'use strict'

const assert = require('assert')
const util = require('./util')

class Cache {
  constructor (transform) {
    this.map = {}
    this.transform = transform || util.identity
  }

  register (filename, contents) {
    assert(typeof filename === 'string', 'File name must be a string')
    this.map[filename] = this.transform(contents)
  }

  clear (filename) {
    assert(typeof filename === 'string', 'File name must be a string')
    delete this.map[filename]
  }

  test (filename, contents) {
    assert(typeof filename === 'string', 'File name must be a string')
    return this.map[filename] === this.transform(contents)
  }

  serialize () {
    return this.map
  }

  deserialize (map) {
    this.map = map
  }
}
module.exports = Cache
