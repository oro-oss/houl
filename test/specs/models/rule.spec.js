'use strict'

const Rule = require('../../../lib/models/rule')

describe('Rule model', () => {
  it('has correct properties', () => {
    const r = new Rule({
      task: 'foo',
      outputExt: 'css',
      exclude: '**/vendor/**',
      progeny: {
        rootPath: 'path/to/root'
      }
    }, 'scss', {
      foo: () => 'foo',
      bar: () => 'bar'
    })

    expect(r.taskName).toBe('foo')
    expect(r.task()).toBe('foo')
    expect(r.inputExt).toBe('scss')
    expect(r.outputExt).toBe('css')
    expect(r.exclude).toBe('**/vendor/**')
    expect(r.progeny).toEqual({
      extension: 'scss',
      rootPath: 'path/to/root'
    })
  })

  it('deals with string format', () => {
    const r = new Rule('foo', 'js', {
      foo: () => 'foo'
    })
    expect(r.taskName).toBe('foo')
    expect(r.task()).toBe('foo')
  })

  it('asserts task is appear', () => {
    expect(() => {
      new Rule({
        task: 'foo'
      }, 'js', {
        bar: () => 'bar'
      })
    }).toThrowError('Task "foo" is not defined')
  })

  it('converts output path to input path', () => {
    const r = new Rule({
      task: 'foo',
      outputExt: 'css'
    }, 'scss', {
      foo: () => 'foo'
    })

    expect(r.getInputPath('path/to/test.css')).toBe('path/to/test.scss')
  })

  it('converts input path to output path', () => {
    const r = new Rule({
      task: 'foo',
      outputExt: 'css'
    }, 'scss', {
      foo: () => 'foo'
    })

    expect(r.getOutputPath('path/to/test.scss')).toBe('path/to/test.css')
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

    it('has the task that does nothing', () => {
      expect(empty.task('foobar')).toBe('foobar')
    })
  })
})
