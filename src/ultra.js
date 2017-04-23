import { PathSpec } from './path'
import { pipe, isStr, noop, shieldProps, isClickValid } from './utils'
import warning from 'warning'

export class Ultra {
  constructor(history) {
    this.history = history
    this.specs = []
    this.default = noop
  }
  handle(action, ...pathKeys) {
    if (!pathKeys.length) this.default = action
    else this.specs.push(new PathSpec(action, pathKeys))
    return this
  }
  advice(action, ...pathKeys) {
    pathKeys.forEach(k => {
      let path = this.findPath(k)
      if (path) path.addAdvice(action)
      warning(!!path, 'pathKey does not match any paths: %s', k)
    })
    return this
  }
  match(location) {
    let { pathname } = isStr(location) ? { pathname: location } : location
    let result,
      spec = this.specs.find(spec => !!(result = spec.match(pathname)))
    return { result, spec }
  }
  process({ result, spec }) {
    if (spec) spec.success(result)
    else this.default()
  }
  ready() {
    if (!this.handle) {
      let listener = pipe(this.match, this.process).bind(this)
      this.handle = this.history.listen(listener)
    }
    return this
  }
  cleanup() {
    if (this.handle) this.handle()
  }
  go(link) {
    warning(!!this.match(link).spec, 'link does not match any paths: %s', link)
    this.history.push(link)
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

export const UltraLink = p => {
  let props = shieldProps(p, 'createElement', 'ultra')
  let { href, createElement, ultra } = props
  props.onClick = createListener(ultra.go.bind(ultra, href))
  return createElement('a', props)
}
UltraLink.defaultProps = {
  style: {
    cursor: 'pointer',
    touchAction: 'manipulation',
    msTouchAction: 'manipulation'
  }
}

export function createListener(action) {
  return function clickHandler(e) {
    if (isClickValid) {
      e.preventDefault()
      action()
    }
  }
}
