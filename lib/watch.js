'use strict'

const vfs = require('vinyl-fs')
const hashSum = require('hash-sum')
const loadConfig = require('./config').loadConfig
const Cache = require('./cache')
const DepResolver = require('./dep-resolver')
const taskStream = require('./task-stream')
const cacheStream = require('./cache-stream')
const createWatcher = require('./externals/watcher')
const WatchLogger = require('./loggers/watch-logger')
const util = require('./util')

/**
 * The top level function to start the watcher for incremental build.
 * The 1st parameter can accept the following options:
 *
 * config - Path to a houl config file
 * cache - Path to a houl cache file
 * dot - Include dot files in output
 *
 * The 2nd parameter is meant to be used for internal,
 * so the users should not use it.
 *
 * The return value is a chokidar watcher object
 * which the user can use to execute any further processing.
 */
function watch (options, debug) {
  debug = debug || { cb: util.noop }

  const config = loadConfig(options.config)

  const cache = new Cache(hashSum)
  const depResolver = DepResolver.create(config)

  // Restore cache data
  if (options.cache) {
    const cacheData = util.readFileSync(options.cache)

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
    console: debug.console
  })

  stream(config.vinylInput).on('finish', debug.cb)
  return createWatcher(config, depResolver, (name, files, origin) => {
    if (name === 'add') {
      logger.addFile(origin)
    } else if (name === 'change') {
      logger.updateFile(origin)
    }

    const filtered = files.filter(f => !config.isExclude(f))
    if (filtered.length === 0) return

    stream(filtered)
      .on('data', file => {
        logger.writeFile(file.path)
      })
      .on('finish', debug.cb)
  }).on('ready', () => {
    logger.startWatching()
  })

  function stream(sources) {
    return vfs.src(sources, { nodir: true, dot: options.dot, base: config.input })
      .pipe(cacheStream(cache, depResolver, util.readFileSync))
      .pipe(taskStream(config))
      .pipe(vfs.dest(config.output))
      .on('finish', () => {
        if (!options.cache) return

        const serialized = JSON.stringify({
          cache: cache.serialize(),
          deps: depResolver.serialize()
        })
        util.writeFileSync(options.cache, serialized)
      })
  }
}

exports.watch = watch
