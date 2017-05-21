const trailingSlashx = /\/$/

function stripPrefix(prefix, path) {
  return prefix ? path.replace(prefix, '/').replace('//', '/') : path
}

function removeTrailingSlash(path) {
  return path.replace(trailingSlashx, '')
}

function normalizePath(prefix, path) {
  return removeTrailingSlash(stripPrefix(prefix, path))
}

export { removeTrailingSlash, normalizePath }
