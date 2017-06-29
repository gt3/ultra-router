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

// navigate
ultra.push('/news') //resolve: b.next
ultra.push('/news/sports') //resolve: b.next
ultra.push('/news/foo') //resolve: b.err
```
- Treat query string and hash fragments integral to routing

```JavaScript
import { check, parseQS, prependPath } from 'ultra'

let weatherSpec = spec('/weather/:zip')(next, err)
let zipCheck = check(':zip')(/^$|^[0-9]$/) //allow nothing or digits
let addZip = ({qs, path}) => prependPath(parseQS(qs, ['loc']), path)
match(weatherSpec, zipCheck, addZip) //a*

//replace a with a* above

//navigate
ultra.push('/weather') //resolve: a*.next
ultra.push('/weather?loc=90210') //resolve: a*.next with :zip = 90210
ultra.push('/weather?loc=abc') //resolve: a*.err
```

# _ultra_

Router for component-based web apps. Pair with React, or `<BYOF />`.


## USP
- Framework agnostic
  - Independent of rendering or view layer
  - Built for React, Preact, et al., but adaptable for Vue.js, Polymer, Angular oob
- Compliments component-based architecture
  - Use conventions to map url string to component (sub)trees
- Extensible and Compact
  - Composable API marks a clear separation between route configuration and runtime to target different environments  
  - For modern browsers with pushstate support
  - Zero dependencies
    - 5kB > ultra > Preact


## Trade-offs (YMMV)
  - Does not render component or fetch data
  - Use of path keys (strings) to derive result
    - might require more effort to make a change in app's url structure 
    - minification of path keys (matters if you have various deeply nested routes e.g. Amazon)
  - Switch (back) to centralized routing configuration for React folks



