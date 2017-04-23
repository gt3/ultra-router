import { PathSpec } from './path'
import { pipe, isStr, shieldProps, isClickValid } from './utils'
import warning from 'warning'

export class Ultra {
  constructor(history) {
    this.history = history
    this.specs = []
    this.defaultActions = []
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
