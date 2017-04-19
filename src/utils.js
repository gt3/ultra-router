const pipe = (...fns) => v => fns.reduce((acc, fn) => (fn ? fn(acc) : acc), v)

const strProto = Object.getPrototypeOf('')
function isStr(s) {
  return Object.getPrototypeOf(Object(s)) === strProto
}

function noop() {}

const hasOwn = Object.prototype.hasOwnProperty

function muteProps(t, ...keys) {
  let res = Object.assign({}, t), mute = { enumerable: false }
  keys.forEach(k => hasOwn.call(res, k) && Object.defineProperty(res, k, mute))
  return res
}

export { pipe, isStr, noop, muteProps }
