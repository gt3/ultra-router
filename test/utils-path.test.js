import assert from 'assert'
import { eq, neq, oeq, oneq, mock } from './helpers'
import * as u from '../src/router/utils-path'

let verifyMatch = (xhref, xpath, xqs, xhash) => actual => {
  let { href, path, qs = '', hash = '' } = actual
  return oeq([href, path, qs, hash], [xhref, xpath, xqs, xhash])
}

describe('path utils', function() {
  it('normalizePath', function() {
    let norm = u.normalizePath
    eq(norm()('abc/def/'), '/abc/def')
    eq(norm('')('/abc/def/'), '/abc/def')
    eq(norm('/')('/abc/def/'), '/abc/def')
    eq(norm('/abc/')('/abc/def/'), '/def')
    eq(norm('abc')('/abc/def'), '/abc/def')
    eq(norm('/abc/def')('/abc/def/'), '/')
    eq(norm('*$%^')('*$%^abc/def'), '/abc/def')
  })
  it('encodePath', function() {
    let enc = u.encodePath
    let asis = `[#$&+,/:;=?@]!'()*-.~`
    eq(enc(asis), asis)
  })
  it('decodePath', function() {
    let dec = u.decode
    let asis = `[#$&+,/:;=?@]!'()*-.~`
    eq(dec(asis), asis)
    eq(dec('%20'), ' ')
    eq(dec('%'), '')
  })
  it('verify URI encoding', function() {
    let verify = u.encodePath
    let asis = `[#$&+,/:;=?@]!'()*-.~`
    eq(verify(asis), asis)
    eq(verify('^', true), '%5E')
    eq(verify('[]'), '[]')
    neq(verify('%'), '%')
    eq(verify(''), '')
  })
  it('verify URI data encoding', function() {
    let verify = u.encodeData
    let asis = `!'()*-.~`
    eq(verify(asis), asis)
    eq(verify('^', true), '%5E')
    neq(verify('[]'), '[]')
    neq(verify('%'), '%')
    eq(verify(''), '')
  })
  it('prependPath', function() {
    let pre = u.prependPath
    eq(pre(['abc'], '/'), '/abc')
    eq(pre(['abc', 'def'], ''), '/abc/def')
    eq(pre(['abc', 'def'], '/xyz'), '/xyz/abc/def')
    eq(pre(['abc'], 'xyz'), 'xyz/abc')
    eq(pre([], '/'), '/')
    eq(pre([], ''), '')
  })
  it('appendPath', function() {
    let app = u.appendPath
    eq(app(['abc', 'def'], ''), 'abc/def/')
    eq(app(['abc', 'def'], '/'), 'abc/def/')
    eq(app(['abc', 'def'], '/xyz'), 'abc/def/xyz')
    eq(app(['abc', 'def'], 'xyz'), 'abc/def/xyz')
    eq(app([], '/'), '/')
    eq(app([], ''), '')
  })
  it('parseQS', function() {
    let parse = u.parseQS
    oeq(parse('?x=42', ['x']), ['42'])
    oeq(parse('x=42', ['x']), ['42'])
    oeq(parse('?&&;x=42', ['x']), ['42'])
    oeq(parse('x=42', ['y']), [''])
    oeq(parse('x=42', ['x', 'y'], { defaults: [, '43'] }), ['42', '43'])

    oeq(parse('?x=42&x=42', ['x']), ['42,42'])
    oeq(parse('?x=43&y=007&x=42', ['x', 'y']), ['43,42', '007'])
    oeq(parse('?x=43&y=007&x=42', ['x', 'y'], { delim: '&' }), ['43&42', '007'])
    oeq(parse('?x=42;y=43', ['x', 'y']), ['42', '43'])
    oeq(parse('?blahblahblah', ['x', 'y', 'z']), ['', '', ''])

    oeq(parse('?x=%24&&&x=%20', ['x', 'y']), ['%24,%20', ''])
    oeq(parse('?x=%24&&&x=%20', ['x', 'y'], { decodeValues: true }), ['$, ', ''])
  })
  it('parseHref', function() {
    let parse = u.parseHref
    verifyMatch('/abc?x=42#xyz', '/abc', 'x=42', 'xyz')(parse('/abc?x=42#xyz'))
    verifyMatch('/abc/?x=42#xyz', '/abc/', 'x=42', 'xyz')(parse('/abc/?x=42#xyz'))
    verifyMatch('/abc#xyz', '/abc', '', 'xyz')(parse('/abc#xyz'))
    verifyMatch('/abc?xyz', '/abc', 'xyz', '')(parse('/abc?xyz'))
    verifyMatch('/?xyz#xyz', '/', 'xyz', 'xyz')(parse('/?xyz#xyz'))
    verifyMatch('?xyz#xyz', '', 'xyz', 'xyz')(parse('?xyz#xyz'))
    verifyMatch('#xyz?xyz', '', '', 'xyz?xyz')(parse('#xyz?xyz'))
    verifyMatch('/abc', '/abc', '', '')(parse('/abc'))
  })
  it('parseHref for url', function() {
    verifyMatch('/abc?x=42#xyz', '/abc', 'x=42', 'xyz')(u.parseHref('http://foo.com/abc?x=42#xyz'))
  })
  it('parseHref path encode', function() {
    verifyMatch('/%5Eabc?x=42#xyz', '/%5Eabc', 'x=42', 'xyz')(
      u.parseHref('http://foo.com/^abc?x=42#xyz')
    )
  })
})
