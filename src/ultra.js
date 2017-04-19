import { PathSpec, makeLink } from './path'
import { pipe, isStr, noop, muteProps } from './utils'
import warning from 'warning'

export class Ultra {
  constructor(history) {
    this.history = history
    this.specs = []
    this.default = noop
    this.match = this.match.bind(this)
    this.process = this.process.bind(this)
    this.go = this.go.bind(this)
  }
  handle(action, ...paths) {
    if (!paths.length) this.default = action
    else this.specs.push(new PathSpec(action, paths))
    return this
  }
  match(location) {
    if (isStr(location)) location = { pathname: location }
    let result,
      spec = this.specs.find(spec => !!(result = spec.match(location)))
    return { result, spec }
  }
  process({ result, spec }) {
    if (spec) spec.success(result)
    else this.default()
  }
  begin() {
    if (!this.handle)
      this.handle = this.history.listen(pipe(this.match, this.process))
    return this
  }
  cleanup() {
    if (this.handle) this.handle()
  }
  go(link) {
    warning(!!this.match(link).spec, 'link does not match a path: %s', link)
    this.history.push(link)
  }
  findPath(path) {
    let result
    this.specs.find(s => !!(result = s.find(path)).length)
    return result
  }
  linkToPath(path, values = []) {
    let link, [, parsed] = this.findPath(path)
    if (parsed) link = makeLink(parsed, values)
    return link || ''
  }
}

export const UltraLink = p => {
  let props = muteProps(p, 'createElement', 'ultra', 'tag', 'clickEvent')
  let { createElement, ultra, href, tag, clickEvent } = props
  props[clickEvent] = createListener(ultra.go.bind(null, href))
  return createElement(tag, props)
}
UltraLink.defaultProps = {
  tag: 'a',
  clickEvent: typeof document !== 'undefined' && document.ontouchstart
    ? 'onTouchStart'
    : 'onClick'
}

export function createListener(action) {
  return function clickHandler(e) {
    //perform validation here: https://github.com/cyclejs/cyclejs/blob/master/history/src/captureClicks.ts
    //1. check which == left click
    //2. check defaultPrevented
    //3. if (event.metaKey || event.ctrlKey || event.shiftKey)
    e.preventDefault()
    action()
  }
}
