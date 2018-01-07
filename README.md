# Houl

[![npm version](https://badge.fury.io/js/houl.svg)](https://badge.fury.io/js/houl)
[![Build Status](https://travis-ci.org/ktsn/houl.svg?branch=master)](https://travis-ci.org/ktsn/houl)
[![Greenkeeper badge](https://badges.greenkeeper.io/ktsn/houl.svg)](https://greenkeeper.io/)

Gulp compatible build tool and dev server for huge static sites.

## Overview

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

Note that you also need a config file to specify a directory path of source/destination and so on. You will learn about the config file on a later section.

## Installation

```bash
# npm
$ npm install --global houl

# yarn
$ yarn global add houl
```

## Command

Houl provides three commands - `build`, `dev` and `watch`.

```bash
$ houl build
$ houl dev
$ houl watch
```

`houl build` transform/copy all source files into destination directory that is written in a config file.

`houl dev` starts a dev server (powered by [BrowserSync](https://browsersync.io/)). The dev server dynamically transform a source file when a request is recieved, then you will not suffer the perfomance problem that depends on the size of static site.

`houl watch` is similar with `houl dev` but it does not start dev server. It watches and builds updated files incrementally. This command is useful in a project that requires some additional processing for asset files such as the asset pipeline of Ruby on Rails.

### `--config` (`-c`) option

Houl automatically loads `houl.config.js` or `houl.config.json` as a config file but you can use `--config` (shorthand `-c`) option if you prefer to load other config file.

```bash
$ houl build -c config.js
$ houl dev -c config.js
$ houl watch -c config.js
```

### `--dot` flag

If you want to include dot files (e.g. `.htaccess`) in input, set `--dot` flag with `build` and `watch` command.

```bash
$ houl build --dot
$ houl watch --dot
```

### `--production` flag

You can enable production mode by adding `--production` flag with `build` command that will set `process.env.NODE_ENV` to `'production'`:

```bash
$ houl build --production
```

### `--cache` option

You may want to cache each build file and process only updated files in the next build. Houl provides this feature for you by setting `--cache` option.

```bash
$ houl build --cache .houlcache
$ houl watch --cache .houlcache
```

Note that the file name that is specified with `--cache` option (`.houlcache` in the above example) is a cache file to check updated files since the previous build. You need to specify the same file on every build to make sure to work the cache system correctly.

The cache system will traverse dependencies to check file updates strictly. The dependencies check works out of the box for the most of file formats thanks to [progeny](https://github.com/es128/progeny). But you may need to adapt a new file format or modify progeny configs for your project. In that case, you can pass progeny configs into each rules (you will learn about _rules_ in a later section).

```json
{
  "rules": {
    "js": {
      "task": "scripts",
      "progeny": {
        "extension": "es6"
      }
    }
  }
}
```

### `--filter` option

There are some cases that we want to build a part of source files in a project for various purpose (e.g. generating styleguide by using built css files). For that case, we can use `--filter` option to specify which files should be build by glob pattern.

```bash
$ houl build --filter **/*.scss
```

### `--port` (`-p`) option

If you want to specify a listen port of the dev server, you can set `--port` (shorthand `-p`) option.

```bash
$ houl dev -p 50000
```

### `--base-path` option

Sometimes, we may want to serve a part of a Web site by the dev server. For example, let imagine the following file structure:

```
- src
  |- index.html
  |- js/
  |- css/
  |- img/
  |- ...
```

If we want to access `src/index.html` via `http://localhost:8080/sub/index.html` in that case, we can use `--base-path` option.

```bash
$ houl dev --base-path sub
```

## Configuration

Houl requires two type of files - config file and task file.

### Config File

Houl config file can be `.json` or `.js` that exports config object. It specifies the project source/destination directory, the way how it transforms sources and so on. Available options are following:

Key            | Description
-------------- | --------------------------------------------------------
input          | Path to source directory
output         | Path to destination directory
exclude        | Glob pattern(s) of files that will be ignored from input
taskFile       | Path to task file that is described in the later section
preset         | Preset package name or an object that specify a preset
preset.name    | Preset package name
preset.options | Preset options
rules          | Specify how to transform source files
dev            | Dev server related options (See [Dev options](#dev-options) for details)

#### Rules

You can specify the way how to transform the source files by _rules_. The `rules` field in config file should be an object and its keys indicate target extensions for transformation. For example, if you want to transform `.js` files, you should add `js` field in `rules` object.

Each field in `rules` object can be an object or a string. If string is specified, it will be treated as `task`.

Key       | Description
--------- | -----------------------------------------------------------------------------------------------------------
task      | Task name that will apply transformations
outputExt | Extension of output files. If omitted, it is same as input files' extensions.
exclude   | Glob pattern(s) of files that will not be applied the rule
progeny   | Specify [progeny configs](https://github.com/es128/progeny#configuration) for the corresponding file format
options   | Options for the corresponding task that is passed to the 2nd argument of the task

#### Preset

Houl can load external preset that distributed on NPM. You can load it by specifying `preset` field of the config file. For example, if you want to use `houl-preset-foo` preset, just write the package name to `preset`.

```json
{
  "input": "./src",
  "output": "./dist",
  "preset": "houl-preset-foo"
}
```

A preset receives any options value if you set a `options` property in the `preset` field.

```json
{
  "input": "./src",
  "output": "./dist",
  "preset": {
    "name": "houl-preset-foo",
    "options": {
      "exclude": "**/_*/**"
    }
  }
}
```

The specified options can be referred in the config file of the preset if it is defined as a function style.

```js
module.exports = function(options) {
  return {
    exclude: options.exclude,
    rules: {
      // ...
    }
  }
}
```

#### Dev options

You can provide dev server related options via `dev` field. The `dev` field has an object which can include the following properties.

Key      | Description
-------- | ---
proxy    | Proxy configurations which is compatible with [`node-http-proxy` options](https://github.com/nodejitsu/node-http-proxy#options).
port     | Port number of the dev server as same as the `--port` cli option.
basePath | Base path of the dev server as same as the `--base-path` cli option.

The below is an example of `proxy` configuration:

```json
{
  "dev": {
    "proxy": {
      "/foo": "http://foo.com/",
      "/bar": {
        "target": "https://bar.com/",
        "secure": true
      }
    }
  }
}
```

The key of the `proxy` object indicates which requests for the path should be proxied. The above config let the dev server proxy requests under `/foo` to `http://foo.com/` and `/bar` to `https://bar.com/`.

#### Config Example

Full example of config file:

```json
{
  "input": "./src",
  "output": "./dist",
  "exclude": ["**/_*", "**/private/**"],
  "taskFile": "./houl.task.js",
  "preset": "houl-preset-foo",
  "rules": {
    "js": {
      "task": "scripts",
      "exclude": "**/vendor/**",
      "progeny": {
        "extension": "es6"
      }
    },
    "scss": {
      "task": "styles",
      "outputExt": "css",
      "options": {
        "fooValue": "foo"
      }
    }
  }
}
```

### Task File

The task file contains how to transform source files by Houl. Interesting point is the task file is compatible with any [Gulp](http://gulpjs.com/) plugins. That means you can utilize rich gulp ecosystem.

The task file must be `.js` file and you need to export some functions. The exported functions receive a stream that will send source files then you must return a piped stream that transforms them. The 2nd argument of the function will be an options value that specified in each rule in the config file. You can use any Gulp plugins to pipe the stream:

```javascript
const babel = require('gulp-babel')
const sass = require('gulp-sass')

exports.scripts = stream => {
  return stream
    .pipe(babel())
}

exports.styles = (stream, options) => {
  return stream
    .pipe(sass(options.sass))
}
```

Note that the exported name is used on config file (e.g. If you write `exports.scripts`, you can refer it as `"scripts"` task in the config file).

#### Task Helpers

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

## License

MIT
