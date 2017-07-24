'use strict'

const path = require('path')
const minimatch = require('minimatch')
const Rule = require('./rule')
const util = require('../util')

module.exports = class Config {
  constructor (config) {
    this.input = config.input
    this.output = config.output
    this.exclude = config.exclude || []
    this.rules = config.rules || {}
    this.proxy = config.proxy || []
    this.filter = config.filter || '**/*'
  }

  get vinylInput () {
    const res = [
      path.join(this.input, this.filter)
    ]

    this.exclude.forEach(exclude => {
      res.push('!' + exclude)
    })

    return res
  }

  /**
   * Create a new config model based on
   * this config model and the provided argument
   */
  extend (config) {
    return new Config(Object.assign({}, this, config))
  }

  /**
   * Check the pathname matches `exclude` pattern or not.
   */
  isExclude (pathname) {
    if (path.isAbsolute(pathname)) {
      pathname = path.relative(this.input, pathname)
    }

    return this.exclude.reduce((acc, exclude) => {
      return acc || minimatch(pathname, exclude)
    }, false)
  }

  findRuleByInput (inputName) {
    const ext = path.extname(inputName).slice(1)
    const rule = this.rules[ext]

    if (!rule || rule.isExclude(inputName)) {
      return null
    }

    return rule
  }

  /**
   * Detect cooresponding rule from output path
   * It is not deterministic unlike findRuleByInput,
   * we query whether the input file is exists
   * to determine what rule we should select.
   * If a possible input file path is not found, we skip the rule.
   */
  findRuleByOutput (outputName, exists) {
    const ext = path.extname(outputName).slice(1)
    const rules = Object.keys(this.rules)
      .map(key => this.rules[key])
      .concat(Rule.empty)

    for (const rule of rules) {
      if (!rule.isEmpty && rule.outputExt !== ext) continue

      const inputName = rule.getInputPath(outputName)

      if (!exists(inputName)) continue

      if (rule.isExclude(inputName)) {
        continue
      }

      return rule
    }

    return null
  }

  /**
   * Builder function for Config model
   * options = { preset, base }
   */
  static create (config, tasks, options) {
    options = options || {}

    const preset = options.preset
    const resolve = makeResolve(options.base || '')

    return new Config({
      // Resolve input/output paths
      input: typeof config.input === 'string' && resolve(config.input),
      output: typeof config.output === 'string' && resolve(config.output),

      // `exclude` option excludes matched files from `input`
      exclude: resolveExclude(config.exclude),

      // Resolve and merge rules by traversing preset
      rules: resolveRules(config.rules || {}, tasks, preset),

      // Resolve dev server configs
      proxy: resolveProxy(config.dev && config.dev.proxy)
    })
  }
}

function resolveExclude (exclude) {
  if (!exclude) return []

  return typeof exclude === 'string'
    ? [exclude]
    : exclude
}

function resolveRules (rules, tasks, preset) {
  rules = util.mapValues(rules, (rule, key) => {
    return new Rule(rule, key, tasks)
  })

  if (!preset) return rules

  return util.merge(preset.rules, rules)
}

function resolveProxy (proxy) {
  if (!proxy) return []

  return Object.keys(proxy).map(context => {
    const config = typeof proxy[context] === 'string'
      ? { target: proxy[context] }
      : proxy[context]

    return { context, config }
  })
}

function makeResolve (base) {
  return pathname => {
    return path.resolve(base, pathname)
  }
}
