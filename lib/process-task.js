const stream = require('stream')
const Transform = stream.Transform
const PassThrough = stream.PassThrough

/**
 * Returns a duplex stream that branches
 * the input stream to several streams given by argument.
 */
module.exports = function selectTask (flow) {
  /**
   * (inputStream) -> transform -> each task -> transform -> (outputStream)
   */
  class ProcessTask extends Transform {
    constructor (flow) {
      super({ objectMode: true })

      // flow = [{ rule, task }]
      // Add input/output stream for each object
      flow.forEach(item => {
        item.inputStream = new PassThrough({ objectMode: true })
        item.outputStream = item.task(item.inputStream)
      })

      this._flow = flow
    }

    _transform (file, encoding, callback) {
      for (const item of this._flow) {
        const rule = item.rule

        // TODO: exclude option
        if (rule.inputExt !== file.extname.slice(1)) continue

        file.extname = '.' + rule.outputExt

        item.inputStream.write(file)
        item.outputStream.on('data', file => callback(null, file))

        return
      }

      callback(null, file)
    }
  }

  return new ProcessTask(flow)
    .once('end', () => {
      flow.forEach(item => {
        item.inputStream.end()
      })
    })
}
