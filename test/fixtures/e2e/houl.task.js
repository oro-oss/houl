'use strict'

const path = require('path')
const houl = require('../../../')
const dev = houl.dev
const prod = houl.prod

const buble = require('gulp-buble')
const sass = require('gulp-sass')
const pug = require('gulp-pug')
const sourcemaps = require('gulp-sourcemaps')
const uglify = require('gulp-uglify')

exports.script = stream => {
  return stream
    .pipe(dev(sourcemaps.init()))
    .pipe(buble())
    .pipe(prod(uglify()))
    .pipe(dev(sourcemaps.write()))
}

exports.style = stream => {
  return stream
    .pipe(dev(sourcemaps.init()))
    .pipe(sass({
      outputStyle: 'expanded'
    }))
    .pipe(dev(sourcemaps.write()))
}

exports.pug = stream => {
  return stream
    .pipe(pug({
      basedir: path.resolve(__dirname, 'src/_layouts'),
      pretty: '  '
    }))
}
