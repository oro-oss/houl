const path = require('path')
const url = require('url')
const fs = require('fs')
const vfs = require('vinyl-fs')
const chokidar = require('chokidar')
const bs = require('browser-sync').create()
const loadConfig = require('../config')

exports.builder = {
  config: {
    alias: 'c',
    demand: true,
    describe: 'Path to a houl config file'
  }
}

exports.handler = argv => {
  const config = loadConfig(argv.config)

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

    if (!rule) {
      // outputPath === inputPath because no matched rule exists
      const inputPath = path.join(config.input, outputPath)

      if (!fs.existsSync(inputPath)) return next()

      vfs.src(inputPath)
        .on('data', file => res.end(file.contents))

      return
    }

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
