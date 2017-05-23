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
  return decodeURIComponent(path)
}

function verifyEncoding(path) {
  let result
  try {
    result = encodePath(decodePath(path))
  } catch (ex) {
    console.error('Error: Could not decode path:', path)
  }
  return result === path
}

export { encodePath, decodePath, verifyEncoding }

function verifyHashEncoding(h) {
  return !h || verifyEncoding(h)
}

function extractHash(loc) {
  let [pathwof, ...h] = loc.split(/#([^/]+)$/)
  warning(verifyHashEncoding(h[0]), 'Incorrect encoding. Use encodeURI on hash: %s', h[0])
  return [pathwof, h[0]]
}

function verifyQSEncoding(qs) {
  return !qs || verifyEncoding(qs.replace(/=|&/g, ''))
}

function extractQS(loc) {
  let [pathwoqs, ...qs] = loc.split(/\?(?=[^\s/]+=)/)
  warning(qs.length <= 1, 'Ambiguous path. Matched multiple query strings: %s', qs)
  warning(
    verifyQSEncoding(qs[0]),
    'Incorrect encoding. Use encodeURIComponent on query string values: %s',
    qs[0]
  )
  return [pathwoqs, qs[0]]
}

function extractQSHash(loc) {
  let [pathwof, h] = extractHash(loc)
  let [pathwoqs, qs] = extractQS(pathwof)
  return [pathwoqs, qs, h]
}

function makeLocation(pathname, qs, h) {
  pathname = substitute([pathname, qs, h], ['?', '#'], true)
  return Object.assign({ pathname }, qs && { qs }, h && { h })
}

function parseURI(loc) {
  let [pathname, qs, h] = extractQSHash(loc)
  return makeLocation(encodePath(pathname), qs, h)
}

export { parseURI }
