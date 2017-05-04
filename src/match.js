import { isStr, flattenToObj } from './utils'

function findPath(specs, pathKey) {
  let result
  specs.find(spec => !!(result = spec.find(pathKey)))
  return result
}

function linkFromPathKey(specs, base, pathKey, values = []) {
  let link, path = findPath(specs, pathKey)
  if (path) link = addBase(base, path.makeLink(values))
  return link || ''
}

function addBase(base, path) {
  let res = path
  if(base) {
    let { pathname } = checkRemoveBase(base, path)
    res = `${base}${pathname}`
  }
  return res
}

function checkRemoveBase(base, path) {
  let baseViolated, pathname = path
  if(base) {
    baseViolated = !path.startsWith(base)
    if(!baseViolated) pathname = path.replace(base, '')
  }
  return { baseViolated, pathname }
}

let resolveLoc = (base, loc) => {
  let res = isStr(loc) ? { pathname: loc } : loc
  return Object.assign(res, base && checkRemoveBase(base, res.pathname))
}

function matcher(specs, validator, base, loc) {
  let spec, result, { baseViolated, pathname, ultra } = resolveLoc(base, loc)
  if(!baseViolated)
    spec = specs.find(spec => !!(result = spec.match(pathname, validator)))
  let success = spec && spec.success(result)
  return { success, result, spec, pathname, ultra }
}

function process({ result, spec, ultra }) {
  if(spec) spec.resolve(result, ultra)
}

export function match(specs, checks = [], base = '') {
  let validator = flattenToObj(checks)
  let match = matcher.bind(null, specs, validator, base)
  let makeLink = linkFromPathKey.bind(null, specs, base)
  return { match, process, base, makeLink }
}
