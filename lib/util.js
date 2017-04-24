'use strict'

const fs = require('fs')
const path = require('path')

function clone (obj) {
  const res = {}
  Object.keys(obj).forEach(key => {
    res[key] = obj[key]
  })
  return res
}
exports.clone = clone

exports.identity = val => val

exports.merge = (a, b) => {
  const res = clone(a)
  Object.keys(b).forEach(key => {
    res[key] = b[key]
  })
  return res
}

exports.mapValues = (val, fn) => {
  const res = {}
  Object.keys(val).forEach(key => {
    res[key] = fn(val[key], key)
  })
  return res
}

exports.isLocalPath = pathname => {
  return /^[\.\/]/.test(pathname)
}

exports.normalizePath = pathname => {
  return pathname.split(path.sep).join('/')
}

exports.readFileSync = fileName => {
  try {
    return fs.readFileSync(fileName, 'utf8')
  } catch (err) {
    return undefined
  }
}

exports.writeFileSync = (fileName, data) => {
  fs.writeFileSync(fileName, data)
}
