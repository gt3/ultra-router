const pipe = (...fns) => v => fns.reduce((acc, fn) => (fn ? fn(acc) : acc), v)

const strProto = Object.getPrototypeOf('')
function isStr(s) {
  return Object.getPrototypeOf(Object(s)) === strProto
}

function noop() {}

function muteProps(t, ...keys) {
  let keep = Object.keys(t).filter(k => !keys.includes(k)).map(k => ({[k]: t[k]}))
  return Object.assign(Object.create(t), ...keep)
}

export { pipe, isStr, noop, muteProps }

function isClickValid(e) {
  return !(e.defaultPrevented ||
    e.button !== 0 ||
    e.metaKey ||
    e.altKey ||
    e.ctrlKey ||
    e.shiftKey)
}

export { isClickValid }
