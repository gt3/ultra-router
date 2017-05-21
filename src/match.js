import { isStr, empty } from './utils'
import { prefixSpec } from './spec'

function findPath(specs, pathKey) {
  let result
  specs.find(spec => !!(result = spec.find(pathKey)))
  return result
}

function addPrefix(prefix, path) {
  return isStr(prefix) && path.indexOf(prefix) !== 0 ? `${prefix}${path}` : path
}

function linkFromPathKey(specs, prefix, pathKey, values = [], usePrefix = true) {
  let link, path = findPath(specs, pathKey)
  if (usePrefix && path) link = addPrefix(prefix, path.makeLink(values))
  return link || ''
}

function matcher(specs, checks, mapper, msg) {
  let spec, result, { pathname } = msg
  if (mapper) pathname = mapper(msg)
  spec = specs.find(spec => !!(result = spec.match(checks, pathname)))
  let success = spec && spec.success(result)
  result = Object.assign({}, msg, result)
  return { result, success, spec }
}

function process({ result, success, spec }) {
  if (spec) spec.resolve(result, success)
  return !!spec
}

function matchPrefix(matcher) {
  let { prefix, match, checks } = matcher, result = matcher
  if (!empty(prefix)) {
    let pspec = prefixSpec(prefix, match)
    result.match = pspec.match.bind(pspec, checks)
  }
  return result
}

export function match(specs, checks = {}, prefix, mapper) {
  if (!Array.isArray(specs)) specs = [].concat(specs)
  let match = matcher.bind(null, specs, checks, mapper)
  return matchPrefix({ match, process, prefix, specs, checks })
}
