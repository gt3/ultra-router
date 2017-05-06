import { isStr, flattenToObj } from './utils'
import { prefixSpec } from './spec'

function findPath(specs, pathKey) {
  let result
  specs.find(spec => !!(result = spec.find(pathKey)))
  return result
}

function addPrefix(prefix, path) {
  return isStr(prefix) && !path.startsWith(prefix) ? `${prefix}${path}` : path
}

function linkFromPathKey(
  specs,
  prefix,
  pathKey,
  values = [],
  usePrefix = true
) {
  let link, path = findPath(specs, pathKey)
  if (usePrefix && path) link = addPrefix(prefix, path.makeLink(values))
  return link || ''
}

function matcher(specs, validator, loc) {
  let spec, result, { pathname, ultra } = isStr(loc) ? { pathname: loc } : loc
  spec = specs.find(spec => !!(result = spec.match(validator, pathname)))
  let success = spec && spec.success(result)
  return { success, result, spec, ultra }
}

function process({ success, result, spec, ultra }) {
  if (spec) spec.resolve(Object.assign(result, { ultra }), success)
}

function matchPrefix(matcher) {
  let { prefix, match, validator } = matcher, result = matcher
  if (isStr(prefix)) {
    let pspec = prefixSpec(prefix, match)
    result.match = pspec.match.bind(pspec, validator)
  }
  return result
}

export function match(specs, checks = [], prefix) {
  if(!Array.isArray(specs)) specs = [].concat(specs)
  let validator = flattenToObj(checks)
  let match = matcher.bind(null, specs, validator)
  return matchPrefix({ match, process, prefix, specs, validator })
}
