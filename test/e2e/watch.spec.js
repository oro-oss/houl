'use strict'

const fse = require('fs-extra')
const td = require('testdouble')
const watch = require('../../lib/cli/watch').handler
const e2eHelpers = require('../helpers/e2e')
const addSrc = e2eHelpers.addSrc
const updateSrc = e2eHelpers.updateSrc
const removeDist = e2eHelpers.removeDist
const compare = e2eHelpers.compare

describe('Watch CLI', () => {
  const config = 'test/fixtures/e2e/houl.config.json'
  const cache = 'test/fixtures/e2e/.cache.json'

  let revert, watcher

  function run(options, cb) {
    if (watcher) {
      watcher.close()
    }
    const console = {
      log: td.function(),
      error: td.function()
    }
    watcher = watch(options, { cb, console })
  }

  function add() {
    revert = addSrc()
  }

  function update() {
    revert = updateSrc()
  }

  beforeEach(() => {
    removeDist()
    fse.removeSync(cache)
  })

  afterEach(() => {
    if (watcher) {
      watcher.close()
      watcher = null
    }

    if (revert) {
      revert()
      revert = null
    }
  })

  it('should build all input files initially', done => {
    run(
      { config },
      observe([
        () => {
          compare('dev')
          update()
        },
        () => {
          compare('updated')
          done()
        }
      ])
    )
  })

  it('should build a newly added file', done => {
    run(
      { config },
      observe([
        () => {
          compare('dev')
          add()
        },
        () => {
          compare('added')
          done()
        }
      ])
    )
  })

  it('should build only updated files', done => {
    run(
      { config },
      observe([
        () => {
          removeDist()
          update()
        },
        () => {
          compare('cache')
          done()
        }
      ])
    )
  })

  it('should build only updated files even if after restart the command', done => {
    run(
      { config, cache },
      observe([
        () => {
          // Equivalent with exiting watch command
          watcher.close()

          removeDist()
          update()

          // Equivalent with restart watch command
          run(
            { config, cache },
            observe([
              () => {
                compare('cache')
                done()
              }
            ])
          )
        }
      ])
    )
  })
})

function observe(cbs) {
  const throttle = 10
  let timer = null
  let count = -1

  // Delay a watcher callback because a watcher may batch
  // multiple call for multiple file updates
  return () => {
    clearTimeout(timer)

    timer = setTimeout(() => {
      count += 1
      cbs[count]()
    }, throttle)
  }
}
