'use strict'

const Transform = require('stream').Transform
const DepCache = require('./dep-cache')

module.exports = function (cache, depResolver, readFile) {
  const contentsMap = new Map()
  const depCache = new DepCache(cache, depResolver, readFile)

  function getContent (fileName) {
    // If contentsMap has the previously loaded content, just use it
    const content = contentsMap.get(fileName)
    if (content) {
      return content
    }

    const loaded = readFile(fileName)
    contentsMap.set(fileName, loaded)
    return loaded
  }

  /**
   * Resolve all previously loaded files deps and register them to cache.
   * We need lazily update the cache because it could block build targets
   * if the nested deps are registered before building them.
   * This method is expected to be called in the `finish` event of stream.
   */
  function registerPendingCache (fileName, source) {
    const footprints = new Set()

    function loop (fileName, source) {
      // Detect circular
      if (footprints.has(fileName)) return
      footprints.add(fileName)

      // When `source` is empty value,
      // the file is not exists so we must clear the cache.
      if (source == null) {
        depCache.clear(fileName)
        return
      }

      depCache.register(fileName, source)

      depResolver.getOutDeps(fileName).forEach(fileName => {
        loop(fileName, getContent(fileName))
      })
    }

    loop(fileName, source)
  }

  const stream = new Transform({
    objectMode: true,
    transform (file, encoding, callback) {
      const source = file.contents.toString()

      contentsMap.set(file.path, source)
      if (!depCache.test(file.path, source)) {
        this.push(file)
      }

      callback()
    }
  })

  stream.on('finish', () => {
    // Update cache and deps
    for (const entry of contentsMap.entries()) {
      registerPendingCache(entry[0], entry[1])
    }
  })

  return stream
}
