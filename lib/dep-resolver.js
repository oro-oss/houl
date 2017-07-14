'use strict'

const assert = require('assert')
const path = require('path')
const progeny = require('progeny')
const util = require('./util')

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

  clear (fileName) {
    const file = this._getFile(fileName)
    this._cleanUpOutDeps(file)
    this._deleteFile(fileName)
  }

  getInDeps (fileName) {
    const origin = this._getFile(fileName)
    return origin.inDeps.reduce(
      this._resolveNestedDeps(origin, 'inDeps'),
      []
    )
  }

  getOutDeps (fileName) {
    const origin = this._getFile(fileName)
    return origin.outDeps.reduce(
      this._resolveNestedDeps(origin, 'outDeps'),
      []
    )
  }

  serialize () {
    const map = {}

    for (const item of this.files.values()) {
      map[item.fileName] = item.outDeps
    }

    return map
  }

  deserialize (map) {
    this.files.clear()

    Object.keys(map).forEach(key => {
      const file = this._getFile(key)
      file.outDeps = map[key]

      this._registerOutDeps(file)
      this._setFile(key, file)
    })
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

  _deleteFile (fileName) {
    this.files.delete(fileName)
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

  _resolveNestedDeps (file, depDirection) {
    assert(
      depDirection === 'outDeps' || depDirection === 'inDeps'
    )

    const footprints = new Set()
    footprints.add(file.fileName)

    const resolveImpl = (acc, fileName) => {
      const file = this._getFile(fileName)

      // detect circlar deps
      if (footprints.has(file.fileName)) {
        return acc
      }

      footprints.add(file.fileName)

      return file[depDirection]
        .reduce(resolveImpl, acc.concat([file.fileName]))
    }

    return resolveImpl
  }

  static create (config) {
    const progenyOptions = util.mapValues(config.rules, rule => rule.progeny)
    return new DepResolver((fileName, contents) => {
      const ext = path.extname(fileName).slice(1)
      return progeny.Sync(progenyOptions[ext])(fileName, contents)
    })
  }
}
module.exports = DepResolver
