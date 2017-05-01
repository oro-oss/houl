'use strict'

const path = require('path')
const fs = require('fs')
const http = require('http')
const td = require('testdouble')
const transform = require('../../helpers').transform
const waitForData = require('../../helpers').waitForData
const Config = require('../../../lib/models/config')
const create = require('../../../lib/externals/browser-sync')

const base = path.resolve(__dirname, '../../../example')

function reqTo (pathname) {
  return 'http://localhost:51234' + pathname
}

function expectDataToBeFile (data, filename) {
  expect(data).toBe(
    fs.readFileSync(path.join(base, filename), 'utf8')
  )
}

describe('Using browsersync', () => {
  const config = new Config({
    input: '',
    output: 'dist',
    rules: {
      js: 'js'
    }
  }, {
    js: stream => {
      return stream.pipe(transform((file, encoding, callback) => {
        const source = file.contents.toString()
        file.contents = Buffer.from('**transformed**\n' + source)
        callback(null, file)
      }))
    }
  }, { base })

  const mockResolver = {
    register: td.function()
  }

  let bs
  beforeAll(done => {
    bs = create(config, {
      port: 51234,
      open: false,
      logLevel: 'silent'
    }, mockResolver)

    bs.emitter.on('init', done)
  })

  afterAll(() => {
    bs.exit()
  })

  it('starts dev server by the given port', done => {
    http.get(reqTo('/src/'), waitForData((res, data) => {
      expect(res.statusCode).toBe(200)
      expectDataToBeFile(data, 'src/index.html')
      done()
    }))
  })

  it('executes corresponding task to transform sources', done => {
    http.get(reqTo('/src/js/index.js'), waitForData((res, data) => {
      expect(data).toMatch(/^\*\*transformed\*\*\n/)
      done()
    }))
  })

  it('redirects if the specified path does not have trailing slash and it points to a directory', done => {
    http.get(reqTo('/src'), res => {
      expect(res.statusCode).toBe(301)
      expect(res.headers.location).toBe('/src/')
      done()
    })
  })

  it('registers requested files to dep resolver', done => {
    http.get(reqTo('/src/css/index.scss'), () => {
      const absPath = path.resolve(base, 'src/css/index.scss')
      const content = fs.readFileSync(absPath, 'utf8')
      td.verify(mockResolver.register(absPath, content))
      done()
    })
  })
})
