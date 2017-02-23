'use strict'

const assert = require('assert')
const path = require('path')
const url = require('url')
const fs = require('fs')
const vfs = require('vinyl-fs')
const chokidar = require('chokidar')
const bs = require('browser-sync').create()
const loadConfig = require('../config').loadConfig
const findConfig = require('../config').findConfig

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

  bs.init({
    server: config.output,
    middleware: [createMiddleware(config)]
  })

  chokidar.watch(config.input, { ignoreInitial: true, cwd: config.input })
    .on('change', pathname => {
      const rule = config.findRuleByInput(pathname)

      if (!rule) {
        bs.reload(pathname)
        return
      }

      bs.reload(rule.getOutputPath(pathname))
    })
}

function createMiddleware (config) {
  return (req, res, next) => {
    const outputPath = normalizePath(url.parse(req.url).pathname)
    const rule = config.findRuleByOutput(outputPath, inputPath => {
      return fs.existsSync(path.join(config.input, inputPath))
    })

    if (!rule) return next()

    const inputPath = path.join(
      config.input,
      rule.getInputPath(outputPath)
    )

    rule.task(vfs.src(inputPath))
      .on('data', file => res.end(file.contents))
  }
}

function normalizePath (pathname) {
  if (/\/$/.test(pathname)) {
    pathname = path.join(pathname, 'index.html')
  }
  return pathname
}
