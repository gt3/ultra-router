import { pipe } from './utils'
const trailingSlashx = /\/$/

function stripPrefix(prefix, path) {
  return prefix ? path.replace(prefix, '') : path
}

function addLeadingSlash(path) {
  return path ? path.replace(/^([?#]|[^/])/, '/$1') : '/'
}

function removeTrailingSlash(path) {
  return path.replace(trailingSlashx, '')
}

function normalizePath(prefix) {
  return pipe(stripPrefix.bind(null, prefix), addLeadingSlash, removeTrailingSlash)
}

export { removeTrailingSlash, normalizePath }
