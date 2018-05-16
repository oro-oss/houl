'use strict'

const assert = require('assert')
const util = require('./util')

class Cache {
  constructor (hash) {
    this.map = {}
    this.hash = hash || util.identity
  }

  get (filename) {
    assert(typeof filename === 'string', 'File name must be a string')
    const item = this.map[filename]
    return item && item.data
  }

  register (filename, source, data) {
    assert(typeof filename === 'string', 'File name must be a string')
    this.map[filename] = {
      hash: this.hash(source),
      data
    }
  }

  clear (filename) {
    assert(typeof filename === 'string', 'File name must be a string')
    delete this.map[filename]
  }

  test (filename, source) {
    assert(typeof filename === 'string', 'File name must be a string')
    const item = this.map[filename]
    return !!item && item.hash === this.hash(source)
  }

  /**
   * We do not include cache data into serialized object
   */
  serialize () {
    return util.mapValues(this.map, item => item.hash)
  }

  deserialize (map) {
    this.map = util.mapValues(map, hash => {
      return { hash }
    })
  }
}
module.exports = Cache
