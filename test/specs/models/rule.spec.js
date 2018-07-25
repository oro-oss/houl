'use strict'

const Rule = require('../../../lib/models/rule')

describe('Rule model', () => {
  it('has correct properties', () => {
    const r = Rule.create(
      {
        task: 'foo',
        outputExt: 'css',
        exclude: '**/vendor/**',
        progeny: {
          rootPath: 'path/to/root'
        }
      },
      'scss',
      {
        foo: () => 'foo',
        bar: () => 'bar'
      }
    )

    expect(r.taskName).toBe('foo')
    expect(r.task()).toBe('foo')
    expect(r.inputExt).toBe('scss')
    expect(r.outputExt).toBe('css')
    expect(r.exclude).toEqual(['**/vendor/**'])
    expect(r.progeny).toEqual({
      extension: 'scss',
      rootPath: 'path/to/root'
    })
  })

  it('accepts array formed exclude', () => {
    const r = Rule.create(
      {
        task: 'foo',
        exclude: ['**/vendor/**', '**/.DS_Store']
      },
      'js',
      {
        foo: () => 'foo'
      }
    )

    expect(r.exclude).toEqual(['**/vendor/**', '**/.DS_Store'])
  })

  it('deals with string format', () => {
    const r = Rule.create('foo', 'js', {
      foo: () => 'foo'
    })
    expect(r.taskName).toBe('foo')
    expect(r.task()).toBe('foo')
  })

  it('asserts task is appear', () => {
    expect(() => {
      Rule.create(
        {
          task: 'foo'
        },
        'js',
        {
          bar: () => 'bar'
        }
      )
    }).toThrowError('Task "foo" is not defined')
  })

  it('provides options to the task', () => {
    const r = Rule.create(
      {
        task: 'foo',
        options: {
          test: 'success'
        }
      },
      'js',
      {
        foo: (_, options) => options.test
      }
    )
    expect(r.task()).toBe('success')
  })

  it('converts output path to input path', () => {
    const r = Rule.create(
      {
        task: 'foo',
        outputExt: 'css'
      },
      'scss',
      {
        foo: () => 'foo'
      }
    )

    expect(r.getInputPath('path/to/test.css')).toBe('path/to/test.scss')
  })

  it('converts input path to output path', () => {
    const r = Rule.create(
      {
        task: 'foo',
        outputExt: 'css'
      },
      'scss',
      {
        foo: () => 'foo'
      }
    )

    expect(r.getOutputPath('path/to/test.scss')).toBe('path/to/test.css')
  })

  it('checks whether the given path is excluded or not', () => {
    const r = Rule.create(
      {
        task: 'foo',
        exclude: ['**/vendor/**', '**/_*']
      },
      'js',
      {
        foo: () => 'foo'
      }
    )

    expect(r.isExclude('src/js/vendor/index.js')).toBe(true)
    expect(r.isExclude('src/js/_hidden.js')).toBe(true)
    expect(r.isExclude('src/js/index.js')).toBe(false)
  })

  it('throws a task not found', () => {
    expect(() => {
      Rule.create(
        {
          task: 'foo'
        },
        'js',
        {
          bar: () => 'bar'
        }
      )
    }).toThrowError(/Task "foo" is not defined/)
  })

  it('throws a task in merged rule not found', () => {
    const parent = Rule.create(
      {
        task: 'foo'
      },
      'js',
      {
        foo: () => 'foo'
      }
    )

    expect(() => {
      Rule.create(
        {
          task: 'foo'
        },
        'js',
        {
          bar: () => 'bar'
        },
        parent
      )
    }).toThrowError(/Task "foo" is not defined/)
  })

  describe('Empty rule', () => {
    const empty = Rule.empty

    it('has its flag', () => {
      expect(empty.isEmpty).toBe(true)
    })

    it('passes output on getInputPath', () => {
      expect(empty.getInputPath('/path/to/test.js')).toBe('/path/to/test.js')
    })

    it('passes input on getOutputPath', () => {
      expect(empty.getOutputPath('/path/to/test.js')).toBe('/path/to/test.js')
    })

    it('always treats that the input path is not excluded', () => {
      expect(empty.isExclude('/path/to/something')).toBe(false)
    })

    it('has the task that does nothing', () => {
      expect(empty.task('foobar')).toBe('foobar')
    })
  })
})
