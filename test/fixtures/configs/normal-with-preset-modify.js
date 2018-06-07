module.exports = {
  input: './src',
  output: './dist',
  preset: {
    name: './preset-function.config.js',
    modifyConfig: config => {
      delete config.rules.baz
    }
  }
}
