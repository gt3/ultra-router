import { pipe, isStr } from './utils'
import warning from 'warning'
import { createPopstate, push, replace, go } from './history'
import { makeVisit, recalibrate } from './visit'

export function recordVisit(msg) {
  let { ultra, pathname, state } = msg
  console.log('before:', ultra.visited)
  let { visited, newState } = makeVisit(ultra, state)
  ultra.visited = visited
  if (newState) {
    replace(null, { pathname, state: newState })
  }
  console.log('after:', ultra.visited)
}

function getDispatch(matchers) {
  let actions = matchers.map(matcher => pipe(matcher.match, matcher.process))
  return msg => {
    recordVisit(msg)
    return actions.some(fn => fn(msg))
  }
}

function guardDispatch(ultra, dispatch, loc) {
  let [len, stickyPath, confirm] = ultra.pauseRecord, { pathname } = loc
  let msg = Object.assign({}, loc, { ultra, stickyPath })
  let ok = () => {
    ultra.resume()
    return dispatch(msg)
  }
  let cancel = pipe(recalibrate, go).bind(null, msg)
  if (confirm && len === history.length) {
    if (pathname !== stickyPath) return confirm(ok, cancel, msg)
  } else return ok()
}

function verify(matchers, loc) {
  return matchers.some(matcher => matcher.match(loc).success)
}

function toPath(loc) {
  return isStr(loc) ? { pathname: loc } : loc
}

function navigate(ultra, dispatch, navAction, loc) {
  let { matchers } = ultra, action = navAction.bind(null, dispatch)
  loc = toPath(loc)
  warning(verify(matchers, loc), 'At least one path should be an exact match: %s', loc.pathname)
  return guardDispatch(ultra, action, loc)
}

function run(matchers, popstate) {
  let _pauseRecord = [], dispatch = getDispatch(matchers)
  let ultra = {
    get pauseRecord() {
      return _pauseRecord
    },
    resume() {
      return (_pauseRecord = [])
    },
    pause(cb) {
      return (_pauseRecord = [history.length, location.pathname, cb])
    },
    stop: popstate.add(loc => guardDispatch(ultra, dispatch, loc)),
    nav: (action, loc) => navigate(ultra, dispatch, action, loc),
    push: loc => ultra.nav(push, loc),
    replace: loc => ultra.nav(replace, loc),
    popstate,
    matchers
  }
  return ultra
}

function initialize(matchers, ultraOptions = {}) {
  let { stop, matchers: currentMatchers, popstate, preventCurrent } = ultraOptions
  if (stop) stop.call(ultraOptions)
  if (currentMatchers) matchers = currentMatchers.concat(matchers)
  if (!popstate) popstate = createPopstate()
  let ultra = run(matchers, popstate)
  if (!preventCurrent) ultra.nav((cb, msg) => cb(msg), location.pathname)
  return ultra
}

export function container(...matchers) {
  return initialize.bind(null, matchers)
}
