module.exports = {
  input: './src',
  output: './dist',
  taskFile: './normal.task.js',
  preset: './preset.config.js',
  rules: {
    js: {
      task: 'js',
      exclude: '**/vendor/**'
    },
    scss: {
      outputExt: 'css',
      task: 'sass'
    },
    png: 'imagemin'
  },
  execute: [
    {
      task: 'svg',
      input: './src/img/_assets/*.svg',
      output: './dist/img/share'
    }
  ]
}
