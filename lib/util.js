'use strict'

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
