import { pipe, exclude, Timer } from './utils'
import { normalizeHref, parseQS } from './utils-path'
import { prefixSpec } from './spec'

let falsy = () => false

export function toggle(newKey, match) {
  let { off, key = newKey } = match, on = off
  if (!off) {
    on = { off: match, match: falsy, resolve: falsy, reject: falsy }
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
  let spec, result, { path } = msg
  spec = specs.find(s => !!(result = s.match(checks, path)))
  let success = spec && spec.success(result)
  result = Object.assign({}, msg, result)
  return { result, success, spec }
}

function makeRedirect(ultra) {
  return (loc, wait) => new Timer(() => ultra.replace(loc), 0, !wait)
}

function resolveSpec({ result, success, spec }) {
  let { ultra } = result, redirect = makeRedirect(ultra)
  result = exclude(result, 'ultra')
  let timer = Timer.isTimer(spec.resolve(result, redirect, success))
  return timer ? { result, timer } : { result }
}

function resolve(msg) {
  return msg.spec ? Object.assign({}, msg, resolveSpec(msg)) : false
}

function reject(specs, msg) {
  let { result, spec } = msg
  specs.forEach(s => s !== spec && s.reject(result))
}

function matchPrefix(prefix, matcher) {
  let { match, checks } = matcher
  let pspec = prefixSpec(prefix, match)
  return Object.assign({}, result, { prefix, match: pspec.match.bind(pspec, checks) })
}

function prematch(matchCheck, msg) {
  let { prefix, href, path, qs = '', hash = '' } = msg
  if (prefix) {
    href = normalizeHref(prefix)(href)
    path = normalizeHref(prefix)(path)
  }
  if (matchCheck) {
    let checkMsg = { prefix, href, path, qs, hash }
    path = matchCheck(checkMsg, parseQS.bind(null, qs))
  }
  return path === msg.path ? msg : Object.assign({}, msg, { href, path })
}

export function match(specs, checks = {}, matchCheck) {
  if (!Array.isArray(specs)) specs = [].concat(specs)
  let match = pipe(prematch.bind(null, matchCheck), matcher.bind(null, specs, checks))
  return { match, resolve, specs, checks, reject: reject.bind(null, specs) }
}

export function prefixMatch(prefix, matcher, matchCheck) {
  let prefixed = matchPrefix(prefix, matcher)
  if(matchCheck) {
    let { match } = prefixed
    prefixed.match = pipe(prematch.bind(null, matchCheck), match)
  }
  return prefixed
}
