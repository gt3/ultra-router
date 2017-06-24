/**
 * @jest-environment jsdom
 */
import assert from 'assert'
import { eq, neq, oeq, oneq, mock } from './helpers'
import { push, replace, go, createPopstate } from '../src/history'
import { setOrigin, setLocation } from './helpers-jsdom'
import * as u from '../src/router/utils-path'

describe('history', function() {
  let loc = window.location, state = { x: 42 }, hlen = 0, path
  beforeEach(function() {
    hlen = u.env.history.length;
    ([, path = '0'] = Math.random().toString().split('.'))
    path = '/' + path.slice(0, 3)
  })
  it('push', function() {
    eq(u.env.href, '/')
    push(null, { href: path, path, state })
    eq(u.env.history.length - hlen, 1)
    eq(u.env.href, path)
    eq(u.env.history.state, state)
    push(null, { href: 'http://localhost:8080/xyz?q=42#skipto', path: '/xyz' })
    eq(u.env.history.length - hlen, 2)
    eq(u.env.href, '/xyz?q=42#skipto')
  })
  it('should not allow duplicate push', function() {
    let cb = mock()
    push(cb, { href: path, path })
    eq(u.env.history.length - hlen, 1)
    eq(cb.mock.calls.length, 1)
    push(cb, { href: path, path }) //warning
    eq(u.env.history.length - hlen, 1)
    eq(cb.mock.calls.length, 1)
  })
  it('replace', function() {
    let cb = mock()
    replace(cb, { href: path, path })
    eq(u.env.history.length - hlen, 0)
    eq(cb.mock.calls.length, 1)
    replace(cb, { href: path, path })
    eq(cb.mock.calls.length, 1)
    replace(cb, { href: path, path, state })
    eq(u.env.history.length - hlen, 0)
    eq(cb.mock.calls.length, 2)
    eq(u.env.history.state, state)
  })
})