/**
 * @jest-environment jsdom
 */
import assert from 'assert'
import { eq, neq, oeq, oneq, mock } from './helpers'
import * as u from '../src/router/utils-path'
import ContainerRewired from '../src/container'
import VisitRewired from '../src/visit'
import { container } from '../src/container'
import { mockPushState, makeRandomPath, firePopstate } from './helpers-jsdom'
import { prefixSpec, spec, check, assignValues, miss } from '../src/router/spec'
import { toggle, toggleSelected, match, prefixMatch } from '../src/router/match'

const guardDispatch = ContainerRewired.__GetDependency__('guardDispatch')
const recordVisit = ContainerRewired.__GetDependency__('recordVisit')
const makeId = VisitRewired.__GetDependency__('makeId')

let len = () => u.env.history.length

describe('container #guardDispatch', function() {
  let confirm, inhibitRecord, restore, dispatch, path
  let state, visited, ultra, loc
  beforeEach(function() {
    path = makeRandomPath()
    state = { $id: makeId(len(), 0) }
    visited = [len(), makeId(len(), 0)]
    loc = { href: path, path, state }
    dispatch = mock()
    confirm = mock()
    restore = mock()
    inhibitRecord = [len(), u.env.href, confirm]
    ultra = { inhibitRecord, restore, visited }
  })
  it('should confirm and allow navigation in inhibited state', function() {
    guardDispatch(ultra, dispatch, loc)
    eq(dispatch.mock.calls.length, 0)
    eq(confirm.mock.calls.length, 1)
    let [ok, cancel, msg] = confirm.mock.calls[0]
    eq(msg.href, loc.href)
    eq(msg.ultra, ultra)
    assert(ok)
    assert(cancel)
    ok()
    eq(restore.mock.calls.length, 1)
    eq(dispatch.mock.calls.length, 1)
    eq(dispatch.mock.calls[0][0], msg)
  })
  it('should confirm and forfeit navigation in inhibited state', function(done) {
    guardDispatch(ultra, dispatch, loc)
    eq(dispatch.mock.calls.length, 0)
    eq(confirm.mock.calls.length, 1)
    let [ok, cancel, msg] = confirm.mock.calls[0]

    let prev = len()
    window.history.pushState(null, null, path)
    eq(prev + 1, len())
    ultra.visited = [len(), ...ultra.visited.slice(1)]

    let restorePushState = mockPushState(u.env)
    let { go } = u.env.history
    cancel()

    setTimeout(() => {
      restorePushState()
      done()
    })
    eq(restore.mock.calls.length, 0)
    eq(dispatch.mock.calls.length, 0)

    eq(go.mock.calls.length, 1)
    eq(go.mock.calls[0][0], -1)
  })
  it('should dispatch if inhibitRecord is not set', function() {
    guardDispatch({ inhibitRecord: [], restore }, dispatch, loc)
    eq(dispatch.mock.calls.length, 1)
  })
  it('should dispatch if inhibitRecord is stale', function() {
    let prev = len()
    window.history.pushState(null, null, u.env.path + '?test')
    eq(prev + 1, len())
    guardDispatch(ultra, dispatch, loc)
    eq(dispatch.mock.calls.length, 1)
    eq(restore.mock.calls.length, 1)
  })
  it('should neither dispatch nor confirm when returning back to the original url', function() {
    guardDispatch(ultra, dispatch, { href: ultra.inhibitRecord[1] })
    eq(dispatch.mock.calls.length, 0)
    eq(confirm.mock.calls.length, 0)
  })
})

describe('container #recordVisit', function() {
  let dispatch, restorePushState, replaceState
  beforeAll(function() {
    restorePushState = mockPushState(u.env)
    replaceState = u.env.history.replaceState
  })
  afterAll(function() {
    restorePushState()
  })
  beforeEach(function() {
    dispatch = mock()
    replaceState.mockClear()
  })
  it('should record visit and invoke replace with computed state', function() {
    let ultra = {}, state, msg = { ultra, state, href: u.env.href, path: u.env.path }
    recordVisit(dispatch, msg)
    assert(dispatch.mock.calls.length, 1)
    assert(ultra.visited)
    assert(replaceState.mock.calls.length, 1)
    let [newState, , href] = replaceState.mock.calls[0]
    eq(newState.$id, ...ultra.visited.slice(-1))
    eq(href, msg.href)
  })
  it('should not record visit if state is already updated', function() {
    let visited = [len(), makeId(len(), 0)]
    let ultra = { visited }, state = { $id: makeId(len(), 0) }
    let msg = { ultra, state, href: u.env.href, path: u.env.path }
    recordVisit(dispatch, msg)
    eq(ultra.visited, visited)
    eq(replaceState.mock.calls.length, 0)
    eq(dispatch.mock.calls.length, 1)
  })
})

