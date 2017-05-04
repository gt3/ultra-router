import Listener from './listener'

function dispatch(makeMsg, handlers) {
  return event => handlers.forEach(h => h(makeMsg(event)))
}

function resolvePath(base, source = location.pathname) {
  return base ? source.replace(base, '') : source
}

function createMsg(resolve, event) {
  let pathname = resolve()
  return {pathname, event}
}

export function createHistory(base = '', eventKey = 'popstate') {
  let resolve = resolvePath.bind(null, base)
  let listener = new Listener(eventKey, window, dispatch.bind(null, createMsg.bind(null, resolve)))
  let history = {
    listen: listener.add.bind(listener),
    push: (p, s, t) => window.history.pushState(s, t, resolve(p)),
    replace: (p, s, t) => window.history.replaceState(s, t, resolve(p))
  }
  return history
}
