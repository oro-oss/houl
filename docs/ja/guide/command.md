# コマンド

Houl は `build`、`dev`、`watch` の3つのコマンドを提供しています。

```bash
$ houl build
$ houl dev
$ houl watch
```

`houl build` は設定ファイルに指定された通りに、すべてのソースコードを出力先ディレクトリに変換、および、コピーします。

`houl dev` は開発サーバー ([BrowserSync](https://browsersync.io/) を使用してます) を立てます。開発サーバーはリクエストを受け取ると、対応するソースファイルを動的に変換します。これにより、静的サイトが大きくなるに連れ、ビルド時間が長くなるようなパフォーマンスの問題は発生しなくなっています。

`houl watch` は `houl dev` と似たコマンドですが、開発サーバーは立てません。`watch` コマンドはファイルの変更をウォッチし、変更があったもののみをビルドします。Ruby on Rails のアセットパイプラインのような、出力ファイルに何らかの追加処理を行いたいケースで使えるでしょう。

## `--config` (`-c`)

Houl は自動的に `houl.config.js`または `houl.config.json` を設定ファイルとして読み込みますが、`--config` (短縮記法 `-c`) オプションを使うことで、明示的に設定ファイルを指定できます。

```bash
$ houl build -c config.js
$ houl dev -c config.js
$ houl watch -c config.js
```

## `--dot`

もしドットファイル (例えば `.htaccess`) をビルドに含めたいときは、`--dot` フラグを `build` または `watch` コマンドに付与します。

```bash
$ houl build --dot
$ houl watch --dot
```

## `--production`

`--production` フラグを `build` コマンドに付与することで本番モードを有効にすることができます。これは `process.env.NODE_ENV` を `'production'` に設定します。

```bash
$ houl build --production
```

## `--cache`

前のビルドから変更されたファイルのみをビルドしたいケースについて考えます。Houl では `--cache` オプションを指定することでそのような機能を使うことができます。

```bash
$ houl build --cache .houlcache
$ houl watch --cache .houlcache
```

`--cache` で指定されたファイル名 (上記では `.houlcache`) は前のビルドからアップデートされたファイルをチェックするためのキャッシュファイルです。キャッシュを正しく動作させるために、毎回のビルドで同じファイルを指定する必要があります。

ファイルの更新を厳密に判定するためにファイルの依存関係の走査も行います。ほとんどのファイル形式は [progeny](https://github.com/es128/progeny) によってデフォルトでサポートされており、依存関係を処理することができます。もし新たなファイル形式を使いたかったり、progeny の設定をプロジェクトに合わせて変えたい場合は、progeny の設定をそれぞれのルールに適用することもできます (_ルール_ については後の節で説明します)。

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

## `--filter`

例えば、ビルド後の CSS ファイルを使ってスタイルガイドを作成したいときなど、一部のソースコードのみをビルドしたい場合があります。そのような場合は `--filter` オプションに glob パターンを渡すことで、ビルド対象のファイルを指定することができます。

```bash
$ houl build --filter **/*.scss
```

## `--port` (`-p`)

開発サーバーが開くポートを指定したい場合は `--port` (短縮記法 `-p`) で指定できます。

```bash
$ houl dev -p 50000
```

## `--base-path`

開発サーバーで Web サイトの一部のディレクトリを配信したい場合があります。例えば、次のようなフォルダ構造を考えます。

```
- src
  |- index.html
  |- js/
  |- css/
  |- img/
  |- ...
```

`src/index.html` に対して `http://localhost:8080/sub/index.html` という URL でアクセスしたい場合、`--base-path` オプションを使えます。

```bash
$ houl dev --base-path sub
```
