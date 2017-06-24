/**
 * @jest-environment jsdom
 */
import assert from 'assert'
import { eq, neq, oeq, oneq, mock } from './helpers'
import { push, replace, go, createPopstate } from '../src/history'
import { setOrigin, setLocation } from './helpers-jsdom'
import * as u from '../src/router/utils-path'

describe('history', function() {
  let loc = window.location, state = { x: 42 }
  it('push', function() {
    eq(u.env.href, '/')
    push(null, { href: '/a', path: '/a', state })
    eq(u.env.href, '/a')
    eq(u.env.history.state, state)
    push(null, { href: 'http://localhost:8080/xyz?q=42#skipto', path: '/xyz' })
    eq(u.env.href, '/xyz?q=42#skipto')
  })
  it('should not allow duplicate push', function() {
    let cb = mock()
    push(cb, { href: '/a', path: '/a' })
    eq(cb.mock.calls.length, 1)
    push(cb, { href: '/a', path: '/a' }) //warning
    eq(cb.mock.calls.length, 1)
  })
  it('replace', function() {
    
  })
})