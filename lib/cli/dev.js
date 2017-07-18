'use strict'

const assert = require('assert')
const loadConfig = require('../config').loadConfig
const findConfig = require('../config').findConfig
const DepResolver = require('../dep-resolver')
const create = require('../externals/browser-sync')
const createWatcher = require('../externals/watcher')

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

  const watcher = createWatcher(config, resolver, files => {
    bs.reload(files.map(resolveOutput))
  })

  return { bs, watcher }

  function resolveOutput (inputName) {
    const rule = config.findRuleByInput(inputName)

    if (!rule) {
      return inputName
    } else {
      return rule.getOutputPath(inputName)
    }
  }
}
