'use strict'

const path = require('path')
const chokidar = require('chokidar')

module.exports = function createWatcher (config, depResolver, options, cb) {
  return chokidar.watch(config.input, {
    ignoreInitial: !options.initial,
    cwd: config.input
  }).on('change', pathname => {
    const fullPath = path.resolve(config.input, pathname)

    // Update deps
    depResolver.register(fullPath)

    // Resolve depended files
    const dirtyFiles = [fullPath].concat(depResolver.getInDeps(fullPath))

    cb(dirtyFiles)
  })
}
