import { pipe, substitute, escapeRx, devWarnOn } from './utils'

let urlx = /^http.?:[\/]{2}[^\/]+/

function stripPrefix(prefix, path) {
  return prefix ? path.replace(new RegExp(`^${escapeRx(prefix)}`), '') : path
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

export { addLeadingSlash, removeTrailingSlash, normalizeHref }

function encodePath(path) {
  return encodeURI(path).replace(/%5B/g, '[').replace(/%5D/g, ']')
}

function encodeData(loc) {
  return encodeURIComponent(loc)
}

function decodePath(path) {
  let result
  try {
    result = decodeURIComponent(path)
  } catch (ex) {
    console.error('Error: Could not decode path:', path)
    result = ''
  }
  return result
}

function verifyURIEncoding(path) {
  return encodePath(decodePath(path)) === path
}

function verifyDataEncoding(loc) {
  return encodeData(decodePath(loc)) === loc
}

export { encodePath, decodePath, verifyURIEncoding, verifyDataEncoding }

function verifyHashEncoding(h) {
  return !h || verifyDataEncoding(h)
}

function extractHash(loc) {
  let [locwof, h] = loc.split(/#(.*)$/, 2)
  devWarnOn(!verifyHashEncoding(h), `Use encodeURIComponent to encode fragment data: ${h}`)
  return [locwof, h]
}

function verifyQSEncoding(qs) {
  return !qs || verifyDataEncoding(qs.replace(/=|&/g, ''))
}

function extractQS(loc) {
  let [path, qs] = loc.split(/\?(.*)$/, 2)
  devWarnOn(!verifyQSEncoding(qs), `Use encodeURIComponent to encode query string data: ${qs}`)
  return [path, qs]
}

function extractQSHash(loc) {
  let [locwof, h] = extractHash(loc)
  let [path, qs] = extractQS(locwof)
  return [path, qs, h]
}

function extractPath(path) {
  return path ? encodePath(path.replace(urlx, '')) : ''
}

function makeLocation(path, qs, hash) {
  path = extractPath(path)
  let href = substitute([path, qs, hash], ['?', '#'], true)
  return Object.assign({ path, href }, qs && { qs }, hash && { hash })
}

function parseHref(loc) {
  return makeLocation(...extractQSHash(loc))
}

function parseQS(qs, ids, path = '', delim = ',') {
  if (!qs) return path
  if (qs[0] !== '?') qs = '?' + qs
  let values = ids.map(id => {
    let rx = new RegExp('[?&;]+' + escapeRx(id) + '=([^&;#]+)', 'i')
    return qs.split(rx).slice(1).filter(s => /^[^&;#]/.test(s)).join(delim)
  })
  let slashes = new Array(ids.length).fill('/', path.slice(-1) === '/' ? 1 : 0)
  return substitute([path, ...values], slashes)
}

export { parseHref, parseQS }

let env = {
  get window() {
    devWarnOn(typeof window === 'undefined', 'missing window object in environment')
    return window
  },
  get location() {
    return this.window.location
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
  get origin() {
    let { protocol, hostname, port } = this.location
    return substitute([protocol, hostname, port], ['//', ':'], true)
  },
  get history() {
    return this.window.history
  }
}

export { env }
