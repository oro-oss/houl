const path = require('path')
const Config = require('./models/config')

module.exports = function loadConfig (configPath) {
  const config = loadConfigFile(configPath)
  return new Config(config, configPath)
}

function loadConfigFile (configPath) {
  const ext = path.extname(configPath)
  if (ext !== '.js' && ext !== '.json') {
    throw new Error(path.basename(configPath) + ' is non-supported file format.')
  }

  return require(path.resolve(configPath))
}
