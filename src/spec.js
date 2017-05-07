import { isStr, flattenToObj, hasOwn, empty } from './utils'

const URIComponentBlacklist = `([^\s#$&+,/:;=?@]*)`
const identifierx = /(:[A-Za-z0-9_:]+)/

function substitute(literals, values) {
  return String.raw({ raw: literals }, ...values)
}

function getMatchX(identifiers, literals) {
  let subs = new Array(identifiers.length).fill(URIComponentBlacklist)
  return new RegExp(`^${substitute(literals, subs)}`, 'i')
}

let parsePathKey = pathKey => {
  let key = isStr(pathKey) ? pathKey : ''
  let fragments = key.split(identifierx)
  let identifiers = []
  let literals = fragments.reduce((acc, f) => {
    if (f.indexOf(':') === 0) identifiers.push(f)
    else acc.push(f)
    return acc
  }, [])
  let matchx = key == '' ? new RegExp('') : getMatchX(identifiers, literals)
  return { key: pathKey, identifiers, literals, matchx }
}

function assignValues(pathKey, values = []) {
  let { identifiers } = isStr(pathKey) ? parsePathKey(pathKey) : pathKey
  let res = identifiers.map((id, key) => ({ [id]: values[key] }))
  return flattenToObj(res)
}

class Path {
  constructor(key) {
    Object.assign(this, parsePathKey(key))
  }
  findInvalid(validator, values) {
    let ids = this.identifiers, check = hasOwn.bind(validator)
    return empty(validator)
      ? -1
      : values.findIndex(
          (val, i) => check(ids[i]) && !validator[ids[i]](values)
        )
  }
  validate(validator, values) {
    let invalid = this.findInvalid(validator, values)
    return invalid === -1
      ? { values, passed: true }
      : { values: values.slice(0, invalid) }
  }
  match(validator, pathname) {
    let matches = this.matchx.exec(pathname)
    if (!matches) return {}
    let match = matches[0], values = matches.slice(1).map(decodeURIComponent)
    let exact = match.length === pathname.length
    return Object.assign(this.validate(validator, values), { match, exact })
  }
  makeLink(values) {
    return substitute(this.literals, values)
  }
}

class PathSpec {
  constructor(pathKeys, next, err) {
    if (!Array.isArray(pathKeys)) pathKeys = [isStr(pathKeys) ? pathKeys : '']
    let paths = pathKeys.map(k => new Path(k))
    Object.assign(this, { pathKeys, paths, next, err })
  }
  find(pathKey) {
    let idx = this.pathKeys.indexOf(pathKey)
    return idx > -1 && this.paths[idx]
  }
  match(validator, pathname) {
    let [primary, ...subs] = this.paths
    let result, matches = primary.match(validator, pathname)
    if (matches.passed) {
      result = { pathname }
      result[primary.key] = matches
      subs.some(sub => {
        let submatches = sub.match(validator, pathname)
        if (submatches.passed) result[sub.key] = submatches
        return submatches.exact
      })
    }
    return result
  }
  success(result) {
    return result && Object.keys(result).some(k => result[k].exact)
  }
  resolve(result, success = this.success(result)) {
    return !this.err || success ? this.next(result) : this.err(result)
  }
}

export function spec(...pathKeys) {
  return (next, err) => new PathSpec(pathKeys, next, err)
}

class PrefixSpec extends PathSpec {
  has(path) {
    return this.prefix && path && path.indexOf(prefix) === 0
  }
  strip(target) {
    let { pathname } = target, result = target
    if (this.has(pathname)) {
      pathname = pathname.replace(this.prefix, '')
      result = Object.assign({}, target, { pathname })
    }
    return result
  }
  match(validator, loc) {
    let { ultra } = loc
    let result, matchResult = super.match(validator, loc)
    if (matchResult) {
      result = this.strip(matchResult)
      result.ultra = ultra
      result = super.resolve(result, true)
    }
    else result = { ultra, success: false }
    return result
  }
}

export function prefixSpec(prefix, next) {
  return new PrefixSpec(prefix, next)
}

function rxToFn(rx) {
  return values => !empty(values.filter(rx.test.bind(rx)))
}

function validator(id, rx) {
  return { [id]: rxToFn(rx) }
}

function rx(ids, rx) {
  return ids.map(id => validator(id, rx))
}

export function checks(...ids) {
  return rx.bind(null, ids)
}
