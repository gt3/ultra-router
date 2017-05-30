const flattenToObj = (arr, base = {}) => Object.assign(base, ...arr)

function shieldProps(t, ...keys) {
  let keep = flattenToObj(Object.keys(t).filter(k => !keys.includes(k)).map(k => ({ [k]: t[k] })))
  return Object.setPrototypeOf(keep, t)
}

const defaultStyle = { touchAction: 'manipulation', msTouchAction: 'manipulation' }

const Anchor = p => {
  let props = shieldProps(p, 'createElement', 'ultra', 'style', 'state', 'title')
  let { href, createElement, ultra, style, state, title } = props
  props.onClick = ultra.navOnClick({ href, state, title })
  props.style = Object.assign({}, defaultStyle, style)
  return createElement('a', props)
}

export { Anchor }
