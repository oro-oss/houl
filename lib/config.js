const path = require('path')

module.exports = function config (configPath) {
  const config = loadConfigFile(configPath)
  const resolve = makeResolve(config.basePath)

  // Resolve input/output paths
  config.input = resolve(config.input)
  config.output = resolve(config.output)

  // Load task file
  config.task = require(resolve(config.taskFile))

  // Resolve paths in execute options
  if (Array.isArray(config.execute)) {
    config.execute.forEach(opts => {
      opts.input = resolve(opts.input)
      opts.output = resolve(opts.output)
    })
  }

  return config
}

function makeResolve (basePath) {
  return pathname => {
    return path.resolve(basePath, pathname)
  }
}

function loadConfigFile (configPath) {
  const ext = path.extname(configPath)
  if (ext !== '.js' && ext !== '.json') {
    throw new Error(path.basename(configPath) + ' is non-supported file format.')
  }

  const config = require(path.resolve(configPath))
  config.basePath = path.resolve(path.dirname(configPath))
  return config
}
