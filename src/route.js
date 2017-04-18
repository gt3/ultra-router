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

let parseRoute = route => {
  let fragments = route.split(identifierx)
  let identifiers = []
  let literals = fragments.reduce((acc, f) => {
    if(f.startsWith(':')) identifiers.push(f)
    else acc.push(f)
    return acc
  }, [])
  let matchx = getMatchX(identifiers, literals)
  return {key: route, identifiers, literals, matchx}
}

export let makeLink = (route, values) => {
  let {literals} = isStr(route) ? parseRoute(route) : route
  return substitute(literals, values)
}

export class RouteSegment {
  constructor(action, routes) {
    let parsedRoutes = routes.map(parseRoute)
    Object.assign(this, {routes, parsedRoutes, action})
  }
  find(route) {
    let idx = this.routes.indexOf(route)
    return idx > -1 ? [this.routes[idx], this.parsedRoutes[idx]] : []
  }
  success(result) {
    this.action(result)
  }
  match({pathname}) {
    let [mainRoute, ...subRoutes] = this.parsedRoutes
    let result, matches = mainRoute.matchx.exec(pathname)
    if(matches) {
      result = new Map()
      result.set(mainRoute.key, matches.slice(1).map(decodeURIComponent))
      subRoutes.forEach(r => {
        let submatches = r.matchx.exec(pathname)
        if(submatches) result.set(r.key, submatches.slice(1).map(decodeURIComponent))
      })
    }
    return result
  }
}
