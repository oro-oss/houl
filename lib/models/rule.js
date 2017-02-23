const assert = require('assert')

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

  }

  getOutputPath (inputPath) {
    const extRE = new RegExp(`\\.${this.inputExt}$`, 'i')
    return inputPath.replace(extRE, `.${this.outputExt}`)
  }
}
