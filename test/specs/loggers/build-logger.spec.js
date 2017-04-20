'use strict'

const Writable = require('stream').Writable
const BuildLogger = require('../../../lib/loggers/build-logger')

function createMockNow (interval) {
  let count = 0
  return () => {
    count += interval
    return count
  }
}

function expectBuffer (buffer, expected) {
  expect(buffer).toBe('START\n' + expected.join('\n') + '\n')
}

describe('Build Logger', () => {
  let mockStream, buffer

  beforeEach(() => {
    buffer = 'START\n'
    mockStream = new Writable({
      write (chunk, encoding, done) {
        const str = chunk.toString()

        if (str === '\u001b[1G' || str === '\u001b[1A') {
          return done()
        }

        if (str === '\u001b[2K') {
          buffer = buffer.replace(/(\n|^).*$/, '')
        } else {
          buffer += str
        }

        done()
      }
    })
  })

  it('should write processing files', () => {
    const logger = new BuildLogger({ output: mockStream })

    logger.start('foo.js')
    logger.start('bar.js')
    logger.start('baz.js')

    expectBuffer(buffer, [
      'Building\tfoo.js...',
      'Building\tbar.js...',
      'Building\tbaz.js...'
    ])
  })

  it('should write built files', () => {
    const logger = new BuildLogger({
      output: mockStream,
      now: createMockNow(100)
    })

    logger.start('foo.js')
    logger.start('bar.scss')
    logger.start('baz.pug')
    logger.finish('bar.scss', 'bar.css')

    expectBuffer(buffer, [
      'Building\tfoo.js...',
      'Finished\tbar.scss -> bar.css 0.2s',
      'Building\tbaz.pug...'
    ])
  })

  it('should write cache existing files', () => {
    const logger = new BuildLogger({
      output: mockStream
    })

    logger.start('foo.js')
    logger.start('bar.scss')
    logger.cache('foo.js')

    expectBuffer(buffer, [
      'Cache exists\tfoo.js',
      'Building\tbar.scss...'
    ])
  })

  it('should apply buffers and remove them from head', () => {
    const logger = new BuildLogger({
      output: mockStream,
      now: createMockNow(500)
    })

    logger.start('a.pug')
    logger.start('b.pug')
    logger.start('c.pug')
    logger.start('d.pug')

    expect(logger.buffer.length).toBe(4)

    logger.finish('a.pug', 'a.html')
    logger.cache('b.pug')
    logger.finish('d.pug', 'd.html')

    expect(logger.buffer.length).toBe(2)
    expectBuffer(buffer, [
      'Finished\ta.pug -> a.html 2s',
      'Cache exists\tb.pug',
      'Building\tc.pug...',
      'Finished\td.pug -> d.html 1s'
    ])
  })
})
