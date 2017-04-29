import { invokeFn, pipe, shieldProps, isClickValid } from './utils'
import warning from 'warning'
import createHistory from 'history/createBrowserHistory'

function verify(matchers, loc) {
  return matchers.some(matcher => !!matcher(loc).spec)
}

function navigate(matchers, navAction, loc) {
  warning(verify(matchers, loc), 'No paths defined for this location: %s', loc)
  navAction(loc)
}

function stop(handles) {
  handles.forEach(invokeFn)
}

function run(matchers, history = createHistory()) {
  let handles = matchers.map(m => history.listen(pipe(m, m.process)))
  return {
    stop: stop.bind(null, handles),
    push: navigate.bind(null, matchers, history.push),
    replace: navigate.bind(null, matchers, history.replace)
  }
}

export function container(...matchers) {
  return run.bind(null, matchers)
}

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
