import babel from 'rollup-plugin-babel'
import { minify } from 'uglify-es'
import uglify from 'rollup-plugin-uglify'
import replace from 'rollup-plugin-re'
const compress = process.env.DIST === 'true'
const babelPlugin = babel({exclude: 'node_modules/**', plugins: ["external-helpers"]})

const lib = {
  entry: './src/index.js',
  external: [ 'warning' ],
  globals: { warning: 'warning' },
  plugins: [
    babelPlugin,
    replace({
      patterns: [
        { test: /\$devWarnOn\s*\(/g, replace: m => '/*@__PURE__*/' + m }
      ]
    })
  ],
  targets: [
    { format: 'es', dest: './lib/ultra.es.js' },
    { format: 'umd', dest: './lib/ultra.js', moduleId: 'ultra', moduleName: 'Ultra' }
  ]
}

const dist = Object.assign({}, lib, {
  plugins: [
    babelPlugin,
    replace({
      patterns: [
        { test: /\$devWarnOn\s*\(/g, replace: m => '/*@__PURE__*/' + m },
        { test: 'process.env.NODE_ENV', replace: "'production'" }
      ]
    }),
    uglify({}, minify)
  ],
  targets: [
    { format: 'umd', dest: './dist/ultra.min.js', moduleId: 'ultra', moduleName: 'Ultra' }
  ]
})

export default compress ? dist: lib
