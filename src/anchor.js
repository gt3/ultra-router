import { parseHref } from './utils-path'
import { shieldProps } from './utils'

function validateClick(e) {
  return !(e.defaultPrevented || e.button !== 0 || e.metaKey || e.altKey || e.ctrlKey || e.shiftKey)
}

export function makeClickHandler({ href, state, title }, action) {
  function clickHandler(e) {
    if (validateClick(e)) {
      e.preventDefault()
      action(clickHandler.loc)
    }
  }
  clickHandler.loc = Object.assign(parseHref(href), { state, title })
  return clickHandler
}

const defaultStyle = { touchAction: 'manipulation', msTouchAction: 'manipulation' }

export function Anchor(p) {
  let props = shieldProps(p, 'createElement', 'getUltra', 'style', 'state', 'title', 'navAction')
  let { href, createElement, getUltra, style, state, title, navAction = 'push' } = props
  props.onClick = makeClickHandler({ href, state, title }, loc => getUltra()[navAction](loc))
  props.style = Object.assign({}, defaultStyle, style)
  return createElement('a', props)
}
