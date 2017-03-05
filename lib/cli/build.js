'use strict'

const assert = require('assert')
const vfs = require('vinyl-fs')
const loadConfig = require('../config').loadConfig
const findConfig = require('../config').findConfig
const processTask = require('../process-task')

exports.builder = {
  config: {
    alias: 'c',
    describe: 'Path to a houl config file'
  }
}

exports.handler = argv => {
  const configPath = argv.config || findConfig(process.cwd())
  assert(configPath, 'Config file is not found')
  const config = loadConfig(configPath)

  // TODO: Execute pre tasks

  // Process all files in input directory
  vfs.src(config.vinylInput, { nodir: true })
    .pipe(processTask(config))
    .pipe(vfs.dest(config.output))
}
