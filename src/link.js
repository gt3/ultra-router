import { shieldProps, validateClick } from './utils';

export const UltraLink = p => {
  let props = shieldProps(p, 'createElement', 'ultra');
  let { href, createElement, ultra } = props;
  props.onClick = createListener(href, ultra.push);
  return createElement('a', props);
};
UltraLink.defaultProps = {
  style: {
    cursor: 'pointer',
    touchAction: 'manipulation',
    msTouchAction: 'manipulation'
  }
};

export function createListener(href, action) {
  return function clickHandler(e) {
    if (validateClick(href, e)) {
      e.preventDefault();
      action(href);
    }
  };
}
