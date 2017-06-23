import assert from 'assert'
import { eq, neq, oeq, oneq, mock } from './helpers'
import Listener from '../src/listener'

describe('Listener', function() {
  let target = {}, ael, rel
  beforeEach(function() {
    target.addEventListener = ael = mock()
    target.removeEventListener = rel = mock()
  })
  it('should register listener on first add', function() {
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
})