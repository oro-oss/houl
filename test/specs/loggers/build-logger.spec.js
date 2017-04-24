'use strict'

const Writable = require('stream').Writable
const BuildLogger = require('../../../lib/loggers/build-logger')

function createMockNow (interval, base) {
  let count = base || 0
  return () => {
    count += interval
    return count
  }
}

function expectBuffer (buffer, expected) {
  expect(buffer).toBe('START\n' + expected.concat(['']).join('\n'))
}

describe('Build Logger', () => {
  let mockStream, buffer

  beforeEach(() => {
    buffer = 'START\n'
    mockStream = new Writable({
      write (chunk, encoding, done) {
        const str = chunk.toString()
        buffer += str
        done()
      }
    })
  })

  it('should write starting message', () => {
    const logger = new BuildLogger({
      output: mockStream,
      now () {
        return new Date(2017, 3, 24, 13, 31, 9).getTime()
      }
    })

    logger.startAll()

    expectBuffer(buffer, [
      'Start building at 13:31:09'
    ])
  })

  it('should write finish message', () => {
    const logger = new BuildLogger({
      output: mockStream,
      now: createMockNow(10000, new Date(2017, 3, 24, 14, 30, 46).getTime())
    })

    logger.startAll()
    logger.finishAll()

    expectBuffer(buffer, [
      'Start building at 14:30:56',
      'Finish building at 14:31:06 10s'
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
      'Finished\tbar.scss -> bar.css 200ms'
    ])
  })

  it('should write multi-built files', () => {
    const logger = new BuildLogger({
      output: mockStream,
      now: createMockNow(1000)
    })

    logger.start('foo.js')
    logger.finish('foo.js', 'foo.js')
    logger.finish('foo.js', 'foo.es6')

    expectBuffer(buffer, [
      'Finished\tfoo.js -> foo.js 1s',
      'Finished\tfoo.js -> foo.es6 2s'
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
      'Cache exists\tfoo.js'
    ])
  })
})
