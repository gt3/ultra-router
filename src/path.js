import { isStr } from './utils'

const URIComponentBlacklist = `([^\s#$&+,/:;=?@]*)`
const identifierx = /(:[A-Za-z0-9_]+)/

function substitute(literals, values) {
  return String.raw({ raw: literals }, ...values)
}

function getMatchX(identifiers, literals) {
  let subs = new Array(identifiers.length).fill(URIComponentBlacklist)
  return new RegExp(`^${substitute(literals, subs)}`, 'i')
}

let parsePath = path => {
  let fragments = path.split(identifierx)
  let identifiers = []
  let literals = fragments.reduce((acc, f) => {
    if (f.startsWith(':')) identifiers.push(f)
    else acc.push(f)
    return acc
  }, [])
  let matchx = getMatchX(identifiers, literals)
  return { key: path, identifiers, literals, matchx }
}

export let makeLink = (path, values) => {
  let { literals } = isStr(path) ? parsePath(path) : path
  return substitute(literals, values)
}

function getMatches({matchx}, path) {
  let matches = matchx.exec(path)
  return matches && matches.map(decodeURIComponent)
}

export class PathSpec {
  constructor(action, pathKeys) {
    let paths = pathKeys.map(k => new Path(k))
    Object.assign(this, { paths, action })
  }
  find(pathKey) {
    return this.paths.find(p => p.key === pathKey)
    //let idx = this.paths.indexOf(path)
    //return idx > -1 ? [this.paths[idx], this.parsedPaths[idx]] : []
  }
  success(result) {
    this.action(result)
  }
  match({ pathname }) {
    let [primary, ...subs] = this.parsedPaths
    let result, matches = getMatches(primary, pathname)
    if (matches) {
      result = subs.reduce((acc, p) => {
        let submatches = getMatches(p, pathname)
        if(submatches) acc[p.key] = submatches
        return acc
      }, {})
      result[primary.key] = matches
    }
    return result
  }
}

export class Path {
  constructor(key, advice = []) {
    let parsed = parsePath(key)
    Object.assign(this, parsed, {advice})
  }
  addAdvice(advice) {
    this.advice.push(advice)
  }
  getAdvice(matches) {
    let [matched, ...values] = matches
    return pipe(...this.advice)({matched, values})
  }
  match(locationPath) {
    let matches = this.matchx.exec(locationPath)
    return matches && this.getAdvice(matches.map(decodeURIComponent))
  }
  makeLink(values) {
    return substitute(this.literals, values)
  }
}
