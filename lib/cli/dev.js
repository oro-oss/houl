'use strict'

const assert = require('assert')
const chokidar = require('chokidar')
const loadConfig = require('../config').loadConfig
const findConfig = require('../config').findConfig
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
  }
}

exports.handler = argv => {
  const configPath = argv.config || findConfig(process.cwd())
  assert(configPath, 'Config file is not found')
  const config = loadConfig(configPath)

  assert(!Number.isNaN(argv.port), '--port should be a number')

  const bs = create(config, {
    port: argv.port
  })

  chokidar.watch(config.input, { ignoreInitial: true, cwd: config.input })
    .on('change', pathname => {
      const rule = config.findRuleByInput(pathname)

      if (!rule) {
        bs.reload(pathname)
        return
      }

      bs.reload(rule.getOutputPath(pathname))
    })
}
