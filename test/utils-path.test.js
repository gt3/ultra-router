import assert from 'assert'
import { eq, neq, oeq, oneq, mock } from './helpers'
import * as u from '../src/utils-path'

describe('path utils', function() {
  it('normalizeHref', function() {
    let norm = u.normalizeHref
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
    let dec = u.decodePath
    let asis = `[#$&+,/:;=?@]!'()*-.~`
    eq(dec(asis), asis)
    eq(dec('%20'), ' ')
    eq(dec('%'), '')
  })
  it('verifyURIEncoding', function() {
    let verify = u.verifyURIEncoding
    let asis = `[#$&+,/:;=?@]!'()*-.~`
    assert(verify(asis))
    eq(verify('[]'), true)
    eq(verify('^'), false)
    eq(verify('%'), false)
    eq(verify(''), true)
  })
  it('verifyDataEncoding', function() {
    let verify = u.verifyDataEncoding
    let asis = `!'()*-.~`
    assert(verify(asis))
    eq(verify('[]'), false)
    eq(verify('%'), false)
    eq(verify(''), true)
  })
})
