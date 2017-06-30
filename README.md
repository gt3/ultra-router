## Test-drive: `npm i --save ultra`

- Setup centralized routing (matching and resolution) for a news portal
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

//extract loc value from query string and append to path
let addZip = ({qs, path}) => prependPath(parseQS(qs, ['loc']), path)

match(weatherSpec, zipCheck, addZip) //a*
//replace a with a* in previous code block

//navigate
ultra.push('/weather') //resolve: a*.next

//assume query param loc is set externally
ultra.push('/weather?loc=90210') //resolve: a*.next with :zip = 90210
ultra.push('/weather?loc=abc') //resolve: a*.err
```
---

## USP
- Framework agnostic
  - Independent of rendering or view layer
  - Built for React, Preact, et al., but adaptable for Vue.js, Polymer, Angular oob
- Compliments component-based architecture
  - Use conventions to map url string to component (sub)trees
- Extensible and Compact
  - Composable API provides clear separation between route configuration and runtime to target different environments  
  - Ideal for progressive web apps
    - No runtime dependencies
    - 5k > ultra (> preact)
    - Code splitting friendly


## Trade-offs
  - For modern browsers with pushstate support
  - Does not render component or fetch data
  - Relies on use of path keys (strings) to derive result
    - might require more effort to make a change in app's url structure
    - Path keys (non-minified) may contribute to bloated bundles
      - especially true for apps with _multiple_ deeply nested routes, e.g. Amazon
  - Return to centralized routing configuration for React folks (_ymmv_)
  - Use in production - not just yet.

## License

MIT

