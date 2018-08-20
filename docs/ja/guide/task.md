# タスクファイル

タスクファイルにはソースコードが Houl によってどのように変換されるかを定義します。特筆すべき点は、タスクファイルは任意の [Gulp](http://gulpjs.com/) プラグインと互換性を持っているという点です。これは Houl で潤沢な Gulp のエコシステムを活用することができることを意味します。

タスクファイルはいくつかの関数をエクスポートする `.js` ファイルです。エクポートされる関数はソースコードが送られるストリームを受け取るので、それをパイプして変換を行ったストリームを返す必要があります。第2引数には設定ファイルの各ルールに指定されたオプションの値が渡されます。任意の Gulp プラグインを使ってストリームをパイプできます。

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

エクスポートする名前は設定ファイル内で使われます (例えば、`exports.scripts` と書いたら、設定ファイル内では `"scripts"` タスクとして使用することができます)。

## タスクヘルパー

環境特有の変換を行いたいときは `dev` や `prod` ヘルパーを使えます。

```javascript
const { dev, prod } = require('houl')
const babel = require('gulp-babel')
const sourcemaps = require('gulp-sourcemaps')
const uglify = require('gulp-uglify')

exports.scripts = stream => {
  return stream
    .pipe(dev(soucemaps.init())) // 開発モードのみソースマップを生成
    .pipe(babel())
    .pipe(prod(uglify())) // プロダクションではミニファイする
    .pipe(dev(soucemaps.write()))
}
```

`build` コマンドに `--production` フラグを渡すとプロダクションモードを有効にできます。
