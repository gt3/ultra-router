import assert from 'assert'
import { eq, neq, oeq, oneq, mock } from './helpers'
//import MatchRewired from '../src/match'
import { toggle } from '../src/match'

//const getMatchX = MatchRewired.__GetDependency__('getMatchX')

describe('match', function() {
  it('toggle', function() {
    let match = { match: mock(true), resolve: mock() }
    let testOn = t => {
      assert(t.match())
      eq(t, match)
      eq(t.key, 'x')
    }
    let testOff = t => {
      assert(!t.match())
      eq(t.off, match)
      eq(t.key, 'x')
    }
    let t = toggle('x', match)
    testOff(t)
    t = toggle('y', t)
    testOn(t)
    t = toggle('z', t)
    testOff(t)
  })
  it('toggleSelected', function() {

  })
})