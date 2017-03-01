'use strict'

const path = require('path')
const execSync = require('child_process').execSync

const p = _path => path.resolve(__dirname, _path)
const exec = (file, nodeEnv) => {
  const env = Object.create(process.env)
  env.NODE_ENV = nodeEnv

  return execSync('node ' + p(file), { env }).toString().trim()
}

describe('Node API', () => {
  it('dev helper', () => {
    let stdout = exec('./env/dev-task.js', 'developement')
    expect(stdout).toBe('transformed')

    stdout = exec('./env/dev-task.js', 'production')
    expect(stdout).toBe('source')
  })

  it('prod helper', () => {
    let stdout = exec('./env/prod-task.js', 'developement')
    expect(stdout).toBe('source')

    stdout = exec('./env/prod-task.js', 'production')
    expect(stdout).toBe('transformed')
  })
})
