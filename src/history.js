import Listener from './listener'
import { noop } from './utils'

const proxyPopstateKey = '_popstate'

function proxyDispatch(detail) {
  return window.dispatchEvent(new CustomEvent(proxyPopstateKey, { detail }))
}

function invokeHandlers(handlers) {
  function invoke(event, fn) {
    let pathname = location.pathname,
      state = event && (event.state || event.detail)
    return fn({ pathname, state, event })
  }
  return event => handlers.forEach(invoke.bind(null, event))
}

function createProxy(popstateListener) {
  let proxy = new Listener(
    proxyPopstateKey,
    window,
    invokeHandlers.bind(null, popstateListener)
  )
  proxy.add(noop)
  return proxy
}

function createPopstate() {
  let listener = new Listener('popstate', window, invokeHandlers)
  listener.proxy = createProxy(listener)
  return listener
}

let push = (p, s, t) => {
  let pathname = location.pathname
  if (!pathname.startsWith(p)) {
    history.pushState(s, t, p)
    proxyDispatch(s)
  }
}

let replace = (p, s, t) => {
  let pathname = location.pathname, state = history.state
  if (!(pathname.startsWith(p) && state === s)) {
    history.replaceState(s, t, p)
    proxyDispatch(s)
  }
}

export { createPopstate, push, replace }
