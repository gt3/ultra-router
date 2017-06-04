import assert from 'assert'
import { eq, neq, oeq, oneq, mock } from './helpers'
//import MatchRewired from '../src/match'
import { toggle, toggleSelected, match } from '../src/match'

//const getMatchX = MatchRewired.__GetDependency__('getMatchX')
function testToggle(match, id) {
let testOn = t => {
  assert(t.match())
  eq(t, match)
  eq(t.key, id)
}

let testOff = t => {
  assert(!t.match())
  eq(t.off, match)
  eq(t.key, id)
}
return { on: testOn, off: testOff }
}

describe('match', function() {
  it('toggle', function() {
    let match = { match: mock(true), resolve: mock() }
    let test = testToggle(match, 'x')
    let t = toggle('x', match)
    test.off(t)
    t = toggle('y', t)
    test.on(t)
    t = toggle('', t)
    test.off(t)
  })
  it('toggleSelected', function() {
    let m1 = { key: '', match: mock(true), resolve: mock() }
    let m2 = { key: 'y', match: mock(true), resolve: mock() }
    let m3 = { key: 'x', match: mock(true), resolve: mock() }
    let matchers = toggleSelected([m1,m2,m3], 'x')
    eq(matchers[0], m1)
    eq(matchers[1], m2)
    testToggle(m3, 'x').off(matchers[2])
  })
})