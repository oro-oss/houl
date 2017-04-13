'use strict'

const Transform = require('stream').Transform

module.exports = function (cache, depResolver, requestFile) {
  const contentsMap = new Map()

  function shouldTransform (fileName, source) {
    contentsMap.set(fileName, source)

    // If original source is updated, it should be transformed
    if (!cache.test(fileName, source)) {
      cache.register(fileName, source)
      return true
    }

    // Acquire old deps and new deps to compare
    const oldDeps = depResolver.getOutDeps(fileName)
    depResolver.register(fileName, source)
    const newDeps = depResolver.getOutDeps(fileName)

    // If dependencies are not matched, it should be transformed
    if (!isSameSet(oldDeps, newDeps)) return true

    // Loop through deps to compare its contents
    let isUpdate = false
    for (const fileName of newDeps) {

      // If contentsMap has the previously loaded contents, just use it
      let contents
      if (contentsMap.has(fileName)) {
        contents = contentsMap.get(fileName)
      } else {
        contents = requestFile(fileName)
        contentsMap.set(fileName, contents)
      }

      // What should we do if possible deps are not found?
      // For now, treat it as updated contents
      // so that transformers can handle the error
      if (contents == null) {
        isUpdate = true
      } else {
        isUpdate |= !cache.test(fileName, contents)
        cache.register(fileName, contents)
      }
    }

    return isUpdate
  }

  const stream = new Transform({
    objectMode: true,
    transform (file, encoding, callback) {
      const source = file.contents.toString()

      if (shouldTransform(file.path, source)) {
        callback(null, file)
      } else {
        callback()
      }
    }
  })

  return stream
}

function isSameSet (xs, ys) {
  if (xs.length !== ys.length) return false

  for (const x of xs) {
    if (ys.indexOf(x) < 0) return false
  }
  return true
}
