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

function verifyFragmentEncoding(f) {
  return !f || verifyEncoding(f)
}

function extractFragment(path) {
  let [pathwof, ...f] = path.split(/#([^/]+)$/)
  warning(verifyFragmentEncoding(f[0]), 'Incorrect encoding. Use encodeURI on fragment: %s', f[0])
  return [pathwof, f[0]]
}

function verifyQSEncoding(qs) {
  return !qs || verifyEncoding(qs.replace(/=|&/g, ''))
}

function extractQS(path) {
  let [pathwoqs, ...qs] = path.split(/\?(?=[^\s/]+=)/)
  warning(qs.length <= 1, 'Ambiguous path. Matched multiple query strings: %s', qs)
  warning(
    verifyQSEncoding(qs[0]),
    'Incorrect encoding. Use encodeURIComponent on query string values: %s',
    qs[0]
  )
  return [pathwoqs, qs[0]]
}

function extractQSFragment(path) {
  let [pathwof, f] = extractFragment(path)
  let [pathwoqs, qs] = extractQS(pathwof)
  return [pathwoqs, qs, f]
}

function makePathObj(pathname, qs, f) {
  pathname = substitute([pathname, qs, f], ['?', '#'], true)
  return Object.assign({ pathname }, qs && { qs }, f && { f })
}

function makePath(path) {
  let [pathname, qs, f] = extractQSFragment(path)
  return makePathObj(encodePath(pathname), qs, f)
}

export { makePath }
