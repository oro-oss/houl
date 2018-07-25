'use strict'

const td = require('testdouble')
const color = require('../../../lib/color')
const DevLogger = require('../../../lib/loggers/dev-logger')
const externalIp = require('../../../lib/util').getIp()

describe('Dev Logger', () => {
  it('should log that dev server starts', () => {
    const console = { log: td.function() }
    const logger = new DevLogger(
      {},
      {
        console
      }
    )

    logger.startDevServer(8080, externalIp)
    td.verify(
      console.log(
        'Houl dev server is running at:\nLocal: http://localhost:8080'
      )
    )
    externalIp.forEach(ip => {
      td.verify(console.log(`External: http://${ip}:8080`))
    })
  })

  it('should log that a source file is added', () => {
    const console = { log: td.function() }
    const logger = new DevLogger(
      {
        input: '/path/to/input'
      },
      {
        console
      }
    )

    logger.addFile('/path/to/input/js/index.js')

    td.verify(console.log(color.yellow('ADDED') + ' /js/index.js'))
  })

  it('should log that a source file is updated', () => {
    const console = { log: td.function() }
    const logger = new DevLogger(
      {
        input: '/path/to/input'
      },
      {
        console
      }
    )

    logger.updateFile('/path/to/input/js/index.js')

    td.verify(console.log(color.yellow('UPDATED') + ' /js/index.js'))
  })

  it('should log that there is a GET request', () => {
    const console = { log: td.function() }
    const logger = new DevLogger(
      {},
      {
        console
      }
    )

    logger.getFile('/js/index.js')

    td.verify(console.log(color.green('GET') + ' /js/index.js'))
  })
})
