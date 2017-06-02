import assert from 'assert'
import { eq, neq, oeq, oneq, mock } from './helpers'
import Spec from '../src/spec'
let getMatchX = Spec.__GetDependency__('getMatchX')

describe('spec', function() {
  it('getMatchX', function() {
    console.log(typeof getMatchX)
    //assert(true)
    eq(true, true)
  })
})