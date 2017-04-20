'use strict'

const path = require('path')
const stream = require('stream')
const Transform = stream.Transform
const Readable = stream.Readable
const util = require('./util')

/**
 * Returns a transform stream that branches
 * the input stream to several streams given by argument.
 */
module.exports = function taskStream (config) {

  function log (file) {
    if (!file._logger) return

    const relative = path.relative(config.input, file.path)
    const outputDir = path.relative(config.base, config.output)
    const output = '/' + util.normalizePath(path.join(outputDir, relative))
    const logger = file._logger.instance

    logger.finish(file._logger.input, output)
  }

  /**
   * (inputStream) -> transform -> each task -> transform -> (outputStream)
   */
  return new Transform({
    objectMode: true,

    transform (file, encoding, callback) {
      const rule = config.findRuleByInput(file.path)

      if (rule === null) {
        callback(null, file)

        log(file)
        return
      }

      const src = new Readable({ objectMode: true })
      src.push(file)
      src.push(null)

      rule.task(src)
        .on('data', file => {
          file.extname = '.' + rule.outputExt
          this.push(file)

          log(file)
        })
        .on('error', callback)
        .on('end', callback)
    }
  })
}
