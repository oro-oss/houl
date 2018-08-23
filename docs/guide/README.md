# Getting Started

Houl is created for simplifying a common workflow of static site coding. It builds source files with customizable tasks, watches source changes and serves built files.

Since Houl abstracts the common workflow as its own feature, you will not be annoyed with complex config files any more. All you have to do is just declare how to transform each file and which file the transformation is applied.

## Installation

Install Houl from npm:

```bash
# npm
$ npm install -g houl

# yarn
$ yarn global add houl
```

## Simple Example

Let's look into how to transform your `.pug` and `.scss` files with Houl. Install depedencies at first:

```bash
$ npm install -D gulp-pug gulp-sass
```

Then write a task file (`houl.task.js`) which you declare how to transform for each file:

```js
// houl.task.js
const pug = require('gulp-pug')
const sass = require('gulp-sass')

exports.pug = stream => {
  return stream.pipe(pug())
}

exports.sass = stream => {
  return stream.pipe(sass())
}
```

You also specify a directory path of the source/destination and which file the transformation is applied in a config JSON file (`houl.config.json`):

```json
{
  "input": "src",
  "output": "dist",
  "taskFile": "houl.task.js",
  "rules": {
    "pug": "pug",
    "scss": {
      "task": "sass",
      "outputExt": "css"
    }
  }
}
```

Build the `src` directory after adding some source files by following command. The output is in `dist` directory:

```bash
$ houl build
```

The configurations are quite simple because Houl automatically handle a dev server and watching. The important thing is that you can use any Gulp plugins in a Houl task file. So you would easily migrate your Gulp workflow to Houl.
