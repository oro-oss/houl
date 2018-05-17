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

    expect(cache.serialize()).toEqual({
      'foo.txt': 'abc',
      'bar.txt': 'def'
    })
  })

  it('deserializes cache map', () => {
    const cache = new Cache()

    cache.deserialize({
      'foo.txt': 'abc',
      'bar.txt': 'def'
    })

    expect(cache.test('foo.txt', 'abc')).toBe(true)
    expect(cache.test('bar.txt', 'def')).toBe(true)
  })

  it('hashes cache data by provided transformer', () => {
    const cache = new Cache(content => 'abc' + content)

    cache.register('foo.txt', 'def')

    expect(cache.test('foo.txt', 'def')).toBe(true)
    expect(cache.serialize()).toEqual({
      'foo.txt': 'abcdef'
    })
  })

  it('stores additional data when register cache', () => {
    const cache = new Cache()

    cache.register('foo.txt', 'abc', 'def')
    expect(cache.get('foo.txt')).toBe('def')
  })

  it('clears cached data', () => {
    const cache = new Cache()

    cache.register('foo.txt', 'abc', 'def')
    cache.clear('foo.txt')
    expect(cache.get('foo.txt')).toBe(undefined)
  })
})
