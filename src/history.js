import Listener from './listener'
import { devWarnOn } from './router/utils'
import { verifyURIEncoding, env } from './router/utils-path'

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
  let { href, path, state, docTitle } = msg
  if (href !== env.href) {
    devWarnOn(!verifyURIEncoding(path), `Incorrect encoding. Use encodeURI on path: ${path}`)
    env.history.pushState(state, docTitle, href)
    if (cb) return cb(msg)
  } else devWarnOn(true, `Attempt to push location identical to current one: ${href}`)
}

let replace = (cb, msg) => {
  let { href, path, state, docTitle } = msg
  if (!(href === env.href && state === env.state)) {
    devWarnOn(!verifyURIEncoding(path), `Incorrect encoding. Use encodeURI on path: ${path}`)
    env.history.replaceState(state, docTitle, href)
    if (cb) return cb(msg)
  } else devWarnOn(true, `Attempt to replace current location with the same one: ${href}`)
}

let go = val => val && env.history.go(val)

export { createPopstate, push, replace, go }
