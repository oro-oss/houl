const path = require('path')
const config = require('../../lib/config')

const p = pathname => {
  return path.relative(process.cwd(), pathname).replace(/\\/g, '/')
}

describe('Config', () => {
  it('loads js file', () => {
    config('test/fixtures/normal.config.js')
  })

  it('loads json file', () => {
    config('test/fixtures/test.config.json')
  })

  it('throws if try loading other file', () => {
    expect(() => config('test/fixtures/test.coffee'))
      .toThrowError(/test\.coffee is non-supported file format/)
  })

  it('resolves input/output paths besed on cwd', () => {
    const c = config('test/fixtures/normal.config.js')
    expect(p(c.input)).toBe('test/fixtures/src')
    expect(p(c.output)).toBe('test/fixtures/dist')
  })

  it('resolves paths in execute options based on cwd', () => {
    const c = config('test/fixtures/normal.config.js')
    const e = c.execute[0]
    expect(p(e.input)).toBe('test/fixtures/src/img/_assets/*.svg')
    expect(p(e.output)).toBe('test/fixtures/dist/img/share')
  })

  it('loads task file', () => {
    const c = config('test/fixtures/normal.config.js')
    expect(c.task.task1()).toBe('foo')
    expect(c.task.task2()).toBe('bar')
  })

  it('normalizes rules options', () => {
    const c = config('test/fixtures/normal.config.js')
    expect(typeof c.rules.png).toBe('object')
    expect(c.rules.png.task).toBe('imagemin')
  })
})
