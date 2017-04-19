const pipe = (...fns) => v => fns.reduce((acc, fn) => (fn ? fn(acc) : acc), v)

const strProto = Object.getPrototypeOf('')
function isStr(s) {
  return Object.getPrototypeOf(Object(s)) === strProto
}

function noop() {}

export { pipe, isStr, noop }
