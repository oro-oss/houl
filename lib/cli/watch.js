'use strict'

const assert = require('assert')
const vfs = require('vinyl-fs')
const hashSum = require('hash-sum')
const loadConfig = require('../config').loadConfig
const findConfig = require('../config').findConfig
const Cache = require('../cache')
const DepResolver = require('../dep-resolver')
const taskStream = require('../task-stream')
const cacheStream = require('../cache-stream')
const createWatcher = require('../externals/watcher')
const WatchLogger = require('../loggers/watch-logger')
const util = require('../util')

exports.builder = {
  config: {
    alias: 'c',
    describe: 'Path to a houl config file'
  },
  cache: {
    describe: 'Path to a houl cache file'
  },
  dot: {
    describe: 'Include dot files in output',
    boolean: true
  }
}

exports.handler = (argv, debug) => {
  debug = debug || { cb: util.noop }

  const configPath = argv.config || findConfig(process.cwd())
  assert(configPath, 'Config file is not found')
  const config = loadConfig(configPath)

  const cache = new Cache(hashSum)
  const depResolver = DepResolver.create(config)

  // Restore cache data
  if (argv.cache) {
    const cacheData = util.readFileSync(argv.cache)

    if (cacheData) {
      const json = JSON.parse(cacheData)

      // Restore cache data
      cache.deserialize(json.cache)

      // Restore deps data
      depResolver.deserialize(json.deps)
    }
  }

  // Logger
  const logger = new WatchLogger(config, {
    console: debug.console || console
  })

  stream(config.vinylInput).on('finish', debug.cb)
  return createWatcher(config, depResolver, (files, origin) => {
    logger.updateFile(origin)
    stream(files)
      .on('data', file => {
        logger.writeFile(file.path)
      })
      .on('finish', debug.cb)
  }).on('ready', () => {
    logger.startWatching()
  })

  function stream(sources) {
    return vfs.src(sources, { nodir: true, dot: argv.dot, base: config.input })
      .pipe(cacheStream(cache, depResolver, util.readFileSync))
      .pipe(taskStream(config))
      .pipe(vfs.dest(config.output))
      .on('finish', () => {
        if (!argv.cache) return

        const serialized = JSON.stringify({
          cache: cache.serialize(),
          deps: depResolver.serialize()
        })
        util.writeFileSync(argv.cache, serialized)
      })
  }
}
