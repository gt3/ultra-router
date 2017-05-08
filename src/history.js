import Listener from './listener'
import { noop } from './utils'
import createEvent from './customevent'

const proxyPopstateKey = '_popstate'

function proxyDispatch(detail) {
  return window.dispatchEvent(createEvent(proxyPopstateKey, detail))
}

function getPathname() {
  return location.pathname
}

function invokeHandlers(handlers) {
  function invoke(event, fn) {
    let pathname = getPathname(), state = event && (event.state || event.detail)
    return fn({ pathname, state, event })
  }
  return event => handlers().forEach(invoke.bind(null, event))
}

function createProxy(listener) {
  let proxy = new Listener(proxyPopstateKey, window, invokeHandlers.bind(null, listener.values))
  proxy.add(noop)
  return proxy
}

function createPopstate() {
  let listener = new Listener('popstate', window, invokeHandlers)
  listener.proxy = createProxy(listener)
  return listener
}

let push = (p, s, t) => {
  let pathname = getPathname()
  if (pathname !== p) {
    history.pushState(s, t, p)
    proxyDispatch(s)
  }
}

let replace = (p, s, t) => {
  let pathname = getPathname(), state = history.state
  if (!(pathname === p && state === s)) {
    history.replaceState(s, t, p)
    proxyDispatch(s)
  }
}

export { createPopstate, push, replace }
