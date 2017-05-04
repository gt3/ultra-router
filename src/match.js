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

function matchBase(base, path) {
  let baseMatch = path.startsWith(base)
  let pathname = baseMatch ? path.replace(base, '') : path
  return { baseMatch, pathname }
}

let resolveLoc = (base, loc) => {
  let res = isStr(loc) ? { pathname: loc } : loc
  return Object.assign(res, base && matchBase(base, res.pathname))
}

function matcher(specs, validator, base, loc) {
  let spec, result, { baseMatch, pathname, ultra } = resolveLoc(base, loc)
  if(baseMatch)
    spec = specs.find(spec => !!(result = spec.match(pathname, validator)))
  let success = spec && spec.success(result)
  return { success, result, spec, pathname, ultra }
}

function process({ result, spec, ultra }) {
  if (spec) spec.resolve(result, ultra)
}

export function match(specs, checks = [], base = '') {
  let validator = flattenToObj(checks)
  return Object.assign(matcher.bind(null, specs, validator, base), { base, process })
}
