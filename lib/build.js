'use strict'

const vfs = require('vinyl-fs')
const hashSum = require('hash-sum')
const loadConfig = require('./config').loadConfig
const Cache = require('./cache')
const DepResolver = require('./dep-resolver')
const BuildLogger = require('./loggers/build-logger')
const taskStream = require('./task-stream')
const cacheStream = require('./cache-stream')
const util = require('./util')

/**
 * The top level function to build sources.
 * The 1st parameter can accept the following options:
 *
 * config - Path to a houl config file
 * cache - Path to a houl cache file
 * production - Enable production mode
 * dot - Include dot files in output
 * filter - Glob pattern for filtering input files
 *
 * The 2nd parameter is meant to be used for internal,
 * so the users should not use it.
 *
 * The return value is a Promise object which will be
 * resolved when the build is exit successfully.
 */
function build(options, debug = {}) {
  if (options.production) {
    process.env.NODE_ENV = 'production'
  }

  const config = loadConfig(options.config).extend({
    filter: options.filter
  })

  // Logger
  const logger = new BuildLogger(config, {
    console: debug.console
  })
  logger.start()

  // Process all files in input directory
  let stream = vfs.src(config.vinylInput, {
    base: config.input,
    nodir: true,
    dot: options.dot
  })

  if (options.cache) {
    const cacheData = util.readFileSync(options.cache)

    const cache = new Cache(hashSum)

    const depResolver = DepResolver.create(config)

    if (cacheData) {
      const json = JSON.parse(cacheData)

      // Restore cache data
      cache.deserialize(json.cache)

      // Restore deps data
      depResolver.deserialize(json.deps)
    }

    stream = stream.pipe(cacheStream(cache, depResolver, util.readFileSync))

    // Save cache
    stream.on('end', () => {
      const serialized = JSON.stringify({
        cache: cache.serialize(),
        deps: depResolver.serialize()
      })
      util.writeFileSync(options.cache, serialized)
    })
  }

  return new Promise((resolve, reject) => {
    // Transform inputs with rules
    stream = stream
      .pipe(taskStream(config))
      // This line does not work yet.
      // We must patch .pipe method and handle
      // all error events for each stream.
      .on('error', err => {
        logger.error(err)
        reject(err)
      })

    // Output
    return stream.pipe(vfs.dest(config.output)).on('finish', () => {
      logger.finish()
      resolve()
    })
  })
}

exports.build = build
