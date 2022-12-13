# GET Twitter Access Token Script

## Usage

1. `.env.example` をコピーして `.env` を作成する
2. [Twitter Developers](https://developer.twitter.com/) にログインする
3. [アプリの登録](https://developer.twitter.com/en/portal/projects-and-apps) からアプリを作成する
4. アプリ詳細から「User authentication settings」の Edit をクリックする
5. アプリのパーミッション設定をする
   1. App permissions は `Read` でよい
   2. Type of App は `Web App` でよい
   3. App info の Callback URI に `http://localhost:3000/callback` をセットする
   4. 必須事項をすべて入力して Save する
6. Keys and tokens タブを開く
7. OAuth 2.0 Client ID and Client Secret からクライアントシークレットを作成する
   - 生成された ID と Secret を `.env` ファイルの `TWITTER_CLIENT_ID` と `TWITTER_CLIENT_SECRET` にコピペする
8. 許可したスコープを `.env` の SCOPES に入力する
   - 例) `TWITTER_SCOPES=offline.access,tweet.read`
9. `$ yarn` で環境構築
10. `$ yarn develop` でアプリを起動しコンソールに表示された認証URLをクリックして開く
11. Twitterの認証ページへリダイレクトされるのでログインして認証を許可する
12. `dist` に `Credential.json` が生成されている
