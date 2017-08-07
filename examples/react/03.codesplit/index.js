import React, { Component } from 'react'

let dynamicImport = () => import(/* webpackChunkName: "news" */ './news')

let Loading = () => <p>loading news module in 1.5s...</p>

class App extends Component {
  componentDidMount() {
    if(!App.news) {
      dynamicImport().then(module => {
        App.news = module.default
        setTimeout(() => this.forceUpdate(), 1500)
      })
    }
  }
  render() {
    return (
      <div>
        {App.news ? <App.news {...this.props} /> : <Loading />}
      </div>
    )
  }
}

export default (mountPath, msg) =>
  <div>
    <hr />
    <div dangerouslySetInnerHTML={{ __html: readme }} />
    <App mountPath={mountPath} dispatch={msg && msg.path !== mountPath} />
  </div>

var readme = require('./README.md')
