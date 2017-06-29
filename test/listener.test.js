import assert from 'assert'
import { eq, neq, oeq, oneq, mock } from './helpers'
import Listener from '../src/listener'

describe('Listener', function() {
  let target = {}, ael, rel
  beforeEach(function() {
    target.addEventListener = ael = mock()
    target.removeEventListener = rel = mock()
  })
  it('should wait to register listener for first add', function() {
    let l = new Listener('x', target), item = function() {}
    assert(!l.active)
    eq(ael.mock.calls.length, 0)
    l.add(item)
    assert(l.active)
    eq(ael.mock.calls.length, 1)
    eq(ael.mock.calls[0][0], 'x')
    let items = l.values()
    eq(items.length, 1)
    eq(items[0], item)
  })
  it('should override default handler', function() {
    let h1 = mock(), h2 = mock(h1)
    let l = new Listener('x', target, h2)
    eq(h2.mock.calls.length, 1)
    eq(h2.mock.calls[0][0], l.values)
    eq(l.handler, h1)
  })
  it('should remove item, remove listener if set is empty', function() {
    let l = new Listener('x', target)
    let item1 = function() {}, item2 = function() {}
    l.add(item1)
    l.add(item2)
    eq(l.size, 2)
    l.delete(item1)
    eq(l.size, 1)
    eq(rel.mock.calls.length, 0)
    l.delete(item2)
    eq(l.size, 0)
    eq(rel.mock.calls.length, 1)
  })
  it('should be able to readd item after removal', function() {
    let l = new Listener('x', target)
    let item1 = function() {}, item2 = function() {}
    l.add(item1)
    l.add(item2)
    eq(l.size, 2)
    l.delete(item1)
    eq(l.size, 1)
    l.add(item1)
    eq(l.size, 2)
  })
  it('clear should remove all items', function() {
    let l = new Listener('x', target)
    let item1 = function() {}, item2 = function() {}
    l.add(item1)
    l.add(item2)
    eq(l.size, 2)
    l.clear()
    eq(l.size, 0)
    eq(rel.mock.calls.length, 1)
    l.add(item1)
    eq(l.size, 1)
    eq(ael.mock.calls.length, 2)
  })
  it('invoking stopListen on non-active listener should not throw', function() {
    let l = new Listener('x', target)
    assert(!l.active)
    assert.doesNotThrow(l.stopListen.bind(l))
  })
  it('default handler should invoke registered listeners', function() {
    let l = new Listener('x', target), msg = {}
    let item1 = mock(), item2 = mock(), item3 = mock()
    l.add(item1)
    l.add(item2)
    l.add(item3)
    l.delete(item2)
    let handler = ael.mock.calls[0][1]
    handler(msg)
    eq(item1.mock.calls.length, 1)
    eq(item2.mock.calls.length, 0)
    eq(item3.mock.calls.length, 1)
    eq(item1.mock.calls[0][0], msg)
    eq(item3.mock.calls[0][0], msg)
  })
})
