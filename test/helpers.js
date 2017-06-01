import assert from 'assert'
let eq = assert.strictEqual, neq = assert.notStrictEqual
const str = JSON.stringify
const compareObjects = (...objs) => {
  let [first, ...rest] = objs, t = str(first)
  return rest.every(v => t === str(v))
}
const oeq = (o1, o2, ...args) => assert.ok.call(null, compareObjects(o1, o2), ...args)
const oneq = (o1, o2, ...args) => assert.ok.call(null, !compareObjects(o1, o2), ...args)

const random = (min = 1, max = 9) => Math.floor(Math.random() * (max - min + 1) + min)

let mock = returnValue => {
  let mocked = jest.fn()
  if (returnValue !== void 0) mocked.mockReturnValue(returnValue)
  return mocked
}

export { eq, neq, oeq, oneq, random, mock }
