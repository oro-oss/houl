'use strict'

const GREEN = '\u001b[32m'
const YELLOW = '\u001b[33m'
const CYAN = '\u001b[36m'

const RESET = '\u001b[0m'

function green(str) {
  return GREEN + str + RESET
}

function yellow(str) {
  return YELLOW + str + RESET
}

function cyan(str) {
  return CYAN + str + RESET
}

exports.green = green
exports.yellow = yellow
exports.cyan = cyan
