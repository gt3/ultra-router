/**
 * @jest-environment jsdom
 */
import assert from 'assert'
import { eq, neq, oeq, oneq, mock } from './helpers'
import * as u from '../src/router/utils-path'
import VisitRewired from '../src/visit'
import { makeVisit, recalibrate } from '../src/visit'

const place = VisitRewired.__GetDependency__('place')
const makeId = VisitRewired.__GetDependency__('makeId')

describe('visit create id', function() {
  it('place', function() {
    eq(place(0), 10)
    eq(place(9), 10)
    eq(place(10), 100)
    eq(place(100), 100)
  })
  it('makeId', function() {
    eq(makeId(0), 0)
    eq(makeId(1), 10)
    eq(makeId(2), 20)
    eq(makeId(11), 110)
    eq(makeId(1, 1), 11)
    eq(makeId(1, 2), 12)
    eq(makeId(5, 10), 510)
  })
})

let len = () => u.env.history.length

describe('makeVisit', function() {
  it('should create new visit record for first visit', function() {
    let ultra = {}, state
    let { visited, newState } = makeVisit(ultra, state)
    oeq(visited, [len(), makeId(len())])
    oeq(newState, { $id: visited[1] })
  })
  it('should create new visit record for a new visit', function() {
    let prev = len()
    window.history.pushState(null, null, u.env.path + '?test')
    eq(prev + 1, len())
    let ultra = { visited: [prev] }, state
    let { visited, newState } = makeVisit(ultra, state)
    oeq(visited, [len(), makeId(len())])
    oeq(newState, { $id: visited[1] })
  })
  it('should add repeat visit to current visit record', function() {
    let prev = len()
    window.history.pushState(null, null, u.env.path + '?test2')
    eq(prev + 1, len())
    let ultra = { visited: [len()] }, state
    let { visited, newState } = makeVisit(ultra, state)
    oeq(visited, [len(), makeId(len(), 0)])
    oeq(newState, { $id: visited[1] })

    ultra = { visited: visited }
    ;({ visited, newState } = makeVisit(ultra, state))
    eq(newState.$id, makeId(len(), ultra.visited.length - 1))
    oeq(visited, [...ultra.visited, newState.$id])

    prev = len()
    window.history.pushState(null, null, u.env.path + '?test3')
    eq(prev + 1, len())
    ultra = { visited: [len(), ...visited.slice(1)] }
    ;({ visited, newState } = makeVisit(ultra, state))
    eq(newState.$id, makeId(len(), ultra.visited.length - 1))
    oeq(visited, [...ultra.visited, newState.$id])
  })
  it('should leave visit record asis if traversing via popstate', function() {
    let prev = len()
    window.history.pushState(null, null, u.env.path + '?test4')
    eq(prev + 1, len())
    let ultra = { visited: [len(), makeId(len(), 0)] }, state = { $id: makeId(len(), 0) }
    let { visited, newState } = makeVisit(ultra, state)
    assert(!newState)
    eq(visited, ultra.visited)
  })
})

describe('recalibrate', function() {
  it('should return -1 if forward navigation was attempted', function() {
    let prev = len()
    window.history.pushState(null, null, u.env.path + '?test5')
    eq(prev + 1, len())
    let ultra = { visited: [len(), makeId(len(), 0)] }, state = { $id: makeId(len(), 0) }
    let delta = recalibrate({ ultra, state })
    eq(delta, -1)
  })
  it('should return +1 if back navigation was attempted', function() {
    let prev = len()
    window.history.pushState(null, null, u.env.path + '?test6')
    eq(prev + 1, len())
    let ultra = { visited: [len(), makeId(len(), 0)] }, state = { $id: prev }
    let delta = recalibrate({ ultra, state })
    eq(delta, 1)
  })
  it('should return 0 if navigation was done (externally)', function() {
    let prev = len()
    window.history.pushState(null, null, u.env.path + '?test7')
    eq(prev + 1, len())
    let ultra = { visited: [prev] }, state = { $id: prev }
    let delta = recalibrate({ ultra, state })
    eq(delta, 0)
  })
})
