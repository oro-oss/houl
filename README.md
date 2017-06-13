# Houl

Gulp compatible build tool and dev server for huge static sites.

## Installation

```bash
# npm
$ npm install --global houl

# yarn
$ yarn global add houl
```

## Command

Houl provides two commands - `build` and `dev`.

```bash
$ houl build
$ houl dev
```

`houl build` transform/copy all source files into destination directory that is written in a config file while `houl dev` starts a dev server (powered by [BrowserSync](https://browsersync.io/)). The dev server dynamically transform a source file when a request is recieved, then you will not suffer the perfomance problem that depends on the size of static site.

Houl automatically loads `houl.config.js` or `houl.config.json` as a config file but you can use `--config` (shorthand `-c`) option if you prefer to load other config file.

```bash
$ houl build -c config.js
$ houl dev -c config.js
```

## Configuration

Houl requires two type of files - config file and task file.

### Config File

Houl config file can be `.json` or `.js` that exports config object. It specifies the project source/destination directory, the way how it transforms sources and so on. Available options are following:

Key      | Description
-------- | --------------------------------------------------------
input    | Path to source directory
output   | Path to destination directory
exclude  | Glob pattern of files that will be ignored from input
taskFile | Path to task file that is described in the later section
preset   | Package name or directory to preset
rules    | Specify how to transform source files

#### Rules

You can specify the way how to transform the source files by *rules*. The `rules` field in config file should be an object and its keys indicate target extensions for transformation. For example, if you want to transform `.js` files, you should add `js` field in `rules` object.

Each field in `rules` object can be an object or a string. If string is specified, it will be treated as `task`.

Key       | Description
--------- | -----------------------------------------------------------------------------
task      | Task name that will apply transformations
outputExt | Extension of output files. If omitted, it is same as input files' extensions.
exclude   | Glob pattern of files that will not be applied the rule

#### Preset

Houl can load external preset that distributed on NPM. You can load it by specifying `preset` field of the config file. For example, if you want to use `houl-preset-foo` preset, just write the package name to `preset`.

```json
{
  "input": "./src",
  "output": "./dist",
  "preset": "houl-preset-foo"
}
```

#### Config Example

Full example of config file:

```json
{
  "input": "./src",
  "output": "./dist",
  "exclude": "**/_*",
  "taskFile": "./houl.task.js",
  "preset": "houl-preset-foo",
  "rules": {
    "js": {
      "task": "scripts",
      "exclude": "**/vendor/**"
    },
    "scss": {
      "task": "styles",
      "outputExt": "css"
    }
  }
}
```

### Task File

The task file contains how to transform source files by Houl. Interesting point is the task file is compatible with any [Gulp](http://gulpjs.com/) plugins. That means you can utilize rich gulp ecosystem.

The task file must be `.js` file and you need to export some functions. The exported functions receive a stream that will send source files then you must return a piped stream that transforms them. You can use any Gulp plugins to pipe the stream:

```javascript
const babel = require('gulp-babel')
const sass = require('gulp-sass')

exports.scripts = stream => {
  return stream
    .pipe(babel())
}

exports.styles = stream => {
  return stream
    .pipe(sass())
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

You can enable production mode by adding `--production` flag with `build` command:

```bash
$ houl build --production
```

## License

MIT
