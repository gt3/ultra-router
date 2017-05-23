import { pipe, substitute } from './utils'
import warning from 'warning'

function stripPrefix(prefix, path) {
  return prefix ? path.replace(prefix, '') : path
}

function addLeadingSlash(path) {
  return path ? path.replace(/^([?#]|[^/])/, '/$1') : '/'
}

function removeTrailingSlash(path) {
  return path === '/' ? path : path.replace(/\/$/, '')
}

function normalizePath(prefix) {
  return pipe(stripPrefix.bind(null, prefix), addLeadingSlash, removeTrailingSlash)
}

export { removeTrailingSlash, normalizePath }

function encodePath(path) {
  return encodeURI(path).replace(/%5B/g, '[').replace(/%5D/g, ']')
}

function decodePath(path) {
  let result = path
  try {
    result = decodeURIComponent(path)
  } catch (ex) {
    console.error('Error: Could not decode path:', path)
  }
  return result
}

function verifyEncoding(path) {
  return encodePath(decodePath(path)) === path
}

export { encodePath, decodePath, verifyEncoding }

function verifyHashEncoding(h) {
  return !h || verifyEncoding(h)
}

function extractHash(loc) {
  let [pathwof, ...h] = loc.split(/#([^/]+)$/)
  warning(verifyHashEncoding(h[0]), 'Incorrect URI encoding. Use encodeURI on hash: %s', h[0])
  return [pathwof, h[0]]
}

function verifyQSEncoding(qs) {
  return !qs || verifyEncoding(qs.replace(/=|&/g, ''))
}

function extractQS(loc) {
  let [pathwoqs, ...qs] = loc.split(/\?(?=[^\s/]+=)/)
  warning(qs.length <= 1, 'Ambiguous URI. Matched multiple query strings: %s', qs)
  warning(
    verifyQSEncoding(qs[0]),
    'Incorrect URI encoding. Use encodeURIComponent on query string values: %s',
    qs[0]
  )
  return [pathwoqs, qs[0]]
}

function extractQSHash(loc) {
  let [pathwof, h] = extractHash(loc)
  let [pathwoqs, qs] = extractQS(pathwof)
  return [pathwoqs, qs, h]
}

function makeLocation(p, qs, h) {
  p = substitute([p, qs, h], ['?', '#'], true)
  return Object.assign({ p }, qs && { qs }, h && { h })
}

function parseURI(loc) {
  let [p, qs, h] = extractQSHash(loc)
  return makeLocation(encodePath(p), qs, h)
}

export { parseURI }

let env = {
  get window() {
    warning(typeof window !== 'undefined', 'missing window object in environment')
    return window || {}
  },
  get location() {
    return this.window.location || {}
  },
  get path() {
    return removeTrailingSlash(this.location.pathname)
  },
  get qs() {
    return this.location.search.slice(1)
  },
  get h() {
    return this.location.hash.slice(1)
  },
  get p() {
    return substitute([this.path, this.qs, this.h], ['?', '#'], true)
  },
  get history() {
    return this.window.history || {}
  }
}

export { env }
