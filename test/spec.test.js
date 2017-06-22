import assert from 'assert'
import { eq, neq, oeq, oneq, mock } from './helpers'
import SpecRewired from '../src/router/spec'
import { prefixSpec, spec, check, assignValues, miss } from '../src/router/spec'

const getMatchX = SpecRewired.__GetDependency__('getMatchX')
const litp = SpecRewired.__GetDependency__('literalp')
const allx = SpecRewired.__GetDependency__('allx')
const parsePathKey = SpecRewired.__GetDependency__('parsePathKey')
const trimIdsValues = SpecRewired.__GetDependency__('trimIdsValues')
const Path = SpecRewired.__GetDependency__('Path')
const PathSpec = SpecRewired.__GetDependency__('PathSpec')
//const MissSpec = SpecRewired.__GetDependency__('MissSpec')

function escape(path, ...ids) {
  path = ids.reduce((acc, id) => acc.replace(id, litp), path)
  return path.replace(/\//g, '\\/')
}

describe('spec', function() {
  it('getMatchX', function() {
    eq(getMatchX([], ['/']).source, escape('^/'))
    eq(getMatchX([':x'], ['/', '/']).source, escape('^/:x/', ':x'))
    eq(getMatchX([':x', ':y'], ['/', '/', '/']).source, escape('^/:x/:y/', ':x', ':y'))
    eq(getMatchX([':x', ':y'], ['/', '/abc/', '/']).source, escape('^/:x/abc/:y/', ':x', ':y'))
  })
  describe('parsePathKey', function() {
    it('should parse path and return correct key, identifiers, literals', function() {
      let key, identifiers, literals
      ;({ key, identifiers, literals } = parsePathKey('/:x/abc/:y/'))
      eq(key, '/:x/abc/:y/')
      oeq(identifiers, [':x', ':y'])
      oeq(literals, ['/', '/abc/', ''])
      ;({ key, identifiers, literals } = parsePathKey('/:x/:y/'))
      eq(key, '/:x/:y/')
      oeq(identifiers, [':x', ':y'])
      oeq(literals, ['/', '/', ''])
      ;({ key, identifiers, literals } = parsePathKey('/:x/'))
      eq(key, '/:x/')
      oeq(identifiers, [':x'])
      oeq(literals, ['/', ''])
      ;({ key, identifiers, literals } = parsePathKey())
      eq(key, undefined)
      oeq(identifiers, [])
      oeq(literals, [''])
    })
    it('should parse empty path and return match all regexp', function() {
      let key, identifiers, literals, matchx
      ;({ key, identifiers, literals, matchx } = parsePathKey(''))
      eq(matchx, allx)
      eq(key, '')
      oeq(identifiers, [])
      oeq(literals, [''])
    })
  })
  it('trimIdsValues', function() {
    let trim = trimIdsValues, ids, vals;
    ([ids,vals] = trim(['x'], ['x','y'], [42,43]))
    oeq(['y'], ids)
    oeq([43], vals);
    ([ids,vals] = trim(['x','y'], ['x','y'], [42,43]))
    oeq([], ids)
    oeq([], vals);
    ([ids,vals] = trim(['y'], ['x','y'], [42,43]))
    oeq(['x','y'], ids)
    oeq([42, 43], vals);
    ([ids,vals] = trim([], ['x','y'], [42,43]))
    oeq(['x','y'], ids)
    oeq([42, 43], vals);
    ([ids,vals] = trim(['x'], [], []))
    oeq([], ids)
    oeq([], vals);
  })
  it('assignValues', function() {
    let expected = { ':x': 42, ':y': 43 }
    oeq(assignValues('/:x', [42]), { ':x': 42 })
    oeq(assignValues('/:x/:y', [42, 43]), expected)
    oeq(assignValues('/:x/:y/', [42, 43]), expected)
    oeq(assignValues(parsePathKey('/:x/:y'), [42, 43]), expected)
    oeq(assignValues('/:x/abc/:y', [42, 43]), expected)
    oeq(assignValues('/abc', [42, 43]), {})
    oeq(assignValues('/', [42, 43]), {})
    oeq(assignValues('/:x'), {})
  })
  it('check', function() {
    let fn = check('x')(/42/)
    assert(fn.x('42'))
    assert(!fn.x('43'))
    fn = check('x', 'y')(/^4/, /[2,3]$/)
    assert(fn.x('42'))
    assert(fn.x('43'))
    assert(!fn.x('44'))
    assert(fn.y('42'))
  })
})

describe('Path: match', function() {
  it('should return empty object on no matches', function() {
    oeq(new Path('/a').match('/b'), {})
  })
  it('exact should be true for exact matches', function() {
    assert(new Path('/a').match(null, '/a').exact)
    assert(!new Path('/a').match(null, '/').exact)
    assert(!new Path('/').match(null, '/a').exact)
    assert(!new Path('').match(null, '/a').exact)
    assert(!new Path('/a').match(null, '/').exact)
    assert(new Path('/:id').match(null, '/a').exact)
    assert(new Path('/:id/:id2').match(null, '/abc/').exact)
    assert(!new Path('/:id/:id2').match(null, '/abc').exact)
  })
  it('passed should be true for all matches', function() {
    assert(new Path('/').match(null, '/a').passed)
    assert(new Path('/a').match(null, '/a').passed)
    assert(new Path('').match(null, '/a').passed)
  })
  it('should validate values', function() {
    let valid = mock(true), invalid = mock(false)
    assert(new Path('/:x').match({ ':x': valid }, '/xxx').passed)
    eq(valid.mock.calls.length, 1)
    eq(valid.mock.calls[0][0], 'xxx')
    oeq(valid.mock.calls[0][1], ['xxx'])
    oeq(valid.mock.calls[0][2], [':x'])
    assert(!new Path('/:x').match({ ':x': invalid }, '/xxx').passed)
    eq(invalid.mock.calls.length, 1)
    assert(new Path('/:id/:id2').match(check(':id2')(/^z/), '/abc/zzz').exact)
    assert(!new Path('/:id/:id2').match(check(':id2')(/^z/), '/abc/xyz').exact)
  })
  it('should validate multiple values in a pathKey', function() {
    let valid = mock(true), invalid = mock(false)
    assert(
      !new Path('/:x/:y/:z').match({ ':x': valid, ':y': valid, ':z': invalid }, '/xxx//zzz').passed
    )
    eq(valid.mock.calls.length, 2)
    eq(invalid.mock.calls.length, 1)
    oeq(valid.mock.calls[0][0], 'xxx')
    oeq(valid.mock.calls[1][0], '')
    oeq(invalid.mock.calls[0][0], 'zzz')
    oeq(valid.mock.calls[0][1], ['xxx', '', 'zzz'])
    oeq(valid.mock.calls[0][2], [':x', ':y', ':z'])
  })
  it('should not invoke remaining checks once validation fails', function() {
    let valid = mock(true), invalid = mock(false)
    assert(!new Path('/:x/:y').match({ ':x': invalid, ':y': valid }, '/xxx/yyy').passed)
    eq(invalid.mock.calls.length, 1)
    eq(valid.mock.calls.length, 0)
  })
})

describe('PathSpec', function() {
  it('should create pathspec for empty key', function() {
    let instance = spec()()
    eq(instance.paths.length, 1)
    eq(instance.paths[0].key, '')
    eq(instance.paths[0].matchx, allx)
  })
  it('should create pathspec for a single key', function() {
    let i1 = new PathSpec('/xyz'), i2 = new PathSpec(['/xyz'])
    eq(i1.paths.length, 1)
    eq(i2.paths.length, 1)
    eq(i1.paths[0].key, '/xyz')
    eq(i2.paths[0].key, '/xyz')
  })
  it('should find path by pathkey', function() {
    let instance = spec('/xyz', '')()
    assert(instance.find(''))
    assert(instance.find('/xyz'))
  })
  describe('match', function() {
    it('should match all paths for empty key', function() {
      let instance = spec()()
      assert(instance.match(null, ''))
      assert(instance.match(null, '/'))
      assert(instance.match(null, '/abc/def'))
    })
    it('should match path only when primary pathKey matches', function() {
      let instance = spec('/abc', '/xyz')()
      assert(!instance.match(null, '/xyz'))
      assert(instance.match(null, '/abc'))
    })
    it('should match primary and sub pathkeys', function() {
      let instance = spec('/', '/x', '/xy', '/xxx')()
      let { '/': a, '/x': b, '/xy': c, '/xxx': d } = instance.match(null, '/xxx')
      assert(!a.exact)
      assert(!b.exact)
      assert(d.exact)
      assert(!c)
    })
    it('should stop matching if primary pathkey matched exactly', function() {
      let instance = spec('/xx', '/x')()
      let { '/xx': a, '/x': b } = instance.match(null, '/xx')
      assert(a.exact)
      assert(!b)
    })
    it('should stop matching on first exact match', function() {
      let instance = spec('/', '/x', '/xy', '/xyy')()
      let { '/': a, '/x': b, '/xy': c, '/xyy': d } = instance.match(null, '/xy')
      assert(!a.exact)
      assert(!b.exact)
      assert(c.exact)
      assert(!d)
    })
  })
  it('success should return true on exact match', function() {
    let instance = spec()()
    let result = { '/x': {}, '/xy': { exact: true } }
    assert(instance.success(result))
    result = { '/x': {}, '/xy': {} }
    assert(!instance.success(result))
  })
  it('resolve should call success/error callback based on result', function() {
    let next = mock('next'), err = mock('err')
    let instance = spec()(next, err)
    let result = { '/x': {}, '/xy': { exact: true } }
    eq(instance.resolve(result), 'next')
    result = { '/x': {}, '/xy': {} }
    eq(instance.resolve(result), 'err')
    instance = spec()(next)
    eq(instance.resolve(result), 'next')
  })
  it('resolve should call success/error callback based on success', function() {
    let next = mock('next'), err = mock('err')
    let instance = spec()(next, err)
    let result = { '/x': {}, '/xy': {} }
    eq(instance.resolve(result, true), 'next')
    instance = spec()(next)
    eq(instance.resolve(result, false), 'next')
  })
  it('reject should call failure callback with result', function() {
    let next = mock('next'), err = mock('err'), fail = mock('fail')
    let instance = spec()(next, err, fail)
    let result = { '/x': {} }
    eq(instance.reject(result), 'fail')
    eq(fail.mock.calls.length, 1)
    eq(fail.mock.calls[0][0], result)
  })
})

describe('PrefixSpec', function() {
  it('on match should invoke callback with matched prefix', function() {
    let next = mock()
    let instance = prefixSpec('/x', next)
    instance.match(null, { path: '/xyz' })
    eq(next.mock.calls.length, 1)
    eq(next.mock.calls[0][0].prefix, '/x')
    eq(next.mock.calls[0][0].path, '/xyz')
  })
  it('should substitute identifier for values', function() {
    let next = mock(), prefix, pIds, pValues
    let instance = prefixSpec('/:x/000/:y', next)
    instance.match(null, { path: '/xxx/000/yyy/zzz' })
    eq(next.mock.calls.length, 1);
    ({prefix, pIds, pValues} = next.mock.calls[0][0]);
    eq(prefix, '/xxx/000/yyy')
    oeq(pIds, [':x',':y'])
    oeq(pValues, ['xxx','yyy'])
    instance.match(null, { path: '/xxx/000//zzz' })
    eq(next.mock.calls.length, 2);
    ({prefix, pIds, pValues} = next.mock.calls[1][0]);
    eq(prefix, '/xxx/000/')
    oeq(pIds, [':x',':y'])
    oeq(pValues, ['xxx',''])
  })
  it('should run checks on values to determine match', function() {
    let next = mock(), valid = mock(true), invalid = mock(false)
    let instance = prefixSpec('/:x/:y', next)
    assert(!instance.match({ ':x': invalid, ':y': valid }, { path: '/xxx/yyy/zzz' }).success)
    eq(next.mock.calls.length, 0)
    instance.match({ ':x': valid, ':y': valid }, { path: '/xxx/yyy/zzz' })
    eq(next.mock.calls.length, 1)
    let {prefix, pIds, pValues} = next.mock.calls[0][0]
    eq(prefix, '/xxx/yyy')
    oeq(pIds, [':x',':y'])
    oeq(pValues, ['xxx','yyy'])
  })
  it('should return success false if prefix does not match', function() {
    let instance = prefixSpec('/x', mock(null))
    assert(!instance.match(null, { path: '/000' }).success)
  })
})

describe('MissSpec', function() {
  it('should resolve if all given pathKeys failed to match', function() {
    let next = mock()
    let instance = miss(next, '/x', '/y')
    instance.match({})
    eq(next.mock.calls.length, 1)
    oeq(next.mock.calls[0][0].miss, ['/x','/y'])
    assert(!instance.match({'/y': {}}))
    eq(next.mock.calls.length, 1)
  })
})