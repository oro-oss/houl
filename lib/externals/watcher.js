'use strict'

const path = require('path')
const chokidar = require('chokidar')

module.exports = function createWatcher (config, depResolver, cb) {
  return chokidar.watch(config.input, {
    ignoreInitial: true,
    cwd: config.input
  }).on('add', file => watchHandler('add', file))
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
