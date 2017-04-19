import babel from 'rollup-plugin-babel'
import babili from 'rollup-plugin-babili'

const minify = process.env.DIST === 'true'

const lib = {
  entry: './src/index.js',
  plugins: [
    babel({exclude: 'node_modules/**'})
  ],
  targets: [
    { format: 'es', dest: './lib/ultra.mjs' },
    { format: 'umd', dest: './lib/ultra.js', moduleId: 'ultra', moduleName: 'Ultra' }
  ]
}

const dist = {
  entry: './lib/ultra.js',
  plugins: [
    babili()
  ],
  targets: [
    { format: 'umd', dest: './dist/ultra.min.js', moduleId: 'ultra', moduleName: 'Ultra' }
  ]
}

export default minify ? dist: lib
