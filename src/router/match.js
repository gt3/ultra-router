import { pipe, $devWarnOn } from './utils'
import { normalizeHref, parseQS } from './utils-path'
import { prefixSpec } from './spec'

let fail = () => false

export function toggle(newKey, match) {
  let { off, key = newKey } = match, on = off
  if (!off) {
    on = { off: match, match: fail, resolve: fail, reject: fail }
  }
  if (key) on.key = key
  return on
}

export function toggleSelected(matchers, ...selectKeys) {
  return matchers.map(
    m => (m.key !== undefined && selectKeys.indexOf(m.key) !== -1 ? toggle(m.key, m) : m)
  )
}

function matcher(specs, checks, msg) {
  let spec, result, { href } = msg
  spec = specs.find(s => !!(result = s.match(checks, href)))
  let success = spec && spec.success(result)
  result = Object.assign({}, msg, result)
  return { result, success, spec }
}

function resolve(msg) {
  let abandon, { result, success, spec } = msg
  $devWarnOn(spec && !success, `Resolve location with a partial match: ${result && result.href}`)
  if (spec) abandon = spec.resolve(result, success) === false
  return spec ? Object.assign({}, msg, { abandon }) : false
}

function reject(specs, msg) {
  let { result, spec } = msg
  specs.forEach(s => s !== spec && s.reject(result))
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
  let { prefix, href, path, qs, hash } = msg
  href = normalizeHref(prefix)(href)
  path = normalizeHref(prefix)(path)
  if (specCheck) {
    let specCheckMsg = { prefix, href, path, qs, hash }
    href = normalizeHref()(specCheck(specCheckMsg, parseQS.bind(null, qs)))
  }
  return href === msg.href ? msg : Object.assign({}, msg, { href, path })
}

export function match(specs, checks = {}, prefix, specCheck) {
  if (!Array.isArray(specs)) specs = [].concat(specs)
  let match = pipe(prematch.bind(null, specCheck), matcher.bind(null, specs, checks))
  let rejectBound = reject.bind(null, specs)
  return matchPrefix({ match, resolve, prefix, specs, checks, reject: rejectBound })
}