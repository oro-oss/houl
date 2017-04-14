'use strict'

const Readable = require('stream').Readable
const Writable = require('stream').Writable
const Cache = require('../../lib/cache')
const DepResolver = require('../../lib/dep-resolver').DepResolver
const cacheStream = require('../../lib/cache-stream')

const emptyArray = () => []
const emptyStr = () => ''

describe('Cache Stream', () => {
  it('should not update a cache until the stream is finished', done => {
    const cache = new Cache()
    const depResolver = new DepResolver(emptyArray)

    source([
      { path: 'foo.txt', contents: 'abc' },
      { path: 'bar.txt', contents: 'def' },
      { path: 'foo.txt', contents: 'abc' }
    ]).pipe(cacheStream(cache, depResolver, emptyStr))
      .pipe(assertStream([
        { path: 'foo.txt', contents: 'abc' },
        { path: 'bar.txt', contents: 'def' },
        { path: 'foo.txt', contents: 'abc' }
      ]))
      .on('finish', done)
  })


  it('should not affect deps update of previous item', done => {
    // last:    a.txt -> b.txt -> c.txt
    // current: a.txt -> b.txt -> d.txt
    // With this structure, if a.txt and b.txt passes to
    // cache stream in this order, both files should not be hit the cache.

    const cache = new Cache()
    const depResolver = new DepResolver((_, content) => {
      return content ? [content] : []
    })

    cache.deserialize({
      'a.txt': 'b.txt',
      'b.txt': 'c.txt',
      'c.txt': '',
      'd.txt': ''
    })

    depResolver.deserialize({
      'a.txt': ['b.txt'],
      'b.txt': ['c.txt']
    })

    const mockFs = pathName => {
      return {
        'a.txt': 'b.txt',
        'b.txt': 'd.txt',
        'c.txt': '',
        'd.txt': ''
      }[pathName]
    }

    source([
        { path: 'a.txt', contents: 'b.txt' },
        { path: 'b.txt', contents: 'd.txt' }
    ]).pipe(cacheStream(cache, depResolver, mockFs))
      .pipe(assertStream([
        { path: 'a.txt', contents: 'b.txt' },
        { path: 'b.txt', contents: 'd.txt' }
      ]))
      .on('finish', done)
  })

  it('passes data if original source does not hit with cache', done => {
    const cache = new Cache()
    const depResolver = new DepResolver(() => ['bar.txt'])

    cache.deserialize({
      'foo.txt': 'abc',
      'bar.txt': 'def'
    })

    depResolver.deserialize({
      'foo.txt': ['bar.txt']
    })

    const mockFs = pathName => {
      return {
        'foo.txt': 'updated',
        'bar.txt': 'def'
      }[pathName]
    }

    // Shold foo.txt be updated?
    // contents      -> updated
    // deps          -> not updated
    // deps contents -> not updated
    // -> should be updated
    source([
      { path: 'foo.txt', contents: 'updated' }
    ]).pipe(cacheStream(cache, depResolver, mockFs))
      .pipe(assertStream([
        { path: 'foo.txt', contents: 'updated' }
      ]))
      .on('finish', done)
  })

  it('passes data if deps contents are updated', done => {
    const cache = new Cache()
    const depResolver = new DepResolver(() => ['bar.txt'])

    cache.deserialize({
      'foo.txt': 'abc',
      'bar.txt': 'def'
    })

    depResolver.deserialize({
      'foo.txt': ['bar.txt']
    })

    const mockFs = pathName => {
      return {
        'foo.txt': 'abc',
        'bar.txt': 'updated'
      }[pathName]
    }

    // Shold foo.txt be updated?
    // contents      -> not updated
    // deps          -> not updated
    // deps contents -> updated (bar.txt)
    // -> should be updated
    source([
      { path: 'foo.txt', contents: 'abc' }
    ]).pipe(cacheStream(cache, depResolver, mockFs))
      .pipe(assertStream([
        { path: 'foo.txt', contents: 'abc' }
      ]))
      .on('finish', done)
  })

  it('filters data if there are no update in any processes', done => {
    const cache = new Cache()
    const depResolver = new DepResolver(() => ['bar.txt'])

    cache.deserialize({
      'foo.txt': 'abc',
      'bar.txt': 'edf'
    })

    depResolver.deserialize({
      'foo.txt': ['bar.txt']
    })

    const mockFs = pathName => {
      return {
        'foo.txt': 'abc',
        'bar.txt': 'edf'
      }[pathName]
    }

    // Shold foo.txt be updated?
    // contents      -> not updated
    // deps          -> not updated
    // deps contents -> not updated
    // -> should not be updated
    source([
      { path: 'foo.txt', contents: 'abc' }
    ]).pipe(cacheStream(cache, depResolver, mockFs))
      .pipe(assertStream([]))
      .on('finish', done)
  })

  it('updates the caches of all nested dependencies', done => {
    const cache = new Cache()
    const depResolver = new DepResolver(() => ['bar.txt', 'baz.txt'])

    cache.deserialize({
      'foo.txt': 'abc',
      'bar.txt': 'edf',
      'baz.txt': 'ghi'
    })

    depResolver.deserialize({
      'foo.txt': ['bar.txt', 'baz.txt']
    })

    const mockFs = pathName => {
      return {
        'foo.txt': 'abc',
        'bar.txt': 'updated',
        'baz.txt': 'updated'
      }[pathName]
    }

    source([
      { path: 'foo.txt', contents: 'abc' }
    ]).pipe(cacheStream(cache, depResolver, mockFs))
      .on('finish', () => {
        expect(cache.serialize()).toEqual({
          'foo.txt': 'abc',
          'bar.txt': 'updated',
          'baz.txt': 'updated'
        })
        done()
      })
  })

  // #16
  it('should update all cache and deps for nested dependencies even if root cache does not hit', done => {
    const cache = new Cache()
    const depResolver = new DepResolver(() => ['bar.txt', 'qux.txt'])

    cache.deserialize({
      'foo.txt': '123',
      'bar.txt': '456',
      'baz.txt': '789',
      'qux.txt': 'abc'
    })

    depResolver.deserialize({
      'foo.txt': ['bar.txt', 'baz.txt']
    })

    const mockFs = pathName => {
      return {
        'foo.txt': 'updated',
        'bar.txt': 'updated',
        'baz.txt': 'updated',
        'qux.txt': 'updated'
      }[pathName]
    }

    source([
      { path: 'foo.txt', contents: 'updated' }
    ]).pipe(cacheStream(cache, depResolver, mockFs))
      .on('finish', () => {
        expect(cache.serialize()).toEqual({
          'foo.txt': 'updated',
          'bar.txt': 'updated',
          'baz.txt': '789', // Cannot update out of deps
          'qux.txt': 'updated'
        })

        expect(depResolver.serialize()).toEqual(
          jasmine.objectContaining({
            'foo.txt': ['bar.txt', 'qux.txt']
          })
        )

        done()
      })
  })
})

function assertStream (expected) {
  let count = 0

  return new Writable({
    objectMode: true,
    write (data, encoding, cb) {
      expect(data).toEqual(expected[count])

      count += 1
      cb(null, data)
    }
  }).on('finish', () => {
    expect(count).toBe(expected.length)
  })
}

function source (input) {
  return new Readable({
    objectMode: true,
    read () {
      input.forEach(data => this.push(data))
      this.push(null)
    }
  })
}
