'use strict'

const assert = require('assert')
const path = require('path')
const util = require('../util')

class BuildLogger {
  constructor(config, options) {
    options = options || {}

    this.errorCount = 0
    this.config = config
    this.console = options.console || console
    this.now = options.now || Date.now
    this.startedTime = null
  }

  start() {
    const input = normalize(this.config.base, this.config.input)
    const output = normalize(this.config.base, this.config.output)

    this.startedTime = this.now()

    this.console.log(`Building ${input} -> ${output}`)
  }

  error(err) {
    assert(this.startedTime !== null)

    this.console.error(err.message)
    this.errorCount += 1
  }

  finish() {
    assert(this.startedTime !== null)

    if (this.errorCount > 0) {
      this.console.log(`Finished with ${this.errorCount} error(s)`)
      return
    }

    const time = this.now() - this.startedTime
    this.console.log(`Finished in ${prittyTime(time)}`)
  }
}
module.exports = BuildLogger

function normalize(base, pathname) {
  return util.normalizePath(path.relative(base, pathname))
}

function prittyTime(msec) {
  if (msec < 1000 * 0.1) {
    return trunc(msec) + 'ms'
  } else if (msec < 1000 * 1000 * 0.1) {
    return trunc(msec / 1000) + 's'
  } else {
    return trunc(msec / (60 * 1000)) + 'm'
  }
}

function trunc(n) {
  return Math.floor(n * 100) / 100
}
