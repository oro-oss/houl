'use strict'

const Duplex = require('stream').Duplex
const PassThrough = require('stream').PassThrough

/**
 * Branch the input files to several streams
 * to process user defined tasks based on rules.
 * All processed files are pushed into TaskStream
 * so the user of this stream should not aware
 * there are multiple streams under the hood.
 */
class TaskStream extends Duplex {
  constructor(config) {
    super({ objectMode: true })

    this._config = config

    // Create transform streams for each rule
    this._branches = this._createInternalStreams(config)

    // Teardown
    this.on('finish', () => this._destroy())
  }

  _createInternalStreams(config) {
    const map = new Map()

    Object.keys(config.rules).forEach(key => {
      const rule = config.rules[key]

      const input = new PassThrough({
        objectMode: true
      })

      const output = rule
        .task(input)
        .on('data', file => {
          file.extname = '.' + rule.outputExt
          this.push(file)
        })
        .on('error', err => this.emit('error', err))

      // Register the source stream to use later.
      map.set(rule, { input, output })
    })

    return map
  }

  _destroy() {
    // To ensure to teardown the streams in correct order
    // we need to wait internal streams before finish `this`.
    // We have to notify the end of input to input stream of each branch
    // and listen the `end` event of each output stream
    // to avoid leakage of any data that need long time to transform.
    const branches = Array.from(this._branches.values())
    branches.forEach(b => {
      b.input.push(null)
    })

    waitAllStreams(branches.map(b => b.output), () => {
      this.push(null)
    })
  }

  /**
   * If the file does not match any rules
   * it is immediately pushed to next stream.
   * Otherwise it is sent to cooresponding task stream.
   */
  _write(file, encoding, done) {
    const rule = this._config.findRuleByInput(file.path)

    if (rule === null) {
      this.push(file)
    } else {
      const input = this._branches.get(rule).input
      input.push(file)
    }

    done()
  }

  // Do nothing since we just use this.push method in other places
  _read() {}

  // Update mtime and ctime for all pushed files
  push(file) {
    if (file) {
      updateTime(file)
    }
    super.push(file)
  }
}

function waitAllStreams(streams, done) {
  let rest = streams.length

  for (const s of streams) {
    s.on('end', () => {
      rest -= 1
      if (rest === 0) {
        done()
      }
    })
  }
}

function updateTime(file) {
  if (!file.stat) return

  const now = Date.now()

  if (file.stat.mtime) {
    file.stat.mtime = new Date(now)
  }
  if (file.stat.ctime) {
    file.stat.ctime = new Date(now)
  }
}

module.exports = function taskStream(config) {
  return new TaskStream(config)
}
