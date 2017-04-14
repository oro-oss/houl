'use strict'

const assert = require('assert')
const path = require('path')
const chokidar = require('chokidar')
const progeny = require('progeny')
const loadConfig = require('../config').loadConfig
const findConfig = require('../config').findConfig
const DepResolver = require('../dep-resolver')
const create = require('../externals/browser-sync')
const util = require('../util')

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

  const progenyOptions = util.mapValues(config.rules, rule => rule.progeny)
  const resolver = new DepResolver((fileName, contents) => {
    const ext = path.extname(fileName).slice(1)
    return progeny.Sync(progenyOptions[ext])(fileName, contents)
  })

  const bs = create(config, {
    port: argv.port
  }, resolver)

  chokidar.watch(config.input, { ignoreInitial: true, cwd: config.input })
    .on('change', pathname => {
      const fullPath = path.resolve(config.input, pathname)

      // Update deps
      resolver.register(fullPath)

      // Reload for changed file
      const target = resolveOutput(fullPath)

      // Resolve depended files
      const reloadFiles = [target, ...resolver.getInDeps(fullPath).map(resolveOutput)]

      bs.reload(reloadFiles)
    })

  function resolveOutput (inputName) {
    const rule = config.findRuleByInput(inputName)

    if (!rule) {
      return inputName
    } else {
      return rule.getOutputPath(inputName)
    }
  }
}
