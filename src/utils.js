function pipe(...fns) {
  function invoke(v) {
    return fns.reduce( (acc, fn) => fn ? fn.call(this, acc) : acc, v)
  }
  return invoke
}

const strProto = Object.getPrototypeOf('')
function isStr(s) {
  return Object.getPrototypeOf(Object(s)) === strProto
}

function noop() {}

function shieldProps(t, ...keys) {
  let keep = Object.keys(t)
    .filter(k => !keys.includes(k))
    .map(k => ({ [k]: t[k] }))
  return Object.assign(Object.create(t), ...keep)
}

export { pipe, isStr, noop, shieldProps }

function isClickValid(e) {
  return !(e.defaultPrevented ||
    e.button !== 0 ||
    e.metaKey ||
    e.altKey ||
    e.ctrlKey ||
    e.shiftKey)
}

export { isClickValid }
