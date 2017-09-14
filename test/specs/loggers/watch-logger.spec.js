'use strict'

const td = require('testdouble')
const color = require('../../../lib/color')
const WatchLogger = require('../../../lib/loggers/watch-logger')

describe('Watch Logger', () => {
  it('should log watching source directory', () => {
    const console = { log: td.function() }
    const logger = new WatchLogger({
      base: '/path/to',
      input: '/path/to/input'
    }, {
      console
    })

    logger.startWatching()
    td.verify(console.log('Houl is watching the source directory: input/'))
  })

  it('should log that a source file was added', () => {
    const console = { log: td.function() }
    const logger = new WatchLogger({
      base: '/path/to',
      input: '/path/to/input'
    }, {
      console
    })

    logger.addFile('/path/to/input/index.html')
    td.verify(console.log(color.yellow('ADDED') + ' /input/index.html'))
  })

  it('should log that a source file was updated', () => {
    const console = { log: td.function() }
    const logger = new WatchLogger({
      base: '/path/to',
      input: '/path/to/input'
    }, {
      console
    })

    logger.updateFile('/path/to/input/index.html')
    td.verify(console.log(color.yellow('UPDATED') + ' /input/index.html'))
  })

  it('should log the dest path of the build', () => {
    const console = { log: td.function() }
    const logger = new WatchLogger({
      base: '/path/to',
      output: '/path/to/output'
    }, {
      console
    })

    logger.writeFile('/path/to/output/index.html')
    td.verify(console.log(color.cyan('WROTE') + ' /output/index.html'))
  })
})
