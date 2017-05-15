import { pipe, isStr } from './utils'
import warning from 'warning'
import { createPopstate, push, replace, recalibrate } from './history'

function place(n) {
  return [10,100].find(x => n%x == n)
}

function makeId(m, n=0) {
  return m*place(n) + n
}

function recordVisit(msg) {
  let id, newState
  let { ultra, pathname, state } = msg, currentLen = history.length
  console.log('before:', ultra.visited)
  if(!ultra.visited) { ultra.visited = [] }
  let [len, ...visits] = ultra.visited
  if(!len || currentLen > len) {
    id = makeId(currentLen)
    newState = Object.assign({}, state, {id})
    console.log('new id:', id)
    ultra.visited = [currentLen, id]
    replace(null, {pathname, state: newState})
  }
  else {
    id = state ? state.id : makeId(currentLen, visits.length)
    if(!visits.length || id > visits[visits.length-1]) {
      console.log('xxx append:', id)
      ultra.visited = [currentLen, ...visits, id]
    }
    if(!state) {
      newState = Object.assign({}, state, {id})
      replace(null, {pathname, state: newState})
    }
  }
  console.log('after:', ultra.visited)
}

function getDispatch(matchers) {
  let actions = matchers.map(matcher => pipe(matcher.match, matcher.process))
  return msg => { recordVisit(msg); actions.some(fn => fn(msg)) }
}

function guardDispatch(ultra, dispatch, loc) {
  let [len, stickyPath, confirm] = ultra.pauseRecord, { pathname } = loc
  let msg = Object.assign({}, loc, { ultra, stickyPath })
  let ok = () => {
    ultra.resume()
    return dispatch(msg)
  }
  let cancel = recalibrate.bind(null, msg)
  if(confirm && len === history.length) {
    if(pathname !== stickyPath) return confirm(ok, cancel, msg)
    else { console.log('result of go action - do nothing'); }
  }
  else return ok()
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
