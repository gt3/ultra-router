import assert from 'assert'
import { eq, neq, oeq, oneq, mock } from './helpers'
import * as u from '../src/router/utils'
import { parseQS, prependPath } from '../src/router/utils-path'
import { prefixSpec, spec, check, assignValues, miss } from '../src/router/spec'
import { toggle, toggleSelected, match, prefixMatch } from '../src/router/match'
import { dispatcher } from '../src/router/dispatch'

describe('dispatch + settle', function() {
  let next, fail, missed, task, nextTask
  let clearMocks = () => {
    next.mockClear()
    fail.mockClear()
    missed.mockClear()
    task.mockClear()
    nextTask.mockClear()
  }
  beforeEach(function() {
    next = mock()
    fail = mock()
    missed = mock()
    task = mock()
    nextTask = mock(u.scheduleTask(task, true))
  })
  it('should resolve, fail, and reject upon path match', function() {
    let d = dispatcher(
      [match(spec('/a')(next)), match(spec('/b')(next, null, fail))],
      [miss(missed, '/a')]
    )
    d({ path: '/a' })
    eq(next.mock.calls.length, 1)
    eq(fail.mock.calls.length, 1)
    eq(missed.mock.calls.length, 0)
    clearMocks()
    d({ path: '/b' })
    eq(next.mock.calls.length, 1)
    eq(fail.mock.calls.length, 0)
    eq(missed.mock.calls.length, 1)
    clearMocks()
    d({ path: '/xxx' })
    eq(next.mock.calls.length, 0)
    eq(fail.mock.calls.length, 0)
    eq(missed.mock.calls.length, 0)
  })
  it('should run scheduled task (timer)', function(done) {
    let d = dispatcher([match(spec('/a')(nextTask))], [miss(missed, '/c')])
    d({ path: '/a' })
    eq(nextTask.mock.calls.length, 1)
    eq(task.mock.calls.length, 0)
    eq(missed.mock.calls.length, 1)
    setTimeout(() => {
      eq(task.mock.calls.length, 1)
      done()
    })
  })
})
