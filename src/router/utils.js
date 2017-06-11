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

export { isFn, isStr, empty }

function makeArray(arr) {
  return Array.isArray(arr) ? arr : empty(arr) ? [] : [arr]
}

function pipe(...fns) {
  function invoke(v) {
    return fns.reduce((acc, fn) => (fn ? fn.call(this, acc) : acc), v)
  }
  return invoke
}

const flattenToObj = (arr, base = {}) => Object.assign(base, ...arr)

function exclude(t, ...keys) {
  return flattenToObj(Object.keys(t).filter(k => keys.indexOf(k) === -1).map(k => ({ [k]: t[k] })))
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

function warnOn(truthy, msg) {
  return truthy && console.error(msg)
}
let $devWarnOn = noop
if (process.env.NODE_ENV !== 'production') {
  $devWarnOn = warnOn
}

export { makeArray, pipe, flattenToObj, exclude, substitute, escapeRx, $devWarnOn }

export class Timer {
  static isTimer(timer) {
    return timer && timer instanceof Timer ? timer : false
  }
  constructor(cb, ms = 0, autoRun = true) {
    this.run = this.run.bind(this, cb, ms)
    if (autoRun) this.run()
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
