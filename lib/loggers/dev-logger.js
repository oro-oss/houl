'use strict'

const path = require('path')
const color = require('../color')

class DevLogger {
  constructor(config, options) {
    options = options || {}

    this.config = config
    this.console = options.console || console

    this.modPath = pathName => {
      return '/' + path.relative(this.config.input, pathName)
    }
  }

  startDevServer(port, externalIp) {
    this.console.log(
      `Houl dev server is running at:\nLocal: http://localhost:${port}`
    )
    externalIp.forEach(ip => {
      this.console.log(`External: http://${ip}:${port}`)
    })
  }

  addFile(source) {
    this._write(color.yellow('ADDED'), this.modPath(source))
  }

  updateFile(source) {
    this._write(color.yellow('UPDATED'), this.modPath(source))
  }

  getFile(pathname) {
    this._write(color.green('GET'), pathname)
  }

  _write(label, text) {
    this.console.log(label + ' ' + text)
  }
}
module.exports = DevLogger
