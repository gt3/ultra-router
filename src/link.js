import { shieldProps, validateClick, encodePath } from './utils'

export function createListener(action) {
  return function clickHandler(e) {
    if (validateClick(e)) {
      e.preventDefault()
      action()
    }
  }
}

export const UltraLink = p => {
  let props = shieldProps(p, 'createElement', 'ultra', 'style', 'defaultStyle', 'state', 'title')
  let { href, createElement, ultra, style, defaultStyle, state, title } = props
  let pathname = encodePath(href)
  props.onClick = createListener(ultra.push.bind(null, { pathname, state, title }))
  props.style = Object.assign({}, defaultStyle, style)
  return createElement('a', props)
}
UltraLink.defaultProps = {
  defaultStyle: {
    touchAction: 'manipulation',
    msTouchAction: 'manipulation'
  }
}
