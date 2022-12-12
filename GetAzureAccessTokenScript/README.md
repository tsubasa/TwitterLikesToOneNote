# GET Azure Access Token Script

## Usage

1. [Microsoft Azure](https://portal.azure.com/) にログインする
2. [アプリの登録](https://aka.ms/AppRegistrations/?referrer=https%3A%2F%2Fdev.onedrive.com) からアプリを作成する
   1. アプリ名は何でもよい
   2. サポートされているアカウントの種類を「任意の組織ディレクトリ内のアカウントと個人のMicrosoftアカウント」を選択する
   3. リダイレクトURIに「http://localhost:3000」を入力する
   4. 登録を完了する
3. アプリのダッシュボードを開きサイドメニューから「証明書とシークレット」をクリック
4. 新しいシークレットクライントを作成するをクリック
   1. 説明は何でもよい
   2. 有効期限は何でも良い
   3. 作成を完了する
5. サイドメニューから「APIのアクセス許可」をクリック
6. Microsoft Graphをクリックする
   - 利用したいサービスのスコープにチェックを入れて登録する
   - 例) OneNote であれば `Notes.Create` や `Notes.Read` など
   - アクセス許可の更新で登録を完了する
7. 許可したスコープを `src/index.ts` の `SCOPES=[]` に入力する
   - 例) `SCOPES=['User.Read', 'Notes.Create']`
8. `.env.example` をコピーして `.env` を作成する
9. `.env` の項目を埋める
10. `$ yarn` で環境構築
11. `$ yarn develop` でアプリを起動しコンソールに表示された認証URLをクリックして開く
12. Microsoftの認証ページへリダイレクトされるのでログインして認証を許可する
13. `dist` に `Credential.json` が生成されている
