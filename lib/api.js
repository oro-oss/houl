const PassThrough = require('stream').PassThrough
const isDev = process.env.NODE_ENV !== 'production'

const noop = new PassThrough({ objectMode: true })

exports.dev = function (stream) {
  return isDev ? stream : noop
}

exports.prod = function (stream) {
  return isDev ? noop : stream
}
