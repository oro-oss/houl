'use strict'

const stream = require('stream')
const Transform = stream.Transform
const Readable = stream.Readable

/**
 * Returns a transform stream that branches
 * the input stream to several streams given by argument.
 */
module.exports = function taskStream (config) {
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

      const src = new Readable({ objectMode: true })
      src.push(file)
      src.push(null)

      rule.task(src).on('data', file => {
        file.extname = '.' + rule.outputExt
        callback(null, file)
      })
    }
  })
}
