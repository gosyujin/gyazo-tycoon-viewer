# gyazo-tycoon-viewer

gyazo-tycoon の外出先用ビューア(静的ページ1枚)。GitHub Pages に置く。データ・鍵は含まない。

開くと App key の入力画面が出て、Dropbox で認可(読み取りのみ)した端末だけ画像を表示できる。
一覧データ(`/index/`)は本体側の `export_static.py` が Dropbox に書く。

## セットアップ

Redirect URI に、公開した Pages の URL(例 `https://<user>.github.io/gyazo-tycoon-viewer/`)を Dropbox App Console で登録すること。

## 機能(詳細は docs/features.md)
- Gyazo へのアップロード
- imgur への匿名アップロード
- 暗号化した画像(🔒)の復号・検索・表示
- 端末キャッシュと先読み(⬇️)

## ドキュメント
- [docs/features.md](docs/features.md) 機能の詳細 / [docs/technical-notes.md](docs/technical-notes.md) 注意点・制限
- [CHANGELOG.md](CHANGELOG.md) 変更履歴 / [CLAUDE.md](CLAUDE.md) Claude への指示
