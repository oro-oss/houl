'use strict'

const td = require('testdouble')
const BuildLogger = require('../../../lib/loggers/build-logger')

describe('Build Logger', () => {
  it('should log that a build is started', () => {
    const console = { log: td.function() }
    const logger = new BuildLogger({
      base: '/path/to/base',
      input: '/path/to/base/src',
      output: '/path/to/base/dist'
    }, {
      console
    })

    logger.start()

    td.verify(console.log('Building src -> dist'))
  })

  it('should log that a build is finished', () => {
    const console = { log: td.function() }
    const now = td.function()

    td.when(now()).thenReturn(0, 12345)

    const logger = new BuildLogger({
      base: '/base',
      input: '/base/to/src',
      output: '/base/to/dist'
    }, {
      console,
      now
    })

    logger.start()
    td.verify(console.log('Building to/src -> to/dist'))

    logger.finish()
    td.verify(console.log('Finished in 12.34s'))
  })

  it('should log errors', () => {
    const console = {
      log: td.function(),
      error: td.function()
    }

    const logger = new BuildLogger({
      base: '/path',
      input: '/path/src',
      output: '/path/dist'
    }, {
      console
    })

    logger.start()
    logger.error(new Error('Test 1'))
    logger.error(new Error('Test 2'))
    logger.finish()

    td.verify(console.error('Test 1'), { times: 1 })
    td.verify(console.error('Test 2'), { times: 1 })
    td.verify(console.log('Finished with 2 error(s)'))
  })
})
