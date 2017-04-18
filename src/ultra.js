import {PathSpec, makeLink} from './path'
import {pipe, isStr, noop} from './utils'
import warning from 'warning'

export default class Ultra {
  constructor(history) {
    this.history = history
    this.specs = []
    this.default = noop
    this.match = this.match.bind(this)
    this.process = this.process.bind(this)
    this.navigate = this.navigate.bind(this)
  }
  handle(action, ...paths) {
    if(!paths.length) this.default = action
    else this.specs.push(new PathSpec(action, paths))
    return this
  }
  match(location) {
    if(isStr(location)) location = {pathname: location}
    let result, spec = this.specs.find(spec => !!(result = spec.match(location)))
    return {result, spec}
  }
  process({result, spec}) {
    if(spec) spec.success(result)
    else this.default()
  }
  begin() {
    if(!this.handle) this.handle = this.history.listen(pipe(this.match, this.process))
    return this
  }
  cleanup() {
    if(this.handle) this.handle()
  }
  navigate(link) {
    warning(!!this.match(link).spec, 'link does not match a path: %s', link)
    this.history.push(link)
  }
  findPath(path) {
    let result, spec = this.specs.find(s => !!(result = s.find(path)).length)
    return result
  }
  linkToPath(path, values=[]) {
    let link, [, parsed] = this.findPath(path)
    if(parsed) link = makeLink(parsed, values)
    return link || ''
  }
}
