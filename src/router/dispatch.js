import { pipe, isTimer, $devWarnOn } from './utils'

function dispatch(actions, msg) {
  let result, resolved = actions.some(fn => !!(result = fn(msg)))
  $devWarnOn(!resolved, `Could not resolve location: ${msg.href}`)
  return result
}

function settle(matchers, mismatchers, msg) {
  let { timer, result } = msg
  if (result && !(isTimer(timer) && timer.active)) {
    if (timer) timer.run()
    matchers.forEach(matcher => matcher.reject(result))
    mismatchers.forEach(mm => mm.match(result))
  }
}

function makeDispatcher(matchers, mismatchers) {
  let actions = matchers.map(matcher => pipe(matcher.match, matcher.resolve))
  let dispatcher = pipe(dispatch.bind(null, actions), settle.bind(null, matchers, mismatchers))
  return dispatcher
}

export { makeDispatcher as dispatcher }
