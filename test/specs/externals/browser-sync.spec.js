'use strict'

const path = require('path')
const fs = require('fs')
const http = require('http')
const td = require('testdouble')
const { transform, waitForData } = require('../../helpers')
const Config = require('../../../lib/models/config')
const Cache = require('../../../lib/cache')
const DepResolver = require('../../../lib/dep-resolver')
const DepCache = require('../../../lib/dep-cache')
const create = require('../../../lib/externals/browser-sync')

const base = path.resolve(__dirname, '../../fixtures')

function reqTo(pathname) {
  return 'http://localhost:51234' + pathname
}

function expectDataToBeFile(data, filename) {
  expect(data).toBe(fs.readFileSync(path.join(base, filename), 'utf8'))
}

function updateFile(filename, data) {
  const filePath = path.join(base, filename)
  const original = fs.readFileSync(filePath)
  fs.writeFileSync(filePath, data)

  return () => {
    fs.writeFileSync(filePath, original)
  }
}

function createWaitCallback(n, done) {
  let count = 0
  return () => {
    count++
    if (count === n) {
      done()
    }
  }
}

describe('Using browsersync', () => {
  const config = Config.create(
    {
      input: '',
      output: 'dist',
      rules: {
        js: 'js'
      },
      dev: {
        port: 51234
      }
    },
    {
      js: stream => {
        return stream.pipe(
          transform((file, encoding, callback) => {
            const source = file.contents.toString()
            file.contents = Buffer.from('**transformed**\n' + source)
            callback(null, file)
          })
        )
      }
    },
    { base }
  )

  let cache, depResolver
  const createDepCache = () => {
    cache = new Cache()
    depResolver = DepResolver.create(config)
    depResolver.register = td.function(depResolver.register.bind(depResolver))
    return new DepCache(cache, depResolver, () => '')
  }

  let bs
  describe('without base path', () => {
    beforeAll(done => {
      bs = create(
        config,
        {
          open: false,
          logLevel: 'silent'
        },
        createDepCache()
      )

      bs.emitter.on('init', done)
    })

    afterAll(() => {
      bs.exit()
    })

    it('starts dev server by the given port', done => {
      http.get(
        reqTo('/sources/'),
        waitForData((res, data) => {
          expect(res.statusCode).toBe(200)
          expectDataToBeFile(data, 'sources/index.html')
          done()
        })
      )
    })

    it('executes corresponding task to transform sources', done => {
      http.get(
        reqTo('/sources/index.js'),
        waitForData((res, data) => {
          expect(data).toMatch(/^\*\*transformed\*\*\n/)
          done()
        })
      )
    })

    it('redirects if the specified path does not have trailing slash and it points to a directory', done => {
      http.get(reqTo('/sources'), res => {
        expect(res.statusCode).toBe(301)
        expect(res.headers.location).toBe('/sources/')
        done()
      })
    })

    it('registers requested files to dep resolver', done => {
      http.get(reqTo('/sources/index.scss'), () => {
        const absPath = path.resolve(base, 'sources/index.scss')
        const content = fs.readFileSync(absPath, 'utf8')
        td.verify(depResolver.register(absPath, content))
        done()
      })
    })
  })

  describe('with base path', () => {
    beforeAll(done => {
      bs = create(
        config.extend({
          basePath: '/path/to/base/'
        }),
        {
          open: false,
          logLevel: 'silent'
        },
        createDepCache()
      )

      bs.emitter.on('init', done)
    })

    afterAll(() => {
      bs.exit()
    })

    it('allows to set base path of assets', done => {
      http.get(
        reqTo('/path/to/base/sources/index.html'),
        waitForData((res, data) => {
          expect(res.statusCode).toBe(200)
          expectDataToBeFile(data, 'sources/index.html')
          done()
        })
      )
    })

    it('returns not found message if the req does not follow the base path', done => {
      http.get(reqTo('/sources/index.html'), res => {
        expect(res.statusCode).toBe(404)
        done()
      })
    })

    it('redirects if it requests to the root of base path', done => {
      http.get(reqTo('/path/to/base'), res => {
        expect(res.statusCode).toBe(301)
        expect(res.headers.location).toBe('/path/to/base/')
        done()
      })
    })
  })

  describe('with proxy', () => {
    let proxy
    beforeAll(done => {
      const proxyConfig = Config.create(
        {
          input: 'sources',
          output: 'dist',
          dev: {
            proxy: {
              '/': {
                target: 'http://localhost:61234/',
                logLevel: 'silent'
              }
            },
            port: 51234
          }
        },
        {},
        { base }
      )

      proxy = create(
        proxyConfig,
        {
          open: false,
          logLevel: 'silent'
        },
        createDepCache()
      )

      bs = create(
        config.extend({
          port: 61234
        }),
        {
          open: false,
          logLevel: 'silent'
        },
        createDepCache()
      )

      const cb = createWaitCallback(2, done)
      proxy.emitter.on('init', cb)
      bs.emitter.on('init', cb)
    })

    afterAll(() => {
      proxy.exit()
      bs.exit()
    })

    it('proxies requests besed on proxy option', done => {
      http.get(
        reqTo('/sources/index.html'),
        waitForData((res, data) => {
          expect(res.statusCode).toBe(200)
          expectDataToBeFile(data, 'sources/index.html')
          done()
        })
      )
    })

    it('prioritize self-resolved contents than proxy', done => {
      http.get(
        reqTo('/sources/index.js'),
        waitForData((res, data) => {
          expect(res.statusCode).toBe(200)
          expectDataToBeFile(data, 'sources/sources/index.js')
          done()
        })
      )
    })
  })

  describe('with base path and proxy', () => {
    let proxy
    beforeAll(done => {
      const proxyConfig = Config.create(
        {
          input: 'sources',
          output: 'dist',
          dev: {
            proxy: {
              '/': {
                target: 'http://localhost:61234/',
                logLevel: 'silent'
              }
            },
            port: 51234,
            basePath: '/assets'
          }
        },
        {},
        { base }
      )

      proxy = create(
        proxyConfig,
        {
          open: false,
          logLevel: 'silent'
        },
        createDepCache()
      )

      bs = create(
        config.extend({
          port: 61234
        }),
        {
          open: false,
          logLevel: 'silent'
        },
        createDepCache()
      )

      const cb = createWaitCallback(2, done)
      proxy.emitter.on('init', cb)
      bs.emitter.on('init', cb)
    })

    afterAll(() => {
      proxy.exit()
      bs.exit()
    })

    it('fallbacks to proxy if the request does not match base path', done => {
      http.get(
        reqTo('/sources/index.html'),
        waitForData((res, data) => {
          expect(res.statusCode).toBe(200)
          expectDataToBeFile(data, 'sources/index.html')
          done()
        })
      )
    })
  })

  describe('cache', () => {
    let callCount, revertUpdate
    beforeEach(done => {
      callCount = 0

      const cacheConfig = Config.create(
        {
          input: '',
          output: 'dist',
          rules: {
            js: 'js'
          },
          dev: {
            port: 51234
          }
        },
        {
          js: stream => {
            return stream.pipe(
              transform((file, encoding, callback) => {
                callCount += 1
                const source = file.contents.toString()
                file.contents = Buffer.from('**transformed**\n' + source)
                callback(null, file)
              })
            )
          }
        },
        { base }
      )

      bs = create(
        cacheConfig,
        {
          open: false,
          logLevel: 'silent'
        },
        createDepCache()
      )

      bs.emitter.on('init', done)
    })

    afterEach(() => {
      if (revertUpdate) {
        revertUpdate()
        revertUpdate = null
      }

      bs.exit()
    })

    it('caches response data and not transform multiple times', done => {
      http.get(
        reqTo('/sources/index.js'),
        waitForData(() => {
          expect(callCount).toBe(1)

          http.get(
            reqTo('/sources/index.js'),
            waitForData(() => {
              expect(callCount).toBe(1)
              done()
            })
          )
        })
      )
    })

    it('updates the cache when the requested file was updated', done => {
      http.get(
        reqTo('/sources/index.js'),
        waitForData(() => {
          expect(callCount).toBe(1)
          revertUpdate = updateFile('sources/index.js', 'alert("Hello")')

          http.get(
            reqTo('/sources/index.js'),
            waitForData((res, data) => {
              expect(callCount).toBe(2)
              expect(data.toString()).toBe('**transformed**\nalert("Hello")')
              done()
            })
          )
        })
      )
    })
  })
})
