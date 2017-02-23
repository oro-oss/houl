'use strict'

const path = require('path')
const config = require('../../lib/config')

const read = pathname => {
  return config(path.join('test/fixtures', pathname))
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
