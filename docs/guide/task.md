# Task File

The task file contains how to transform source files by Houl. Interesting point is the task file is compatible with any [Gulp](http://gulpjs.com/) plugins. That means you can utilize rich gulp ecosystem.

The task file must be `.js` file and you need to export some functions. The exported functions receive a stream that will send source files then you must return a piped stream that transforms them. The 2nd argument of the function will be an options value that specified in each rule in the config file. You can use any Gulp plugins to pipe the stream:

```javascript
const babel = require('gulp-babel')
const sass = require('gulp-sass')

exports.scripts = stream => {
  return stream.pipe(babel())
}

exports.styles = (stream, options) => {
  return stream.pipe(sass(options.sass))
}
```

Note that the exported name is used on config file (e.g. If you write `exports.scripts`, you can refer it as `"scripts"` task in the config file).

## Inline Task

You can also write task function in config file directory. `task` option in rule objects can receive task function:

```javascript
const babel = require('gulp-babel')
const sass = require('gulp-sass')

module.exports = options => {
  return {
    rules: {
      js: {
        task: stream => {
          return stream.pipe(babel())
        }
      },
      scss: {
        task: stream => {
          return stream.pipe(sass(options.sass))
        },
        outputExt: 'css'
      }
    }
  }
}
```

## Task Helpers

If you want to execute environment specific transformation, you can use `dev` and `prod` helpers:

```javascript
const { dev, prod } = require('houl')
const babel = require('gulp-babel')
const sourcemaps = require('gulp-sourcemaps')
const uglify = require('gulp-uglify')

exports.scripts = stream => {
  return stream
    .pipe(dev(soucemaps.init())) // Generate source maps in development mode
    .pipe(babel())
    .pipe(prod(uglify())) // Minify in production mode
    .pipe(dev(soucemaps.write()))
}
```

You can enable production mode by using `--production` flag with `build` command.
