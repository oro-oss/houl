const { PassThrough } = require('stream')
const { build } = require('./build')
const { dev: startDevServer } = require('./dev')

function isDev () {
  return process.env.NODE_ENV !== 'production'
}

function noop () {
  return new PassThrough({ objectMode: true })
}

function dev (stream) {
  return isDev() ? stream : noop()
}

function prod (stream) {
  return isDev() ? noop() : stream
}

exports.dev = dev
exports.prod = prod
exports.build = build
exports.startDevServer = startDevServer
