## 途中で調べた内容

pnpm dlxについて
zodなどのpnpm addはアプリ起動時に参照する依存関係をインストールするからaddでshadcnuiはコンポーネント生成する際にCLIツールを使うだけだからその時一回だけ実行するdlxを使用する。

components/featuresは自分で作ったcomponent置き場
components/uiはchadcn/uiが作成したコンポーネント置き場

https://catnose99.github.io/quiet-internet-api-docs/

## 今回ハマったポイントのメモ

issue4にてデプロイ関連で詰まったとこ
Windowsでのシンボリックリンク → Developer Mode または 管理者実行 が必要
Node.js v20 → v22以上 が必要（Wrangler v4の要件）
Next.js 16 のデフォルト Turbopack → --webpack フラグで回避
