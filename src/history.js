import Listener from './listener'
import warning from 'warning'
import { verifyEncoding } from './utils'

function getPathname() {
  return location.pathname
}

function getState() {
  return history.state
}

function invokeHandlers(handlers) {
  function invoke(event, fn) {
    let pathname = getPathname(), state = event.state
    return fn({ pathname, state, event })
  }
  return event => handlers().forEach(invoke.bind(null, event))
}

function createPopstate() {
  return new Listener('popstate', window, invokeHandlers)
}

let push = (cb, msg) => {
  let { pathname, state, title } = msg
  if (pathname !== getPathname()) {
    warning(verifyEncoding(pathname), 'Incorrect encoding. Use encodeURI on path: %s', pathname)
    history.pushState(state, title, pathname)
    console.log('push:', pathname, state)
    if (cb) return cb(msg)
  } else warning(false, 'Attempt to push path identical to current path: %s', pathname)
}

let replace = (cb, msg) => {
  let { pathname, state, title } = msg
  if (!(pathname === getPathname() && state === getState())) {
    warning(verifyEncoding(pathname), 'Incorrect encoding. Use encodeURI on path: %s', pathname)
    history.replaceState(state, title, pathname)
    console.log('replace:', pathname, state)
    if (cb) return cb(msg)
  } else warning(false, 'Attempt to push path identical to current path: %s', pathname)
}

let go = val => val && history.go(val)

export { createPopstate, push, replace, go }
