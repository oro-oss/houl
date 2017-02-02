const path = require('path')
const Config = require('../../lib/models/config')
const config = require('../../lib/config')

const read = pathname => {
  return config(path.join('test/fixtures', pathname))
}

// check
const p = pathname => {
  return path.relative(
    path.join(process.cwd(), 'test/fixtures'),
    pathname
  ).replace(/\\/g, '/')
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

  it('resolves input/output paths besed on cwd', () => {
    const c = read('normal.config.js')
    expect(p(c.input)).toBe('src')
    expect(p(c.output)).toBe('dist')
  })

  it('resolves paths in execute options based on cwd', () => {
    const c = read('normal.config.js')
    const e = c.execute[0]
    expect(p(e.input)).toBe('src/img/_assets/*.svg')
    expect(p(e.output)).toBe('dist/img/share')
  })

  it('loads task file', () => {
    const c = read('normal.config.js')
    expect(c.tasks.task1()).toBe('foo')
    expect(c.tasks.task2()).toBe('bar')
  })

  it('normalizes rules options', () => {
    const c = read('normal.config.js')
    expect(typeof c.rules.png).toBe('object')
    expect(c.rules.js.task).toBe('js')
    expect(c.rules.scss.task).toBe('sass')
    expect(c.rules.png.task).toBe('imagemin')
  })

  it('add inputExt/outptExt in each rule object', () => {
    const c = read('normal.config.js')
    expect(c.rules.js.inputExt).toBe('js')
    expect(c.rules.js.outputExt).toBe('js')
    expect(c.rules.scss.inputExt).toBe('scss')
    expect(c.rules.scss.outputExt).toBe('css')
    expect(c.rules.png.inputExt).toBe('png')
    expect(c.rules.png.outputExt).toBe('png')
  })

  it('loads preset as a config object', () => {
    const normal = read('normal.config.js')
    const preset = read('preset.config.js')
    expect(normal.preset).toEqual(preset)
  })
})
