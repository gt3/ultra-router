import Listener from './listener'
import warning from 'warning'

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
  let {pathname, state, title} = msg
  if(pathname !== getPathname()) {
    history.pushState(state, title, pathname)
    if(cb) return cb(msg)
  }
  else warning(false, 'Attempt to push path identical to current path: %s', pathname)
}

let replace = (cb, msg) => {
  let {pathname, state, title} = msg
  if (!(pathname === getPathname() && state === getState())) {
    history.replaceState(state, title, pathname)
    if(cb) return cb(msg)
  }
  else warning(false, 'Attempt to push path identical to current path: %s', pathname)
}

let recalibrate = msg => {
  let { ultra, state } = msg, currentLen = history.length
  let [len, ...visits] = ultra.visited
  if(state && state.id && currentLen === len) {
    if(visits[visits.length - 1] === state.id) {
      console.log('go back')
      history.go(-1)
    }
    else {
      console.log('go forward')
      history.go(1)
    }
  }
}

export { createPopstate, push, replace, recalibrate }
