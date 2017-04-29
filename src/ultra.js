import { PathSpec } from './path'
import { noop, pipe, isStr, flattenToObj } from './utils'
import warning from 'warning'

export class Ultra {
  constructor(specs, checks) {
    this.specs = specs
    this.checks = checks
    this.default = noop
    this.listen = pipe(this.match, this.process).bind(this)
  }
  match(loc) {
    let result, { pathname } = isStr(loc) ? { pathname: loc } : loc
    let spec = this.specs.find(spec => !!(result = spec.match(pathname)))
    return { result, spec, pathname }
  }
  process({ result, spec, pathname }) {
    if (spec) spec.success(result, pathname)
    else this.default(pathname)
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

function matcher(specs, validator, loc) {
  let result, { pathname } = isStr(loc) ? { pathname: loc } : loc
  let spec = specs.find(spec => !!(result = spec.match(pathname, validator)))
  return { result, spec }
}

function process({ result, spec }) {
  if(spec) spec.realize(result)
  //else this.default(pathname)
}

export function match(specs, checks=[]) {
  let validator = flattenToObj(checks)
  pipe(matcher.bind(null, specs, validator), process)
}
