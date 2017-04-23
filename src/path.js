import { isStr, pipe, flattenToObj } from './utils'

const URIComponentBlacklist = `([^\s#$&+,/:;=?@]*)`
const identifierx = /(:[A-Za-z0-9_]+)/

function substitute(literals, values) {
  return String.raw({ raw: literals }, ...values)
}

function getMatchX(identifiers, literals) {
  let subs = new Array(identifiers.length).fill(URIComponentBlacklist)
  return new RegExp(`^${substitute(literals, subs)}`, 'i')
}

let parsePathKey = key => {
  let fragments = key.split(identifierx)
  let identifiers = []
  let literals = fragments.reduce((acc, f) => {
    if (f.startsWith(':')) identifiers.push(f)
    else acc.push(f)
    return acc
  }, [])
  let matchx = getMatchX(identifiers, literals)
  return { key, identifiers, literals, matchx }
}

export function assignValues(pathKey, values = []) {
  let { identifiers } = isStr(pathKey) ? parsePathKey(pathKey) : pathKey
  let res = identifiers.map((ident, key) => ({ [ident]: values[key] }))
  return flattenToObj(res)
}

export class Path {
  constructor(key, advice = []) {
    let parsed = parsePathKey(key)
    Object.assign(this, parsed, { advice })
  }
  addAdvice(action) {
    this.advice.push(action)
  }
  getAdvice(matches) {
    return pipe(...this.advice)(matches)
  }
  match(locationPath) {
    let matches = this.matchx.exec(locationPath)
    return matches && this.getAdvice(matches.map(decodeURIComponent))
  }
  makeLink(values) {
    return substitute(this.literals, values)
  }
}

export class PathSpec {
  constructor(action, pathKeys) {
    let paths = pathKeys.map(k => new Path(k))
    Object.assign(this, { pathKeys, paths, action })
  }
  find(pathKey) {
    let idx = this.pathKeys.indexOf(pathKey)
    return idx > -1 && this.paths[idx]
  }
  success(result) {
    this.action(result)
  }
  match(locationPath) {
    let [primary, ...subs] = this.paths
    let result, matches = primary.match(locationPath)
    if (matches) {
      result = subs.reduce((acc, p) => {
        let submatches = p.match(locationPath)
        if (submatches) acc[p.key] = submatches
        return acc
      }, {})
      result[primary.key] = matches
    }
    return result
  }
}
