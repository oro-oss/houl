'use strict'

const path = require('path')
const fs = require('fs')
const http = require('http')
const Transform = require('stream').Transform
const td = require('testdouble')
const Config = require('../../../lib/models/config')
const create = require('../../../lib/externals/browser-sync')

const base = path.resolve(__dirname, '../../../example/src')

function reqTo (pathname) {
  return 'http://localhost:51234' + pathname
}

function waitForData (fn) {
  let buf = ''

  return res => {
    res.on('data', chunk => buf += chunk)
    res.on('end', () => {
      fn(res, buf)
    })
  }
}

function expectDataToBeFile (data, filename) {
  expect(data).toBe(
    fs.readFileSync(path.join(base, filename), 'utf8')
  )
}

describe('Using browsersync', () => {
  const config = new Config({
    input: 'src',
    output: 'dist',
    rules: {
      js: 'js'
    }
  }, {
    js: stream => {
      return stream.pipe(new Transform({
        objectMode: true,
        transform (file, encoding, callback) {
          const source = file.contents.toString()
          file.contents = Buffer.from('**transformed**\n' + source)
          callback(null, file)
        }
      }))
    }
  }, {
    base: path.resolve(__dirname, '../../../example')
  })

  const mockResolver = {
    register: td.function()
  }

  create(config, {
    port: 51234,
    open: false,
    logLevel: 'silent'
  }, mockResolver)

  it('starts dev server by the given port', done => {
    http.get(reqTo('/'), waitForData((res, data) => {
      expect(res.statusCode).toBe(200)
      expectDataToBeFile(data, 'index.html')
      done()
    }))
  })

  it('executes corresponding task to transform sources', done => {
    http.get(reqTo('/js/index.js'), waitForData((res, data) => {
      expect(data).toMatch(/^\*\*transformed\*\*\n/)
      done()
    }))
  })

  it('fills trailing slash if the specified path indicates a directory', done => {
    http.get(reqTo(''), waitForData((res, data) => {
      expectDataToBeFile(data, 'index.html')
      done()
    }))
  })

  it('registers requested files to dep resolver', done => {
    http.get(reqTo('/css/index.scss'), () => {
      const absPath = path.resolve(base, 'css/index.scss')
      const content = fs.readFileSync(absPath, 'utf8')
      td.verify(mockResolver.register(absPath, content))
      done()
    })
  })
})
