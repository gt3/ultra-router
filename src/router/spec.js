import { isStr, flattenToObj, empty, substitute, escapeRx, exclude, $devWarnOn } from './utils'
import { removeTrailingSlash, decode } from './utils-path'

const literalp = `([^\\s/]*)`
const allx = /(?:)/
const identifierx = /(:[A-Za-z0-9_:]+)/

function getMatchX(identifiers, literals) {
  let subs = new Array(identifiers.length).fill(literalp)
  return new RegExp(`^${substitute(literals.map(escapeRx), subs)}`, 'i')
}

let parsePathKey = pathKey => {
  let key = isStr(pathKey) ? removeTrailingSlash(pathKey) : ''
  let fragments = key.split(identifierx)
  let identifiers = []
  let literals = fragments.reduce((acc, f) => {
    if (f.indexOf(':') === 0) identifiers.push(f)
    else acc.push(f)
    return acc
  }, [])
  let matchx = key == '' ? allx : getMatchX(identifiers, literals)
  return { key: pathKey, identifiers, literals, matchx }
}

export function assignValues(pathKey, values = []) {
  let { identifiers } = isStr(pathKey) ? parsePathKey(pathKey) : pathKey
  return flattenToObj(identifiers.map((id, key) => ({ [id]: values[key] })))
}

class Path {
  constructor(key) {
    Object.assign(this, parsePathKey(key))
  }
  findInvalid(checks, values) {
    let ids = this.identifiers, hasCheck = Object.prototype.hasOwnProperty.bind(checks)
    let callCheck = (id, val) => hasCheck(id) && !checks[id](val, ids, values)
    return empty(checks) ? -1 : values.findIndex((val, i) => callCheck(ids[i], val))
  }
  validate(checks, values) {
    let invalid = this.findInvalid(checks, values)
    return invalid === -1
      ? { values, passed: true }
      : { values: values.slice(0, invalid), exact: false }
  }
  match(checks, path) {
    let matches = this.matchx.exec(path)
    if (!matches) return {}
    let match = matches[0], values = matches.slice(1).map(decode)
    let exact = match.length === path.length, ids = this.identifiers
    return Object.assign({ ids, match, exact }, this.validate(checks, values))
  }
  /*makeLink(values) {
    return substitute(this.literals, values)
  }*/
}

function trimIdsValues(sourceIds, targetIds, targetValues) {
  let stopReplaceIndex = sourceIds.findIndex((sid, i) => targetIds[i] !== sid)
  if (stopReplaceIndex === -1) stopReplaceIndex = sourceIds.length
  return [targetIds.slice(stopReplaceIndex), targetValues.slice(stopReplaceIndex)]
}

class PathSpec {
  constructor(pathKeys, next, err, fail) {
    if (!Array.isArray(pathKeys) || !pathKeys.length) pathKeys = [isStr(pathKeys) ? pathKeys : '']
    let paths = pathKeys.map(k => new Path(k))
    Object.assign(this, { pathKeys, paths, next, err, fail })
  }
  find(pathKey) {
    let idx = this.pathKeys.indexOf(pathKey)
    return idx > -1 && this.paths[idx]
  }
  match(checks, path) {
    let [primary, ...subs] = this.paths
    let result, matches = primary.match(checks, path)
    if (matches.passed) {
      result = {
        ids: matches.ids,
        values: matches.values,
        [primary.key]: exclude(matches, 'passed')
      }
      if (!matches.exact) {
        subs.some(sub => {
          let submatches = sub.match(checks, path)
          if (submatches.passed) {
            let [ids, vals] = trimIdsValues(result.ids, submatches.ids, submatches.values)
            result.ids = result.ids.concat(ids)
            result.values = result.values.concat(vals)
            result[sub.key] = exclude(submatches, 'passed')
          }
          return submatches.exact
        })
      }
    }
    return result
  }
  success(result) {
    return result && Object.keys(result).some(k => result[k].exact)
  }
  resolve(result, redirect, success = this.success(result)) {
    $devWarnOn(!success, `Resolve location with a partial match: ${result && result.href}`)
    return !this.err || success ? this.next(result, redirect) : this.err(result, redirect)
  }
  reject(result) {
    return this.fail && this.fail(result)
  }
}

export function spec(...pathKeys) {
  return (next, err, fail) => new PathSpec(pathKeys, next, err, fail)
}

class PrefixSpec extends PathSpec {
  get prefixKey() {
    return this.pathKeys[0]
  }
  match(checks, msg) {
    let { path } = msg, result = Object.assign({}, msg)
    let matches = super.match(checks, path)
    if (matches) {
      let { match: prefix, values: prefixValues } = matches[this.prefixKey]
      result = super.resolve(Object.assign(result, { prefix, prefixValues }), null, true)
    } else result.success = false
    return result
  }
}

export function prefixSpec(prefixKey, next) {
  return new PrefixSpec(prefixKey, next)
}

function rxFn(rxs) {
  return value => rxs.every(rx => rx.test(value))
}

function makeCheck(id, rxs) {
  return { [id]: rxFn(rxs) }
}

function rx(ids, ...rxs) {
  return flattenToObj(ids.map(id => makeCheck(id, rxs)))
}

export function check(...ids) {
  return rx.bind(null, ids)
}

class MissSpec extends PathSpec {
  match(result) {
    let hasCheck = Object.prototype.hasOwnProperty.bind(result)
    let miss = this.paths.filter(({ key }) => !hasCheck(key)).map(({ key }) => key)
    let matched = miss.length === this.paths.length
    return matched && super.resolve(Object.assign({}, result, { miss }), null, true)
  }
}

export function miss(next, ...pathKeys) {
  return new MissSpec(pathKeys, next)
}
