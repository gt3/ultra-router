import { pipe } from './utils'
import warning from 'warning'
import {createPopstate, push, replace} from './history'

function verify(matchers, loc) {
  return matchers.some(matcher => matcher.match(loc).success)
}

function navigate(matchers, navAction, loc, ...args) {
  warning(
    verify(matchers, loc),
    'At least one path should be an exact match: %s',
    loc
  )
  navAction(loc, ...args)
}

function getDispatch(matchers) {
  let actions = matchers.map(matcher => pipe(matcher.match, matcher.process))
  return (ultra, loc) => {
    console.log('dispatch:', loc)
    let ultraLoc = Object.assign({}, loc, { ultra })
    actions.forEach(fn => fn(ultraLoc))
  }
}

function run(matchers, popstate) {
  let dispatch = getDispatch(matchers)
  let ultra = {
    stop: popstate.add(loc => dispatch(ultra, loc)),
    push: navigate.bind(null, matchers, push),
    replace: navigate.bind(null, matchers, replace),
    popstate,
    matchers
  }
  return ultra
}

function initialize(matchers, ultra = {}) {
  let {stop, matchers: currentMatchers, popstate}  = ultra
  if(stop) stop.call(ultra)
  if(currentMatchers) matchers = currentMatchers.concat(matchers)
  if(!popstate) popstate = createPopstate()
  return run(matchers, popstate)
}

export function container(...matchers) {
  return initialize.bind(null, matchers)
}
