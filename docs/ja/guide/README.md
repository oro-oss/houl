# はじめに

Houl は静的サイトコーディングの共通ワークフローを単純にするために作られています。カスタマイズ可能なタスクでソースファイルをビルドしたり、変更をウォッチしたり、開発サーバーを立てたりできます。

Houl は共通のワークフローを自身の機能として抽象化しているので、設定ファイルが複雑になってイライラすることはもうありません。ファイルをどのように変換するか、どのファイルにそれを適用するかということだけを定義すればよいです。

## インストール

npm から Houl をインストールします。

```bash
# npm
$ npm install -g houl

# yarn
$ yarn global add houl
```

## 単純な例

Houl で `.pug` や `.scss` をどのように変換するかを見ていきましょう。初めに依存関係をインストールします。

```bash
$ npm install -D gulp-pug gulp-sass
```

次に、それぞれのファイルをどのように変換するかを定義したタスクファイル (`houl.task.js`) を書きます。

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

さらに、JSON の設定ファイル (`houl.config.json`) にソースコードのあるディレクトリ、出力先ディレクトリや、変換をどのファイルに適用するかを指定します。

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

何らかのソースファイルを `src` ディレクトリに追加した後、次のコマンドでビルドします。出力は `dist` ディレクトリに入ります。

```bash
$ houl build
```

Houl は自動的に開発サーバーやファイル監視を扱ってくれるので、設定はとてもシンプルになります。重要な点として、任意の Gulp プラグインを Houl のタスクで使用できるということがあります。したがって、Gulp のワークフローを簡単に Houl に移行することができます。
