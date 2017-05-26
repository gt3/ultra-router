import { shieldProps } from './utils'
import { parseHref } from './utils-path'

function validateClick(e) {
  return !(e.defaultPrevented || e.button !== 0 || e.metaKey || e.altKey || e.ctrlKey || e.shiftKey)
}

export function createListener(action) {
  return function clickHandler(e) {
    if (validateClick(e)) {
      e.preventDefault()
      action()
    }
  }
}

const defaultStyle = { touchAction: 'manipulation', msTouchAction: 'manipulation' }

export const Anchor = p => {
  let props = shieldProps(p, 'createElement', 'ultra', 'style', 'state', 'title')
  let { href, createElement, ultra, style, state, title } = props
  let loc = Object.assign(parseHref(href), { state, title })
  props.onClick = createListener(ultra.push.bind(null, loc))
  props.style = Object.assign({}, defaultStyle, style)
  return createElement('a', props)
}
