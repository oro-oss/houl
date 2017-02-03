const path = require('path')
const url = require('url')
const fs = require('fs')
const vfs = require('vinyl-fs')
const bs = require('browser-sync').create()
const minimatch = require('minimatch')
const loadConfig = require('../config')
const util = require('../util')

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
}

function createMiddleware (config) {
  return (req, res, next) => {
    const outputPath = normalizePath(url.parse(req.url).pathname)
    const result = matchRuleByOutput(config.rules, outputPath)
    const fullInputPath = path.join(config.input, result.inputPath)

    if (!fs.existsSync(fullInputPath)) return next()

    const task = result.rule ? result.rule.task : util.identity

    task(vfs.src(fullInputPath))
      .on('data', file => res.end(file.contents))
  }
}


function matchRuleByOutput (rules, filePath) {
  const ext = path.extname(filePath).slice(1)

  rules = Object.keys(rules)
    .reverse()
    .map(key => rules[key])

  for (const rule of rules) {
    if (rule.outputExt !== ext) continue

    const inputPath = filePath.replace(
      new RegExp('.' + ext + '$', 'i'),
      '.' + rule.inputExt
    )

    if (rule.exclude && minimatch(inputPath, rule.exclude)) {
      continue
    }

    return {
      inputPath,
      rule
    }
  }

  return {
    inputPath: filePath,
    rule: null
  }
}

function normalizePath (pathname) {
  if (/\/$/.test(pathname)) {
    pathname = path.join(pathname, 'index.html')
  }
  return pathname
}
