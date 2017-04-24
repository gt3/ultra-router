import { PathSpec } from './path'
import { pipe, isStr } from './utils'
import warning from 'warning'

export class Ultra {
  constructor() {
    this.specs = []
    this.defaultActions = []
    this.listen = pipe(this.match, this.process).bind(this)
  }
  add(action, ...pathKeys) {
    if (!pathKeys.length) this.defaultActions.push(action)
    else this.specs.push(new PathSpec(action, pathKeys))
    return this
  }
  addAdvice(action, ...pathKeys) {
    pathKeys.forEach(k => {
      let path = this.findPath(k)
      if (path) path.addAdvice(action)
      warning(!!path, 'pathKey does not match any paths: %s', k)
    })
    return this
  }
  match(loc) {
    let result, { pathname } = isStr(loc) ? { pathname: loc } : loc
    let spec = this.specs.find(spec => !!(result = spec.match(pathname)))
    return { result, spec, pathname }
  }
  process({ result, spec, pathname }) {
    if (spec) spec.success(result, pathname)
    else this.defaultActions.forEach(action => action(pathname))
  }
  findPath(pathKey) {
    let result
    this.specs.find(s => !!(result = s.find(pathKey)))
    return result
  }
  linkToPath(pathKey, values = []) {
    let link, path = this.findPath(pathKey)
    if (path) link = path.makeLink(values)
    return link || ''
  }
}
