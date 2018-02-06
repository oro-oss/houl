'use strict'

const assert = require('assert')
const findConfig = require('../config').findConfig
const { dev } = require('../dev')
const util = require('../util')

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

exports.handler = (argv, debug = {}) => {
  const configPath = argv.config || findConfig(process.cwd())
  assert(configPath, 'Config file is not found')
  assert(!Number.isNaN(argv.port), '--port should be a number')

  const options = util.merge(argv, { config: configPath })
  return dev(options, debug)
}
