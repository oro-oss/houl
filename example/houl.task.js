const buble = require('gulp-buble')
const sass = require('gulp-sass')

exports.js = stream => {
  return stream.pipe(buble())
}

exports.sass = stream => {
  return stream.pipe(sass())
}
