'use strict'

const assert = require('assert')
const vfs = require('vinyl-fs')
const hashSum = require('hash-sum')
const loadConfig = require('../config').loadConfig
const findConfig = require('../config').findConfig
const Cache = require('../cache')
const DepResolver = require('../dep-resolver')
const BuildLogger = require('../loggers/build-logger')
const taskStream = require('../task-stream')
const cacheStream = require('../cache-stream')
const util = require('../util')

exports.builder = {
  config: {
    alias: 'c',
    describe: 'Path to a houl config file'
  },
  cache: {
    describe: 'Path to a houl cache file'
  },
  production: {
    describe: 'Enable production mode',
    boolean: true
  },
  dot: {
    describe: 'Include dot files in output',
    boolean: true
  },
  filter: {
    describe: 'Glob pattern for filtering input files'
  }
}

exports.handler = (argv, debug) => {
  debug = debug || {}

  if (argv.production) {
    process.env.NODE_ENV = 'production'
  }

  const configPath = argv.config || findConfig(process.cwd())
  assert(configPath, 'Config file is not found')
  const config = loadConfig(configPath).extend({
    filter: argv.filter
  })

  // Logger
  const logger = new BuildLogger(config, {
    console: debug.console
  })
  logger.start()

  // Process all files in input directory
  let stream = vfs.src(config.vinylInput, { nodir: true, dot: argv.dot })

  if (argv.cache) {
    const cacheData = util.readFileSync(argv.cache)

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
      util.writeFileSync(argv.cache, serialized)
    })
  }

  // Transform inputs with rules
  stream = stream.pipe(taskStream(config))
    // This line does not work yet.
    // We must patch .pipe method and handle
    // all error events for each stream.
    .on('error', err => { logger.error(err) })

  // Output
  return stream.pipe(vfs.dest(config.output))
    .on('finish', () => { logger.finish() })
}
