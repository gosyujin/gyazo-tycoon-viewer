# gyazo-tycoon-viewer

gyazo-tycoon の外出先用ビューア(静的ページ1枚)。GitHub Pages に置く。データ・鍵は含まない。

開くと App key の入力画面が出て、Dropbox で認可(読み取りのみ)した端末だけ画像を表示できる。
一覧データ(`/index/`)は本体側の `export_static.py` が Dropbox に書く。

Redirect URI に、公開した Pages の URL(例 `https://<user>.github.io/gyazo-tycoon-viewer/`)を Dropbox App Console で登録すること。

## imgur へのアップロード

拡大表示の下部(メモ欄から離した位置)にある「imgur にアップロード」で、表示中の画像を imgur に匿名アップロードし、`i.imgur.com` の URL をクリップボードにコピーする(gif 可、mp4 は非対応、gif 以外は 20MB まで)。

- 初回は ⚙ 設定の「imgur Client-ID」に、https://api.imgur.com/oauth2/addclient で登録した Anonymous 用アプリの Client-ID を入力する(この端末の localStorage にだけ保存。リポジトリには含まれない)。
- 応答の deletehash は画像ごとに localStorage に残り、拡大表示の「imgur から削除」で消せる。匿名アップロードは imgur 側に管理画面がないので、この端末以外からは消せない。
- 同じ画像を再度アップロードしても重複チェックはしない。
