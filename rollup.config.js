import commonjs from 'rollup-plugin-commonjs'
import nodeResolve from 'rollup-plugin-node-resolve'

const plugins = [nodeResolve({ jsnext: true, main: true }), commonjs({})]

const name = 'x'
const format = 'iife'
const sourcemap = true
const watch = { include: ['src/*.js', 'src/entites/*.js'] }

export default [
  {
    plugins,
    watch,
    input: 'src/background.js',
    output: { name, format, sourcemap, file: 'dist/background.js' }
  },
  {
    plugins,
    watch,
    input: 'src/content.js',
    output: { name, format, sourcemap, file: 'dist/content.js' }
  },
  {
    plugins,
    watch,
    input: 'src/newtab.js',
    output: { name, format, sourcemap, file: 'dist/newtab.js' }
  },
  {
    plugins,
    watch,
    input: 'src/popup.js',
    output: { name, file: 'dist/popup.js', format, sourcemap }
  }
]
