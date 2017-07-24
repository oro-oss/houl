'use strict'

const td = require('testdouble')

const Config = require('../../lib/models/config')
const taskStream = require('../../lib/task-stream')

const helpers = require('../helpers')
const vinyl = helpers.vinyl
const source = helpers.source
const transform = helpers.transform
const assertStream = helpers.assertStream

describe('ProcessTask Stream', () => {
  it('passes through files that does not match any rules', done => {
    const config = Config.create({
      rules: {
        js: 'js'
      }
    }, {
      js: stream => stream.pipe(transform((file, encoding, done) => {
        done(new Error('Unexpected'))
      }))
    })

    source([
      vinyl({ path: 'test.css', contents: '' })
    ]).pipe(taskStream(config))
      .pipe(assertStream([
        vinyl({ path: 'test.css', contents: '' })
      ]))
      .on('finish', done)
  })

  it('transforms file by matched task', done => {
    const config = Config.create({
      rules: {
        es6: {
          task: 'js',
          outputExt: 'js'
        },
        scss: {
          task: 'css',
          outputExt: 'css'
        }
      }
    }, {
      js: stream => stream.pipe(transform((file, encoding, done) => {
        file.contents = Buffer.from('es6: ' + file.contents)
        done(null, file)
      })),
      css: stream => stream.pipe(transform((file, encoding, done) => {
        file.contents = Buffer.from('scss: ' + file.contents)
        done(null, file)
      }))
    })

    source([
      vinyl({ path: 'test.es6', contents: 'const test = "es6"' }),
      vinyl({ path: 'test.scss', contents: '.foo {}' })
    ]).pipe(taskStream(config))
      .pipe(assertStream([
        vinyl({ path: 'test.js', contents: 'es6: const test = "es6"' }),
        vinyl({ path: 'test.css', contents: 'scss: .foo {}' })
      ]))
      .on('finish', done)
  })

  it('ignores files that is matched with exclude option', done => {
    const config = Config.create({
      rules: {
        es6: {
          task: 'js',
          outputExt: 'js',
          exclude: '**/vendor/**'
        }
      }
    }, {
      js: stream => stream.pipe(transform((file, encoding, done) => {
        file.contents = Buffer.from('es6: ' + file.contents)
        done(null, file)
      }))
    })

    source([
      vinyl({ path: 'test.es6', contents: 'const test = "test"' }),
      vinyl({ path: 'vendor/test.es6', contents: 'const test = "vendor"' })
    ]).pipe(taskStream(config))
      .pipe(assertStream([
        vinyl({ path: 'test.js', contents: 'es6: const test = "test"' }),
        vinyl({ path: 'vendor/test.es6', contents: 'const test = "vendor"' })
      ]))
      .on('finish', done)
  })

  it('transforms extname after executing task', done => {
    let called = false
    const config = Config.create({
      rules: {
        es6: {
          task: 'js',
          outputExt: 'js'
        }
      }
    }, {
      js: stream => stream.pipe(transform((file, encoding, done) => {
        expect(file.extname).toBe('.es6')
        called = true
        done(null, file)
      }))
    })

    source([
      vinyl({ path: 'test.es6' })
    ]).pipe(taskStream(config))
      .pipe(assertStream([
        vinyl({ path: 'test.js' })
      ]))
      .on('finish', () => {
        expect(called).toBe(true)
        done()
      })
  })

  // #19
  it('hanldes filtering tasks', done => {
    const config = Config.create({
      rules: {
        js: 'js'
      }
    }, {
      js: stream => stream.pipe(transform(function (file, encoding, done) {
        if (file.path.indexOf('exclude') < 0) {
          this.push(file)
        }
        done()
      }))
    })

    source([
      vinyl({ path: 'foo.js' }),
      vinyl({ path: 'exclude.js' }),
      vinyl({ path: 'bar.js' })
    ]).pipe(taskStream(config))
      .pipe(assertStream([
        vinyl({ path: 'foo.js' }),
        vinyl({ path: 'bar.js' })
      ]))
      .on('finish', done)
  })

  it('handles task errors', done => {
    const config = Config.create({
      rules: {
        js: 'js'
      }
    }, {
      js: stream => stream.pipe(transform((file, encoding, done) => {
        done(new Error('Test Error'))
      }))
    })

    source([
      vinyl({ path: 'error.js' })
    ]).pipe(taskStream(config))
      .on('error', err => {
        expect(err).toEqual(new Error('Test Error'))
        done()
      })
  })

  it('should teardown internal stream and itself in correct order', done => {
    const config = Config.create({
      rules: {
        js: 'js'
      }
    }, {
      js: stream => stream.pipe(transform((file, encoding, done) => {
        setTimeout(() => {
          done(null, file)
        }, 0)
      }))
    })

    const spy = td.function()
    const data = vinyl({ path: 'test.js' })

    source([data])
      .pipe(taskStream(config))
      .on('data', spy)
      .on('error', err => { throw err })
      .on('end', () => {
        td.verify(spy(data), { times: 1 })
        done()
      })
  })

  it('should update mtime and ctime of a file', done => {
    const config = Config.create({}, {})

    const time = new Date()

    const data = vinyl({
      path: 'test.js',
      stat: {
        atime: time,
        mtime: time,
        ctime: time
      }
    })

    setTimeout(() => {
      source([data])
        .pipe(taskStream(config))
        .on('data', data => {
          expect(data.stat.atime.getTime()).toBe(time.getTime())
          expect(data.stat.mtime.getTime()).toBeGreaterThan(time.getTime())
          expect(data.stat.ctime.getTime()).toBeGreaterThan(time.getTime())
          done()
        })
    }, 0)
  })
})
