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

export class PathSpec {
  constructor(action, paths) {
    let parsedPaths = paths.map(parsePath)
    Object.assign(this, { paths, parsedPaths, action })
  }
  find(path) {
    let idx = this.paths.indexOf(path)
    return idx > -1 ? [this.paths[idx], this.parsedPaths[idx]] : []
  }
  success(result) {
    this.action(result)
  }
  match({ pathname }) {
    let [primary, ...subs] = this.parsedPaths
    let result, matches = primary.matchx.exec(pathname)
    if (matches) {
      result = new Map()
      result.set(primary.key, matches.slice(1).map(decodeURIComponent))
      subs.forEach(p => {
        let submatches = p.matchx.exec(pathname)
        if (submatches)
          result.set(p.key, submatches.slice(1).map(decodeURIComponent))
      })
    }
    return result
  }
}
