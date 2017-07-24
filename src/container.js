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
  let [len, tappedHref, confirm] = ultra.tapped, { href } = loc
  let msg = Object.assign({}, loc, { ultra })
  let ok = () => {
    ultra.untap()
    return dispatch(msg)
  }
  let cancel = pipe(recalibrate, go).bind(null, msg)
  if (confirm && len === env.history.length) {
    if (href !== tappedHref) return confirm(ok, cancel, msg)
  } else return ok()
}

function navigate(ultra, dispatch, navAction, loc) {
  loc = isStr(loc) ? parseHref(loc) : loc
  return guardDispatch(ultra, navAction.bind(null, dispatch), loc)
}

function run(_matchers, _mismatchers, _popstate) {
  let _tapped = [], dispatch = recordVisit.bind(null, dispatcher(_matchers, _mismatchers))
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
    get tapped() {
      return _tapped
    },
    untap() {
      return (_tapped = [])
    },
    tap(cb) {
      return (_tapped = [env.history.length, env.href, cb])
    },
    stop: _popstate.add(loc => guardDispatch(ultra, dispatch, loc)),
    nav: (action, loc) => navigate(ultra, dispatch, action, loc),
    push: loc => ultra.nav(push, loc),
    replace: loc => ultra.nav(replace, loc),
    dispatch: () => ultra.nav((cb, msg) => cb(msg), env.href)
  }
  return ultra
}

export function container(matchers, mismatchers, instance, scheduleDispatch) {
  let { stop, popstate, visited } = instance || {}, isRunning = Array.isArray(visited)
  if (scheduleDispatch === void 0) scheduleDispatch = !instance || !isRunning
  if (!popstate) popstate = createPopstate()
  let ultra = run(makeArray(matchers), makeArray(mismatchers), popstate)
  if (stop) stop.call(instance)
  if (isRunning) ultra.visited = visited
  if (scheduleDispatch) setTimeout(ultra.dispatch)
  return ultra
}
