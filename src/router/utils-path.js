import { pipe, substitute, escapeRx, $devWarnOn } from './utils'

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

function encodePath(path, decoded) {
  if (!decoded) path = decode(path)
  return encodeURI(path).replace(/%5B/g, '[').replace(/%5D/g, ']')
}

function encodeData(data, decoded) {
  if (!decoded) data = decode(data)
  return encodeURIComponent(data)
}

function decode(path) {
  let result
  try {
    result = decodeURIComponent(path)
  } catch (ex) {
    console.error('Error: Could not decode path:', path)
    result = ''
  }
  return result
}

export { encodePath, encodeData, decode }

function verifyHashEncoding(h) {
  return !h || encodeData(h) === h
}

function extractHash(loc) {
  let [locwof, h] = loc.split(/#(.*)$/, 2)
  $devWarnOn(!verifyHashEncoding(h), `Use encodeURIComponent to encode fragment data: ${h}`)
  return [locwof, h]
}

function verifyQSEncoding(qs) {
  if (qs) qs = qs.replace(/[=&,]/g, '')
  return !qs || encodeData(qs) === qs
}

function extractQS(loc) {
  let [path, qs] = loc.split(/\?(.*)$/, 2)
  $devWarnOn(!verifyQSEncoding(qs), `Use encodeURIComponent to encode query string data: ${qs}`)
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

function parseQS(qs, ids, { delim = ',', defaults = [], decodeValues } = {}) {
  if (qs[0] !== '?') qs = '?' + qs
  let values = ids.map((id, i) => {
    let rx = new RegExp('[?&;]+' + escapeRx(id) + '=([^&;#]+)', 'i')
    let res = qs.split(rx).slice(1).filter(s => /^[^&;#]/.test(s))
    res = (decodeValues ? res.map(decode) : res).join(delim)
    return res || defaults[i] || ''
  })
  return values
}

function prependPath(values, path) {
  let slashes = new Array(values.length).fill('/', path.slice(-1) === '/' ? 1 : 0)
  return substitute([path, ...values], slashes)
}

function appendPath(values, path) {
  let slashes = new Array(values.length).fill('/', 0, path.slice(0, 1) === '/' ? -1 : void 0)
  return substitute([...values, path], slashes)
}

export { parseHref, parseQS, prependPath, appendPath }

let env = {
  get window() {
    $devWarnOn(typeof window === 'undefined', 'missing window object in environment')
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
