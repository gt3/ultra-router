import { isStr, makeArray, pipe } from './router/utils'
import { parseHref, env } from './router/utils-path'
import { dispatcher } from './router/dispatch'
import { createPopstate, push, replace, go } from './history'
import { makeVisit, recalibrate } from './visit'

function recordVisit(dispatch, msg) {
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
  let [len, targetHref, confirm] = ultra.inhibitRecord, { href } = loc
  let msg = Object.assign({}, loc, { ultra })
  let ok = () => {
    ultra.restore()
    return dispatch(msg)
  }
  let cancel = pipe(recalibrate, go).bind(null, msg)
  if (confirm && len === env.history.length) {
    if (href !== targetHref) return confirm(ok, cancel, msg)
  } else return ok()
}

function navigate(ultra, dispatch, navAction, loc) {
  loc = isStr(loc) ? parseHref(loc) : loc
  return guardDispatch(ultra, navAction.bind(null, dispatch), loc)
}

function run(_matchers, _mismatchers, _popstate) {
  let _inhibitRec = [], dispatch = recordVisit.bind(null, dispatcher(_matchers, _mismatchers))
  let ultra = {
    visited: null,
    get popstate() {
      return _popstate
    },
    get matchers() {
      return _matchers
    },
    get mismatchers() {
      return _mismatchers
    },
    get inhibitRecord() {
      return _inhibitRec
    },
    restore() {
      return (_inhibitRec = [])
    },
    inhibit(cb) {
      return (_inhibitRec = [env.history.length, env.href, cb])
    },
    stop: _popstate.add(loc => guardDispatch(ultra, dispatch, loc)),
    nav: (action, loc) => navigate(ultra, dispatch, action, loc),
    push: loc => ultra.nav(push, loc),
    replace: loc => ultra.nav(replace, loc)
  }
  return ultra
}

export function container(matchers, mismatchers, instance, runDispatch = true) {
  let { stop, popstate, visited } = instance || {}
  if (!popstate) popstate = createPopstate()
  let ultra = run(makeArray(matchers), makeArray(mismatchers), popstate)
  if (stop) stop.call(instance)
  if (Array.isArray(visited)) ultra.visited = visited
  else if (runDispatch) ultra.nav((cb, msg) => cb(msg), env.href)
  return ultra
}
