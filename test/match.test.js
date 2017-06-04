import assert from 'assert'
import { eq, neq, oeq, oneq, mock } from './helpers'
import * as u from '../src/utils'
//import MatchRewired from '../src/match'
import { prefixSpec, spec, check, assignValues } from '../src/spec'
import { toggle, toggleSelected, match } from '../src/match'

//const matcher = MatchRewired.__GetDependency__('matcher')

function testToggle(match, id) {
let testOn = t => {
  assert(t.match())
  eq(t, match)
  eq(t.key, id)
}

let testOff = t => {
  assert(!t.match())
  eq(t.off, match)
  eq(t.key, id)
}
return { on: testOn, off: testOff }
}

describe('match: toggle', function() {
  it('toggle', function() {
    let match = { match: mock(true), resolve: mock() }
    let test = testToggle(match, 'x')
    let t = toggle('x', match)
    test.off(t)
    t = toggle('y', t)
    test.on(t)
    t = toggle('', t)
    test.off(t)
  })
  it('toggleSelected', function() {
    let m1 = { key: '', match: mock(true), resolve: mock() }
    let m2 = { key: 'y', match: mock(true), resolve: mock() }
    let m3 = { key: 'x', match: mock(true), resolve: mock() }
    let matchers = toggleSelected([m1,m2,m3], 'x')
    eq(matchers[0], m1)
    eq(matchers[1], m2)
    testToggle(m3, 'x').off(matchers[2])
  })
})

describe.only('match', function() {
  it('basic', function() {
    let next = mock(), err = mock()
    let matcher = match(spec('/a')(next, err))
    let run = u.pipe(matcher.match, matcher.resolve)
    run({href: '/a'})
    eq(next.mock.calls.length, 1)
    let res = next.mock.calls[0][0]['/a']
    assert(res.exact)
    run({href: '/a/b'})
    eq(err.mock.calls.length, 1)
    res = err.mock.calls[0][0]['/a']
    assert(res.passed)
    assert(!res.exact)
    eq(res.match, '/a')
  })
})