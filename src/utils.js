function noop() {}

function id(x) { return x }

const strProto = Object.getPrototypeOf('')
function isStr(s) {
  return Object.getPrototypeOf(Object(s)) === strProto
}

function pipe(...fns) {
  function invoke(v) {
    return fns.reduce((acc, fn) => (fn ? fn.call(this, acc) : acc), v)
  }
  return invoke
}

const m2f = (mKey, fn) => fn && (arr => Array.prototype[mKey].call(arr, fn))

const flattenToObj = (arr, base = {}) => Object.assign(base, ...arr)
const pipeOverKeys = (obj, ...fns) => obj && pipe(...fns)(Object.keys(obj))
const mapOverKeys = (obj, mapper) => pipeOverKeys(obj, m2f('map', mapper))

function shieldProps(t, ...keys) {
  let keep = Object.keys(t)
    .filter(k => !keys.includes(k))
    .map(k => ({ [k]: t[k] }))
  return Object.assign(Object.create(t), ...keep)
}

export { noop, id, pipe, isStr, flattenToObj, mapOverKeys, shieldProps }

function isClickValid(e) {
  return !(e.defaultPrevented ||
    e.button !== 0 ||
    e.metaKey ||
    e.altKey ||
    e.ctrlKey ||
    e.shiftKey)
}

export { isClickValid }
