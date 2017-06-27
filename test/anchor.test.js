/**
 * @jest-environment jsdom
 */
import assert from 'assert'
import { eq, neq, oeq, oneq, mock } from './helpers'
import * as u from '../src/router/utils-path'
import { setOrigin, setLocation } from './helpers-jsdom'
import AnchorRewired from '../src/anchor'

const retainQSHash = AnchorRewired.__GetDependency__('retainQSHash')
const getNavAction = AnchorRewired.__GetDependency__('getNavAction')
let len = () => u.env.history.length

describe('retain', function() {
  let newLoc
  beforeAll(function() {
    setLocation('/xyz?q=42#skipto')
    newLoc = u.parseHref('/abc')
  })
  it('retain qs + hash', function() {
    let {href, qs, hash} = retainQSHash('qs,hash', newLoc)
    eq(href, u.env.href.replace(u.env.path, newLoc.path))
    eq(qs, u.env.qs)
    eq(hash, u.env.hash)
  })
  it('retain qs', function() {
    let {href, qs, hash} = retainQSHash('qs', newLoc)
    eq(href, u.env.href.replace(u.env.path, newLoc.path).replace('#'+u.env.hash, ''))
    eq(qs, u.env.qs)
    assert(!hash)
  })
  it('retain hash', function() {
    let {href, qs, hash} = retainQSHash('hash', newLoc)
    eq(href, u.env.href.replace(u.env.path, newLoc.path).replace('?'+u.env.qs, ''))
    eq(hash, u.env.hash)
    assert(!qs)
  })
  it('retain nothing', function() {
    let {href, qs, hash} = retainQSHash('', newLoc)
    eq(href, newLoc.path)
    assert(!hash)
    assert(!qs)
  })
  it('retain history', function() {
    eq(getNavAction('x'), 'push')
    eq(getNavAction(null), 'push')
    eq(getNavAction('history'), 'replace')
  })
})

