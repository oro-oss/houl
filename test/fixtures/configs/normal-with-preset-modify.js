module.exports = {
  input: './src',
  output: './dist',
  preset: {
    name: './preset.config.js',
    modifyConfig: config => {
      delete config.rules.js
    }
  }
}
