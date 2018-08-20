# 設定ファイル

Houl の設定ファイルには `.json` もしくは、オブジェクトをエクスポートする `.js` ファイルを使うことができます。設定ファイルにはプロジェクトのソースコードが入ったディレクトリ、出力先ディレクトリ、ソースコードをどのように変換するか、などを設定することができます。利用可能なオプションは以下のとおりです。

キー            | 説明
-------------- | --------------------------------------------------------
input          | ソースコードの入っているディレクトリ
output         | 出力先ディレクトリ
exclude        | input 内で無視するファイルの glob パターン (文字列または配列)
taskFile       | タスクファイルのパス (タスクファイルについては次の節で説明します)
preset         | プリセットのパッケージ名、もしくは、プリセットを指定するオブジェクト
preset.name    | プリセットのパッケージ名
preset.options | プリセットのオプション
rules          | ソースコードをどのように変換するかを指定
dev            | 開発サーバー関連のオプション (詳細は [Dev options](#dev-options))

## ルール

_ルール_ によってソースコードをどのように変換するかを指定することができます。設定ファイルの `rules` はキーが変換するソースコードの拡張子と対応するオブジェクトです。例えば、`.js` ファイルを変換したいとき、`rules` オブジェクトに `js` プロパティを追加します。

`rules` オブジェクトのそれぞれの値はオブジェクト、または、文字列になります。文字列が指定されたときは `task` として扱われます。

キー       | 説明
--------- | -----------------------------------------------------------------------------------------------------------
task      | 変換として適用されるタスク
outputExt | 出力ファイルの拡張子。省略されたときは入力ファイルの拡張子と同じになる。
exclude   | このルールを適用しないファイルの glob パターンの文字列、もしくは、その配列
progeny   | ファイル形式に対応する [progeny の設定](https://github.com/es128/progeny#configuration)
options   | タスクのオプション (タスク関数の第2引数に渡されます)

## プリセット

Houl は npm で公開されている外部のプリセットを読み込めます。設定ファイルの `preset` フィールドを指定することで読み込めます。例えば、`houl-preset-foo` というプリセットを使いたいときは、そのパッケージ名を `preset` に書きます。

```json
{
  "input": "./src",
  "output": "./dist",
  "preset": "houl-preset-foo"
}
```

### プリセットオプションの指定

`preset` フィールドの `options` プロパティで任意のオプションの値をプリセットに渡すことができます。

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

指定されたオプションはプリセットの設定ファイルが関数の形式で定義されていれば、その中で使用できます。

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

### プリセット設定の拡張

特有の要件に対応するため、既存のプリセットのルールを拡張したい場合があるかもしれません。そのような場合は、対応するルールに追加のオプションを指定するだけで良いです。

例えば、プリセットの設定が次のようなときを考えます。

```js
{
  "rules": {
    "js": {
      "task": "script"
    }
  }
}
```

また、ユーザーの設定が以下の通りだとします。

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

上記は次の設定と同じ意味を持ちます。

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

プリセットをより柔軟に変更したいときは、`preset.modifyConfig` オプションを使えます。`modifyConfig` には第1引数に生のプリセットの設定オブジェクトが渡される関数を指定します。プリセットの設定をその関数内で変更したり、任意で新しい設定オブジェクトを返すことができます。

```js
module.exports = {
  input: './src',
  output: './dist',
  preset: {
    name: 'houl-preset-foo',
    modifyConfig: config => {
      // プリセット内の `foo` タスクを削除
      // タスクを削除するには `null` を代入するのではなく
      // `delete` 文を使う必要があります
      delete config.rules.foo
    }
  }
}
```

## 開発オプション

`dev` フィールドには開発サーバー関連のオプションを渡せます。`dev` フィールドは次のようなプロパティを含むオブジェクトを期待します。

キー      | 説明
-------- | ---
proxy    | [`node-http-proxy` のオプション](https://github.com/nodejitsu/node-http-proxy#options) 互換のプロキシ設定。
port     | 開発サーバーのポート番号。`--port` CLI オプションと同じ。
basePath | 開発サーバーのベースとなるパス。`--base-path` CLI オプションと同じ。

下記は `proxy` 設定の例です。

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

`proxy` オブジェクトのキーはどのパスに向けたリクエストをプロキシすべきかを表しています。上記の設定は開発サーバーへのリクエスト `/foo` を `http://foo.com/` にプロキシし、`/bar` を `https://bar.com/` にプロキシします。

## 設定例

設定ファイルの完全な例は以下のとおりです。

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
