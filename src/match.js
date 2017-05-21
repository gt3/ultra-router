import { isFn, isStr, empty, pipe } from './utils'
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

function matcher(specs, checks, msg) {
  let spec, result, { pathname } = msg
  spec = specs.find(spec => !!(result = spec.match(checks, pathname)))
  let success = spec && spec.success(result)
  result = Object.assign({}, msg, result)
  return { result, success, spec }
}

function process({ result, success, spec }) {
  return spec ? spec.resolve(result, success) : false
}

function matchPrefix(matcher) {
  let { prefix, match, checks } = matcher, result = matcher
  if (!empty(prefix)) {
    let pspec = prefixSpec(prefix, match)
    result.match = pspec.match.bind(pspec, checks)
  }
  return result
}

function wrapPrematch(prematch, msg) {
  let { pathname } = msg
  pathname = prematch(pathname)
  return pathname === msg.pathname ? msg : Object.assign({}, msg, { pathname })
}

function prematchEntry(match, prematch) {
  return !isFn(prematch) ? match : pipe(wrapPrematch.bind(null, prematch), match)
}

export function match(specs, checks = {}, prefix, prematch) {
  if (!Array.isArray(specs)) specs = [].concat(specs)
  let match = prematchEntry(matcher.bind(null, specs, checks), prematch)
  return matchPrefix({ match, process, prefix, specs, checks })
}
