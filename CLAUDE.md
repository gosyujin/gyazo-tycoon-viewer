# gyazo-tycoon-viewer

gyazo-tycoon の外出先用ビューア(静的ページ1枚、`index.html` + `crypto.js`)。GitHub Pages に置く。データ・鍵は含まない。概要は README.md、詳細は docs/ を参照。

## ドキュメント運用ルール
- 作業開始時は CLAUDE.md と README の概要だけ読む。docs/ は「触る前に読む」に従い、該当作業のときだけ読む。CHANGELOG は全文を読まず直近のエントリだけ見る。
- README に経緯・実装ログ・機能の詳細を書かない。機能を追加したら README には一行、詳細は docs/features.md に書く。
- 実装完了時は CHANGELOG に1〜3行で追記する。調査や判断に経緯がある場合は docs/decisions/ に書き、CHANGELOG からリンクする。
- 触ると壊れる箇所・変更禁止の理由は docs/technical-notes.md に書き、CLAUDE.md の「触る前に読む」に1行で要約する。
- 実機確認が必要で未確認の項目は technical-notes.md の「未検証」に書く。確認できたら削除し、CHANGELOG に「確認済み」と1行残す。
- README が150行、CLAUDE.md が200行を超えたら、追記せず分割を提案する。

## 触る前に読む
- 暗号化した画像(docs/features.md): 形式は gyazo-tycoon 本体の `seal.py` と一致させる(`crypto.js`: PBKDF2-SHA256 → AES-256-GCM)。復号した画像・サムネイルはキャッシュに保存せずメモリのみ。暗号化画像は imgur アップロード不可・先読みもしない。
- 秘密の扱い(docs/features.md): Gyazo トークン・imgur Client-ID・Dropbox の鍵は端末の localStorage / IndexedDB にだけ置き、リポジトリに含めない。
- imgur アップロード(docs/technical-notes.md): 匿名アップロードは imgur 側に管理画面がなく、deletehash を持つ端末以外からは消せない。重複チェックはしない。
- 端末キャッシュ(docs/technical-notes.md): iOS はタブのままだと7日触らないとサイトデータを消すことがある。ホーム画面に追加して使う。
