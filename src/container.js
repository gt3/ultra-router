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

function checkOverride(dispatch, ultra, loc) {
  let [len, path, override] = ultra.override, msg = Object.assign({}, loc, { ultra })
  let next = () => {
    ultra.override = null;
    return dispatch(msg)
  }
  let restore = () => ultra.replace(path)
  let actions = { restore, dispatch: next }
  return (override && len === history.length && path !== location.pathname) ? override(next, restore, msg) : next()
}

function getDispatch(matchers) {
  let actions = matchers.map(matcher => pipe(matcher.match, matcher.process))
  return msg => actions.some(fn => fn(msg))
}

function run(matchers, popstate) {
  let _override = [], dispatch = getDispatch(matchers)
  let ultra = {
    get override() { return _override },
    set override(value) { _override = value ? [history.length, location.pathname, value] : [] },
    stop: popstate.add(loc => checkOverride(dispatch, ultra, loc)),
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
