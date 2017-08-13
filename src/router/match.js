import { pipe, isTimer, makeArray, $devWarnOn } from './utils'
import { normalizePath } from './utils-path'
import { prefixSpec } from './spec'

const off = () => false
const turnOff = o => Object.assign(o, { match: off, resolve: off, reject: off })

export function toggle(matcher, newKey, replacement) {
  let { off, key } = matcher
  let on = off ? replacement || off : turnOff({ off: replacement || matcher })
  on.key = newKey || key
  let hasAll = (o, ...props) => props.every(Object.prototype.hasOwnProperty.bind(o))
  $devWarnOn(() => !hasAll(on, 'match', 'resolve', 'reject'), `Match not well formed: ${on.key}`)
  return on
}

export function toggleSelected(matchers, key, replacements) {
  if (key === undefined) return matchers
  replacements = makeArray(replacements)
  let replaced = 0
  let result = matchers.map(m => (m.key === key ? toggle(m, key, replacements[replaced++]) : m))
  $devWarnOn(
    () => replaced === 0 || replaced !== replacements.length,
    `${replaced} replacements issued for toggle key: ${key}`
  )
  return result
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
  return msg.spec ? Object.assign({}, msg, resolveSpec(msg)) : false
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
