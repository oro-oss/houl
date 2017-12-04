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
    default: 3000,
    number: true
  },
  'base-path': {
    describe: 'Base path of dev server',
    default: '/'
  }
}

exports.handler = (argv, debug) => {
  debug = debug || {}

  const configPath = argv.config || findConfig(process.cwd())
  assert(configPath, 'Config file is not found')
  const config = loadConfig(configPath)

  assert(!Number.isNaN(argv.port), '--port should be a number')

  // Logger
  const logger = new DevLogger(config, {
    console: debug.console
  })

  const resolver = DepResolver.create(config)

  const basePath = argv['base-path']

  const bs = create(config, {
    port: argv.port,
    startPath: basePath,
    logLevel: 'silent',
    middleware: logMiddleware,
    open: !argv._debug // Internal
  }, resolver, basePath)

  bs.emitter.on('init', () => {
    logger.startDevServer(argv.port, externalIp)
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
