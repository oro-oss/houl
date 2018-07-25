'use strict'

const normalize = require('normalize-path')
const Config = require('../../../lib/models/config')

describe('Config model', () => {
  it('resolves input/output paths besed on base path', () => {
    const c = Config.create(
      {
        input: 'path/to/src',
        output: 'to/dist/'
      },
      {},
      {
        base: '/path/to/base'
      }
    )
    expect(c.input).toBePath('/path/to/base/path/to/src')
    expect(c.output).toBePath('/path/to/base/to/dist')
  })

  it('retain exclude field', () => {
    const c = Config.create(
      {
        exclude: '**/_*'
      },
      {}
    )

    expect(c.exclude.length).toBe(1)
    expect(c.exclude[0]).toBePath('**/_*')
  })

  it('creates vinyl input', () => {
    const c = Config.create(
      {
        input: 'src'
      },
      {},
      {
        base: '/path/to'
      }
    )
    expect(c.vinylInput.length).toBe(1)
    expect(c.vinylInput[0]).toBePath('/path/to/src/**/*')
  })

  it('includes `exclude` pattern into vinyl input', () => {
    const c = Config.create(
      {
        input: 'src',
        exclude: '**/_*'
      },
      {},
      {
        base: '/path/to/'
      }
    )
    expect(c.vinylInput.length).toBe(2)
    expect(c.vinylInput[0]).toBePath('/path/to/src/**/*')
    expect(c.vinylInput[1]).toBePath('!**/_*')
  })

  it('filters input pattern', () => {
    const c = new Config({
      input: '/path/to/src',
      filter: '/**/*.scss'
    })

    expect(c.vinylInput.length).toBe(1)
    expect(c.vinylInput[0]).toBePath('/path/to/src/**/*.scss')
  })

  it('includes array formed `exclude` pattern into vinyl input', () => {
    const c = Config.create(
      {
        input: 'src',
        exclude: ['**/_*', '**/.DS_Store']
      },
      {},
      {
        base: '/path/to/'
      }
    )
    const input = c.vinylInput
    expect(input.length).toBe(3)
    expect(input[0]).toBePath('/path/to/src/**/*')
    expect(input[1]).toBePath('!**/_*')
    expect(input[2]).toBePath('!**/.DS_Store')
  })

  it('isExclude always returns false if `exclude` is empty', () => {
    const c = Config.create(
      {
        input: 'src'
      },
      {}
    )

    expect(c.isExclude('/path/to/foo.css')).toBe(false)
    expect(c.isExclude('')).toBe(false)
  })

  it('test whether a path matches exclude pattern', () => {
    const c = Config.create(
      {
        input: '/',
        exclude: '**/_*'
      },
      {}
    )

    expect(c.isExclude('/path/to/file.js')).toBe(false)
    expect(c.isExclude('path/to/_internal.js')).toBe(true)
  })

  it('should not match ancestor path of the input directory for exclude', () => {
    const c = Config.create(
      {
        input: '/path/to/src',
        exclude: '**/to/**'
      },
      {}
    )

    expect(c.isExclude('/path/to/src/foo/bar.js')).toBe(false)
    expect(c.isExclude('/path/to/src/to/foo/bar.js')).toBe(true)
    expect(c.isExclude('path/to/relative.js')).toBe(true)
  })

  it('loads tasks', () => {
    const c = Config.create(
      {
        rules: {
          js: 'foo',
          scss: {
            task: 'bar'
          }
        }
      },
      {
        foo: () => 'foo',
        bar: () => 'bar'
      }
    )
    expect(c.rules.js.task()).toBe('foo')
    expect(c.rules.scss.task()).toBe('bar')
  })

  it('add inputExt/outputExt in each rule object', () => {
    const c = Config.create(
      {
        rules: {
          js: 'foo',
          scss: {
            task: 'bar',
            outputExt: 'css'
          }
        }
      },
      {
        foo: () => 'foo',
        bar: () => 'bar'
      }
    )
    expect(c.rules.js.inputExt).toBe('js')
    expect(c.rules.js.outputExt).toBe('js')
    expect(c.rules.scss.inputExt).toBe('scss')
    expect(c.rules.scss.outputExt).toBe('css')
  })

  it('merges rules of preset', () => {
    const preset = Config.create(
      {
        rules: {
          scss: {
            task: 'baz',
            outputExt: 'css'
          },
          png: 'qux'
        }
      },
      {
        baz: () => 'baz',
        qux: () => 'qux'
      }
    )

    const c = Config.create(
      {
        rules: {
          js: 'foo',
          scss: 'bar'
        }
      },
      {
        foo: () => 'foo',
        bar: () => 'bar'
      },
      {
        preset
      }
    )

    expect(c.rules.js.task()).toBe('foo')
    expect(c.rules.scss.task()).toBe('bar')
    expect(c.rules.scss.outputExt).toBe('scss')
    expect(c.rules.png.task()).toBe('qux')
  })

  it('merges rules fields with task name', () => {
    const preset = Config.create(
      {
        rules: {
          js: 'script'
        }
      },
      {
        script: () => 'preset'
      }
    )

    const c = Config.create(
      {
        rules: {
          js: {
            exclude: '_*'
          }
        }
      },
      {
        script: () => 'child'
      },
      {
        preset
      }
    )

    expect(c.rules.js.task()).toBe('preset')
    expect(c.rules.js.exclude).toEqual(['_*'])
  })

  it('concats excludes field on rules', () => {
    const preset = Config.create(
      {
        rules: {
          js: {
            task: 'script',
            exclude: '_*'
          }
        }
      },
      {
        script: () => 'preset'
      }
    )

    const c = Config.create(
      {
        rules: {
          js: {
            exclude: ['test.js']
          }
        }
      },
      {},
      {
        preset
      }
    )

    expect(c.rules.js.exclude).toEqual(['_*', 'test.js'])
  })

  it('merges progeny options on rules', () => {
    const preset = Config.create(
      {
        rules: {
          js: {
            task: 'script',
            progeny: {
              regexp: /foo/,
              altPaths: ['/path/foo']
            }
          }
        }
      },
      {
        script: () => 'preset'
      }
    )

    const c = Config.create(
      {
        rules: {
          js: {
            progeny: {
              regexp: /bar/,
              altPaths: ['/path/bar'],
              skipComments: true
            }
          }
        }
      },
      {},
      {
        preset
      }
    )

    const resolved = c.rules.js.progeny
    expect(resolved.regexp).toEqual(/bar/)
    expect(resolved.altPaths).toEqual(['/path/foo', '/path/bar'])
    expect(resolved.skipComments).toBe(true)
  })

  it('finds rule by input file path', () => {
    const c = Config.create(
      {
        rules: {
          js: 'foo',
          scss: 'bar'
        }
      },
      {
        foo: () => 'foo',
        bar: () => 'bar'
      }
    )

    let rule = c.findRuleByInput('path/to/test.js')
    expect(rule.task()).toBe('foo')
    rule = c.findRuleByInput('path/to/test.scss')
    expect(rule.task()).toBe('bar')
    rule = c.findRuleByInput('path/to/test.js.html')
    expect(rule).toBe(null)
  })

  it('excludes matched input file path for rule', () => {
    const c = Config.create(
      {
        rules: {
          js: {
            task: 'foo',
            exclude: '**/vendor/**'
          }
        }
      },
      {
        foo: () => 'foo'
      }
    )

    let rule = c.findRuleByInput('path/to/test.js')
    expect(rule.task()).toBe('foo')
    rule = c.findRuleByInput('path/to/vendor/test.js')
    expect(rule).toBe(null)
  })

  it('finds rule by output file path', () => {
    function exists(pathname) {
      return (
        ['path/to/test.js', 'path/to/test.scss'].indexOf(normalize(pathname)) >=
        0
      )
    }

    const c = Config.create(
      {
        input: '',
        output: '',
        rules: {
          js: 'foo',
          scss: {
            task: 'bar',
            outputExt: 'css'
          }
        }
      },
      {
        foo: () => 'foo',
        bar: () => 'bar'
      }
    )

    let rule = c.findRuleByOutput('path/to/test.js', exists)
    expect(rule.task()).toBe('foo')

    rule = c.findRuleByOutput('path/to/test.css', exists)
    expect(rule.task()).toBe('bar')

    // There is no matched rule but file is found -> empty rule
    rule = c.findRuleByOutput('path/to/test.scss', exists)
    expect(rule.isEmpty).toBe(true)

    // File is not found -> null
    rule = c.findRuleByOutput('path/to/not-found.js', exists)
    expect(rule).toBe(null)
  })

  it('excludes matched output file path for rule', () => {
    function exists(pathname) {
      return (
        [
          'path/to/test_1.scss',
          'path/to/vendor/test.css',
          'path/to/vendor/test.scss',
          'path/to/test_2.less'
        ].indexOf(normalize(pathname)) >= 0
      )
    }

    const c = Config.create(
      {
        input: '',
        output: '',
        rules: {
          scss: {
            task: 'foo',
            outputExt: 'css',
            exclude: '**/vendor/**'
          },
          css: 'bar',
          less: {
            task: 'baz',
            outputExt: 'css'
          }
        }
      },
      {
        foo: () => 'foo',
        bar: () => 'bar',
        baz: () => 'baz'
      }
    )

    let rule = c.findRuleByOutput('path/to/test_1.css', exists)
    expect(rule.task()).toBe('foo')

    // Ignored by scss rule
    rule = c.findRuleByOutput('path/to/vendor/test.css', exists)
    expect(rule.task()).toBe('bar')

    // Should not match if possible input file is not found
    rule = c.findRuleByOutput('path/to/test_2.css', exists)
    expect(rule.task()).toBe('baz')
  })

  it('resolves proxy config', () => {
    const proxy = {
      '/foo': 'http://foo.com/',
      '/bar': {
        target: 'https://bar.com/',
        secure: true
      }
    }

    const c = Config.create(
      {
        dev: { proxy }
      },
      {}
    )

    expect(c.proxy).toEqual([
      {
        context: '/foo',
        config: {
          target: 'http://foo.com/'
        }
      },
      {
        context: '/bar',
        config: {
          target: 'https://bar.com/',
          secure: true
        }
      }
    ])
  })

  it('provides an empty array as proxy if dev.proxy is not specified', () => {
    const c = Config.create({}, {})

    expect(c.proxy).toEqual([])
  })

  it('resolves port config', () => {
    const c = Config.create(
      {
        dev: { port: 51234 }
      },
      {}
    )

    expect(c.port).toBe(51234)
  })

  it('provides 3000 as a default port number', () => {
    const c = Config.create({}, {})
    expect(c.port).toBe(3000)
  })

  it('resolves basePath config', () => {
    const c = Config.create(
      {
        dev: { basePath: '/path/to/base' }
      },
      {}
    )

    expect(c.basePath).toBe('/path/to/base')
  })

  it("provides '/' as a default base path", () => {
    const c = Config.create({}, {})
    expect(c.basePath).toBe('/')
  })

  it('extends itself with the provided object', () => {
    const c = Config.create(
      {
        input: 'src',
        output: 'dist'
      },
      {},
      { base: '/' }
    )

    expect(c.input).toBe('/src')
    expect(c.output).toBe('/dist')
    expect(c.filter).toBe('**/*')
    const e = c.extend({ filter: 'test/**/*' })
    expect(e.input).toBe('/src')
    expect(e.output).toBe('/dist')
    expect(e.filter).toBe('test/**/*')
  })

  it('ignores null or undefined value for extend', () => {
    const c = Config.create(
      {
        input: 'src',
        output: 'dist'
      },
      {},
      {
        base: '/'
      }
    ).extend({
      filter: 'test/**/*'
    })

    expect(c.input).toBe('/src')
    expect(c.output).toBe('/dist')
    expect(c.filter).toBe('test/**/*')
    const e1 = c.extend({ filter: null })
    expect(e1.input).toBe('/src')
    expect(e1.output).toBe('/dist')
    expect(e1.filter).toBe('test/**/*')
    const e2 = c.extend({ filter: undefined })
    expect(e2.input).toBe('/src')
    expect(e2.output).toBe('/dist')
    expect(e2.filter).toBe('test/**/*')
  })
})
