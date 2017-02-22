const Config = require('../../../lib/models/config')

describe('Config model', () => {
  it('resolves input/output paths besed on base path', () => {
    const c = new Config({
      input: 'path/to/src',
      output: 'to/dist/'
    }, {}, {
      base: '/path/to/base'
    })
    expect(c.input).toBe('/path/to/base/path/to/src')
    expect(c.output).toBe('/path/to/base/to/dist')
  })

  it('resolves paths in execute options based on cwd', () => {
    const c = new Config({
      execute: [
        {
          input: 'src/img/_assets/*.svg',
          output: 'dist/img/share'
        }
      ]
    }, {}, {
      base: '/path/to/'
    })
    const e = c.execute[0]
    expect(e.input).toBe('/path/to/src/img/_assets/*.svg')
    expect(e.output).toBe('/path/to/dist/img/share')
  })

  it('loads tasks', () => {
    const c = new Config({
      rules: {
        js: 'foo',
        scss: {
          task: 'bar'
        }
      }
    }, {
      foo: () => 'foo',
      bar: () => 'bar'
    })
    expect(c.rules.js.task()).toBe('foo')
    expect(c.rules.scss.task()).toBe('bar')
  })

  it('add inputExt/outputExt in each rule object', () => {
    const c = new Config({
      rules: {
        js: 'foo',
        scss: {
          task: 'bar',
          outputExt: 'css'
        }
      }
    }, {
      foo: () => 'foo',
      bar: () => 'bar'
    })
    expect(c.rules.js.inputExt).toBe('js')
    expect(c.rules.js.outputExt).toBe('js')
    expect(c.rules.scss.inputExt).toBe('scss')
    expect(c.rules.scss.outputExt).toBe('css')
  })

  it('merges rules of preset', () => {
    const preset = new Config({
      rules: {
        scss: {
          task: 'baz',
          outputExt: 'css'
        },
        png: 'qux'
      }
    }, {
      baz: () => 'baz',
      qux: () => 'qux'
    })

    const c = new Config({
      rules: {
        js: 'foo',
        scss: 'bar'
      }
    }, {
      foo: () => 'foo',
      bar: () => 'bar'
    }, {
      preset
    })

    expect(c.rules.js.task()).toBe('foo')
    expect(c.rules.scss.task()).toBe('bar')
    expect(c.rules.scss.outputExt).toBe('scss')
    expect(c.rules.png.task()).toBe('qux')
  })
})
