Route code splitting example
- Navigation to the `/codesplit` route triggers dynamic import of the news module
- Sub routes to `/news` are added to Ultra (via `<Use>`) as the News component mounts

Example demonstrates how to:
- import modules dynamically with webpack
- add routes to Ultra lazily, once a module has loaded
