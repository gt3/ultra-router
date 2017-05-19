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
  let props = shieldProps(p, 'createElement', 'ultra', 'style', 'defaultStyle')
  let { href, createElement, ultra, style, defaultStyle } = props
  props.onClick = createListener(ultra.push.bind(null, encodePath(href)))
  props.style = Object.assign({}, defaultStyle, style)
  return createElement('a', props)
}
UltraLink.defaultProps = {
  defaultStyle: {
    touchAction: 'manipulation',
    msTouchAction: 'manipulation'
  }
}
