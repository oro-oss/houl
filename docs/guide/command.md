# Command

Houl provides three commands - `build`, `dev` and `watch`.

```bash
$ houl build
$ houl dev
$ houl watch
```

`houl build` transform/copy all source files into destination directory that is written in a config file.

`houl dev` starts a dev server (powered by [BrowserSync](https://browsersync.io/)). The dev server dynamically transform a source file when a request is recieved, then you will not suffer the perfomance problem that depends on the size of static site.

`houl watch` is similar with `houl dev` but it does not start dev server. It watches and builds updated files incrementally. This command is useful in a project that requires some additional processing for asset files such as the asset pipeline of Ruby on Rails.

## `--config` (`-c`) option

Houl automatically loads `houl.config.js` or `houl.config.json` as a config file but you can use `--config` (shorthand `-c`) option if you prefer to load other config file.

```bash
$ houl build -c config.js
$ houl dev -c config.js
$ houl watch -c config.js
```

## `--dot` flag

If you want to include dot files (e.g. `.htaccess`) in input, set `--dot` flag with `build` and `watch` command.

```bash
$ houl build --dot
$ houl watch --dot
```

## `--production` flag

You can enable production mode by adding `--production` flag with `build` command that will set `process.env.NODE_ENV` to `'production'`:

```bash
$ houl build --production
```

## `--cache` option

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

## `--filter` option

There are some cases that we want to build a part of source files in a project for various purpose (e.g. generating styleguide by using built css files). For that case, we can use `--filter` option to specify which files should be build by glob pattern.

```bash
$ houl build --filter **/*.scss
```

## `--port` (`-p`) option

If you want to specify a listen port of the dev server, you can set `--port` (shorthand `-p`) option.

```bash
$ houl dev -p 50000
```

## `--base-path` option

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
