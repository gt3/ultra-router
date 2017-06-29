import assert from 'assert'
import { eq, neq, oeq, oneq, mock } from './helpers'
import * as u from '../src/router/utils-path'

function setOrigin(protocol, hostname, port) {
  return Object.defineProperties(window.location, {
    protocol: { writable: true, value: protocol },
    hostname: { writable: true, value: hostname },
    host: { writable: true, value: hostname + (port || '') },
    port: { writable: true, value: port || '' }
  })
}

function setLocation(loc) {
  let { href, path: pathname, qs: search = '', hash = '' } = u.parseHref(loc)
  href = u.addLeadingSlash(href)
  pathname = u.addLeadingSlash(pathname)
  Object.defineProperties(window.location, {
    href: { writable: true, value: href },
    pathname: { writable: true, value: pathname },
    hash: { writable: true, value: hash && hash[0] !== '#' ? '#' + hash : hash },
    search: { writable: true, value: search && search[0] !== '?' ? '?' + search : search }
  })
  return { href, pathname, search, hash }
}

function overrideHistoryMethods(env, overrides) {
  return Object.assign(env.history, overrides)
}

function mockPushState(env) {
  let { pushState, replaceState, go } = env.history
  overrideHistoryMethods(env, {
    pushState: mock(),
    replaceState: mock(),
    go: mock()
  })
  return overrideHistoryMethods.bind(null, env, { pushState, replaceState, go })
}

function makeRandomPath() {
  let [, path = '0'] = Math.random().toString().split('.')
  path = '/' + path.slice(0, 3)
  return path
}

function firePopstate(state) {
  let { window } = u.env
  let event = Object.assign(new window.Event('popstate'), { state })
  window.dispatchEvent(event)
  return event
}

export { setOrigin, setLocation, mockPushState, makeRandomPath, firePopstate }
