import warning from 'warning'
import { pipe } from './utils'
import { normalizeHref, parseQS } from './utils-path'
import { prefixSpec } from './spec'

/*
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
*/

export function toggle(match, toggleKey) {
  let { off, key = toggleKey } = match, on = off
  if (!off) {
    on = { off: match, match: () => false, resolve: () => false }
  }
  on.key = key
  return on
}

export function toggleSelector(matchers, ...selectKeys) {
  return matchers.map(
    m => (m.key !== undefined && selectKeys.indexOf(m.key) !== -1 ? toggle(m) : m)
  )
}

function matcher(specs, checks, msg) {
  let spec, result, { href } = msg
  spec = specs.find(spec => !!(result = spec.match(checks, href)))
  let success = spec && spec.success(result)
  result = Object.assign({}, msg, result)
  return { result, success, spec }
}

function resolve({ result, success, spec }) {
  warning(!(spec && !success), 'Resolve location with a partial match: %s', result && result.href)
  return spec ? (spec.resolve(result, success), true) : false
}

function matchPrefix(matcher) {
  let { prefix, match, checks } = matcher, result = matcher
  if (prefix) {
    let pspec = prefixSpec(prefix, match)
    result.match = pspec.match.bind(pspec, checks)
  }
  return result
}

function prematch(specCheck, msg) {
  let { prefix, href, path, qs } = msg
  href = normalizeHref(prefix)(href)
  path = normalizeHref(prefix)(path)
  if (specCheck) {
    href = normalizeHref()(specCheck(parseQS.bind(null, qs), path, href))
  }
  return href === msg.href ? msg : Object.assign({}, msg, { href })
}

export function match(specs, checks = {}, prefix, specCheck) {
  if (!Array.isArray(specs)) specs = [].concat(specs)
  let match = pipe(prematch.bind(null, specCheck), matcher.bind(null, specs, checks))
  return matchPrefix({ match, resolve, prefix, specs, checks })
}
