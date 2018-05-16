'use strict'

/**
 * Similar with Cache but considering files dependencies.
 */
class DepCache {
  constructor (cache, depResolver, readFile) {
    this.cache = cache
    this.depResolver = depResolver
    this.readFile = readFile
  }

  get (filename) {
    return this.cache.get(filename)
  }

  register (filename, source, data) {
    this.cache.register(filename, source, data)
    this.depResolver.register(filename, source)
  }

  clear (filename) {
    this.cache.clear(filename)
    this.depResolver.clear(filename)
  }

  /**
   * Test the given file has the same contents.
   * It also considers the dependencies. That means it is treated as
   * updated when one of the dependenies is changed even if the target
   * file itself is not.
   */
  test (fileName, source) {
    // If original source is updated, it should not be the same.
    if (!this.cache.test(fileName, source)) {
      return false
    }

    this.depResolver.register(fileName, source)
    const newDeps = this.depResolver.getOutDeps(fileName)

    // Loop through deps to compare its contents
    let isUpdate = false
    for (const fileName of newDeps) {
      const contents = this.readFile(fileName)

      // What should we do if possible deps are not found?
      // For now, treat it as updated contents
      // so that transformers can handle the error
      if (contents == null) {
        isUpdate = true
      } else {
        isUpdate = isUpdate || !this.cache.test(fileName, contents)
      }
    }

    return !isUpdate
  }
}
module.exports = DepCache
