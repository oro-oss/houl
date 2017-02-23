'use strict'

const path = require('path')
const loadConfig = require('../../lib/config').loadConfig

const read = pathname => {
  return loadConfig(path.join('test/fixtures', pathname))
}

describe('Config', () => {
  it('loads js file', () => {
    read('normal.config.js')
  })

  it('loads json file', () => {
    read('test.config.json')
  })

  it('throws if try loading other file', () => {
    expect(() => read('test.coffee'))
      .toThrowError(/test\.coffee is non-supported file format/)
  })
})
