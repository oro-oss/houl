const path = require('path')

module.exports = class Config {
  constructor (config, configPath) {
    const resolve = makeResolve(path.dirname(configPath))

    // Resolve input/output paths
    this.input = resolve(config.input)
    this.output = resolve(config.output)

    // Load task file
    this.tasks = require(resolve(config.taskFile))

    // Normalize all rules
    if (config.rules !== null && typeof config.rules === 'object') {
      this.rules = mapValues(config.rules, normalizeRule)
    }

    // Resolve paths in execute options
    if (Array.isArray(config.execute)) {
      this.execute = config.execute.map(opts => ({
        task: opts.task,
        input: resolve(opts.input),
        output: resolve(opts.output)
      }))
    }
  }
}

function normalizeRule (rule, key) {
  if (typeof rule === 'string') {
    rule = {
      task: rule
    }
  }

  rule.inputExt = key
  if (typeof rule.outputExt !== 'string') {
    rule.outputExt = rule.inputExt
  }

  return rule
}

function makeResolve (basePath) {
  return pathname => {
    return path.resolve(basePath, pathname)
  }
}

function mapValues (val, fn) {
  const res = {}
  Object.keys(val).forEach(key => {
    res[key] = fn(val[key], key)
  })
  return res
}
