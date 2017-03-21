'use strict'

const stream = require('stream')
const Transform = stream.Transform
const PassThrough = stream.PassThrough

/**
 * Returns a transform stream that branches
 * the input stream to several streams given by argument.
 */
module.exports = function selectTask (config) {
  /**
   * (inputStream) -> transform -> each task -> transform -> (outputStream)
   */
  return new Transform({
    objectMode: true,

    transform (file, encoding, callback) {
      const rule = config.findRuleByInput(file.path)

      if (rule === null) {
        callback(null, file)
        return
      }

      const src = new PassThrough({ objectMode: true })
      rule.task(src).on('data', file => {
        file.extname = '.' + rule.outputExt
        callback(null, file)
      })
      src.end(file)
    }
  })
}
