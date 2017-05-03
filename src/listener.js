export default class Listener extends Set {
  constructor(eventKey, target = window) {
    super()
    let listener = (...args) => this.forEach(l => l(...args))
    Object.assign(this, {eventKey, target, listener, active: false})
  }
  beginListen() {
    if(!this.active) {
      this.target.addEventListener(this.eventKey, this.listener)
      this.active = true
    }
  }
  stopListen() {
    if(this.active) {
      this.active = false
      this.target.removeEventListener(this.eventKey, this.listener)
    }
  }
  add(val) {
    this.beginListen()
    super.add.call(this, val)
  }
  delete(val) {
    super.delete.call(this, val)
    if(this.size === 0) this.stopListen()
  }
  clear() {
    this.stopListen()
    super.call(this)
  }
}
