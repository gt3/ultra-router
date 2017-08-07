Vehicle shop example
- Select vehicle by year, make, model to show price
- Sidebar navigation shows all available models
- Currency selector in header sets currency unit (default: $)

Example demonstrates how to:
- use `prefixMatch` to apply prefix to existing match
- use pre-match hook to include query string value in match: `addCurrency`
- validate identifier values with check: `currCheck `
- use `a.link` to create React link component with `retain` query string option
