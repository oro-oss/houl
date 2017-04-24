'use strict'

const assert = require('assert')

class BuildLogger {
  constructor (options) {
    options = options || {}

    this.meta = {}
    this.output = options.output || process.stdout
    this.now = options.now || Date.now
  }

  startAll () {
    this.startTime = this.now()
    this._write(`Start building at ${format(this.startTime)}`)
  }

  finishAll () {
    const finishTime = this.now()
    const duration = finishTime - this.startTime

    this._write(`Finish building at ${format(finishTime)} ${prittyTime(duration)}`)
  }

  start (fileName) {
    this.meta[fileName] = {
      fileName,
      startTime: this.now()
    }
  }

  finish (input, output) {
    const target = this._findMeta(input)
    const finishTime = this.now()

    this._write(
      `Finished\t${input} -> ${output} ${prittyTime(finishTime - target.startTime)}`
    )
  }

  cache (input) {
    this._findMeta(input)

    this._write(
      `Cache exists\t${input}`
    )
  }

  _findMeta (input) {
    const target = this.meta[input]
    assert(target)
    return target
  }

  _write (line) {
    this.output.write(line + '\n')
  }
}
module.exports = BuildLogger

function format (time) {
  const date = new Date(time)
  const h = pad(date.getHours())
  const m = pad(date.getMinutes())
  const s = pad(date.getSeconds())
  return `${h}:${m}:${s}`
}

function pad (n) {
  return ('0' + String(n)).slice(-2)
}

function prittyTime (msec) {
  if (msec < 1000) {
    return trunc(msec) + 'ms'
  } else if (msec < 60 * 1000) {
    return trunc(msec / 1000) + 's'
  } else {
    return trunc(msec / (60 * 1000)) + 'm'
  }
}

function trunc (n) {
  return Math.floor(n * 10) / 10
}
