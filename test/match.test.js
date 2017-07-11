import assert from 'assert'
import { eq, neq, oeq, oneq, mock } from './helpers'
import * as u from '../src/router/utils'
import { parseQS, prependPath } from '../src/router/utils-path'
import { prefixSpec, spec, check, assignValues } from '../src/router/spec'
import { toggle, toggleSelected, match, prefixMatch } from '../src/router/match'

function testToggle(id, match) {
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
    let match = { match: mock(true), resolve: mock(), reject: mock() }
    let test = testToggle('x', match)
    let t = toggle(match, 'x')
    test.off(t)
    t = toggle(t)
    test.on(t)
    t = toggle(t)
    test.off(t)
  })
  it('toggle absent key', function() {
    let match = { match: mock(true), resolve: mock(), reject: mock() }
    testToggle(undefined, match).off(toggle(match))
  })
  it('toggle new value', function() {
    let matchx = { match: mock(true), resolve: mock(), reject: mock() }
    let matchy = { match: mock(true), resolve: mock(), reject: mock() }
    let t = toggle(matchx, 'x')
    testToggle('x', matchx).off(t)
    t = toggle(t, 'y', matchy)
    testToggle('y', matchy).on(t)
  })
  it('toggleSelected', function() {
    let m1 = { key: 'y', match: mock(true), resolve: mock(), reject: mock() }
    let m2 = { key: 'x', match: mock(true), resolve: mock(), reject: mock() }
    let matchers = toggleSelected([m1, m2], 'x')
    eq(matchers[0], m1)
    testToggle('x', m2).off(matchers[1])
    let newm2 = { key: 'x', match: mock(true), resolve: mock(), reject: mock() }
    matchers = toggleSelected(matchers, 'x', newm2)
    eq(matchers[0], m1)
    testToggle('x', newm2).on(matchers[1])
    let untouched = toggleSelected(matchers)
    eq(untouched, matchers)
  })
  it('toggleSelected multiple replacements', function() {
    let m1 = { key: 'x', match: mock(true), resolve: mock(), reject: mock() }
    let m2 = { key: 'x', match: mock(true), resolve: mock(), reject: mock() }
    let m3 = { key: 'x', match: mock(true), resolve: mock(), reject: mock() }
    let newm1 = { key: 'x', match: mock(true), resolve: mock(), reject: mock() }
    let newm3 = { key: 'x', match: mock(true), resolve: mock(), reject: mock() }
    let matchers = toggleSelected([m1, m2, m3], 'x')
    matchers = toggleSelected(matchers, 'x', [newm1, null, newm3])
    eq(matchers[1], m2)
    testToggle('x', newm1).on(matchers[0])
    testToggle('x', newm3).on(matchers[2])
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
    run({ path: '/a' })
    eq(next.mock.calls.length, 1)
    let res = next.mock.calls[0][0]['/a']
    assert(res.exact)
    run({ path: '/a/b' })
    eq(err.mock.calls.length, 1)
    res = err.mock.calls[0][0]['/a']
    assert(res)
    assert(!res.exact)
    eq(res.match, '/a')
  })
  it('specs + checks', function() {
    let specs = [spec('/abc', '/abc/:x')(next, err), spec('/xyz', '/xyz/:x/:y')(next, err)]
    let checks = check(':x', ':y')(/^4/, /[2,3]$/)
    let matcher = match(specs, checks)
    let res, run = u.pipe(matcher.match, matcher.resolve)
    run({ path: '/abc/42' })
    eq(next.mock.calls.length, 1)
    res = next.mock.calls[0][0]['/abc/:x']
    assert(res.exact)
    eq(res.values[0], '42')
    run({ path: '/xyz/42/43' })
    eq(next.mock.calls.length, 2)
    res = next.mock.calls[1][0]['/xyz/:x/:y']
    assert(res.exact)
    oeq(res.values, ['42', '43'])
    run({ path: '/xyz/42/44' })
    eq(err.mock.calls.length, 1)
    assert(!err.mock.calls[0][0]['/xyz/:x/:y'])
    res = err.mock.calls[0][0]['/xyz']
    assert(res)
  })
  it('spec + matchCheck', function() {
    let s = spec('/c')(next, err)
    let matchCheck = mock('/c')
    let matcher = match(s, null, matchCheck)
    let res, run = u.pipe(matcher.match, matcher.resolve)
    run({ path: '/xxx', href: '/xxx', qs: '', hash: '', prefix: '' })
    eq(next.mock.calls.length, 1)
    res = next.mock.calls[0][0]['/c']
    assert(res.exact)
    eq(matchCheck.mock.calls.length, 1)
    res = matchCheck.mock.calls[0][0]
    eq(res.path, '/xxx')
    eq(res.href, '/xxx')
    eq(res.qs, '')
    eq(res.hash, '')
    eq(res.prefix, '')
  })
  it('spec + matchCheck + QS', function() {
    let s = spec('/c/:d')(next, err)
    let matchCheck = ({ qs, path }) => prependPath(parseQS(qs, ['q']), path)
    let m = match(s, null, matchCheck)
    let res, run = u.pipe(m.match, m.resolve)
    run({ path: '/c', qs: '?q=42&q=43' })
    eq(next.mock.calls.length, 1)
    res = next.mock.calls[0][0]['/c/:d']
    assert(res.exact)
    assert(res.values[0], '42,43')
    run({ path: '/c', qs: '?q=42' })
    eq(next.mock.calls.length, 2)
    res = next.mock.calls[1][0]['/c/:d']
    assert(res.exact)
    assert(res.values[0], '42')
  })
  it('does not match any routes', function() {
    let matcher = match(spec('/a')(next, err))
    let run = u.pipe(matcher.match, matcher.resolve)
    run({ path: '/' })
    eq(next.mock.calls.length, 0)
    eq(err.mock.calls.length, 0)
  })
})

