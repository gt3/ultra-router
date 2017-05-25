import Listener from './listener'
import warning from 'warning'
import { verifyEncoding, env } from './utils-path'

function invokeHandlers(handlers) {
  function invoke(event, fn) {
    let { href, path, qs, hash } = env, state = event.state
    return fn({ href, path, qs, hash, state, event })
  }
  return event => handlers().forEach(invoke.bind(null, event))
}

function createPopstate() {
  return new Listener('popstate', env.window, invokeHandlers)
}

let push = (cb, msg) => {
  let { href, path, state, title } = msg
  if (href !== env.href) {
    warning(verifyEncoding(path), 'Incorrect encoding. Use encodeURI on path: %s', path)
    env.history.pushState(state, title, href)
    if (cb) return cb(msg)
  } else warning(false, 'Attempt to push location identical to current one: %s', href)
}

let replace = (cb, msg) => {
  let { href, path, state, title } = msg
  if (!(href === env.href && state === env.state)) {
    warning(verifyEncoding(path), 'Incorrect encoding. Use encodeURI on path: %s', path)
    env.history.replaceState(state, title, href)
    if (cb) return cb(msg)
  } else warning(false, 'Attempt to replace current location with the same one: %s', href)
}

let go = val => val && env.history.go(val)

export { createPopstate, push, replace, go }
