import { A, Use } from 'react-ultra'
import { spec, match, prefixMatch } from 'ultra'

let next = route => console.log('handled route: ', route.path)

let newsMatch = mountPath => prefixMatch(mountPath, match([spec('/news/sports')(next), spec('/news/politics')(next)]))

let News = ({mountPath, dispatch}) =>
  <div>
    <Use matchers={newsMatch(mountPath)} dispatch={dispatch} />
    <h1>News Home</h1>
    <ul>
      <li><A href={`${mountPath}/news/sports`} title="check console">sports</A></li>
      <li><A href={`${mountPath}/news/politics`} title="check console">politics</A></li>
    </ul>
  </div>

export default News