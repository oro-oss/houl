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
}
