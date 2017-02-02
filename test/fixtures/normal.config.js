module.exports = {
  input: './src',
  output: './dist',
  taskFile: './normal.task.js',
  preset: './preset.config.js',
  rules: {
    js: {
      task: 'task1',
      exclude: '**/vendor/**'
    },
    scss: {
      outputExt: 'css',
      task: 'task2'
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
