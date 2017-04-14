'use strict'

const stream = require('stream')
const Readable = stream.Readable
const Writable = stream.Writable
const Transform = stream.Transform

exports.vinyl = function vinyl (options) {
  if (typeof options.contents === 'string') {
    options.contents = Buffer.from(options.contents)
  }

  Object.defineProperty(options, 'extname', {
    get () {
      return '.' + this.path.split('.').pop()
    },
    set (value) {
      const filePath = this.path.split('.')
      filePath.pop()
      this.path = filePath.join('.') + value
    }
  })

  return options
}

exports.assertStream = function assertStream (expected) {
  let count = 0

  return new Writable({
    objectMode: true,
    write (data, encoding, cb) {
      expect(data).toEqual(expected[count])

      count += 1
      cb(null, data)
    }
  }).on('finish', () => {
    expect(count).toBe(expected.length)
  })
}

exports.source = function source (input) {
  return new Readable({
    objectMode: true,
    read () {
      input.forEach(data => this.push(data))
      this.push(null)
    }
  })
}

exports.transform = function transform (fn) {
  return new Transform({
    objectMode: true,
    transform: fn
  })
}
