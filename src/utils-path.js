import { pipe } from './utils'
import warning from './warning'

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

function extractFragment(path) {
  let [pathwof, ...f] = path.split(/\/#/)
  warning(f.length <= 1, 'Ambiguous path detected. Could not parse fragment: %s => %s', path, f)
  return [pathwof, f[0]]
}

function extractQS(path) {
  let [pathwoqs, ...qs] = path.split(/\/\?/)
  warning(qs.length <= 1, 'Ambiguous path detected. Could not parse query string: %s => %s', path, qs)
  return [pathwoqs, qs[0]]
}

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

function escapeRx(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export { escapeRx, encodePath, decodePath, verifyEncoding }
