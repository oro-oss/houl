const Rule = require('../../../lib/models/rule')

describe('Rule model', () => {
  it('has correct properties', () => {
    const r = new Rule({
      task: 'foo',
      outputExt: 'css',
      exclude: '**/vendor/**'
    }, 'scss', {
      foo: () => 'foo',
      bar: () => 'bar'
    })

    expect(r.taskName).toBe('foo')
    expect(r.task()).toBe('foo')
    expect(r.inputExt).toBe('scss')
    expect(r.outputExt).toBe('css')
    expect(r.exclude).toBe('**/vendor/**')
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
})
