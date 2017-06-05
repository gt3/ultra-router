import assert from 'assert'
import { eq, neq, oeq, oneq, mock } from './helpers'
import * as u from '../src/utils'
//import MatchRewired from '../src/match'
import { prefixSpec, spec, check, assignValues } from '../src/spec'
import { toggle, toggleSelected, match } from '../src/match'

//const matcher = MatchRewired.__GetDependency__('matcher')

function testToggle(id, match) {
  let testOn = t => {
    assert(t.match())
    assert(t.resolve())
    eq(t, match)
    eq(t.key, id)
  }

  let testOff = t => {
    assert(!t.match())
    assert(!t.resolve())
    eq(t.off, match)
    eq(t.key, id)
  }
  return { on: testOn, off: testOff }
}

describe('match: toggle', function() {
  it('toggle', function() {
    let match = { match: mock(true), resolve: mock(true) }
    let test = testToggle('x', match)
    let t = toggle('x', match)
    test.off(t)
    t = toggle('y', t)
    test.on(t)
    t = toggle(undefined, t)
    test.off(t)
  })
  it('toggle absent key', function() {
    let match = { match: mock(true), resolve: mock(true) }
    testToggle(undefined, match).off(toggle(undefined, match))
  })
  it('toggleSelected', function() {
    let m1 = { key: '', match: mock(true), resolve: mock() }
    let m2 = { key: 'y', match: mock(true), resolve: mock() }
    let m3 = { key: 'x', match: mock(true), resolve: mock() }
    let matchers = toggleSelected([m1, m2, m3], 'x')
    eq(matchers[0], m1)
    eq(matchers[1], m2)
    testToggle('x', m3).off(matchers[2])
  })
})

describe('match', function() {
  let next, err
  beforeEach(function() {
    next = mock()
    err = mock()
  })
  it('specs', function() {
    let matcher = match(spec('/a')(next, err))
    let run = u.pipe(matcher.match, matcher.resolve)
    run({ href: '/a' })
    eq(next.mock.calls.length, 1)
    let res = next.mock.calls[0][0]['/a']
    assert(res.exact)
    run({ href: '/a/b' })
    eq(err.mock.calls.length, 1)
    res = err.mock.calls[0][0]['/a']
    assert(res.passed)
    assert(!res.exact)
    eq(res.match, '/a')
  })
  it('specs + checks', function() {
    let specs = [spec('/abc', '/abc/:x')(next, err), spec('/xyz', '/xyz/:x/:y')(next, err)]
    let checks = check(':x', ':y')(/^4/, /[2,3]$/)
    let matcher = match(specs, checks)
    let res, run = u.pipe(matcher.match, matcher.resolve)
    run({ href: '/abc/42' })
    eq(next.mock.calls.length, 1)
    res = next.mock.calls[0][0]['/abc/:x']
    assert(res.exact)
    eq(res.values[0], '42')
    run({ href: '/xyz/42/43' })
    eq(next.mock.calls.length, 2)
    res = next.mock.calls[1][0]['/xyz/:x/:y']
    assert(res.exact)
    oeq(res.values, ['42', '43'])
    run({ href: '/xyz/42/44' })
    eq(err.mock.calls.length, 1)
    assert(!err.mock.calls[0][0]['/xyz/:x/:y'])
    res = err.mock.calls[0][0]['/xyz']
    assert(res.passed)
  })
  it('specs + prefix', function() {
    let s = spec('/c')(next, err)
    let a = match(s, null, '/a')
    let b = match(s, null, '/b')
    let res, run = u.pipe(a.match, a.resolve)
    run({ path: '/a/c', href: '/a/c' })
    eq(next.mock.calls.length, 1)
    res = next.mock.calls[0][0]['/c']
    assert(res.exact)
    run = u.pipe(b.match, b.resolve)
    run({ path: '/b/c', href: '/b/c' })
    eq(next.mock.calls.length, 2)
    res = next.mock.calls[1][0]['/c']
    assert(res.exact)
  })
  it('spec + specCheck', function() {
    let s = spec('/c')(next, err)
    let specCheck = mock('/c')
    let matcher = match(s, null, null, specCheck)
    let res, run = u.pipe(matcher.match, matcher.resolve)
    run({ path: '/xxx', href: '/xxx', qs: '', hash: '', prefix: '' })
    eq(next.mock.calls.length, 1)
    res = next.mock.calls[0][0]['/c']
    assert(res.exact)
    eq(specCheck.mock.calls.length, 1)
    res = specCheck.mock.calls[0][0]
    eq(res.path, '/xxx')
    eq(res.href, '/xxx')
    eq(res.qs, '')
    eq(res.hash, '')
    eq(res.prefix, '')
  })
  it('spec + specCheck + QS', function() {
    let s = spec('/c/:d')(next, err)
    let checks = check(':aorb')(/^[a,b]$/)
    let specCheck = ({ path }, parseQS) => parseQS(['q'], path)
    let aorb = match(s, checks, '/:aorb', specCheck)
    let res, run = u.pipe(aorb.match, aorb.resolve)
    run({ path: '/a/c', href: '/a/c?q=42&q=43', qs: '?q=42&q=43' })
    eq(next.mock.calls.length, 1)
    res = next.mock.calls[0][0]['/c/:d']
    assert(res.exact)
    assert(res.values[0], '42,43')
    run({ path: '/b/c', href: '/b/c?q=42', qs: '?q=42' })
    eq(next.mock.calls.length, 2)
    res = next.mock.calls[1][0]['/c/:d']
    assert(res.exact)
    assert(res.values[0], '42')
  })
  it('does not match any routes', function() {
    let matcher = match(spec('/a')(next, err))
    let run = u.pipe(matcher.match, matcher.resolve)
    run({ href: '/' })
    eq(next.mock.calls.length, 0)
    eq(err.mock.calls.length, 0)
  })
})
