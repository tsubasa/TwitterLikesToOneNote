# TwitterLikesToOneNote

ツイッターのブックマークを取得して指定したアカウントのツイートをOneNoteへ保存するスクリプト

## 環境構築

### yarn install

```bash
$ yarn
```

### データベース作成

```bash
$ yarn typeorm migration:generate src/infrastructure/db/migrations/Init -d src/infrastructure/db/DataSource.ts
```

### 設定ファイル作成

```bash
$ cp config/default.json.example config/default.json
$ cp .env.example .env
```

### Twitter API のアクセストークン取得

1. [GetTwitterAccessTokenScript](GetTwitterAccessTokenScript) でアクセストークンを取得する
2. 取得したアクセストークンを `config/default.json` の `twitter: { ... }` にセットする

### Azure API のアクセストークン取得

1. [GetAzureAccessTokenScript](GetAzureAccessTokenScript) でアクセストークンを取得する
2. 取得したアクセストークンを `config/default.json` の `azure: { ... }` にセットする

## 使い方

```bash
$ yarn develop
```

でスクリプトを起動したあとに

```
[1] GetTweetsFromBookmark
[2] GetTweetMediaFromTweets
[3] GetOneNoteSectionId
[4] SaveToOneNote
[5] Exit
```

半角数字を入力してメニューを選択する

| NO | 説明 |
| ---- | ---- |
| 1 | config/default.json の twitter で設定したアカウントのブックマークを取得する
| 2 | [1] で取得したブックマークの画像や動画をダウンロードする
| 3 | OneNoteのセクションIDを取得する (config の onenote.sectionId が未設定の場合はデフォルト値をセット)
| 4 | OneNoteへ指定したツイッターアカウントのツイートをすべて保存する (画像は最大4MBまで)
| 5 | 終了する |
