import { isStr, isFn, pipe, flattenToObj, hasOwn } from './utils'

const URIComponentBlacklist = `([^\s#$&+,/:;=?@]*)`
const identifierx = /(:[A-Za-z0-9_:]+)/

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
  let res = identifiers.map((id, key) => ({ [id]: values[key] }))
  return flattenToObj(res)
}

export class Path {
  constructor(key) {
    Object.assign(this, parsePathKey(key))
  }
  validate(validator, matches) {
    let [, values] = matches, ids = this.identifiers
    let vexists = hasOwn.bind(validator)
    return values.find((val, i) => vexists(ids[i]) && !validator[ids[i]](val))
  }
  match(locationPath) {
    let matches = this.matchx.exec(locationPath)
    return matches && matches.map(decodeURIComponent)
  }
  makeLink(values) {
    return substitute(this.literals, values)
  }
}

class PathSpec {
  constructor(pathKeys, actions) {
    let paths = pathKeys.map(k => new Path(k))
    let [next, err] = actions
    Object.assign(this, { pathKeys, paths, next, err })
  }
  success(result, pathname) {
    this.next(result, pathname)
  }
  find(pathKey) {
    let idx = this.pathKeys.indexOf(pathKey)
    return idx > -1 && this.paths[idx]
  }
  match(locationPath, validator) {
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

function actions(pathKeys, ...fns) {
  return new PathSpec(pathKeys, fns)
}

export function spec(...pathKeys) {
  return actions.bind(null, pathKeys)
}

function rxToFn(rx) {
  return values => values.filter(rx.test.bind(rx))
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

check(':id', ':date')(/\d/)
