import { PathSpec } from './path'
import { noop, pipe, isStr, flattenToObj } from './utils'
import warning from 'warning'

function findPath(specs, pathKey) {
  let result
  specs.find(spec => !!(result = spec.find(pathKey)))
  return result
}

function linkToPath(specs, pathKey, values = []) {
  let link, path = findPath(specs, pathKey)
  if (path) link = path.makeLink(values)
  return link || ''
}

function matcher(specs, validator, loc) {
  let result, { pathname } = isStr(loc) ? { pathname: loc } : loc
  let spec = specs.find(spec => !!(result = spec.match(pathname, validator)))
  return { result, spec }
}

function process({ result, spec }) {
  if(spec) spec.realize(result)
  //else this.default(pathname)
}

function runner(matcher, processor) {
  return 
}

export function match(specs, checks=[]) {
  let validator = flattenToObj(checks)
  return Object.assign(matcher.bind(null, specs, validator), {process})
}
