const path = require('path')
const Rule = require('./rule')
const util = require('../util')

module.exports = class Config {
  /**
   * options = { preset, base }
   */
  constructor (config, tasks, options) {
    const preset = options.preset
    this.base = options.base

    const resolve = makeResolve(this.base)

    // Resolve input/output paths
    if (typeof config.input === 'string') {
      this.input = resolve(config.input)
    }
    if (typeof config.input === 'string') {
      this.output = resolve(config.output)
    }

    // Resolve and merge rules by traversing preset
    this.rules = this._resolveRules(config.rules || {}, tasks, preset)

    // Resolve paths in execute options
    if (Array.isArray(config.execute)) {
      this.execute = config.execute.map(opts => ({
        task: opts.task,
        input: resolve(opts.input),
        output: resolve(opts.output)
      }))
    }
  }

  _resolveRules (rules, tasks, preset) {
    rules = util.mapValues(rules, (rule, key) => {
      return new Rule(rule, key, tasks)
    })

    if (!preset) return rules

    return util.merge(preset.rules, rules)
  }
}

function makeResolve (base) {
  return pathname => {
    return path.resolve(base, pathname)
  }
}
