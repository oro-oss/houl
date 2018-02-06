'use strict'

const assert = require('assert')
const findConfig = require('../config').findConfig
const { build } = require('../build')
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

exports.handler = (argv, debug = {}) => {
  const configPath = argv.config || findConfig(process.cwd())
  assert(configPath, 'Config file is not found')

  const options = util.merge(argv, { config: configPath })
  return build(options, {
    console: debug.console
  })
}
