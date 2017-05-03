import Listener from './listener'

function dispatch(makeMsg, handlers) {
  return event => handlers.forEach(h => h(makeMsg(event)))
}

function fixPath(base, source = location.pathname) {
  return base ? source.replace(base, '') : source
}

function createMsg(fix, event) {
  let pathname = fix()
  return {pathname, event}
}

export function createHistory(base = '', eventKey = 'popstate') {
  let fix = fixPath.bind(null, base)
  let listener = new Listener(eventKey, window, dispatch.bind(null, createMsg.bind(null, fix)))
  let history = {
    listen: listener.add.bind(listener),
    push: (p, s, t) => window.history.pushState(s, t, fix(p)),
    replace: (p, s, t) => window.history.replaceState(s, t, fix(p))
  }
  return history
}