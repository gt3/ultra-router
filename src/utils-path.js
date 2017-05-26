import { pipe, substitute, escapeRx } from './utils'
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

function normalizeHref(prefix) {
  return pipe(stripPrefix.bind(null, prefix), addLeadingSlash, removeTrailingSlash)
}

export { removeTrailingSlash, normalizeHref }

function encodePath(path) {
  return encodeURI(path).replace(/%5B/g, '[').replace(/%5D/g, ']')
}

function encodeData(loc) {
  return encodeURIComponent(loc)
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

function verifyURIEncoding(path) {
  return encodePath(decodePath(path)) === path
}

function verifyDataEncoding(loc) {
  return encodeData(decodePath(loc)) === loc
}

export { encodePath, decodePath, verifyURIEncoding }

function verifyHashEncoding(h) {
  return !h || verifyDataEncoding(h)
}

function extractHash(loc) {
  let [locwof, h] = loc.split(/#(.*)$/,2)
  warning(verifyHashEncoding(h), 'Use encodeURIComponent to encode fragment data: %s', h)
  return [locwof, h]
}

function verifyQSEncoding(qs) {
  return !qs || verifyDataEncoding(qs.replace(/=|&/g, ''))
}

function extractQS(loc) {
  let [path, qs] = loc.split(/\?(.*)$/, 2)
  warning(verifyQSEncoding(qs), 'Use encodeURIComponent to encode query string data: %s', qs)
  return [path, qs]
}

function extractQSHash(loc) {
  let [locwof, h] = extractHash(loc)
  let [path, qs] = extractQS(locwof)
  return [path, qs, h]
}

function makeLocation(path, qs, hash) {
  let href = substitute([path, qs, hash], ['?', '#'], true)
  return Object.assign({ path, href }, qs && { qs }, hash && { hash })
}

function parseHref(loc) {
  let [path, qs, hash] = extractQSHash(loc)
  return makeLocation(encodePath(path), qs, hash)
}

function parseQS(qs, ids, path = '', delim = ',') {
  if (!qs) return path
  if (qs[0] !== '?') qs = '?' + qs
  let values = ids.map(id => {
    let rx = new RegExp('[?&]+' + escapeRx(id) + '=([^&#]+)', 'i')
    return qs.split(rx).slice(1).filter(s => /^[^&#]/.test(s)).join(delim)
  })
  let slashes = new Array(ids.length).fill('/', path.slice(-1) === '/' ? 1 : 0)
  return substitute([path, ...values], slashes)
}

export { parseHref, parseQS }

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
  get hash() {
    return this.location.hash.slice(1)
  },
  get href() {
    return substitute([this.path, this.qs, this.hash], ['?', '#'], true)
  },
  get history() {
    return this.window.history || {}
  }
}

export { env }
