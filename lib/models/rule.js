'use strict'

const assert = require('assert')
const util = require('../util')

const emptyRule = new class EmptyRule {
  constructor () {
    this.isEmpty = true
    this.taskName = null
    this.task = util.identity
    this.inputExt = null
    this.outputExt = null
    this.exclude = null
  }

  getInputPath (outputPath) {
    return outputPath
  }

  getOutputPath (inputPath) {
    return inputPath
  }
}

module.exports = class Rule {
  constructor (rule, inputExt, tasks) {
    const taskName = this.taskName = typeof rule === 'string'
      ? rule
      : rule.task
    this.task = tasks[taskName]

    assert(this.task, `Task "${taskName}" is not defined`)

    this.inputExt = inputExt
    this.outputExt = rule.outputExt || this.inputExt
    this.exclude = rule.exclude
  }

  getInputPath (outputPath) {
    const extRE = new RegExp(`\\.${this.outputExt}$`, 'i')
    return outputPath.replace(extRE, `.${this.inputExt}`)
  }

  getOutputPath (inputPath) {
    const extRE = new RegExp(`\\.${this.inputExt}$`, 'i')
    return inputPath.replace(extRE, `.${this.outputExt}`)
  }

  static get empty () {
    return emptyRule
  }
}
