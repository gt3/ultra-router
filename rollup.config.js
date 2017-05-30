import babel from 'rollup-plugin-babel'
import { minify } from 'uglify-es'
import uglify from 'rollup-plugin-uglify'

const compress = process.env.DIST === 'true'

const lib = {
  entry: './src/index.js',
  external: [ 'warning' ],
  globals: { warning: 'warning' },
  plugins: [
    babel({exclude: 'node_modules/**'})
  ],
  targets: [
    { format: 'es', dest: './lib/ultra.es.js' },
    { format: 'umd', dest: './lib/ultra.js', moduleId: 'ultra', moduleName: 'Ultra' }
  ]
}

const dist = Object.assign({}, lib, {
  plugins: [
    babel({exclude: 'node_modules/**'}),
    uglify({}, minify)
  ],
  targets: [
    { format: 'umd', dest: './dist/ultra.min.js', moduleId: 'ultra', moduleName: 'Ultra' }
  ]
})

export default compress ? dist: lib
