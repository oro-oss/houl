'use strict'

const DepResolver = require('../../lib/dep-resolver').DepResolver

describe('DepResolver', () => {
  it('registers dependent files', () => {
    const r = new DepResolver(() => ['/path/to/dep.js'])

    // origin.js -depends-> dep.js
    r.register('/path/to/origin.js', '')
    expect(r.resolve('/path/to/dep.js')).toEqual([
      '/path/to/origin.js'
    ])

    // origin.js  -depends--> dep.js
    // another.js -depends-^
    r.register('/path/to/another.js', '')
    expect(r.resolve('/path/to/dep.js')).toEqual([
      '/path/to/origin.js',
      '/path/to/another.js'
    ])
  })

  it('should not have redundant file paths', () => {
    const r = new DepResolver(() => ['/path/to/dep.js'])

    r.register('/path/to/origin.js', '')
    r.register('/path/to/origin.js', '')

    expect(r.resolve('/path/to/dep.js')).toEqual([
      '/path/to/origin.js'
    ])
  })

  it('resolves nested dependencies', () => {
    const r = new DepResolver((_, content) => [content])

    // a --> b -> d
    // c -^
    r.register('/a.js', '/b.js')
    r.register('/c.js', '/b.js')
    r.register('/b.js', '/d.js')

    expect(r.resolve('/d.js')).toEqual([
      '/b.js',
      '/a.js',
      '/c.js'
    ])
  })

  it('handles circlar dependencies', () => {
    const r = new DepResolver((_, content) => [content])

    // a -> b -> c -> a -> ...
    r.register('/a.js', '/b.js')
    r.register('/b.js', '/c.js')
    r.register('/c.js', '/a.js')

    expect(r.resolve('/a.js')).toEqual([
      '/c.js',
      '/b.js'
    ])
  })

  it('overwrites the dependencies of the file having the same name', () => {
    const r = new DepResolver((_, content) => [content])

    // foo --> test
    // bar -^
    r.register('/foo.js', '/test.js')
    r.register('/bar.js', '/test.js')
    expect(r.resolve('/test.js')).toEqual([
      '/foo.js',
      '/bar.js'
    ])

    r.register('/foo.js', '/test2.js')
    expect(r.resolve('/test.js')).toEqual([
      '/bar.js'
    ])
    expect(r.resolve('/test2.js')).toEqual([
      '/foo.js'
    ])
  })

  it('returns empty array if target is not registered', () => {
    const r = new DepResolver(() => ['noop'])
    expect(r.resolve('/test.js')).toEqual([])
  })
})
