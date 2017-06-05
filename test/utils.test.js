import assert from 'assert'
import { eq, neq, oeq, oneq, mock } from './helpers'
import * as u from '../src/router/utils'

describe('utils', function() {
  it('pipe', function() {
    let inc = i => i + 1, sq = i => i * i
    eq(u.pipe(null, inc, sq)(1), 4)
    eq(u.pipe(sq, null, inc)(1), 2)
    eq(u.pipe(null)(1), 1)
  })
  it('flattenToObj', function() {
    let a = [], a2 = [{ x: 1 }, { y: 2 }], a3 = [{ x: { y: 1 } }]
    let o = {}, o2 = { x: 1, y: 2 }, o3 = { x: { y: 1 } }
    oeq(u.flattenToObj(a), o)
    oeq(u.flattenToObj(a2), o2)
    oeq(u.flattenToObj(a3), o3)
  })
  it('isFn', function() {
    function fn() {}
    eq(u.isFn(fn), fn)
    eq(u.isFn(), undefined)
    eq(u.isFn(null), undefined)
  })
  it('isStr', function() {
    eq(u.isStr('xxx'), true)
    eq(u.isStr(''), true)
    eq(u.isStr(new String()), true)
    eq(u.isStr(String('')), true)
    eq(u.isStr(null), false)
    eq(u.isStr(undefined), false)
    eq(u.isStr({}), false)
    eq(u.isStr(1), false)
    eq(u.isStr(Error(' ')), false)
  })
  it('empty', function() {
    eq(u.empty({}), true)
    eq(u.empty({ x: 1 }), false)
    eq(u.empty([]), true)
    eq(u.empty([1]), false)
    eq(u.empty(''), true)
    eq(u.empty(new String()), true)
    eq(u.empty(' '), false)
    eq(u.empty('x'), false)
    eq(u.empty(null), true)
  })
  it('exclude', function() {
    let o = { x: 1, y: 2 }, o2 = { y: 2 }
    oeq(u.exclude(o, 'x'), o2)
    oeq(u.exclude(o, 'x', 'y'), {})
    oeq(u.exclude(o, 'z'), o)
    oeq(u.exclude(o, ''), o)
    neq(u.exclude(o, ''), o)
  })
  it('substitute', function() {
    eq(u.substitute([42, 42], [42]), '424242')
    eq(u.substitute([42], [42]), '42')
    eq(u.substitute([42, , 42], [42, 42]), '42424242')
    eq(u.substitute([42, , 42], [42, 42], true), '424242')
    eq(u.substitute([42, ,], [42], true), '42')
    eq(u.substitute([42, , 42], [42]), '424242')
    eq(u.substitute([], []), '')
    eq(u.substitute([], [42]), '')
    eq(u.substitute([42], []), '42')
  })
  it('escapeRx', function() {
    let escapeAll = `.*+?^$()|[]\{}`
    let escaped = u.escapeRx(escapeAll)
    eq(escaped, '\\'.concat(escapeAll.split('').join('\\')))
    assert.doesNotThrow(() => new RegExp(escaped))
  })
})
