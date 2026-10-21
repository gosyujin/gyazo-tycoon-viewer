# CSP (meta) を追加し、インライン JS を `app.js` に分離する

## 背景

`https://note.gosyujin.com/` には複数の個人アプリが**同一オリジン**で同居し、`localStorage` を共有する
(scrapbox-tycoon の PAT、Gist 用 PAT、Dropbox のトークンなど)。このアプリは Dropbox のトークンを持つ。
**同居アプリのどれか 1 つで XSS や外部スクリプトの改ざんが起きると、全部のトークンが読み取られる。**
そのため「実行できるスクリプト」と「通信できる先」を CSP で絞り、外部から読む script には SRI を付ける。

## 変更

1. **インライン JS を `app.js` に分離**(約 900 行。中身は変更していない)。`<script src="app.js">` で読む。
   インライン script が残ると CSP の `script-src` に `'unsafe-inline'` が必要になり、XSS 対策にならないため。
   `sw.js` の `SHELL_FILES` と deploy workflow の `?v=<sha>` 付与にも `app.js` を追加した。
2. **CSP を meta で追加**(GitHub Pages はレスポンスヘッダを付けられないため meta)。

```
default-src 'none';
script-src 'self' 'unsafe-eval' https://cdn.jsdelivr.net/npm/heic2any@0.0.4/dist/heic2any.min.js;
style-src 'self' 'unsafe-inline';
img-src 'self' data: blob:;
connect-src 'self' blob: data: https://api.dropboxapi.com https://content.dropboxapi.com https://upload.gyazo.com https://api.imgur.com;
manifest-src 'self';
worker-src 'self' blob:;
base-uri 'none';
form-action 'none';
object-src 'none'
```

3. **heic2any(遅延読み込み)に SRI** (`integrity` sha384 + `crossorigin`)。jsdelivr の `heic2any@0.0.4` を固定。
   公式のハッシュ値はないため、バージョン固定の配布物を取得した値(初回信頼)。

## `'unsafe-eval'` が入っている理由と、外す方針

heic2any(libheif)は `eval` 系を使う。`'wasm-unsafe-eval'` では動かず、CSP 下で変換が無応答になることを検証で確認した
(`'unsafe-eval'` を入れると `ERR_LIBHEIF` まで到達する=動く)。インライン script・`on*=` は引き続き遮断される。

**外す方針**: HEIC の変換を gyazo-tycoon 本体(Mac、`sips`)側で行い、ビューアには JPEG 派生ファイルを出す。
そうすればこのアプリから heic2any と `'unsafe-eval'`、jsdelivr 依存、SRI がすべて不要になる(未着手)。

## 検証

- ローカルで deploy workflow の staging を再現して配信し、描画・`app.js` の読み込み・SRI・CSP(任意ドメインへの fetch・インライン script の遮断)を確認。
- 実機ではない確認の範囲: Dropbox 認可後の一覧・サムネ、暗号化画像、HEIC の実ファイル変換、Service Worker は**未確認**(technical-notes の「未検証」参照)。
