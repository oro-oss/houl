'use strict'

class DepResolver {
  constructor (resolveDeps) {
    // `progeny` - (filePath, fileContent) => filePath[]
    this.resolveDeps = resolveDeps

    this.files = new Map()
  }

  register (fileName, content) {
    const file = this._getFile(fileName)
    const newOut = this.resolveDeps(fileName, content)

    this._cleanUpOutDeps(file)
    file.outDeps = newOut
    this._registerOutDeps(file)

    this._setFile(fileName, file)
  }

  resolve (fileName) {
    const origin = this._getFile(fileName)
    const footprints = new Set()
    footprints.add(origin.fileName)

    const resolveImpl = (acc, fileName) => {
      const file = this._getFile(fileName)

      // detect circlar deps
      if (footprints.has(file.fileName)) {
        return acc
      }

      footprints.add(file.fileName)

      return file.inDeps
        .reduce(resolveImpl, acc.concat([file.fileName]))
    }

    return origin.inDeps.reduce(resolveImpl, [])
  }

  _getFile (fileName) {
    const file = this.files.get(fileName)

    if (file) return file

    const newFile = {
      fileName,
      outDeps: [],
      inDeps: []
    }
    this._setFile(fileName, newFile)
    return newFile
  }

  _setFile (fileName, file) {
    this.files.set(fileName, file)
  }

  _registerOutDeps (file) {
    file.outDeps.forEach(name => {
      const dep = this._getFile(name)
      dep.inDeps.push(file.fileName)
      this._setFile(dep.fileName, dep)
    })
  }

  _cleanUpOutDeps (file) {
    file.outDeps.forEach(name => {
      const dep = this._getFile(name)
      dep.inDeps = dep.inDeps.filter(inDep => {
        return inDep !== file.fileName
      })
      this._setFile(dep.fileName, dep)
    })
  }
}
exports.DepResolver = DepResolver
