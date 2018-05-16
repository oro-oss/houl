'use strict'

const assert = require('assert')
const util = require('./util')

class Cache {
  constructor (hash) {
    this.map = {}
    this.hash = hash || util.identity
  }

  register (filename, contents) {
    assert(typeof filename === 'string', 'File name must be a string')
    this.map[filename] = this.hash(contents)
  }

  clear (filename) {
    assert(typeof filename === 'string', 'File name must be a string')
    delete this.map[filename]
  }

  test (filename, contents) {
    assert(typeof filename === 'string', 'File name must be a string')
    return this.map[filename] === this.hash(contents)
  }

  serialize () {
    return this.map
  }

  deserialize (map) {
    this.map = map
  }
}
module.exports = Cache
