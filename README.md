## `npm i ultra`

Add pushstate navigation to your component-based web app. Integrate seamlessly with React, Preact, and Vue.

| download | dependencies |
| :----: | :----: |
| `4.6 kb` | none |

### Benefits
- Embrace component paradigm, stay framework agnostic
  - Use conventions to map url string to component (sub)trees
  - Independent of rendering or view layer
    - Routing should be immune to complexity introduced by framework-level abstractions (context in React for e.g.)
- Co-locate routes to support scalability
  - Routes are data. Similar types of information are best understood if they exist in the same space.
  - On the other end, as relationships between components get more complex, it is best to leave route matching logic out of the mix.
- Extensible
  - Composable API provides clear separation between route configuration and runtime to avail maximum reuse and target different environments
- Compact
  - Ideal for mobile/progressive web apps
    - No runtime dependencies
    - `4.6 kb > ultra (> preact)`
    - Code splitting friendly

### Trade-offs
  - For modern browsers with pushstate support
  - Does not render component or fetch data
  - Relies on use of path keys (strings) to derive result
    - More complex update process involves replacing path keys throughout the app
    - Path keys (non-minified) may contribute to bloated bundles
      - Concern for apps with _multiple_ deeply nested routes, e.g. Amazon
  - For the Developer: Overcome the notion of changing your routing code again this season, and actually following through. No pun intended.

### Resources

- [Quick start](https://github.com/gt3/ultra-router/wiki/Quick-start) (build navigation for a news website tutorial)
- React bindings: [react-ultra](https://github.com/gt3/react-ultra)
- Code examples in `/examples` directory
  - Vehicle shop: [jsfiddle](http://jsfiddle.net/cheekyiscool/1n7v87aq/embedded/js,html,result/dark/)
  - Tap (intercept routing): [jsfiddle](http://jsfiddle.net/cheekyiscool/y9f8j44u/embedded/js,html,result/dark/)
  - Loading modules and routes dynamically
  
### To-dos
- Create automated cross-browser test suite
- Add Preact and Vue.js examples
- Implement Node.js container for [ultra-router](https://www.npmjs.com/package/ultra-router)


### License

MIT

---

> Handle a route or two without breaking a sweat. :crossed_swords: `ULTRA`
