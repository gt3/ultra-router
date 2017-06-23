let defaultHandler = handlers => (...args) => handlers().forEach(h => h(...args))

export default class Listener extends Set {
  constructor(eventKey, target, handler = defaultHandler) {
    super()
    this.values = this.values.bind(this)
    handler = handler(this.values)
    let orphans = new WeakSet(), active = false
    Object.assign(this, { eventKey, target, handler, orphans, active })
  }
  beginListen() {
    if (!this.active) {
      this.target.addEventListener(this.eventKey, this.handler)
      this.active = true
    }
  }
  stopListen() {
    if (this.active) {
      this.active = false
      this.target.removeEventListener(this.eventKey, this.handler)
    }
  }
  add(val) {
    this.beginListen()
    super.add.call(this, val)
    this.orphans.delete(val)
    return this.delete.bind(this, val)
  }
  delete(val) {
    this.orphans.add(val)
  }
  clear() {
    this.values().map(v => this.orphans.add(v))
  }
  *[Symbol.iterator]() {
    ;[...super.values.call(this)]
      .filter(v => this.orphans.has(v))
      .map(v => super.delete.call(this, v))
    if (super.size === 0) this.stopListen()
    else yield* super.values.call(this)
  }
  values() {
    return Array.from(this)
  }
  get size() { return this.values().length }
}
