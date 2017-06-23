/**
 * @jest-environment jsdom
 */
import assert from 'assert'
import { eq, neq, oeq, oneq, mock } from './helpers'
import { push, replace, go, createPopstate } from '../src/history'
import { setOrigin, setLocation } from './helpers-jsdom'
import * as u from '../src/router/utils-path'

describe.skip('history', function() {
  let loc = window.location
  it('push', function() {
    push(null, { href: '/a', path: '/a' })
    eq(loc.href, '/a')
  })
  it('replace', function() {
  })
})