import { shieldProps, isClickValid } from './utils'

export const UltraLink = p => {
  let props = shieldProps(p, 'createElement', 'ultra')
  let { href, createElement, ultra } = props
  props.onClick = createListener(ultra.push.bind(null, href))
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
