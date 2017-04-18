/*
let input = '/c/:target.value'

let fn = input => {
  let lit = input.replace(/:([A-Za-z0-9_.]+)/g, '${this.$1}')
  return new Function("return `"+lit+"`;")
}

console.log( fn(input).call({target: {value: 1}}) )
*/
const strProto = Object.getPrototypeOf('')
function isStr(s) {
  return Object.getPrototypeOf(Object(s)) === strProto
}

const URIComponentBlacklist = `([^\s#$&+,/:;=?@]*)`
const identifierx = /(:[A-Za-z0-9_]+)/

function substitute(literals, values) {
  return String.raw({raw: literals}, ...values)
}

function getMatchX(identifiers, literals) {
  let subs = new Array(identifiers.length).fill(URIComponentBlacklist)
  return new RegExp(`^${substitute(literals, subs)}`, 'i')
}

let parsePath = path => {
  let fragments = path.split(identifierx)
  let identifiers = []
  let literals = fragments.reduce((acc, f) => {
    if(f.startsWith(':')) identifiers.push(f)
    else acc.push(f)
    return acc
  }, [])
  let matchx = getMatchX(identifiers, literals)
  return {key: path, identifiers, literals, matchx}
}

export let makeLink = (path, values) => {
  let {literals} = isStr(path) ? parsePath(path) : path
  return substitute(literals, values)
}

export class PathSpec {
  constructor(action, paths) {
    let parsedPaths = paths.map(parsePath)
    Object.assign(this, {paths, parsedPaths, action})
  }
  find(path) {
    let idx = this.paths.indexOf(path)
    return idx > -1 ? [this.paths[idx], this.parsedPaths[idx]] : []
  }
  success(result) {
    this.action(result)
  }
  match({pathname}) {
    let [primary, ...subs] = this.parsedPaths
    let result, matches = primary.matchx.exec(pathname)
    if(matches) {
      result = new Map()
      result.set(primary.key, matches.slice(1).map(decodeURIComponent))
      subs.forEach(p => {
        let submatches = p.matchx.exec(pathname)
        if(submatches) result.set(p.key, submatches.slice(1).map(decodeURIComponent))
      })
    }
    return result
  }
}

export default function createListener(action) {
	return function clickHandler(e) {
		//perform validation here: https://github.com/cyclejs/cyclejs/blob/master/history/src/captureClicks.ts
		//1. check which == left click
		//2. check defaultPrevented
		//3. if (event.metaKey || event.ctrlKey || event.shiftKey)
		e.preventDefault()
		action()
	}
}
