'use strict'

module.exports = function createTask(rawTask, options) {
  return stream => rawTask(stream, options)
}
