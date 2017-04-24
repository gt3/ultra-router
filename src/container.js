import { shieldProps, isClickValid } from './utils'
import warning from 'warning'
import createHistory from 'history/createBrowserHistory'

export class BrowserContainer {
  static run(router) {
    return new BrowserContainer(router).run()
  }
  constructor(router) {
    this.history = createHistory()
    this.router = router
  }
  run() {
    let {history, router} = this
    if (!this.handle) this.handle = history.listen(router.listen)
  }
  stop() {
    if(this.handle) this.handle()
  }
  push(loc) {
    warning(!!this.router.match(loc).spec, 'No paths defined for this location: %s', loc)
    this.history.push(loc)
  }
  replace(loc) {
    warning(!!this.router.match(loc).spec, 'No paths defined for this location: %s', loc)
    this.history.replace(loc)
  }
}

export const UltraLink = p => {
  let props = shieldProps(p, 'createElement', 'container')
  let { href, createElement, container } = props
  props.onClick = createListener(container.push.bind(container, href))
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
