module.exports = {
  input: './src',
  output: './dist',
  taskFile: './normal.task.js',
  preset: {
    name: './preset-function.config.js',
    options: { baz: 'bazOptions' }
  },
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
  }
}
