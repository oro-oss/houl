'use strict'

const GREEN = '\u001b[32m'
const YELLOW = '\u001b[33m'

const RESET = '\u001b[0m'

function green(str) {
  return GREEN + str + RESET
}

function yellow(str) {
  return YELLOW + str + RESET
}

exports.green = green
exports.yellow = yellow
