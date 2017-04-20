'use strict'

const path = require('path')
const Transform = require('stream').Transform
const util = require('./util')

module.exports = function loggerStream (logger, config) {
  return new Transform({
    objectMode: true,
    transform (file, encoding, done) {
      const input = util.normalizePath(path.relative(config.base, file.path))

      file._logger = {
        input,
        instance: logger
      }

      logger.start(input)

      done(null, file)
    }
  })
}
