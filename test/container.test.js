/**
 * @jest-environment jsdom
 */
import assert from 'assert'
import { eq, neq, oeq, oneq, mock } from './helpers'
import * as u from '../src/router/utils-path'
import ContainerRewired from '../src/container'
import VisitRewired from '../src/visit'
import { container } from '../src/container'
import { mockPushState, makeRandomPath } from './helpers-jsdom'
import { prefixSpec, spec, check, assignValues } from '../src/router/spec'
import { toggle, toggleSelected, match, prefixMatch } from '../src/router/match'

const guardDispatch = ContainerRewired.__GetDependency__('guardDispatch')
const recordVisit = ContainerRewired.__GetDependency__('recordVisit')
const makeId = VisitRewired.__GetDependency__('makeId')

let len = () => u.env.history.length

describe('container #guardDispatch', function() {
  let confirm, pauseRecord, resume, dispatch, path
  let state, visited, ultra, loc
  beforeEach(function() {
    path = makeRandomPath()
    state = { $id: makeId(len(), 0) }
    visited = [len(), makeId(len(), 0)]
    loc = { href: path, path, state }
    dispatch = mock()
    confirm = mock()
    resume = mock()
    pauseRecord = [len(), u.env.href, confirm]
    ultra = { pauseRecord, resume, visited }
  })
  it('should confirm and allow resume in paused state', function() {
    guardDispatch(ultra, dispatch, loc)
    eq(dispatch.mock.calls.length, 0)
    eq(confirm.mock.calls.length, 1)
    let [ok, cancel, msg] = confirm.mock.calls[0]
    eq(msg.href, loc.href)
    eq(msg.ultra, ultra)
    assert(ok)
    assert(cancel)
    ok()
    eq(resume.mock.calls.length, 1)
    eq(dispatch.mock.calls.length, 1)
    eq(dispatch.mock.calls[0][0], msg)
  })
  it('should confirm and allow cancel in paused state', function(done) {
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
    eq(resume.mock.calls.length, 0)
    eq(dispatch.mock.calls.length, 0)

    eq(go.mock.calls.length, 1)
    eq(go.mock.calls[0][0], -1)
  })
  it('should dispatch if pauseRecord is not set', function() {
    guardDispatch({ pauseRecord: [], resume }, dispatch, loc)
    eq(dispatch.mock.calls.length, 1)
  })
  it('should dispatch if pauseRecord is stale', function() {
    let prev = len()
    window.history.pushState(null, null, u.env.path + '?test')
    eq(prev + 1, len())
    guardDispatch(ultra, dispatch, loc)
    eq(dispatch.mock.calls.length, 1)
    eq(resume.mock.calls.length, 1)
  })
  it('should neither dispatch nor confirm when returning back to the original url', function() {
    guardDispatch(ultra, dispatch, { href: ultra.pauseRecord[1] })
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
  let next, restorePS, replaceState, path
  let mockPS = () => {
    restorePS = mockPushState(u.env);
    ({replaceState} = u.env.history)
  }
  beforeAll(function() {
    next = mock()
    mockPS()
  })
  afterAll(function() {
    restorePS()
  })
  beforeEach(function() {
    next.mockClear()
    replaceState.mockClear()
    path = makeRandomPath()
  })
  it('should dispatch current loc on instatiation', function() {
    restorePS()
    let prev = len()
    window.history.pushState(null, null, path)
    eq(len(), prev+1)
    mockPS()
    let ultra = container(match(spec(path)(next)))
    assert(ultra.visited)
    assert(next.mock.calls.length, 1)
  })
  it('should not dispatch current loc if runDispatch is false', function() {
    let ultra = container(match(spec(path)(next)), null, null, false)
    assert(!ultra.visited)
  })
  it('should not dispatch current loc when cloning a container that has dispatched', function() {
    restorePS()
    let prev = len()
    window.history.pushState(null, null, path)
    eq(len(), prev+1)
    mockPS()
    let ultra = container(match(spec(path)(next)))
    assert(ultra.visited)
    assert(next.mock.calls.length, 1)
    let visited = ultra.visited

    restorePS()
    prev = len()
    window.history.pushState(null, null, '/a')
    eq(len(), prev+1)
    mockPS()

    ultra = container([...ultra.matchers, match(spec('/a')(next))], null, ultra)
    eq(ultra.visited, visited)
    eq(next.mock.calls.length, 1)
  })
  it('should dispatch current loc when cloning a container that has not dispatched', function() {
    restorePS()
    let prev = len()
    window.history.pushState(null, null, path)
    eq(len(), prev+1)
    mockPS()

    let ultra = container(match(spec(path)(next)), null, null, false)
    assert(!ultra.visited)
    eq(next.mock.calls.length, 0)

    ultra = container([...ultra.matchers], null, ultra)
    assert(ultra.visited)
    eq(next.mock.calls.length, 1)
  })
})