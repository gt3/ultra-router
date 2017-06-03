import assert from 'assert'
import { eq, neq, oeq, oneq, mock } from './helpers'
import SpecRewired from '../src/spec'
import { spec, check, assignValues } from '../src/spec'

const getMatchX = SpecRewired.__GetDependency__('getMatchX')
const litp = SpecRewired.__GetDependency__('literalp')
const allx = SpecRewired.__GetDependency__('allx')
const parsePathKey = SpecRewired.__GetDependency__('parsePathKey')

function escape(path, ...ids) {
  path = ids.reduce((acc, id) => acc.replace(id, litp), path)
  return path.replace(/\//g,'\\/')
}

describe('spec', function() {
  it('getMatchX', function() {
    eq(getMatchX([], ['/']).source, escape('^/'))
    eq(getMatchX([':x'], ['/', '/']).source, escape('^/:x/', ':x'))
    eq(getMatchX([':x',':y'], ['/', '/', '/']).source, escape('^/:x/:y/', ':x', ':y'))
    eq(getMatchX([':x',':y'], ['/', '/abc/', '/']).source, escape('^/:x/abc/:y/', ':x', ':y'))
  })
  describe('parsePathKey', function() {
    it('should parse path and return correct key, identifiers, literals', function() {
      let key, identifiers, literals
      ({key, identifiers, literals} = parsePathKey('/:x/abc/:y/'))
      eq(key, '/:x/abc/:y/')
      oeq(identifiers, [':x',':y'])
      oeq(literals, ['/', '/abc/', '']);
      ({key, identifiers, literals} = parsePathKey('/:x/:y/'));
      eq(key, '/:x/:y/')
      oeq(identifiers, [':x',':y'])
      oeq(literals, ['/', '/', '']);
      ({key, identifiers, literals} = parsePathKey('/:x/'));
      eq(key, '/:x/')
      oeq(identifiers, [':x'])
      oeq(literals, ['/', '']);
      ({key, identifiers, literals} = parsePathKey('/'));
      eq(key, '/')
      oeq(identifiers, [])
      oeq(literals, ['/']);
    })
    it('should parse empty path and return match all regexp', function() {
      let key, identifiers, literals, matchx
      ({key, identifiers, literals, matchx} = parsePathKey(''));
      eq(matchx, allx)
      eq(key, '')
      oeq(identifiers, [])
      oeq(literals, [''])
    })
  })
  it('assignValues', function() {
    let expected = {':x': 42, ':y': 43}
    oeq(assignValues('/:x', [42]), {':x': 42})
    oeq(assignValues('/:x/:y', [42,43]), expected)
    oeq(assignValues('/:x/:y/', [42,43]), expected)
    oeq(assignValues(parsePathKey('/:x/:y'), [42,43]), expected)
    oeq(assignValues('/:x/abc/:y', [42,43]), expected)
    oeq(assignValues('/abc', [42,43]), {})
    oeq(assignValues('/', [42,43]), {})
    oeq(assignValues('/:x', []), {})
  })
  it('spec', function() {
  })
})
