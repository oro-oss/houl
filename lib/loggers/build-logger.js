'use strict'

const assert = require('assert')
const readline = require('readline')
const util = require('../util')

class BuildLogger {
  constructor (options) {
    options = options || {}

    this.buffer = []
    this.output = options.output || process.stdout
    this.now = options.now || Date.now
  }

  start (fileName) {
    this._cleanUpBuffer()

    this.buffer.push({
      input: fileName,
      output: null,
      startTime: this.now(),
      finishTime: null,
      status: 'building'
    })

    this._writeBuffer()
  }

  finish (input, output) {
    const target = this._findBuilding(input)

    target.status = 'finished'
    target.finishTime = this.now()
    target.output = output

    this._updateBuffer()
  }

  cache (input) {
    const target = this._findBuilding(input)

    target.status = 'cache_exists'

    this._updateBuffer()
  }

  _findBuilding (input) {
    const target = this.buffer.find(b => b.input === input)
    assert(target)
    assert(!target.isFinished)
    return target
  }

  _updateBuffer () {
    this._cleanUpBuffer()
    this._applyFinishedBuffer()
    this._writeBuffer()
  }

  _cleanUpBuffer () {
    for (let i = 0; i < this.buffer.length + 1; ++i) {
      readline.clearLine(this.output, 0)
      readline.cursorTo(this.output, 0)
      readline.moveCursor(this.output, 0, -1)
    }
    this.output.write('\n')
  }

  _applyFinishedBuffer () {
    // Remove sequencial finished/cache_exists buffers
    // and apply it to stdout permanently
    const head = util.takeWhile(this.buffer, item => {
      return item.status === 'finished' || item.status === 'cache_exists'
    })

    this._write(head)
    this.buffer = this.buffer.slice(head.length)
  }

  _writeBuffer () {
    this._write(this.buffer)
  }

  _write (buffer) {
    const lines = buffer
      .map(item => this._makeLine(item))
      .concat([''])
      .join('\n')

    this.output.write(lines)
  }

  _makeLine (item) {
    switch (item.status) {
      case 'building':
        return `Building\t${item.input}...`
      case 'finished':
        const time = item.finishTime - item.startTime
        return `Finished\t${item.input} -> ${item.output} ${prittyTime(time)}`
      case 'cache_exists':
        return `Cache exists\t${item.input}`
      default:
        assert(false, 'Unexpected status')
    }
  }
}
module.exports = BuildLogger

function prittyTime (msec) {
  if (msec < 1000 * 0.1) {
    return trunc(msec) + 'ms'
  } else if (msec < 1000 * 1000 * 0.1) {
    return trunc(msec / 1000) + 's'
  } else {
    return trunc(msec / (1000 * 1000)) + 'm'
  }
}

function trunc (n) {
  return Math.floor(n * 100) / 100
}
