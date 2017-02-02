const path = require('path')
const Rule = require('./rule')
const util = require('../util')

module.exports = class Config {
  constructor (config, configPath) {
    this.basePath = path.dirname(configPath)
    this._resolve = makeResolve(this.basePath)

    // Resolve input/output paths
    if (typeof config.input === 'string') {
      this.input = this._resolve(config.input)
    }
    if (typeof config.input === 'string') {
      this.output = this._resolve(config.output)
    }

    // Resolve and merge rules by traversing preset
    this.rules = this._resolveRules(config)

    // Resolve paths in execute options
    if (Array.isArray(config.execute)) {
      this.execute = config.execute.map(opts => ({
        task: opts.task,
        input: this._resolve(opts.input),
        output: this._resolve(opts.output)
      }))
    }
  }

  _resolveRules (config) {
    let rules = {}

    // Load preset rules
    if (config.preset) {
      if (util.isLocalPath(config.preset)) {
        config.preset = this._resolve(config.preset)
      }
      const presetPath = require.resolve(config.preset)
      const preset = new Config(require(presetPath), presetPath)

      rules = preset.rules
    }

    // Load task file
    const tasks = require(this._resolve(config.taskFile))

    // Normalize all rules
    if (config.rules) {
      rules = util.merge(
        rules,
        util.mapValues(config.rules, (rule, key) => {
          return new Rule(rule, key, tasks)
        })
      )
    }

    return rules
  }
}

function makeResolve (basePath) {
  return pathname => {
    return path.resolve(basePath, pathname)
  }
}
