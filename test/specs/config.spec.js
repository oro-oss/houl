const path = require('path')
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
    expect(c.task.task1()).toBe('foo')
    expect(c.task.task2()).toBe('bar')
  })

  it('normalizes rules options', () => {
    const c = read('normal.config.js')
    expect(typeof c.rules.png).toBe('object')
    expect(c.rules.png.task).toBe('imagemin')
  })
})
