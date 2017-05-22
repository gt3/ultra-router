import { pipe } from './utils'
const trailingSlashx = /\/$/

function stripPrefix(prefix, path) {
  return prefix ? path.replace(prefix, '') : path
}

function addLeadingSlash(path) {
  return path ? path.replace(/^([?#]|[^/])/, '/$1') : '/'
}

function removeTrailingSlash(path) {
  return path === '/' ? path : path.replace(trailingSlashx, '')
}

function normalizePath(prefix) {
  return pipe(stripPrefix.bind(null, prefix), addLeadingSlash, removeTrailingSlash)
}

export { removeTrailingSlash, normalizePath }

function escapeRx(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
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

export { escapeRx, encodePath, decodePath, verifyEncoding }
