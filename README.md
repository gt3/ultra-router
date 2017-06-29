# ` npm i --save ultra `

- Setup centralized routing (matching and resolution) for your favorite news website
```JavaScript
import { spec, match, prefixMatch, container } from 'ultra'

let matchers = [
  match(spec('/weather')(next)), //a
  prefixMatch('/news', match(spec('/', '/politics', '/sports')(next, err))), //b
  match(spec('/')(next)) //c
]
```

- Integrate with browser's PushState API to kickoff routing

```JavaScript
let ultra = container(matchers)

//navigation
ultra.push('/news') //resolve: b.next
ultra.push('/news/sports') //resolve: b.next
ultra.push('/news/foo') //resolve: b.err
```
- Treat query string and hash fragments integral to routing

```JavaScript
import { check, parseQS, prependPath } from 'ultra'

let weatherSpec = spec('/weather/:zip')(next, err)
let zipCheck = check(':zip')(/^$|^[0-9]$/)
let addZip = ({qs, path}) => prependPath(parseQS(qs, ['loc']), path)
match(weatherSpec, zipCheck, addZip)), //a* replace a above 

ultra.push('/weather') //resolve: a*.next
ultra.push('/weather?loc=90210') //resolve: a*.next with :zip = 90210
ultra.push('/weather?loc=abc') //resolve: a*.err

```

# _ultra_

Router for component-based JavaScript apps. Pair with React, or `<BYO web framework />`.


USP
- Framework agnostic
  - Independent of rendering or view layer
- Compliments component-based architecture
  - Use convention over configuration
- Extensible and Compact
  - Clear separation between route configuration and runtime
  - Functional routing API to target different environments
  - Does not render component or fetch data
  - For modern browsers with pushstate support
- Easier to test
  
