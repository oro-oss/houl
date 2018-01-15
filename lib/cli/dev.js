'use strict'

const assert = require('assert')
const url = require('url')
const externalIp = require('../util').getIp()
const loadConfig = require('../config').loadConfig
const findConfig = require('../config').findConfig
const DepResolver = require('../dep-resolver')
const create = require('../externals/browser-sync')
const createWatcher = require('../externals/watcher')
const DevLogger = require('../loggers/dev-logger')

exports.builder = {
  config: {
    alias: 'c',
    describe: 'Path to a houl config file'
  },
  port: {
    alias: 'p',
    describe: 'Port number of dev server',
    number: true
  },
  'base-path': {
    describe: 'Base path of dev server'
  }
}

exports.handler = (argv, debug) => {
  debug = debug || {}

  const configPath = argv.config || findConfig(process.cwd())
  assert(configPath, 'Config file is not found')
  assert(!Number.isNaN(argv.port), '--port should be a number')

  const config = loadConfig(configPath).extend({
    port: argv.port,
    basePath: argv['base-path']
  })

  // Logger
  const logger = new DevLogger(config, {
    console: debug.console
  })

  const resolver = DepResolver.create(config)

  const bs = create(config, {
    logLevel: 'silent',
    middleware: logMiddleware,
    open: !argv._debug // Internal
  }, resolver)

  bs.emitter.on('init', () => {
    logger.startDevServer(config.port, externalIp)
  })

  const watcher = createWatcher(config, resolver, (name, files, origin) => {
    if (name === 'add') {
      logger.addFile(origin)
    } else if (name === 'change') {
      logger.updateFile(origin)
    }
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

  function logMiddleware (req, res, next) {
    const parsedPath = url.parse(req.url).pathname
    logger.getFile(parsedPath)
    next()
  }
}
