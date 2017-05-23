import Listener from './listener'
import warning from 'warning'
import { verifyEncoding } from './utils-path'
import { env } from './utils'

function invokeHandlers(handlers) {
  function invoke(event, fn) {
    let pathname = env.p, state = event.state
    return fn({ pathname, state, event })
  }
  return event => handlers().forEach(invoke.bind(null, event))
}

function createPopstate() {
  return new Listener('popstate', env.window, invokeHandlers)
}

let push = (cb, msg) => {
  let { pathname, state, title } = msg
  if (pathname !== env.p) {
    warning(verifyEncoding(pathname), 'Incorrect encoding. Use encodeURI on path: %s', pathname)
    env.history.pushState(state, title, pathname)
    console.log('push:', pathname, state)
    if (cb) return cb(msg)
  } else warning(false, 'Attempt to push path identical to current path: %s', pathname)
}

let replace = (cb, msg) => {
  let { pathname, state, title } = msg
  if (!(pathname === env.p && state === env.state)) {
    warning(verifyEncoding(pathname), 'Incorrect encoding. Use encodeURI on path: %s', pathname)
    env.history.replaceState(state, title, pathname)
    console.log('replace:', pathname, state)
    if (cb) return cb(msg)
  } else warning(false, 'Attempt to push path identical to current path: %s', pathname)
}

let go = val => val && env.history.go(val)

export { createPopstate, push, replace, go }
