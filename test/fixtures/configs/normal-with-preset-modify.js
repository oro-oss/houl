module.exports = {
  input: './src',
  output: './dist',
  preset: {
    name: './preset-function.config.js',
    modifyConfig: config => {
      config.rules.baz = null
    }
  }
}
