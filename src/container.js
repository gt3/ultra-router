import warning from 'warning'
import { pipe, isStr } from './utils'
import { parseHref, env } from './utils-path'
import { createPopstate, push, replace, go } from './history'
import { makeVisit, recalibrate } from './visit'

function dispatcher(actions, msg) {
  let resolved = actions.some(fn => fn(msg))
  warning(resolved, 'Could not resolve location: %s', msg.href)
  return resolved
}

function getDispatcher(matchers) {
  let actions = matchers.map(matcher => pipe(matcher.match, matcher.resolve))
  return recordVisit.bind(null, dispatcher.bind(null, actions))
}

export function recordVisit(dispatch, msg) {
  let { ultra, state } = msg
  let { visited, newState } = makeVisit(ultra, state)
  ultra.visited = visited
  if (newState) {
    msg = Object.assign({}, msg, { state: newState })
    return replace(dispatch, msg)
  }
  return dispatch(msg)
}

function guardDispatch(ultra, dispatch, loc) {
  let [len, pausedHref, confirm] = ultra.pauseRecord, { href } = loc
  let msg = Object.assign({}, loc, { ultra })
  let ok = () => {
    ultra.resume()
    return dispatch(msg)
  }
  let cancel = pipe(recalibrate, go).bind(null, msg)
  if (confirm && len === env.history.length) {
    if (href !== pausedHref) return confirm(ok, cancel, msg)
  } else return ok()
}

function navigate(ultra, dispatch, navAction, loc) {
  loc = isStr(loc) ? parseHref(loc) : loc
  return guardDispatch(ultra, navAction.bind(null, dispatch), loc)
}

function run(matchers, popstate) {
  let _pauseRecord = [], dispatch = getDispatcher(matchers)
  let ultra = {
    get pauseRecord() {
      return _pauseRecord
    },
    resume() {
      return (_pauseRecord = [])
    },
    pause(cb) {
      return (_pauseRecord = [env.history.length, env.href, cb])
    },
    stop: popstate.add(loc => guardDispatch(ultra, dispatch, loc)),
    nav: (action, loc) => navigate(ultra, dispatch, action, loc),
    push: loc => ultra.nav(push, loc),
    replace: loc => ultra.nav(replace, loc),
    visited: null,
    popstate,
    matchers
  }
  return ultra
}

function initialize(matchers, ultraOptions = {}) {
  let { stop, matchers: currentMatchers, popstate, visited } = ultraOptions
  if (currentMatchers) matchers = currentMatchers.concat(matchers)
  if (!popstate) popstate = createPopstate()
  if (stop) stop.call(ultraOptions)
  let ultra = run(matchers, popstate)
  if (!visited) ultra.nav((cb, msg) => cb(msg), env.href)
  return ultra
}

export function container(...matchers) {
  return initialize.bind(null, matchers)
}
