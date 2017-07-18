'use strict'

const fse = require('fs-extra')
const watch = require('../../lib/cli/watch').handler
const e2eHelpers = require('../helpers/e2e')
const updateSrc = e2eHelpers.updateSrc
const removeDist = e2eHelpers.removeDist
const compare = e2eHelpers.compare

describe('Build CLI', () => {
  const config = 'test/fixtures/e2e/houl.config.json'
  const cache = 'test/fixtures/e2e/.cache.json'

  let revert, watcher

  function run (options, cbs) {
    watcher = watch(options, cbs)
  }

  function update () {
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
    run({ config }, observe([
      () => {
        compare('dev')
        update()
      },
      () => {
        compare('updated')
        done()
      }
    ]))
  })

  it('should build only updated files', done => {
    run({ config }, observe([
      () => {
        removeDist()
        update()
      },
      () => {
        compare('cache')
        done()
      }
    ]))
  })
})

function observe (cbs) {
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
