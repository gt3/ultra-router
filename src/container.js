import { pipe } from './utils'
import warning from 'warning'
import createHistory from 'history/createBrowserHistory'

function verify(matchers, loc) {
  return matchers.some(matcher => !!matcher(loc).spec)
}

function navigate(matchers, navAction, loc) {
  warning(verify(matchers, loc), 'No paths defined for this location: %s', loc)
  navAction(loc)
}

function process(actions, ...args) {
  return actions.forEach(fn => fn(...args))
}

function processMatches(matchers) {
  let actions = matchers.map(matcher => pipe(matcher, matcher.process))
  return process.bind(null, actions)
}

function run(matchers, history = createHistory()) {
  let stop = history.listen(processMatches(matchers))
  let push = navigate.bind(null, matchers, history.push)
  let replace = navigate.bind(null, matchers, history.replace)
  return { stop, push, replace }
}

export function container(...matchers) {
  return run.bind(null, matchers)
}
