import commonjs from 'rollup-plugin-commonjs'
import nodeResolve from 'rollup-plugin-node-resolve'

const childProcess = require('child_process')

const plugins = [nodeResolve({ jsnext: true, main: true }), commonjs({})]

const name = 'x'
const format = 'iife'
const sourcemap = true
const watch = {
  include: ['src/*.js', 'src/browser/*.js', 'src/entites/*.js', 'src/ui/*.js']
}

const environment = process.env.NODE_ENV || 'development'
const version = childProcess
  .execSync('git rev-parse HEAD')
  .toString()
  .trim()

const intro = `window.SDQ = { environment: '${environment}', version: '${version}' }`

export default [
  {
    plugins,
    watch,
    input: 'src/browser/background.js',
    output: { name, format, sourcemap, intro, file: 'dist/background.js' }
  },
  {
    plugins,
    watch,
    input: 'src/browser/content.js',
    output: { name, format, sourcemap, intro, file: 'dist/content.js' }
  },
  {
    plugins,
    watch,
    input: 'src/browser/newtab.js',
    output: { name, format, sourcemap, intro, file: 'dist/newtab.js' }
  },
  {
    plugins,
    watch,
    input: 'src/browser/popup.js',
    output: { name, format, sourcemap, intro, file: 'dist/popup.js' }
  }
]
