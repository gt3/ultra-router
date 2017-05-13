import { pipe, isStr } from './utils'
import warning from 'warning'
import { createPopstate, push, replace } from './history'

function getDispatch(matchers) {
  let actions = matchers.map(matcher => pipe(matcher.match, matcher.process))
  return msg => actions.some(fn => fn(msg))
}

function guardDispatch(ultra, dispatch, loc) {
  let [len, prevPath, confirm] = ultra.pauseRecord, msg = Object.assign({}, loc, { ultra, prevPath })
  let ok = () => {
    ultra.resume()
    return dispatch(msg)
  }
  let cancel = () => ultra.replace(prevPath)
  return (confirm && len === history.length) ? confirm(ok, cancel, msg) : ok()
}

function verify(matchers, loc) {
  return matchers.some(matcher => matcher.match(loc).success)
}

function toPath(loc) {
  return isStr(loc) ? { pathname: loc } : loc
}

function navigate(dispatch, ultra, navAction, loc) {
  let {pauseRecord, matchers} = ultra, action = pipe(navAction, dispatch)
  warning(verify(matchers, toPath(loc)), 'At least one path should be an exact match: %s', loc)
  return guardDispatch(action, ultra, loc)
}

function run(matchers, popstate) {
  let _pauseRecord = [], dispatch = getDispatch(matchers)
  let ultra = {
    get pauseRecord() { return _pauseRecord },
    resume() { return _pauseRecord = [] },
    pause(cb) { return _pauseRecord = [history.length, location.pathname, cb] },
    stop: popstate.add(loc => guardDispatch(ultra, dispatch, loc)),
    push: loc => navigate(ultra, dispatch, push, loc),
    replace: loc => navigate(ultra, dispatch, replace, loc),
    popstate,
    matchers
  }
  return ultra
}

function initialize(matchers, ultra = {}) {
  let { stop, matchers: currentMatchers, popstate } = ultra
  if (stop) stop.call(ultra)
  if (currentMatchers) matchers = currentMatchers.concat(matchers)
  if (!popstate) popstate = createPopstate()
  return run(matchers, popstate)
}

export function container(...matchers) {
  return initialize.bind(null, matchers)
}
