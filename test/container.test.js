/**
 * @jest-environment jsdom
 */
import assert from 'assert'
import { eq, neq, oeq, oneq, mock } from './helpers'
import * as u from '../src/router/utils-path'
import ContainerRewired from '../src/container'
import { container } from '../src/container'
import { mockPushState, makeRandomPath } from './helpers-jsdom'
import VisitRewired from '../src/visit'

const guardDispatch = ContainerRewired.__GetDependency__('guardDispatch')
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