describe('prefixMatch', function() {
  let next, err
  beforeEach(function() {
    next = mock()
    err = mock()
    fail = mock()
  })
  it('specs + prefix', function() {
    let s = spec('/c')(next, err)
    let a = prefixMatch('/a', match(s))
    let b = prefixMatch('/b', match(s))
    let res, run = u.pipe(a.match, a.resolve)
    run({ path: '/a/c' })
    eq(next.mock.calls.length, 1)
    res = next.mock.calls[0][0]['/c']
    assert(res.exact)
    run = u.pipe(b.match, b.resolve)
    run({ path: '/b/c' })
    eq(next.mock.calls.length, 2)
    res = next.mock.calls[1][0]['/c']
    assert(res.exact)
  })
  it('specs + matchCheck', function() {
    let s = spec('/c')(next, err, fail)
    let matchCheck = ({ path }) => prependPath(['c'], path)
    let aorbCheck = check(':aorb')(/^[a,b]$/)
    let matcher = prefixMatch('/:aorb', match(s, aorbCheck), matchCheck)
    let res, run = u.pipe(matcher.match, matcher.resolve)
    run({ path: '/a' })
    eq(next.mock.calls.length, 1)
    res = next.mock.calls[0][0]['/c']
    assert(res.exact)
    run({ path: '/b' })
    eq(next.mock.calls.length, 2)
    res = next.mock.calls[1][0]['/c']
    assert(res.exact)
    run = u.pipe(matcher.match, matcher.resolve, matcher.reject)
    run({ path: '/d' })
    eq(next.mock.calls.length, 2)
    eq(fail.mock.calls.length, 1)
  })
})

describe('match: resolve returns timer', function() {
  let next, task
  beforeEach(function() {
    task = mock()
    next = mock(u.scheduleTask(task))
  })
  it('specs + matchCheck', function(done) {
    let matcher = match(spec('/a')(next))
    let run = u.pipe(matcher.match, matcher.resolve)
    let res = run({ path: '/a' })
    eq(next.mock.calls.length, 1)
    eq(task.mock.calls.length, 0)
    assert(u.isTimer(res.timer))
    setTimeout(() => {
      eq(task.mock.calls.length, 1)
      done()
    })
  })
})