describe('container', function() {
  let next, restorePS, pushState, pMock, rMock, path, ultra
  let mockPS = () => {
    restorePS = mockPushState(u.env)
    ;({ pushState: pMock, replaceState: rMock } = u.env.history)
  }
  afterEach(function() {
    if(restorePS) { restorePS(); restorePS = null }
    if(ultra) ultra.stop()
  })
  beforeEach(function() {
    next = mock()
    path = makeRandomPath()
  })
  it('should dispatch current loc on instatiation', function() {
    let prev = len()
    window.history.pushState(null, null, path)
    eq(len(), prev + 1)
    mockPS()
    ultra = container(match(spec(path)(next)), miss(next, 'xxx'))
    assert(ultra.visited)
    assert(next.mock.calls.length, 2)
  })
  it('should not dispatch current loc if runDispatch is false', function() {
    ultra = container(match(spec(path)(next)), null, null, false)
    assert(!ultra.visited)
  })
  it('should not dispatch current loc when cloning a container that has dispatched', function() {
    let prev = len()
    window.history.pushState(null, null, path)
    eq(len(), prev + 1)
    mockPS()
    ultra = container(match(spec(path)(next)))
    assert(ultra.visited)
    assert(next.mock.calls.length, 1)
    let visited = ultra.visited

    restorePS()
    prev = len()
    window.history.pushState(null, null, '/a')
    eq(len(), prev + 1)
    mockPS()

    ultra = container([...ultra.matchers, match(spec('/a')(next))], null, ultra)
    eq(ultra.visited, visited)
    eq(next.mock.calls.length, 1)
  })
  it('should dispatch current loc when cloning a container that has not dispatched', function() {
    let prev = len()
    window.history.pushState(null, null, path)
    eq(len(), prev + 1)
    mockPS()

    ultra = container(match(spec(path)(next)), miss(next, 'xxx'), null, false)
    assert(!ultra.visited)
    eq(next.mock.calls.length, 0)

    ultra = container(ultra.matchers, ultra.mismatchers, ultra)
    assert(ultra.visited)
    eq(next.mock.calls.length, 2)
  })
  it('should allow inhibit/restore control on navigation', function() {
    let confirm = mock()
    ultra = container(match(spec(path)(next)), null, null, false)
    assert(!ultra.visited)
    eq(next.mock.calls.length, 0)
    ultra.inhibit(confirm)
    ultra.push({ href: path, path })
    eq(confirm.mock.calls.length, 1)
    eq(next.mock.calls.length, 0)
    assert(!ultra.visited)
    ultra.restore()
    ultra.push({ href: path + '?test', path })
    eq(next.mock.calls.length, 1)
    assert(ultra.visited)
  })
  it('push/replace', function() {
    mockPS()
    ultra = container(match(spec(path)(next)), null, null, false)
    eq(next.mock.calls.length, 0)
    ultra.push({ href: path, path })
    eq(pMock.mock.calls.length, 1)
    eq(rMock.mock.calls.length, 1)
    eq(next.mock.calls.length, 1)
    ultra.replace({ href: path + '?test', path })
    eq(rMock.mock.calls.length, 3)
    eq(next.mock.calls.length, 2)
    ultra.stop()
  })
  it('stop popstate listener', function() {
    let state = { x: 42 }
    ultra = container(match(spec(path)(next)), null, null, false)
    let prev = len()
    window.history.pushState(null, null, path)
    eq(len(), prev + 1)
    firePopstate(state)
    eq(next.mock.calls.length, 1)
    ultra.stop()
    firePopstate(state)
    eq(next.mock.calls.length, 1)
  })
})
