function noop() {}

function isFn(t) {
  return typeof t === 'function' ? t : void 0
}

const strProto = Object.getPrototypeOf('')
function isStr(s) {
  return Object.getPrototypeOf(Object(s)) === strProto
}

function empty(t) {
  return !t || (!t.length && !Object.keys(t).length)
}

export { noop, isFn, isStr, empty }

const invokeFn = Function.prototype.call.bind(Function.prototype.call)

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

const hasOwn = Object.prototype.hasOwnProperty

function shieldProps(t, ...keys) {
  let keep = flattenToObj(Object.keys(t).filter(k => !keys.includes(k)).map(k => ({ [k]: t[k] })))
  return Object.setPrototypeOf(keep, t)
}

function substitute(literals, values, removeEmpty) {
  if (removeEmpty && literals.length > values.length) {
    values = Array.from(values)
    literals = Array.from(literals)
    literals = [literals[0], ...literals.slice(1).map((l, i) => l || (values[i] = ''))]
  }
  return String.raw({ raw: literals }, ...values)
}

export { invokeFn, pipe, flattenToObj, mapOverKeys, hasOwn, shieldProps, substitute }
