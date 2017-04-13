'use strict'

const assert = require('assert')
const path = require('path')
const vfs = require('vinyl-fs')
const progeny = require('progeny')
const hashSum = require('hash-sum')
const loadConfig = require('../config').loadConfig
const findConfig = require('../config').findConfig
const Cache = require('../cache')
const DepResolver = require('../dep-resolver').DepResolver
const processTask = require('../process-task')
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
  }
}

exports.handler = argv => {
  if (argv.production) {
    process.env.NODE_ENV = 'production'
  }

  const configPath = argv.config || findConfig(process.cwd())
  assert(configPath, 'Config file is not found')
  const config = loadConfig(configPath)

  // TODO: Execute pre tasks

  // Process all files in input directory
  let stream = vfs.src(config.vinylInput, { nodir: true })

  if (argv.cache) {
    const cacheData = util.readFileSync(argv.cache)

    const cache = new Cache(hashSum)

    const progenyOptions = util.mapValues(config.rules, rule => rule.progeny)
    const depResolver = new DepResolver((fileName, contents) => {
      const ext = path.extname(fileName).slice(1)
      return progeny.Sync(progenyOptions[ext])(fileName, contents)
    })

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
  stream = stream.pipe(processTask(config))

  // Output
  stream.pipe(vfs.dest(config.output))
}
