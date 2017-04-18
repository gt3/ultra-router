import createHistory from 'history/createHashHistory'
import {RouteSegment, makeLink as _makeLink} from './route'
import warning from 'warning'

const pipe = (...fns) => v => fns.reduce((acc, fn) => fn ? fn(acc) : acc, v)
const strProto = Object.getPrototypeOf('')
function isStr(s) { return Object.getPrototypeOf(Object(s)) === strProto }

function noop() {}

export default class Router {
  constructor(history = createHistory()) {
    this.history = history
    this.segments = []
    this.default = noop
    this.match = this.match.bind(this)
    this.process = this.process.bind(this)
    this.navigate = this.navigate.bind(this)
  }
  add(action, ...routes) {
    let segment = new RouteSegment(action, routes)
    this.segments.push(segment)
    return segment
  }
  setDefault(action) {
    this.default = action
  }
  match(location) {
    if(isStr(location)) location = {pathname: location}
    let result, segment = this.segments.find(seg => !!(result = seg.match(location)))
    return {result, segment}
  }
  process({result, segment}) {
    if(segment) segment.success(result)
    else this.default()
  }
  mount() {
    if(!this.handle) this.handle = this.history.listen(pipe(this.match, this.process))
    return this
  }
  unmount() {
    if(this.handle) this.handle()
  }
  navigate(link) {
    warning(!!this.match(link).segment, 'link did not match any segment: %s', link)
    this.history.push(link)
  }
  findRoute(route) {
    let result, segment = this.segments.find(s => !!(result = s.find(route)).length)
    return result
  }
  makeLink(route, values=[]) {
    let link, [, parsed] = this.findRoute(route)
    if(parsed) link = _makeLink(parsed, values)
    return link || ''
  }
}
