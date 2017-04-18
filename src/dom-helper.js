function createListener(action) {
	return function clickHandler(e) {
		//perform validation here: https://github.com/cyclejs/cyclejs/blob/master/history/src/captureClicks.ts
		//1. check which == left click
		//2. check defaultPrevented
		//3. if (event.metaKey || event.ctrlKey || event.shiftKey)
		e.preventDefault()
		action()
	}
}

export class A extends PureComponent {
	render() {
		let router = this.context.services.router
		let {tag, href, clickEventKey, children, ...rest} = this.props
		let childprops = { href, [clickEventKey]: createListener(router.navigate.bind(null, href)) }
		return React.createElement(tag, Object.assign({}, rest, childprops), children)
	}
}
A.defaultProps = { tag: 'a', clickEventKey: typeof document !== 'undefined' && document.ontouchstart ? 'onTouchStart' : 'onClick' }
A.contextTypes = { services: PropTypes.object }
