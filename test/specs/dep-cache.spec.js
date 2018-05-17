const Cache = require('../../lib/cache')
const DepResolver = require('../../lib/dep-resolver')
const DepCache = require('../../lib/dep-cache')

describe('DepCache', () => {
  it('returns true if it hits the cache including all deps', () => {
    // foo.txt -> bar.txt -> baz.txt
    const readFile = file => {
      return {
        'bar.txt': 'bar',
        'baz.txt': 'baz'
      }[file]
    }

    const resolveDep = file => {
      switch (file) {
        case 'foo.txt':
          return ['bar.txt']
        case 'bar.txt':
          return ['baz.txt']
        default:
          return []
      }
    }

    const cache = new Cache()
    const depResolver = new DepResolver(resolveDep)
    const depCache = new DepCache(cache, depResolver, readFile)

    expect(depCache.test('foo.txt', 'foo')).toBe(false)
    depCache.register('foo.txt', 'foo')
    expect(depCache.test('foo.txt', 'foo')).toBe(true)
  })

  it('returns false if one of deps is changed', () => {
    let bazContent = 'baz'

    // foo.txt -> bar.txt -> baz.txt
    const readFile = file => {
      return {
        'bar.txt': 'bar',
        'baz.txt': bazContent
      }[file]
    }

    const resolveDep = file => {
      switch (file) {
        case 'foo.txt':
          return ['bar.txt']
        case 'bar.txt':
          return ['baz.txt']
        default:
          return []
      }
    }

    const cache = new Cache()
    const depResolver = new DepResolver(resolveDep)
    const depCache = new DepCache(cache, depResolver, readFile)

    depCache.register('foo.txt', 'foo')
    bazContent = 'baz updated'
    expect(depCache.test('foo.txt', 'foo')).toBe(false)
  })
})
