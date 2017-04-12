'use strict'

const Cache = require('../../lib/cache')

describe('Cache', () => {
  it('tests cache hit with file name and contents', () => {
    const cache = new Cache()

    cache.register('test.txt', 'abc')

    expect(cache.test('test.txt', 'abc')).toBe(true)
    expect(cache.test('foo.txt', 'abc')).toBe(false)
    expect(cache.test('test.txt', 'def')).toBe(false)
  })

  it('clears cache by file name', () => {
    const cache = new Cache()

    cache.register('test.txt', 'abc')
    expect(cache.test('test.txt', 'abc')).toBe(true)

    cache.clear('test.txt')
    expect(cache.test('test.txt', 'abc')).toBe(false)
  })

  it('serializes cache map', () => {
    const cache = new Cache()

    cache.register('foo.txt', 'abc')
    cache.register('bar.txt', 'def')

    expect(cache.serialize()).toEqual(JSON.stringify({
      'foo.txt': 'abc',
      'bar.txt': 'def'
    }))
  })

  it('deserializes cache map', () => {
    const cache = new Cache()

    cache.deserialize(JSON.stringify({
      'foo.txt': 'abc',
      'bar.txt': 'def'
    }))

    expect(cache.test('foo.txt', 'abc')).toBe(true)
    expect(cache.test('bar.txt', 'def')).toBe(true)
  })
})
