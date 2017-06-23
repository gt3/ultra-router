function noop() {}

function id(x) {
  return x
}

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

export { id, isFn, isStr, empty }

function makeArray(arr) {
  return Array.isArray(arr) ? arr : empty(arr) ? [] : [arr]
}

function pipe(...fns) {
  function invoke(v) {
    return fns.reduce((acc, fn) => (fn ? fn.call(this, acc) : acc), v)
  }
  return fns.length > 0 ? invoke : id
}

const flattenToObj = (arr, base = {}) => Object.assign(base, ...arr)

function exclude(t, ...keys) {
  return flattenToObj(Object.keys(t).filter(k => keys.indexOf(k) === -1).map(k => ({ [k]: t[k] })))
}

function substitute(literals, values, removeEmpty) {
  let vals = Array.from(values, v => v || '')
  let lits = Array.from(literals, v => v || '')
  if (removeEmpty && lits.length > vals.length) {
    lits = [lits[0], ...lits.slice(1).map((l, i) => l || (vals[i] = ''))]
  }
  return String.raw({ raw: lits }, ...vals)
}

function escapeRx(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function warnOn(truthy, msg) {
  return truthy && console.error(msg)
}
let $devWarnOn = noop
if (process.env.NODE_ENV !== 'production') {
  $devWarnOn = warnOn
}

export { makeArray, pipe, flattenToObj, exclude, substitute, escapeRx, $devWarnOn }

class Timer {
  constructor(cb, wait, ms = 0) {
    this.run = this.run.bind(this, cb, ms)
    if (!wait) this.run()
  }
  get active() {
    return !!this.ref
  }
  run(cb, ms) {
    return (this.ref = setTimeout(this.stop.bind(this, cb), ms))
  }
  stop(cb) {
    clearTimeout(this.ref)
    this.ref = undefined
    return cb && cb()
  }
}

let isTimer = timer => (timer && timer instanceof Timer ? timer : false)
let scheduleTask = (...args) => new Timer(...args)

export { isTimer, scheduleTask }
