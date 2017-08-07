import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { spec, check, match, prefixMatch } from 'ultra'
import { Use } from 'react-ultra'

function pipe(...fns) {
  function invoke(v) {
    return fns.reduce((acc, fn) => (fn ? fn.call(this, acc) : acc), v)
  }
  return invoke
}

let createMatch = (select, mountPath) => {
  let transform = ({ values: [x] }) => ({ x })
  return [prefixMatch(mountPath, match(spec('/:x')(pipe(transform, select))))]
}

class App extends Component {
  constructor(props, ctx) {
    super(props, ctx)
    App.mountPath = props.mountPath
    this.state = { x: 1, tap: false }
    this.navigate = this.navigate.bind(this)
    this.matchers = createMatch(this.setState.bind(this), App.mountPath)
  }
  get ultra() {
    return this.context.getUltra()
  }
  get nextLink() {
    return `${App.mountPath}/${+this.state.x + 1}`
  }
  navigate() {
    return this.ultra.push(this.nextLink)
  }
  componentWillMount() {
    this.interval = setInterval(this.navigate, 3000)
  }
  componentWillUnmount() {
    clearInterval(this.interval)
  }
  confirm(ok, cancel) {
    return window.confirm('Are you sure you want to navigate away?') ? ok() : cancel()
  }
  render() {
    let { x, tap } = this.state
    let toggleTap = cb => () => this.setState(state => ({ tap: !state.tap }), cb)
    if (tap) this.ultra.tap((ok, cancel) => this.confirm(toggleTap(ok), cancel))
    else this.ultra.untap()
    return (
      <div>
        <Use matchers={this.matchers} dispatch={this.props.dispatch} />
        <button onClick={toggleTap()}>
          {tap ? 'release' : 'tap'}: {x}
        </button>
      </div>
    )
  }
}
App.contextTypes = { getUltra: PropTypes.func }

export default (mountPath, msg) =>
  <div>
    <hr />
    <div dangerouslySetInnerHTML={{ __html: readme }} />
    <App mountPath={mountPath} dispatch={msg && msg.path !== mountPath} />
  </div>

var readme = require('./README.md')
