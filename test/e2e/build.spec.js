'use strict'

const fse = require('fs-extra')
const build = require('../../lib/cli/build').handler
const e2eHelpers = require('../helpers/e2e')
const updateSrc = e2eHelpers.updateSrc
const removeDist = e2eHelpers.removeDist
const compare = e2eHelpers.compare

describe('Build CLI', () => {
  const config = 'test/fixtures/e2e/houl.config.json'
  const cache = 'test/fixtures/e2e/.cache.json'

  let revert

  beforeEach(() => {
    removeDist()
    fse.removeSync(cache)

    process.env.NODE_ENV = null
  })

  afterEach(() => {
    if (revert) {
      revert()
      revert = null
    }
  })

  it('should build in develop mode', done => {
    build({ config }).on('finish', () => {
      compare('dev')
      done()
    })
  })

  it('should build in production mode', done => {
    build({
      config,
      production: true
    }).on('finish', () => {
      compare('prod')
      done()
    })
  })

  it('should not build cached files', done => {
    build({ config, cache }).on('finish', () => {
      removeDist()
      revert = updateSrc()
      build({ config, cache }).on('finish', () => {
        compare('cache')
        done()
      })
    })
  })

  it('can output dot files', done => {
    build({ config, dot: true }).on('finish', () => {
      compare('dot')
      done()
    })
  })

  it('can filter input files', done => {
    build({ config, filter: '**/*.scss' }).on('finish', () => {
      compare('filtered')
      done()
    })
  })
})
