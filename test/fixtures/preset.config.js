module.exports = {
  taskFile: './preset.task.js',
  rules: {
    js: {
      task: 'foo'
    },
    scss: {
      outputExt: 'css',
      task: 'bar'
    }
  },
  execute: [
    {
      task: 'svg',
      input: './src/img/_assets/*.svg',
      output: './dist/img/share'
    }
  ]
}
