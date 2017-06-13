module.exports = options => {
  return {
    taskFile: './preset.task.js',
    rules: {
      baz: {
        task: 'baz',
        options: options.baz
      }
    }
  }
}
