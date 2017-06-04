import { parseHref, env } from './utils-path'
import { exclude } from './utils'

function verifyOrigin(href) {
  return href.indexOf(env.location.protocol) !== 0 || href.indexOf(env.origin) === 0
}

function verifyClick(e) {
  return !(e.defaultPrevented || e.button !== 0 || e.metaKey || e.altKey || e.ctrlKey || e.shiftKey)
}

export function makeClickHandler({ href, state, docTitle }, action) {
  function clickHandler(e) {
    if (verifyClick(e) && verifyOrigin(href)) {
      e.preventDefault()
      action(clickHandler.loc)
    }
  }
  clickHandler.loc = Object.assign(parseHref(href), { state, docTitle })
  return clickHandler
}

const defaultStyle = { touchAction: 'manipulation', msTouchAction: 'manipulation' }
const ownKeys = ['createElement', 'getUltra', 'style', 'state', 'docTitle', 'navAction', 'onClick']

export function Anchor(props) {
  let { href, createElement, getUltra, style, state, docTitle, navAction = 'push' } = props
  props = exclude(props, ...ownKeys)
  props.onClick = makeClickHandler({ href, state, docTitle }, loc => getUltra()[navAction](loc))
  props.style = Object.assign({}, defaultStyle, style)
  return createElement('a', props)
}
