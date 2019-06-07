# Config File

Houl config file can be `.json` or `.js` that exports config object. It specifies the project source/destination directory, the way how it transforms sources and so on. Available options are following:

| Key            | Description                                                              |
| -------------- | ------------------------------------------------------------------------ |
| input          | Path to source directory                                                 |
| output         | Path to destination directory                                            |
| exclude        | Glob pattern(s) of files that will be ignored from input                 |
| taskFile       | Path to task file that is described in the later section                 |
| preset         | Preset package name or an object that specify a preset                   |
| preset.name    | Preset package name                                                      |
| preset.options | Preset options                                                           |
| rules          | Specify how to transform source files                                    |
| dev            | Dev server related options (See [Dev options](#dev-options) for details) |

## Rules

You can specify the way how to transform the source files by _rules_. The `rules` field in config file should be an object and its keys indicate target extensions for transformation. For example, if you want to transform `.js` files, you should add `js` field in `rules` object.

Each field in `rules` object can be an object, a string or a function. If string or function is specified, it will be treated as `task`.

| Key       | Description                                                                                                 |
| --------- | ----------------------------------------------------------------------------------------------------------- |
| task      | Task name or inline task that will apply transformations                                                    |
| outputExt | Extension of output files. If omitted, it is same as input files' extensions.                               |
| exclude   | Glob pattern(s) of files that will not be applied the rule                                                  |
| progeny   | Specify [progeny configs](https://github.com/es128/progeny#configuration) for the corresponding file format |
| options   | Options for the corresponding task that is passed to the 2nd argument of the task                           |

## Preset

Houl can load external preset that distributed on NPM. You can load it by specifying `preset` field of the config file. For example, if you want to use `houl-preset-foo` preset, just write the package name to `preset`.

```json
{
  "input": "./src",
  "output": "./dist",
  "preset": "houl-preset-foo"
}
```

### Specifying preset options

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

### Extending preset config

You may want to extend an existing preset rules to adapt your own needs. In that case, you just specify additional options for corresponding rules.

For example, when the preset config is like the following:

```js
{
  "rules": {
    "js": {
      "task": "script"
    }
  }
}
```

The user config:

```js
{
  "preset": "houl-preset-foo",
  "rules": {
    "js": {
      "exclude": "**/_*/**"
    }
  }
}
```

The above user config is the same as the following config:

```js
{
  "rules": {
    "js": {
      "task": "script",
      "exclude": "**/_*/**"
    }
  }
}
```

If you want to tweak presets more flexible, you can use `preset.modifyConfig` option. `modifyConfig` expects a function that receives a raw preset config object as the 1st argument. You modify the preset config in the function or optionally return new config object.

```js
module.exports = {
  input: './src',
  output: './dist',
  preset: {
    name: 'houl-preset-foo',
    modifyConfig: config => {
      // Remove `foo` task in the preset
      // You have to use `delete` statement instead of
      // assigning `null` to remove a task.
      delete config.rules.foo
    }
  }
}
```

## Dev options

You can provide dev server related options via `dev` field. The `dev` field has an object which can include the following properties.

| Key      | Description                                                                                                                      |
| -------- | -------------------------------------------------------------------------------------------------------------------------------- |
| proxy    | Proxy configurations which is compatible with [`node-http-proxy` options](https://github.com/nodejitsu/node-http-proxy#options). |
| port     | Port number of the dev server as same as the `--port` cli option.                                                                |
| basePath | Base path of the dev server as same as the `--base-path` cli option.                                                             |

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

## Config Example

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
