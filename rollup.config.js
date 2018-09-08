import commonjs from 'rollup-plugin-commonjs'
import nodeResolve from 'rollup-plugin-node-resolve'

const plugins = [nodeResolve({ jsnext: true, main: true }), commonjs({})]

const name = 'x'
const format = 'iife'
const sourcemap = true

export default [
  {
    plugins,
    input: 'src/background.js',
    output: { name, format, sourcemap, file: 'dist/background.js' },
    watch: { include: 'src/*.js' }
  },
  {
    plugins,
    input: 'src/content.js',
    output: { name, format, sourcemap, file: 'dist/content.js' },
    watch: { include: 'src/*.js' }
  },
  {
    plugins,
    input: 'src/newtab.js',
    output: { name, format, sourcemap, file: 'dist/newtab.js' },
    watch: { include: 'src/*.js' }
  },
  {
    plugins,
    input: 'src/popup.js',
    output: { name, file: 'dist/popup.js', format, sourcemap },
    watch: { include: 'src/*.js' }
  }
]
