'use strict'

const url = require('url')
const externalIp = require('./util').getIp()
const loadConfig = require('./config').loadConfig
const DepResolver = require('./dep-resolver')
const create = require('./externals/browser-sync')
const createWatcher = require('./externals/watcher')
const DevLogger = require('./loggers/dev-logger')

/**
 * The top level function for the dev server.
 * The 1st parameter can accept the following options:
 *
 * config - Path to a houl config file
 * port - Port number of dev server
 * basePath - Base path of dev server
 *
 * The 2nd parameter and return value are meant to be used for internal,
 * so the users should not use them.
 */
function dev (options, debug = {}) {
  const config = loadConfig(options.config).extend({
    port: options.port,
    basePath: options['base-path']
  })

  // Logger
  const logger = new DevLogger(config, {
    console: debug.console
  })

  const resolver = DepResolver.create(config)

  const bs = create(config, {
    logLevel: 'silent',
    middleware: logMiddleware,
    open: !options._debug // Internal
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

exports.dev = dev
