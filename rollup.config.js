export default [
  {
    input: 'src/background.js',
    output: { file: 'background.js', format: 'iife', sourcemap: true },
    watch: { include: 'src/_*.js' }
  },
  {
    input: 'src/content.js',
    output: { file: 'content.js', format: 'iife', sourcemap: true },
    watch: { include: 'src/_*.js' }
  },
  {
    input: 'src/newtab.js',
    output: { file: 'newtab.js', format: 'iife', sourcemap: true },
    watch: { include: 'src/_*.js' }
  }
]
