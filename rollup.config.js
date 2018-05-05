export default [
  {
    input: 'src/background.js',
    output: { file: 'dist/background.js', format: 'iife', sourcemap: true },
    watch: { include: 'src/_*.js' }
  },
  {
    input: 'src/content.js',
    output: { file: 'dist/content.js', format: 'iife', sourcemap: true },
    watch: { include: 'src/_*.js' }
  },
  {
    input: 'src/newtab.js',
    output: { file: 'dist/newtab.js', format: 'iife', sourcemap: true },
    watch: { include: 'src/_*.js' }
  }
]
