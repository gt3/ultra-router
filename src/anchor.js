import { parseHref, env } from './router/utils-path'
import { exclude, substitute } from './router/utils'

function retainQS(retain, currQS) {
  let qs = retain && /\bqs\b/.test(retain) ? env.qs : ''
  return currQS ? substitute([currQS, qs], ['&'], true) : qs
}

function retainHash(retain, currHash) {
  return retain && /\bhash\b/.test(retain) ? env.hash : currHash
}

function retainQSHash(retain, loc) {
  let qs = retainQS(retain, loc.qs)
  let hash = retainHash(retain, loc.hash)
  let href = substitute([loc.path, qs, hash], ['?', '#'], true)
  return { href, qs, hash }
}

function verifyOrigin(href) {
  return href.indexOf(env.location.protocol) !== 0 || href.indexOf(env.origin) === 0
}

function verifyClick(e) {
  return !(e.defaultPrevented || e.button !== 0 || e.metaKey || e.altKey || e.ctrlKey || e.shiftKey)
}

export function makeClickHandler({ href, state, docTitle, retain }, action) {
  const loc = Object.assign(parseHref(href), { state, docTitle })
  let clickHandler = e => {
    if (verifyClick(e) && verifyOrigin(href)) {
      e.preventDefault()
      action(retain ? Object.assign({}, loc, retainQSHash(retain, loc)) : loc)
    }
  }
  return Object.assign(clickHandler, loc)
}

function getNavAction(retain) {
  return retain && /\bhistory\b/.test(retain) ? 'replace' : 'push'
}

export const defaultStyle = { touchAction: 'manipulation', msTouchAction: 'manipulation' }
const ownKeys = ['createElement', 'getUltra', 'style', 'state', 'docTitle', 'retain', 'onClick']

export function Anchor(props) {
  let { href, createElement, getUltra, style, state, docTitle, retain } = props
  props = exclude(props, ...ownKeys)
  let navAction = getNavAction(retain)
  props.onClick = makeClickHandler({ href, state, docTitle, retain }, loc =>
    getUltra()[navAction](loc)
  )
  props.style = Object.assign({}, defaultStyle, style)
  return createElement('a', props)
}
