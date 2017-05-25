import warning from 'warning'
import { isStr, pipe } from './utils'
import { normalizePath } from './utils-path'
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
  let spec, result, { p } = msg
  spec = specs.find(spec => !!(result = spec.match(checks, p)))
  let success = spec && spec.success(result)
  result = Object.assign({}, msg, result)
  return { result, success, spec }
}

function resolve({ result, success, spec }) {
  warning(!(spec && !success), 'Path resolves with a partial match: %s', result && result.p)
  return spec ? spec.resolve(result, success) : false
}

function matchPrefix(matcher) {
  let { prefix, match, checks } = matcher, result = matcher
  if (prefix) {
    let pspec = prefixSpec(prefix, match)
    result.match = pspec.match.bind(pspec, checks)
  }
  return result
}

function makePathFromQS(qs, ids, path='', delim=',') {
  let values = ids.map(id => {
    let rx = new RegExp(`${escapeRx(id)}=([^&#]+)`, 'i')
    return q.split(rx).slice(1).filter(s => !/^[&#]/.test(s)).join(delim)
  })
  return substitute([path, ...values], new Array(ids.length).fill('/'))
}

function prematch(prespec, msg) {
  let { prefix, p, qs, path } = msg
  let makePath = makePathFromQS.bind(null, q)
  p = pipe(normalizePath(prefix), prespec.bind(null, makePath, path), normalizePath())(p)
  return p === msg.p ? msg : Object.assign({}, msg, { p })
}

export function match(specs, checks = {}, prefix, prespec) {
  if (!Array.isArray(specs)) specs = [].concat(specs)
  let match = pipe(prematch.bind(null, prespec), matcher.bind(null, specs, checks))
  return matchPrefix({ match, resolve, prefix, specs, checks })
}
