'use strict'

const Transform = require('stream').Transform

module.exports = function (cache, depResolver, requestFile) {
  const contentsMap = new Map()

  function getContent (fileName) {
    // If contentsMap has the previously loaded contents, just use it
    if (contentsMap.has(fileName)) {
      return contentsMap.get(fileName)
    } else {
      const contents = requestFile(fileName)
      contentsMap.set(fileName, contents)
      return contents
    }
  }

  function shouldTransform (fileName, source) {
    contentsMap.set(fileName, source)

    // If original source is updated, it should be transformed
    if (!cache.test(fileName, source)) return true

    depResolver.register(fileName, source)
    const newDeps = depResolver.getOutDeps(fileName)

    // Loop through deps to compare its contents
    let isUpdate = false
    for (const fileName of newDeps) {
      const contents = getContent(fileName)

      // What should we do if possible deps are not found?
      // For now, treat it as updated contents
      // so that transformers can handle the error
      if (contents == null) {
        isUpdate = true
      } else {
        isUpdate |= !cache.test(fileName, contents)
      }
    }

    return isUpdate
  }

  function walkNestedDeps (fileName, source) {
    const footprints = new Set()

    function loop (fileName, source) {
      // Detect circular
      if (footprints.has(fileName)) return
      footprints.add(fileName)

      cache.register(fileName, source)
      depResolver.register(fileName, source)

      depResolver.getOutDeps(fileName).forEach(fileName => {
        loop(fileName, getContent(fileName))
      })
    }

    return loop(fileName, source)
  }

  const stream = new Transform({
    objectMode: true,
    transform (file, encoding, callback) {
      const source = file.contents.toString()

      if (shouldTransform(file.path, source)) {
        this.push(file)
      }

      callback()
    }
  })

  stream.on('finish', () => {
    // Update cache and deps
    for (const entry of contentsMap.entries()) {
      walkNestedDeps(entry[0], entry[1])
    }
  })

  return stream
}
