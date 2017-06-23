/**
 * @jest-environment jsdom
 */
import assert from 'assert'
import { eq, neq, oeq, oneq, mock } from './helpers'
import * as u from '../src/router/utils-path'
import { setOrigin, setLocation } from './helpers-jsdom'

let testEnv = (loc = window.location) => {
  if (loc !== window.location) loc = setLocation(loc)
  let { href, path, qs = '', hash = '' } = u.env
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
