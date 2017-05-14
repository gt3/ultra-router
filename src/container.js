import { pipe, isStr } from './utils'
import warning from 'warning'
import { createPopstate, push, replace, recalibrate } from './history'

function recordVisit(msg) {
  let { ultra, pathname } = msg
  let historyLength = history.length
  if(!ultra.visited) ultra.visited = new Map()
  if(!ultra.visited.has(historyLength)) {
    ultra.visited.set(historyLength, pathname)
  }
  else {
    if(ultra.visited.get(historyLength - 1) === pathname) {
      ultra.visited.delete(historyLength)
    }
    else {
      ultra.visited.set(historyLength, pathname)
    }
  }
  return msg
}

function getDispatch(matchers) {
  let actions = matchers.map(matcher => pipe(matcher.match, matcher.process))
  return msg => actions.some(fn => fn(msg))
}

function guardDispatch(ultra, dispatch, loc) {
  let [len, pausePath, confirm] = ultra.pauseRecord, msg = Object.assign({}, loc, { ultra, pausePath })
  let ok = () => {
    ultra.resume()
    return dispatch(msg)
  }
  let cancel = recalibrate.bind(null, null, msg)
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
    pause(cb) { return _pauseRecord = [history.length, location.pathname, cb] },
    stop: popstate.add(loc => guardDispatch(ultra, dispatch, loc)),
    go: (action, loc) => navigate(ultra, dispatch, action, loc),
    push: loc => ultra.go(push, loc),
    replace: loc => ultra.go(replace, loc),
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
  if(!preventCurrent) ultra.go((cb, msg) => cb(msg), location.pathname)
  return ultra
}

export function container(...matchers) {
  return initialize.bind(null, matchers)
}
