## 途中で調べた内容

pnpm dlxについて
zodなどのpnpm addはアプリ起動時に参照する依存関係をインストールするからaddでshadcnuiはコンポーネント生成する際にCLIツールを使うだけだからその時一回だけ実行するdlxを使用する。

components/featuresは自分で作ったcomponent置き場
components/uiはchadcn/uiが作成したコンポーネント置き場

https://catnose99.github.io/quiet-internet-api-docs/

## 今回ハマったポイントのメモ

### issue4にてデプロイ関連で詰まったとこ

Windowsでのシンボリックリンク → Developer Mode または 管理者実行 が必要
Node.js v20 → v22以上 が必要（Wrangler v4の要件）
Next.js 16 のデフォルト Turbopack → --webpack フラグで回避

### issue6でpnpmのCIで依存関係インストール時に詰まったとこ

| 問題                                                    | 原因                                                                                                                | 解決策                                                 |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------- | ------------------------------------------------------ |
| `ERR_PNPM_MINIMUM_RELEASE_AGE_VIOLATION`                | pnpm v11 のデフォルト24時間サプライチェーンポリシーに、`wrangler` の間接依存 `@aws-sdk/*`（公開直後）が引っかかった | `pnpm-workspace.yaml` に `minimumReleaseAge: 0` を追加 |
| `ERR_PNPM_IGNORED_BUILDS`                               | pnpm v11 で `onlyBuiltDependencies` / `ignoredBuiltDependencies` が廃止され `allowBuilds` に統合された              | `pnpm-workspace.yaml` を `allowBuilds` 形式に移行      |
| `[WARN] "pnpm" field in package.json is no longer read` | pnpm v11 で `package.json` の `pnpm` キーが廃止                                                                     | 設定を `pnpm-workspace.yaml` に移行                    |

## issue10

| Drizzle Adapter                                       | JWT方式                          |
| ----------------------------------------------------- | -------------------------------- |
| Auth.js指定のテーブルが必要                           | 今のテーブル設計をそのまま使える |
| `accounts`・`sessions`・`verificationTokens` が増える | 不要                             |
| Auth.jsの設計に合わせる必要がある                     | 自分の設計を優先できる           |
| 柔軟性はやや低い                                      | `signIn` で好きな処理を書ける    |
| セッションをDBで管理                                  | セッションはJWTで管理            |
