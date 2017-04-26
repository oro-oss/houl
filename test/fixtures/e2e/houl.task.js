'use strict'

const path = require('path')
const houl = require('../../../')
const dev = houl.dev
const prod = houl.prod

const buble = require('gulp-buble')
const sass = require('gulp-sass')
const pug = require('gulp-pug')
const uglify = require('gulp-uglify')

const devMark = () => require('stream').Transform({
  objectMode: true,
  transform (file, encoding, done) {
    file.contents = Buffer.from(file.contents + '\n/* In dev mode */\n')
    done(null, file)
  }
})

exports.script = stream => {
  return stream
    .pipe(buble())
    .pipe(prod(uglify()))
    .pipe(dev(devMark()))
}

exports.style = stream => {
  return stream
    .pipe(sass({
      outputStyle: 'expanded'
    }))
    .pipe(dev(devMark()))
}

exports.pug = stream => {
  return stream
    .pipe(pug({
      basedir: path.resolve(__dirname, 'src/_layouts'),
      pretty: '  '
    }))
}
