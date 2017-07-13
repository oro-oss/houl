'use strict'

const Cache = require('../../lib/cache')
const DepResolver = require('../../lib/dep-resolver')
const cacheStream = require('../../lib/cache-stream')

const helpers = require('../helpers')
const assertStream = helpers.assertStream
const source = helpers.source

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


  it('should not affect latter items even if previous item updates nested deps', done => {
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

  // #26
  it('should not pass undefined value to file request callback of dep resolver', done => {
    // Naive dep resolver from JavaScript content
    const extractDeps = content => {
      const re = /import "(.+?)"/g
      const res = []
      let m
      while (m = re.exec(content)) { // eslint-disable-line
        res.push(m[1])
      }
      return res
    }

    // Fake JavaScript files
    const stubFs = {
      'root.js': 'import "second.js"',
      'second.js': 'import "foo.js"\nimport "bar.js"',
      'foo.js': 'alert("foo")',
      'bar.js': 'alert("bar")'
    }

    const cache = new Cache()
    const depResolver = new DepResolver((_, content) => {
      // Progeny will throw an error if `content` is undefined
      expect(content).not.toBeUndefined()
      return extractDeps(content)
    })

    const test = () => {
      return source([
        { path: 'root.js', contents: stubFs['root.js'] }
      ]).pipe(cacheStream(cache, depResolver, fileName => stubFs[fileName]))
    }

    // Save base cache at first
    test().on('finish', () => {
      // Update the source files
      delete stubFs['bar.js']
      stubFs['second.js'] = 'import "foo.js"'

      test().on('finish', done)
    })
  })
})
