export default [
  {
    input: 'src/background.js',
    output: { file: 'background.js', format: 'iife' }
  },
  {
    input: 'src/content.js',
    output: { file: 'content.js', format: 'iife' }
  },
  {
    input: 'src/newtab.js',
    output: { file: 'newtab.js', format: 'iife' }
  }
]
