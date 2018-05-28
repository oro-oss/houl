'use strict'

const assert = require('assert')
const minimatch = require('minimatch')
const util = require('../util')
const createTask = require('./task')

const emptyRule = new class EmptyRule {
  constructor () {
    this.isEmpty = true
    this.taskName = null
    this.task = util.identity
    this.inputExt = null
    this.outputExt = null
    this.exclude = []
    this.progeny = undefined
  }

  getInputPath (outputPath) {
    return outputPath
  }

  getOutputPath (inputPath) {
    return inputPath
  }

  isExclude () {
    return false
  }
}

class Rule {
  constructor (rule, inputExt) {
    this.taskName = typeof rule === 'string'
      ? rule
      : rule.task

    this.task = null

    this.inputExt = inputExt
    this.outputExt = rule.outputExt || this.inputExt

    this.exclude = rule.exclude || []
    if (typeof this.exclude === 'string') {
      this.exclude = [this.exclude]
    }

    this.progeny = rule.progeny
    if (this.progeny) {
      this.progeny.extension = inputExt
    }
  }

  getInputPath (outputPath) {
    const extRE = new RegExp(`\\.${this.outputExt}$`, 'i')
    return outputPath.replace(extRE, `.${this.inputExt}`)
  }

  getOutputPath (inputPath) {
    const extRE = new RegExp(`\\.${this.inputExt}$`, 'i')
    return inputPath.replace(extRE, `.${this.outputExt}`)
  }

  isExclude (inputPath) {
    return this.exclude.reduce((acc, exclude) => {
      return acc || minimatch(inputPath, exclude)
    }, false)
  }

  merge (rule) {
    const merged = new Rule({
      task: rule.taskName || this.taskName,
      outputExt: rule.outputExt || this.outputExt,
      exclude: this.exclude.concat(rule.exclude),
      progeny: mergeOptions(this.progeny, rule.progeny)
    }, rule.inputExt)

    // `task` may not loaded yet, so we need to check `taskName` instead.
    merged.task = rule.taskName ? rule.task : this.task

    return merged
  }

  static create (rawRule, inputExt, tasks, parent) {
    let rule = new Rule(rawRule, inputExt)
    if (parent) {
      rule = parent.merge(rule)
    }

    if (!rule.task) {
      assert(tasks[rule.taskName], `Task "${rule.taskName}" is not defined`)
      rule.task = createTask(tasks[rule.taskName], rawRule.options || {})
    }

    return rule
  }

  static get empty () {
    return emptyRule
  }
}
module.exports = Rule

/**
 * Assumes `a` and `b` is the same type
 * but if either one is `null` or `undefined`, it will be just ignored.
 */
function mergeOptions (a, b) {
  if (a == null) return b
  if (b == null) return a

  if (Array.isArray(a)) {
    return a.concat(b)
  }

  if (
    typeof a === 'object'
    && !(a instanceof RegExp)
  ) {
    const res = {}
    mergedKeys(a, b).forEach(key => {
      res[key] = mergeOptions(a[key], b[key])
    })
    return res
  }

  return b
}

function mergedKeys (a, b) {
  const keys = {}
  Object.keys(a).concat(Object.keys(b)).forEach(key => {
    keys[key] = true
  })
  return Object.keys(keys)
}
