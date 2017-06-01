import assert from 'assert'
import { eq, neq, oeq, oneq, mock } from './helpers'
import * as u from '../src/utils'

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
})
