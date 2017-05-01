import { pipe } from './utils'
import warning from 'warning'
import createHistory from 'history/createBrowserHistory'

function verify(matchers, loc) {
  return matchers.some(matcher => {
    let { spec, result } = matcher(loc)
    return spec && spec.success(result)
  })
}

function replaceWrapped(history, loc, force) {
  let pathname = history.location.pathname
  if (force || !pathname.startsWith(loc)) history.replace(loc)
}

function navigate(matchers, navAction, loc, ...args) {
  warning(verify(matchers, loc), 'No paths defined for this location: %s', loc)
  navAction(loc, ...args)
}

function processMatches(matchers) {
  let actions = matchers.map(matcher => pipe(matcher, matcher.process))
  return (ultra, loc) => {
    let ultraLoc = Object.assign({}, loc, { ultra })
    actions.forEach(fn => fn(ultraLoc))
  }
}

function run(matchers, history = createHistory()) {
  let process = processMatches(matchers)
  let ultra = {
    stop: history.listen(loc => process(ultra, loc)),
    push: navigate.bind(null, matchers, history.push),
    replace: navigate.bind(null, matchers, replaceWrapped.bind(null, history))
  }
  return ultra
}

export function container(...matchers) {
  return run.bind(null, matchers)
}
