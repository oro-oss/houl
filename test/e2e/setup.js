'use strict'

const spawn = require('child_process').spawn

beforeAll(done => {
  spawn('npm', ['install'], {
    shell: true,
    cwd: 'test/fixtures/e2e'
  }).on('exit', done)
})
