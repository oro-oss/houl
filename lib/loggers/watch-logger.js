'use strict'

const path = require('path')
const color = require('../color')

class WatchLogger {
  constructor(config, options) {
    this.config = config
    this.console = options.console || console

    this.modPath = pathName => {
      return '/' + path.relative(this.config.base, pathName)
    }
  }

  startWatching() {
    const source = path.relative(this.config.base, this.config.input) + '/'
    this.console.log(`Houl is watching the source directory: ${source}`)
  }

  addFile(source) {
    this._write(color.yellow('ADDED'), this.modPath(source))
  }

  updateFile(source) {
    this._write(color.yellow('UPDATED'), this.modPath(source))
  }

  writeFile(dest) {
    this._write(color.cyan('WROTE'), this.modPath(dest))
  }

  _write(label, text) {
    this.console.log(label + ' ' + text)
  }
}
module.exports = WatchLogger
