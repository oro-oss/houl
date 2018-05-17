'use strict'

const Transform = require('stream').Transform
const DepCache = require('./dep-cache')

module.exports = function (cache, depResolver, readFile) {
  const contentsMap = new Map()
  const depCache = new DepCache(cache, depResolver, getContent)

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

  // Resolve all previously loaded files deps and register them to cache.
  // We need lazily update the cache because it could block build targets
  // if the nested deps are registered before building them.
  // This method is expected to be called in the `finish` event of stream.
  stream.on('finish', () => {
    for (const entry of contentsMap.entries()) {
      depCache.register(entry[0], entry[1])
    }
  })

  return stream
}
