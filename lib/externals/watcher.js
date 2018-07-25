'use strict'

const path = require('path')
const chokidar = require('chokidar')

module.exports = function createWatcher(config, depResolver, cb) {
  const options = {
    ignoreInitial: true,
    cwd: config.input
  }
  if (process.env.TEST) {
    // Disable fsevents on testing environment since it may cause clash sometimes.
    // See: https://github.com/paulmillr/chokidar/issues/612
    options.useFsEvents = false
  }

  return chokidar
    .watch(config.input, options)
    .on('add', file => watchHandler('add', file))
    .on('change', file => watchHandler('change', file))

  function watchHandler(name, pathname) {
    const fullPath = path.resolve(config.input, pathname)

    // Update deps
    depResolver.register(fullPath)

    // Resolve depended files
    const dirtyFiles = [fullPath].concat(depResolver.getInDeps(fullPath))

    cb(name, dirtyFiles, fullPath)
  }
}
