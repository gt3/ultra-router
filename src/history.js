import Listener from './listener'
import warning from 'warning'
import { verifyEncoding, env } from './utils-path'

function invokeHandlers(handlers) {
  function invoke(event, fn) {
    let p = env.p, qs = env.qs, h = env.h, state = event.state
    return fn({ p, qs, h, state, event })
  }
  return event => handlers().forEach(invoke.bind(null, event))
}

function createPopstate() {
  return new Listener('popstate', env.window, invokeHandlers)
}

let push = (cb, msg) => {
  let { p, state, title } = msg
  if (p !== env.p) {
    warning(verifyEncoding(p), 'Incorrect encoding. Use encodeURI on path: %s', p)
    env.history.pushState(state, title, p)
    if (cb) return cb(msg)
  } else warning(false, 'Attempt to push path identical to current path: %s', p)
}

let replace = (cb, msg) => {
  let { p, state, title } = msg
  if (!(p === env.p && state === env.state)) {
    warning(verifyEncoding(p), 'Incorrect encoding. Use encodeURI on path: %s', p)
    env.history.replaceState(state, title, p)
    if (cb) return cb(msg)
  } else warning(false, 'Attempt to push path identical to current path: %s', p)
}

let go = val => val && env.history.go(val)

export { createPopstate, push, replace, go }
