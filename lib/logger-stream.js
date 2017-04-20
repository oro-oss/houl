'use strict'

const path = require('path')
const Transform = require('stream').Transform

module.exports = function loggerStream (logger, config) {
  return new Transform({
    objectMode: true,
    transform (file, encoding, done) {
      const input = '/' + path.relative(config.base, file.path)

      file._logger = {
        input,
        instance: logger
      }

      logger.start(input)

      done(null, file)
    }
  })
}
