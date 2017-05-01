import { isStr, flattenToObj } from './utils'

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
  let result, { pathname, ultra } = isStr(loc) ? { pathname: loc } : loc
  let spec = specs.find(spec => !!(result = spec.match(pathname, validator)))
  return { result, spec, ultra }
}

function process({ result, spec, ultra }) {
  if (spec) spec.realize(result, ultra)
}

export function match(specs, checks = []) {
  let validator = flattenToObj(checks)
  return Object.assign(matcher.bind(null, specs, validator), { process })
}
