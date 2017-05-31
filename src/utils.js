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

export { isFn, isStr, empty }

function pipe(...fns) {
  function invoke(v) {
    return fns.reduce((acc, fn) => (fn ? fn.call(this, acc) : acc), v)
  }
  return invoke
}

const flattenToObj = (arr, base = {}) => Object.assign(base, ...arr)

function shieldProps(t, ...keys) {
  let keep = flattenToObj(Object.keys(t).filter(k => !keys.includes(k)).map(k => ({ [k]: t[k] })))
  return Object.setPrototypeOf(keep, t)
}

function substitute(literals, values, removeEmpty) {
  let falsyToEmpty = v => v || ''
  let vals = Array.from(values, falsyToEmpty)
  let lits = Array.from(literals, falsyToEmpty)
  if (removeEmpty && lits.length > vals.length) {
    lits = [lits[0], ...lits.slice(1).map((l, i) => l || (vals[i] = ''))]
  }
  return String.raw({ raw: lits }, ...vals)
}

function escapeRx(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

export { pipe, flattenToObj, shieldProps, substitute, escapeRx }
