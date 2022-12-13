# GET Azure Access Token Script

## Usage

1. `.env.example` をコピーして `.env` を作成する
2. [Microsoft Azure](https://portal.azure.com/) にログインする
3. [アプリの登録](https://aka.ms/AppRegistrations/?referrer=https%3A%2F%2Fdev.onedrive.com) からアプリを作成する
   1. アプリ名は何でもよい
   2. サポートされているアカウントの種類を「任意の組織ディレクトリ内のアカウントと個人のMicrosoftアカウント」を選択する
   3. リダイレクトURIに「http://localhost:3000」を入力する
   4. 登録を完了する
   5. ダッシュボードにあるアプリケーションID(クライアントID)をコピーして `.env` の `MS_CLIENT_ID=` にコピペする
4. アプリのダッシュボードを開きサイドメニューから「証明書とシークレット」をクリック
5. 新しいシークレットクライントを作成するをクリック
   1. 説明は何でもよい
   2. 有効期限は何でも良い
   3. 作成を完了する
   4. 生成されたシークレットキーを `.env` の `MS_CLIENT_SECRET=` にコピペする
6. サイドメニューから「APIのアクセス許可」をクリック
7. Microsoft Graphをクリックする
   - 利用したいサービスのスコープにチェックを入れて登録する
   - 例) OneNote であれば `Notes.Create` や `Notes.Read` など
   - アクセス許可の更新で登録を完了する
8. 許可したスコープを `.env` の `MS_SCOPES=` に入力する
   - 例) `MS_SCOPES=User.Read,Notes.Create`
9. `$ yarn` で環境構築
10. `$ yarn develop` でアプリを起動しコンソールに表示された認証URLをクリックして開く
11. Microsoftの認証ページへリダイレクトされるのでログインして認証を許可する
12. `dist` に `Credential.json` が生成されている
