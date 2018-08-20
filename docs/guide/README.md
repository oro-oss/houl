# Overview

Houl is created for simplifying common workflows of static site coding. For example, you may setup your `gulpfile.js` that includes tasks to compile sources, start a dev server and watch source file changes:

```js
const gulp = require('gulp')
const pug = require('gulp-pug')
const sass = require('gulp-sass')
const bs = require('browser-sync').create()

gulp.task('pug', () => {
  return gulp.src('src/**/*.pug')
    .pipe(pug())
    .pipe(gulp.dest('dist'))
    .pipe(bs.stream())
})

gulp.task('sass', () => {
  return gulp.src('src/styles/**/*.scss')
    .pipe(sass())
    .pipe(gulp.dest('dist/styles'))
    .pipe(bs.stream())
})

gulp.task('serve', ['pug', 'sass'], () => {
  bs.init({
    server: 'dist'
  })

  gulp.watch('src/**/*.pug', ['pug'])
  gulp.watch('src/styles/**/*.scss', ['sass'])
})
```

While the `gulpfile.js` will be complicated as your web site grows, the Houl task file can be kept simple. The Houl task file that will do the same things as the `gulpfile.js` is like below:

```js
const pug = require('gulp-pug')
const sass = require('gulp-sass')

exports.pug = stream => {
  return stream.pipe(pug())
}

exports.sass = stream => {
  return stream.pipe(sass())
}
```

It is quite simple because Houl automatically handle a dev server and watching. The important thing is that you can use any Gulp plugins in a Houl task file. So you would easily migrate your Gulp workflow to Houl.

Note that you also need a config file to specify a directory path of source/destination and so on. You will learn about the config file on the later sections.
