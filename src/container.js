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
  let cancel = replace.bind(null, null, prevPath)
  return (confirm && len === history.length) ? confirm(ok, cancel, msg) : ok()
}

function verify(matchers, loc) {
  return matchers.some(matcher => matcher.match(loc).success)
}

function toPath(loc) {
  return isStr(loc) ? { pathname: loc } : loc
}

function navigate(ultra, dispatch, navAction, loc) {
  let {pauseRecord, matchers} = ultra, action = navAction.bind(null, dispatch)
  loc = toPath(loc)
  warning(verify(matchers, loc), 'At least one path should be an exact match: %s', loc.pathname)
  return guardDispatch(ultra, action, loc)
}

function run(matchers, popstate) {
  let _pauseRecord = [], dispatch = getDispatch(matchers)
  let ultra = {
    get pauseRecord() { return _pauseRecord },
    resume() { return _pauseRecord = [] },
    pause(cb) { return _pauseRecord = [history.length, toPath(location.pathname), cb] },
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
