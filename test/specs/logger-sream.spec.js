'use strict'

const td = require('testdouble')

const Config = require('../../lib/models/config')
const loggerStream = require('../../lib/logger-stream')

const helpers = require('../helpers')
const source = helpers.source
const vinyl = helpers.vinyl
const assertStream = helpers.assertStream

describe('Logger Stream', () => {
  let mockLogger

  beforeEach(() => {
    mockLogger = {
      start: td.function(),
      __dummy__: 'dummy'
    }
  })

  it('injects _logger object', done => {
    const config = new Config({}, {}, {
      base: '/path/to'
    })

    source([
      vinyl({ path: '/path/to/src/foo.js' })
    ]).pipe(loggerStream(mockLogger, config))
      .pipe(assertStream([
        vinyl({
          path: '/path/to/src/foo.js',
          _logger: {
            input: '/src/foo.js',
            instance: mockLogger
          }
        })
      ]))
      .on('finish', done)
  })

  it('should log that the process is starting', done => {
    const config = new Config({}, {}, {
      base: '/path/to/'
    })

    source([
      vinyl({ path: '/path/to/src/foo.js' })
    ]).pipe(loggerStream(mockLogger, config))
      .on('finish', () => {
        td.verify(mockLogger.start('/src/foo.js'))
        done()
      })
  })
})
