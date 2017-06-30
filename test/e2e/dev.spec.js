'use strict'

const http = require('http')
const fse = require('fs-extra')
const path = require('path')
const dev = require('../../lib/cli/dev').handler
const waitForData = require('../helpers').waitForData

function get (pathName, port, cb) {
  http.get('http://localhost:' + port + pathName, waitForData(cb))
}

function assertData (data, file, type) {
  type = type || 'dev'
  expect(data).toBe(
    fse.readFileSync(path.resolve(__dirname, '../expected', type, file), 'utf8')
  )
}

describe('Dev CLI', () => {
  const config = 'test/fixtures/e2e/houl.config.json'

  let bs
  function run (options, cb) {
    bs = dev({
      config: options.config,
      port: options.port || 3000,
      'base-path': options['base-path'] || '/',
      _debug: true
    })

    bs.emitter.on('init', () => cb(bs))

    return bs
  }

  let revert
  function update (file, cb) {
    const original = path.resolve(__dirname, '../fixtures/e2e/src', file)
    const updated = path.resolve(__dirname, '../fixtures/e2e/updated-src', file)

    function handleError (fn) {
      return (err, res) => {
        if (err) throw err
        fn(res)
      }
    }

    fse.readFile(original, 'utf8', handleError(temp => {
      fse.copy(updated, original, handleError(() => {
        revert = () => {
          fse.writeFileSync(original, temp)
        }
        cb()
      }))
    }))
  }

  afterEach(() => {
    if (bs) bs.exit()
    if (revert) revert()

    bs = null
    revert = null
  })

  it('starts a static file server', done => {
    run({ config }, () => {
      get('/index.html', 3000, (res, data) => {
        expect(res.statusCode).toBe(200)
        assertData(data, 'index.html')
        done()
      })
    })
  })

  it('compiles files based on corresponding tasks', done => {
    run({ config }, () => {
      get('/css/index.css', 3000, (res, data) => {
        expect(res.statusCode).toBe(200)
        assertData(data, 'css/index.css')
        done()
      })
    })
  })

  it('detect file changes considering its dependencies', done => {
    run({ config }, () => {
      get('/css/index.css', 3000, (res, data) => {
        assertData(data, 'css/index.css')

        update('css/_variables.scss', () => {
          get('/css/index.css', 3000, (res, data) => {
            assertData(data, 'css/index.css', 'cache')
            done()
          })
        })
      })
    })
  })

  it('can be specified port number of dev server', done => {
    run({ config, port: 51234 }, () => {
      get('/js/index.js', 51234, (res, data) => {
        expect(res.statusCode).toBe(200)
        assertData(data, 'js/index.js')
        done()
      })
    })
  })

  it('can be set base path of dev server', done => {
    const options = { config }
    options['base-path'] = 'path/to/base'
    run(options, () => {
      get('/path/to/base/js/index.js', 3000, (res, data) => {
        expect(res.statusCode).toBe(200)
        assertData(data, 'js/index.js')
        done()
      })
    })
  })
})
