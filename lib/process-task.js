const stream = require('stream')
const Transform = stream.Transform
const PassThrough = stream.PassThrough
const minimatch = require('minimatch')
const util = require('./util')

/**
 * Returns a transform stream that branches
 * the input stream to several streams given by argument.
 */
module.exports = function selectTask (config) {
  /**
   * (inputStream) -> transform -> each task -> transform -> (outputStream)
   */
  class ProcessTask extends Transform {
    constructor (config) {
      super({ objectMode: true })

      // Add input/output stream for each rule
      this._items = util.mapValues(config.rules, rule => {
        const inputStream = new PassThrough({ objectMode: true })
        return {
          rule,
          inputStream,
          outputStream: rule.task(inputStream)
        }
      })
    }

    _transform (file, encoding, callback) {
      const ext = file.extname.slice(1)
      const item = this._items[ext]

      if (!item) {
        callback(null, file)
        return
      }

      const rule = item.rule

      // Ignore if the file path is matched with exclude option
      if (rule.exclude && minimatch(file.path, rule.exclude)) {
        callback(null, file)
        return
      }

      file.extname = '.' + rule.outputExt

      item.inputStream.write(file)
      item.outputStream.on('data', file => callback(null, file))
    }
  }

  return new ProcessTask(config)
    .once('end', function () {
      Object.keys(this._items).forEach(key => {
        this._items[key].inputStream.end()
      })
    })
}
