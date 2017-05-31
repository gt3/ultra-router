import { parseHref } from './utils-path'

const flattenToObj = (arr, base = {}) => Object.assign(base, ...arr)

function shieldProps(t, ...keys) {
  let keep = flattenToObj(Object.keys(t).filter(k => !keys.includes(k)).map(k => ({ [k]: t[k] })))
  return Object.setPrototypeOf(keep, t)
}

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
