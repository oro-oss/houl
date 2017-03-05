const { dev, prod } = require('../lib/api')
const buble = require('gulp-buble')
const sass = require('gulp-sass')
const sourcemaps = require('gulp-sourcemaps')
const uglify = require('gulp-uglify')

exports.js = stream => {
  return stream
    .pipe(dev(sourcemaps.init()))
    .pipe(buble())
    .pipe(prod(uglify()))
    .pipe(dev(sourcemaps.write()))
}

exports.sass = stream => {
  return stream
    .pipe(dev(sourcemaps.init()))
    .pipe(sass())
    .pipe(dev(sourcemaps.write()))
}
