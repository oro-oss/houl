'use strict'

/**
 * Similar with Cache but considering files dependencies.
 */
class DepCache {
  constructor(cache, depResolver, readFile) {
    this.cache = cache
    this.depResolver = depResolver
    this.readFile = readFile
  }

  get(filename) {
    return this.cache.get(filename)
  }

  register(filename, source, data) {
    const footprints = new Set()

    const loop = (filename, source) => {
      if (footprints.has(filename)) {
        return
      }
      footprints.add(filename)

      // #26
      // When `source` is empty value,
      // the file is not exists so we must clear the cache.
      if (source == null) {
        this.clear(filename)
        return
      }

      this.cache.register(filename, source, data)
      this.depResolver.register(filename, source)

      this.depResolver.getOutDeps(filename).forEach(dep => {
        const depSource = this.readFile(dep)
        if (this.cache.test(dep, depSource)) {
          return
        }

        loop(dep, depSource)
      })
    }

    loop(filename, source, data)
  }

  clear(filename) {
    // Only clear the target file cache because we cannot be sure
    // the deps are really no longer useless for now.
    // i.e. The user may refer them directly via `test` method.
    this.cache.clear(filename)
    this.depResolver.clear(filename)
  }

  /**
   * Test the given file has the same contents.
   * It also considers the dependencies. That means it is treated as
   * updated when one of the dependenies is changed even if the target
   * file itself is not.
   */
  test(fileName, source) {
    // If original source is updated, it should not be the same.
    if (!this.cache.test(fileName, source)) {
      return false
    }

    const deps = this.depResolver.getOutDeps(fileName)

    // Loop through deps to compare its contents
    let isUpdate = false
    for (const fileName of deps) {
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
