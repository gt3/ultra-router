/**
 * @jest-environment jsdom
 */
import assert from 'assert'
import { eq, neq, oeq, oneq, mock } from './helpers'
import * as u from '../src/router/utils-path'
import { setOrigin, setLocation } from './helpers-jsdom'
import AnchorRewired from '../src/anchor'
import { Anchor, defaultStyle } from '../src/anchor'
import { container } from '../src/container'
import { mockPushState, makeRandomPath, firePopstate } from './helpers-jsdom'
import { prefixSpec, spec, check, assignValues, miss } from '../src/router/spec'
import { toggle, toggleSelected, match, prefixMatch } from '../src/router/match'

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

describe('Anchor', function() {
  let createElement, next, path, clickEvent, preventDefault
  beforeAll(function() {
    preventDefault = mock()
    clickEvent = Object.assign(new window.Event('click'),{button: 0, preventDefault})
    createElement = mock()
    next = mock()
  })
  beforeEach(function () {
    next.mockClear()
    createElement.mockClear()
    preventDefault.mockClear()
    path = makeRandomPath()
    setLocation('/xyz?q=42#skipto')
  })
  it('end-to-end with retain hash', function() {
    let ultra = container(match(spec(path)(next)), null, null, false)
    let getUltra = () => ultra, retain = 'hash'
    Anchor({ createElement, getUltra, retain, href: path })
    eq(createElement.mock.calls.length, 1)
    eq(createElement.mock.calls[0][0], 'a')
    assert(createElement.mock.calls[0][1])
    let { onClick } = createElement.mock.calls[0][1]
    onClick(clickEvent)
    eq(preventDefault.mock.calls.length, 1)
    eq(next.mock.calls.length, 1)
    let { href } = next.mock.calls[0][0]
    eq(href, path + '#' + u.env.hash)
  })
  it('apply default style', function() {
    Anchor({ createElement, href: path })
    eq(createElement.mock.calls.length, 1)
    let { style } = createElement.mock.calls[0][1]
    oeq(style, defaultStyle)
  })
  it('override default style', function() {
    let override = { touchAction: 'something', msTouchAction: 'something', color: 'green' }
    Anchor({ createElement, href: path, style: override })
    eq(createElement.mock.calls.length, 1)
    let { style } = createElement.mock.calls[0][1]
    oeq(style, override)
  })
  it('should enforce same origin', function() {
    Anchor({ createElement, href: 'http://foo.com' + path })
    eq(createElement.mock.calls.length, 1)
    let { onClick } = createElement.mock.calls[0][1]
    onClick(clickEvent)
    eq(preventDefault.mock.calls.length, 0)
  })
  it('should check if preventDefault was already issued on event', function(done) {
    let event = Object.assign(new Event('click', { bubbles: true, cancelable: true }), {button: 0})
    window.addEventListener('click', e => e.preventDefault() )
    document.dispatchEvent(event)
    setTimeout(() => {
      assert(event.defaultPrevented)
      event.preventDefault = preventDefault
      Anchor({ createElement, href: path })
      let { onClick } = createElement.mock.calls[0][1]
      onClick(event)
      eq(preventDefault.mock.calls.length, 0)
      done()
    })
  })
})