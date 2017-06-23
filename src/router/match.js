import { pipe, exclude, isTimer } from './utils'
import { normalizePath } from './utils-path'
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

function resolveSpec({ result, success, spec }) {
  let timer = isTimer(spec.resolve(result, success))
  return timer ? { result, timer } : { result }
}

function resolve(msg) {
  let res = exclude(msg, 'spec')
  return msg.spec ? Object.assign({}, res, resolveSpec(msg)) : false
}

function reject(specs, msg) {
  let { result, spec } = msg
  specs.forEach(s => s !== spec && s.reject(result))
}

function matchPrefix(prefixKey, matcher) {
  let { match, checks } = matcher
  let pspec = prefixSpec(prefixKey, match)
  return Object.assign({}, matcher, { prefixKey, match: pspec.match.bind(pspec, checks) })
}

function prematch(matchCheck, msg) {
  let { prefix, href, path, qs = '', hash = '' } = msg
  if (prefix) path = normalizePath(prefix)(path)
  if (matchCheck) path = matchCheck({ prefix, href, path, qs, hash })
  return path === msg.path ? msg : Object.assign({}, msg, { path })
}

export function match(specs, checks = {}, matchCheck) {
  if (!Array.isArray(specs)) specs = [].concat(specs)
  let match = pipe(prematch.bind(null, matchCheck), matcher.bind(null, specs, checks))
  return { match, resolve, specs, checks, reject: reject.bind(null, specs) }
}

export function prefixMatch(prefixKey, matcher, prematchCheck) {
  let prefixed = matchPrefix(prefixKey, matcher)
  if (prematchCheck) {
    let { match } = prefixed
    prefixed.match = pipe(prematch.bind(null, prematchCheck), match)
  }
  return prefixed
}
