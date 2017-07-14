'use strict'

const assert = require('assert')
const chokidar = require('chokidar')
const loadConfig = require('../config').loadConfig
const findConfig = require('../config').findConfig
const DepResolver = require('../dep-resolver')
const create = require('../externals/browser-sync')

exports.builder = {
  config: {
    alias: 'c',
    describe: 'Path to a houl config file'
  },
  port: {
    alias: 'p',
    describe: 'Port number of dev server',
    default: 3000,
    number: true
  },
  'base-path': {
    describe: 'Base path of dev server',
    default: '/'
  }
}

exports.handler = argv => {
  const configPath = argv.config || findConfig(process.cwd())
  assert(configPath, 'Config file is not found')
  const config = loadConfig(configPath)

  assert(!Number.isNaN(argv.port), '--port should be a number')

  const resolver = DepResolver.create(config)

  const basePath = argv['base-path']

  const bs = create(config, {
    port: argv.port,
    startPath: basePath,
    logLevel: argv._debug ? 'silent' : 'info', // Internal
    open: !argv._debug // Internal
  }, resolver, basePath)

  chokidar.watch(config.input, { ignoreInitial: true, cwd: config.input })
    .on('change', pathname => {
      const fullPath = path.resolve(config.input, pathname)

      // Update deps
      resolver.register(fullPath)

      // Reload for changed file
      const target = resolveOutput(fullPath)

      // Resolve depended files
      const reloadFiles = [target].concat(resolver.getInDeps(fullPath).map(resolveOutput))

      bs.reload(reloadFiles)
    })

  return bs

  function resolveOutput (inputName) {
    const rule = config.findRuleByInput(inputName)

    if (!rule) {
      return inputName
    } else {
      return rule.getOutputPath(inputName)
    }
  }
}
