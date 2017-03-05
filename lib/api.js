const PassThrough = require('stream').PassThrough

function isDev () {
  return process.env.NODE_ENV !== 'production'
}

function noop () {
  return new PassThrough({ objectMode: true })
}

exports.dev = function (stream) {
  return isDev() ? stream : noop()
}

exports.prod = function (stream) {
  return isDev() ? noop() : stream
}
