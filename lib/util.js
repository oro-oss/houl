'use strict'

const path = require('path')
const fs = require('fs')
const os = require('os')

exports.noop = () => {}

function clone(obj) {
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

exports.filterProps = (props, fn) => {
  const res = {}
  Object.keys(props).forEach(key => {
    if (fn(props[key], key)) {
      res[key] = props[key]
    }
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

exports.dropWhile = (list, fn) => {
  let from = 0
  for (let i = 0; i < list.length; i++) {
    if (fn(list[i])) {
      from = i + 1
    } else {
      break
    }
  }
  return list.slice(from)
}

exports.getIp = () => {
  const networkInterfaces = os.networkInterfaces()
  const matches = []

  Object.keys(networkInterfaces).forEach(function(item) {
    networkInterfaces[item].forEach(function(address) {
      if (address.internal === false && address.family === 'IPv4') {
        matches.push(address.address)
      }
    })
  })

  return matches
}
