const path = require('path')
const stream = require('stream')
const Readable = stream.Readable
const Transform = stream.Transform

const processTask = require('../../lib/process-task')

describe('ProcessTask Stream', () => {
  it('passes through files that does not match any rules', done => {
    test([
      flow('js', 'js', () => { throw new Error('Unexpected') })
    ], [
      file('test.css')
    ], (input, output) => {
      expect(output).toEqual(input)
      done()
    })
  })

  it('transform file by matched task', done => {
    test([
      flow('es6', 'js', data => 'es6\n' + data),
      flow('scss', 'css', data => 'scss\n' + data)
    ], [
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
})

function file (pathname, contents = '') {
  return {
    path: pathname,
    extname: path.extname(pathname),
    contents
  }
}

function flow (inputExt, outputExt, task, exclude) {
  return {
    rule: {
      inputExt,
      outputExt,
      exclude
    },
    task: stream => {
      return stream.pipe(new Transform({
        objectMode: true,
        transform (file, _, cb) {
          cb(null, merge(file, { contents: task(file.contents) }))
        }
      }))
    }
  }
}

function test (flow, input, cb) {
  const data = []

  new Readable({
    objectMode: true,
    read () {
      input.forEach(d => this.push(d))
      this.push(null)
    }
  }).pipe(processTask(flow))
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
