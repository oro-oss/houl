const prod = require('../../../lib/api').prod
const Readable = require('stream').Readable
const Transform = require('stream').Transform

const transform = new Transform({
  objectMode: true,
  transform (text, encoding, callback) {
    callback(null, 'transformed')
  }
})

const source = new Readable({
  objectMode: true,
  read () {
    this.push('source')
    this.push(null)
  }
})

source
  .pipe(prod(transform))
  .on('data', data => console.log(data)) // eslint-disable-line
