/**
 * @jest-environment jsdom
 */
import assert from 'assert'
import { eq, neq, oeq, oneq, mock } from './helpers'
import { push, replace, go, createPopstate } from '../src/history'
import { mockPushState, makeRandomPath, firePopstate } from './helpers-jsdom'
import * as u from '../src/router/utils-path'

describe('history pushstate simulated', function() {
  let loc = window.location, state = { x: 42 }, hlen = 0, path
  beforeEach(function() {
    hlen = u.env.history.length
    path = makeRandomPath()
  })
  it('push', function() {
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

describe('history pushstate mocked', function() {
  let loc = window.location, state = { x: 42 }, hlen = 0, path
  let psmock, rsmock, gomock, restorePushState
  beforeEach(function() {
    hlen = u.env.history.length
    path = makeRandomPath()
    psmock.mockClear()
    rsmock.mockClear()
    gomock.mockClear()
  })
  beforeAll(function() {
    restorePushState = mockPushState(u.env)
    ;({ pushState: psmock, replaceState: rsmock, go: gomock } = u.env.history)
  })
  afterAll(function() {
    restorePushState()
  })
  it('push', function() {
    push(null, { href: path, path, state, docTitle: 'zoom' })
    eq(psmock.mock.calls.length, 1)
    eq(psmock.mock.calls[0][0], state)
    eq(psmock.mock.calls[0][1], 'zoom')
    eq(psmock.mock.calls[0][2], path)
  })
  it('replace', function() {
    replace(null, { href: path, path, state, docTitle: 'zoom' })
    eq(rsmock.mock.calls.length, 1)
    eq(rsmock.mock.calls[0][0], state)
    eq(rsmock.mock.calls[0][1], 'zoom')
    eq(rsmock.mock.calls[0][2], path)
  })
  it('go', function() {
    go(0)
    eq(gomock.mock.calls.length, 0)
    go(-1)
    eq(gomock.mock.calls.length, 1)
  })
})

let testLoc = loc => {
  let { href, path, qs = '', hash = '' } = u.env
  return oeq([href, path, qs, hash], [loc.href, loc.path, loc.qs, loc.hash])
}

describe('createPopstate', function() {
  let state = { x: 42 }
  it('should fire registered handlers on popstate event', function() {
    let h1 = mock(), h2 = mock(), popstate = createPopstate()
    popstate.add(h1)
    popstate.add(h2)
    let event = firePopstate(state)
    eq(h1.mock.calls.length, 1)
    let { href, path, qs, hash, state: s, event: e } = h1.mock.calls[0][0]
    eq(state, h1.mock.calls[0][0].state)
    eq(event, h1.mock.calls[0][0].event)
    testLoc(h1.mock.calls[0][0])
    eq(h2.mock.calls.length, 1)
  })
})
