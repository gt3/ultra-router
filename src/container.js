import { pipe, isStr } from './utils'
import warning from 'warning'
import { createPopstate, push, replace } from './history'

function verify(matchers, loc) {
  return matchers.some(matcher => matcher.match(loc).success)
}

function toPath(loc) {
  return isStr(loc) ? { pathname: loc } : loc
}

function navigate(matchers, navAction, loc, ...args) {
  warning(verify(matchers, toPath(loc)), 'At least one path should be an exact match: %s', loc)
  navAction(loc, ...args)
}

function checkPause(dispatch, ultra, loc) {
  let [len, path, confirm] = ultra.pauseRecord, msg = Object.assign({}, loc, { ultra, path })
  let ok = () => {
    ultra.resume()
    return dispatch(msg)
  }
  let cancel = () => ultra.replace(path)
  return (confirm && len === history.length && path !== location.pathname) ? confirm(ok, cancel, msg) : ok()
}

function getDispatch(matchers) {
  let actions = matchers.map(matcher => pipe(matcher.match, matcher.process))
  return msg => actions.some(fn => fn(msg))
}

function run(matchers, popstate) {
  let _pauseRecord = [], dispatch = getDispatch(matchers)
  let ultra = {
    get pauseRecord() { return _pauseRecord },
    resume() { return _pauseRecord = [] },
    pause(cb) { return _pauseRecord = [history.length, location.pathname, cb] },
    stop: popstate.add(loc => checkPause(dispatch, ultra, loc)),
    push: navigate.bind(null, matchers, push),
    replace: navigate.bind(null, matchers, replace),
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
