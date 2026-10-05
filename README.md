# gyazo-tycoon-viewer

gyazo-tycoon の外出先用ビューア(静的ページ1枚)。GitHub Pages に置く。データ・鍵は含まない。

開くと App key の入力画面が出て、Dropbox で認可(読み取りのみ)した端末だけ画像を表示できる。
一覧データ(`/index/`)は本体側の `export_static.py` が Dropbox に書く。

Redirect URI に、公開した Pages の URL(例 `https://<user>.github.io/gyazo-tycoon-viewer/`)を Dropbox App Console で登録すること。
