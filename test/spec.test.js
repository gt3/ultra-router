import assert from 'assert'
import { eq, neq, oeq, oneq, mock } from './helpers'
import Spec from '../src/spec'
const getMatchX = Spec.__GetDependency__('getMatchX')
const litp = Spec.__GetDependency__('literalp')
const allx = Spec.__GetDependency__('allx')
const parsePathKey = Spec.__GetDependency__('parsePathKey')

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
})
