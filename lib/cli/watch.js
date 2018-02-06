'use strict'

const assert = require('assert')
const findConfig = require('../config').findConfig
const { watch } = require('../watch')
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
  const configPath = argv.config || findConfig(process.cwd())
  assert(configPath, 'Config file is not found')

  const options = util.merge(argv, { config: configPath })
  return watch(options, debug)
}
