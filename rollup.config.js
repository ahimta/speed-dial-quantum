import commonjs from 'rollup-plugin-commonjs'
import nodeResolve from 'rollup-plugin-node-resolve'

const childProcess = require('child_process')

const environment = process.env.NODE_ENV || 'development'
const version = childProcess
  .execSync('git rev-parse HEAD')
  .toString()
  .trim()

const intro = `window.SDQ = { environment: '${environment}', version: '${version}' }`

export default [
  getConfig('src/browser/background.js', 'dist/background.js'),
  getConfig('src/browser/content.js', 'dist/content.js'),
  getConfig('src/browser/newtab.js', 'dist/newtab.js'),
  getConfig('src/browser/popup.js', 'dist/popup.js')
]

function getConfig (inputPath, outputPath) {
  const plugins = [nodeResolve({ jsnext: true, main: true }), commonjs({})]

  const name = 'x'
  const format = 'iife'
  const sourcemap = true
  const watch = {
    include: ['src/**/*.js']
  }

  return {
    plugins,
    watch,
    input: inputPath,
    output: { name, format, sourcemap, intro, file: outputPath }
  }
}
