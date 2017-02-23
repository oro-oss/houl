'use strict'

const path = require('path')
const stream = require('stream')
const Readable = stream.Readable
const Transform = stream.Transform
const Config = require('../../lib/models/config')

const processTask = require('../../lib/process-task')

describe('ProcessTask Stream', () => {
  it('passes through files that does not match any rules', done => {
    test(config([
      ['js', 'js', () => { throw new Error('Unexpected') }]
    ]), [
      file('test.css')
    ], (input, output) => {
      expect(output).toEqual(input)
      done()
    })
  })

  it('transforms file by matched task', done => {
    test(config([
      ['es6', 'js', data => 'es6\n' + data],
      ['scss', 'css', data => 'scss\n' + data]
    ]), [
      file('test.es6', 'var test = "es6"'),
      file('test.scss', '.foo {}')
    ], (input, output) => {
      expect(output[0].contents).toBe('es6\n' + input[0].contents)
      expect(output[0].extname).toBe('.js')
      expect(output[1].contents).toBe('scss\n' + input[1].contents)
      expect(output[1].extname).toBe('.css')
      done()
    })
  })

  it('ignores files that is matched with exclude option', done => {
    test(config([
      ['es6', 'js', data => 'es6\n' + data, '**/vendor/**']
    ]), [
      file('test.es6', 'var test = "test"'),
      file('vendor/test.es6', 'var test = "vendor"')
    ], (input, output) => {
      expect(output[0].contents).toBe('es6\n' + input[0].contents)
      expect(output[0].extname).toBe('.js')
      expect(output[1]).toEqual(input[1])
      done()
    })
  })
})

// Create dummy vinyl object
function file (pathname, contents) {
  contents = contents || ''
  return {
    path: pathname,
    extname: path.extname(pathname),
    contents
  }
}

// Create a config that will be passed as processTask argument
// [[inputExt, outputExt, taskFn, exclude]]
function config (args) {
  const rules = {}
  const tasks = {}

  args.forEach(arg => {
    rules[arg[0]] = {
      task: arg[0],
      outputExt: arg[1],
      exclude: arg[3]
    }

    tasks[arg[0]] = stream => {
      return stream.pipe(new Transform({
        objectMode: true,
        transform (file, _, cb) {
          cb(null, merge(file, { contents: arg[2](file.contents) }))
        }
      }))
    }
  })

  return new Config({ rules }, tasks)
}

// Test the processTask function
// cb will recieve the input/output array as its arguments
function test (config, input, cb) {
  const data = []

  new Readable({
    objectMode: true,
    read () {
      input.forEach(d => this.push(merge({}, d))) // clone
      this.push(null)
    }
  }).pipe(processTask(config))
    .on('data', d => data.push(d))
    .on('end', () => cb(input, data))
}

function merge (a, b) {
  const res = {}
  ;[a, b].forEach(item => {
    Object.keys(item).forEach(key => {
      res[key] = item[key]
    })
  })
  return res
}
