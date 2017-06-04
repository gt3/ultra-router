/**
 * @jest-environment jsdom
 */
import assert from 'assert'
import { eq, neq, oeq, oneq, mock } from './helpers'
import * as u from '../src/utils-path'

function setOrigin(protocol, hostname, port) {
  return Object.defineProperties(window.location, {
    protocol: { writable: true, value: protocol },
    hostname: { writable: true, value: hostname },
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

let testEnv = (loc = window.location) => {
  if (loc !== window.location) loc = setLocation(loc)
  let { href, path, qs = '', hash = '' } = u.env
  //console.log([href,path,qs,hash])
  //console.log([loc.href,loc.pathname,loc.search,loc.hash])
  return oeq([href, path, qs, hash], [loc.href, loc.pathname, loc.search, loc.hash])
}

describe('path utils: env', function() {
  //window.location.assign = jest.fn()
  it('origin', function() {
    setOrigin('http:', 'foo.com')
    eq(u.env.origin, 'http://foo.com')
    setOrigin('http:', 'foo.com', '8080')
    eq(u.env.origin, 'http://foo.com:8080')
  })
  it('location', function() {
    eq(u.env.location, window.location)
    testEnv('/xyz?q=42#skipto')
    testEnv('/xyz?q=42')
    testEnv('/xyz#skipto')
    testEnv('/abc/xyz')
    testEnv('/')
    testEnv('')
  })
  it('history', function() {
    eq(u.env.history, window.history)
    Object.defineProperty(window.history, 'id', { writable: true, value: 42 })
    eq(u.env.history.id, 42)
  })
})
