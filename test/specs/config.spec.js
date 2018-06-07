'use strict'

const path = require('path')
const normalize = require('normalize-path')
const loadConfig = require('../../lib/config').loadConfig
const findConfig = require('../../lib/config').findConfig

const read = pathname => {
  return loadConfig(path.join('test/fixtures/configs', pathname))
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

  it('throws if no config file is found', () => {
    expect(() => read('not-exist.json'))
      .toThrowError(/not-exist\.json is not found/)
  })

  it('loads a function style config', () => {
    const config = read('preset-function.config.js')
    expect(config.rules.baz).not.toBe(undefined)
  })

  it('loads a preset', () => {
    const config = read('normal.config.js')
    expect(config.rules.gif).not.toBe(undefined)
  })

  it('loads a preset with the object format property', () => {
    const config = read('normal-with-preset-options.js')
    expect(config.rules.baz.task()).toBe('bazOptions')
  })

  it('modifies a preset object', () => {
    const config = read('normal-with-preset-modify.js')
    expect(config.rules.js).toBe(undefined)
  })

  it('allows an empty taskFile field', () => {
    expect(() => {
      read('no-taskfile.js')
    }).not.toThrow()
  })

  it('search config file', () => {
    function exists (pathname) {
      return '/path/houl.config.js' === normalize(pathname)
    }

    expect(findConfig('/path/to/project', exists)).toBePath('/path/houl.config.js')
  })

  it('also search json config file', () => {
    function exists (pathname) {
      return '/path/houl.config.json' === normalize(pathname)
    }

    expect(findConfig('/path/to/project', exists)).toBePath('/path/houl.config.json')
  })

  it('prefers js config', () => {
    function exists (pathname) {
      return [
        '/path/to/houl.config.json',
        '/path/to/houl.config.js'
      ].indexOf(normalize(pathname)) >= 0
    }

    expect(findConfig('/path/to/', exists)).toBePath('/path/to/houl.config.js')
  })

  it('returns null if not found', () => {
    function exists (pathname) {
      return '/path/to/houl.config.json' === normalize(pathname)
    }

    expect(findConfig('/path/other/project', exists)).toBe(null)
  })
})
