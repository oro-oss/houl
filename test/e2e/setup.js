'use strict'

const path = require('path')
const spawn = require('child_process').spawn

spawn('npm', ['install'], {
  shell: true,
  cwd: path.resolve(__dirname, '../fixtures/e2e')
})
