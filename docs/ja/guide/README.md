# 概要

Houl は静的サイトコーディングの共通ワークフローを単純化するために作られています。例えば、`gulpfile.js` にソースをコンパイルし、開発サーバーをたて、変更をウォッチするようなタスクを書くと以下のようになると思います。

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

`gulpfile.js` は Web サイトが大きくなるに連れ複雑になっていきますが、Houl のタスクファイルは単純なままです。上記の `gulpfile.js` と同じことをする Houl のタスクファイルは以下のようになります。

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

このように単純なのは、Houl が自動的に開発サーバーの制御とウォッチを行うからです。重要なのは Houl タスクファイルの中では任意の Gulp プラグインを使えるという点です。なので、従来の Gulp を使ったワークフローから Houl に移行するのは簡単です。

ここで説明したタスクファイル以外にもソース、出力先ディレクトリなどを指定するための設定ファイルも必要ですが、後の節で説明します。

