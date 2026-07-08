# 週刊ゆるてっく 実装方針まとめ

最終更新: 2026-07-08
このドキュメントは、仕様書（PRD）・技術選定書をベースに、壁打ちを通じて確定した実装方針をまとめたものです。実装時はこのファイルを一次情報源としてください。

---

## 1. 技術スタック（最終版）

| カテゴリ            | 技術                                              | 備考                                                                                                            |
| ------------------- | ------------------------------------------------- | --------------------------------------------------------------------------------------------------------------- |
| Framework           | Next.js (App Router)                              |                                                                                                                 |
| Language            | TypeScript                                        |                                                                                                                 |
| UI                  | Tailwind CSS                                      |                                                                                                                 |
| Component           | shadcn/ui                                         |                                                                                                                 |
| Icons               | Lucide React                                      |                                                                                                                 |
| **ORM**             | **Drizzle ORM**                                   | ~~Prisma~~ から変更。TiDB serverless driverをORM本体が直接サポートしているため採用                              |
| DB                  | TiDB Cloud Starter（旧Serverless）                | MySQL互換、無料枠、クレカ不要。組織ごと最大5インスタンス、5GiB×2＋月5000万RU                                    |
| Auth                | Auth.js (Discord OAuth)                           |                                                                                                                 |
| Validation          | Zod                                               |                                                                                                                 |
| Form                | React Hook Form                                   |                                                                                                                 |
| Data Fetching       | TanStack Query                                    |                                                                                                                 |
| RSS                 | rss-parser                                        | オンデマンド取得のみ（定期ポーリングなし）                                                                      |
| Testing             | Vitest                                            |                                                                                                                 |
| Component Test      | React Testing Library                             |                                                                                                                 |
| ~~Prisma-fabbrica~~ | 自前シードスクリプト＋Faker                       | DrizzleにはPrisma-fabbrica相当がないため                                                                        |
| Lint/Format         | ESLint / Prettier / Lefthook                      |                                                                                                                 |
| CI/CD               | GitHub Actions                                    |                                                                                                                 |
| Date                | date-fns                                          |                                                                                                                 |
| **デプロイ**        | **Cloudflare Workers + `@opennextjs/cloudflare`** | ~~Cloudflare Pages~~ から確定。2025年12月以降CloudflareはNext.jsに対してPagesではなくWorkers+OpenNextを公式推奨 |
| Package Manager     | pnpm                                              |                                                                                                                 |
| Version Control     | GitHub                                            |                                                                                                                 |

### Vercelを採用しなかった理由（参考）

- 当初「クレカ不要」を理由にCloudflareを選んでいたが、実際はVercel Hobbyもクレカ不要・永久無料。この理由単体では差別化にならないと後から判明。
- 実際の判断材料：①VercelのHobby cronは1日1回まで＋発火時刻が最大59分ズレる精度の粗さ、②Hobbyプランは規約上「非商用限定」、③Cloudflare Workersの方がNext.js機能に依存しすぎない構成にできる。
- 最終的には「Cloudflareを使ってみたい」という意向を優先して確定。

---

## 2. インフラ構成の要点

### TiDB接続

- **ローカル/CI開発**：通常のTCP接続文字列（`mysql://`）でOK
- **本番（Cloudflare Workers）**：`drizzle-orm/tidb-serverless` + `@tidbcloud/serverless`（HTTP接続）を使用。TCP接続はWorkers環境で動作しないため必須
- 接続が30分以上アイドルだと切断されることがあるため、コネクション周りの設定に注意

### Cloudflare Cron Triggers（イベント自動作成）

- 毎週土曜 0:00 (JST) にEventレコードを自動作成
- **UTC変換に注意**：JST土曜0:00 = UTC金曜15:00。`wrangler.jsonc`に`"crons": ["0 15 * * 5"]`と設定
- 重複作成防止のため、Cronハンドラ内で「同じ週のEventが既に存在するか」をチェックする

### RSS取得方式

- **定期ポーリングは行わない**。記事投稿画面を開いたタイミングでオンデマンド取得する方式に統一
- これによりCronやスケジューラ関連の追加インフラが不要になっている
- RSSは技術ブログ界隈（Qiita/Zenn/静かなインターネット等）では現役の配信方式として機能しているため採用

---

## 3. DB設計（Drizzle スキーマ）

原則：Article（記事情報）とPointLog（ポイント履歴）は責務分離する。

```ts
// src/db/schema.ts
import { relations } from "drizzle-orm";
import {
  mysqlTable,
  varchar,
  datetime,
  json,
  int,
  mysqlEnum,
  timestamp,
  uniqueIndex,
  index,
} from "drizzle-orm/mysql-core";
import { createId } from "@paralleldrive/cuid2";

export const roleEnum = ["USER", "ADMIN"] as const;
export const contentTypeEnum = ["ARTICLE", "SLIDE"] as const;
export const pointTypeEnum = ["ARTICLE", "PRESENTATION", "MANUAL"] as const;

export const users = mysqlTable(
  "users",
  {
    id: varchar("id", { length: 191 })
      .primaryKey()
      .$defaultFn(() => createId()),
    discordId: varchar("discord_id", { length: 191 }).notNull(),
    username: varchar("username", { length: 191 }).notNull(),
    displayName: varchar("display_name", { length: 191 }).notNull(),
    avatarUrl: varchar("avatar_url", { length: 512 }),
    role: mysqlEnum("role", roleEnum).default("USER").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    discordIdUnique: uniqueIndex("users_discord_id_unique").on(table.discordId),
  }),
);

export const providers = mysqlTable("providers", {
  id: varchar("id", { length: 191 })
    .primaryKey()
    .$defaultFn(() => createId()),
  name: varchar("name", { length: 191 }).notNull(),
  iconUrl: varchar("icon_url", { length: 512 }),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userProviderAccounts = mysqlTable(
  "user_provider_accounts",
  {
    id: varchar("id", { length: 191 })
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: varchar("user_id", { length: 191 })
      .notNull()
      .references(() => users.id),
    providerId: varchar("provider_id", { length: 191 })
      .notNull()
      .references(() => providers.id),
    rssUrl: varchar("rss_url", { length: 512 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    userProviderUnique: uniqueIndex("upa_user_provider_unique").on(
      table.userId,
      table.providerId,
    ),
  }),
);

export const events = mysqlTable("events", {
  id: varchar("id", { length: 191 })
    .primaryKey()
    .$defaultFn(() => createId()),
  title: varchar("title", { length: 191 }).notNull(), // 例: 第15回
  startAt: datetime("start_at").notNull(),
  endAt: datetime("end_at").notNull(),
  presentationOrderJson: json("presentation_order_json").$type<string[]>(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const articles = mysqlTable(
  "articles",
  {
    id: varchar("id", { length: 191 })
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: varchar("user_id", { length: 191 })
      .notNull()
      .references(() => users.id),
    eventId: varchar("event_id", { length: 191 })
      .notNull()
      .references(() => events.id),
    providerId: varchar("provider_id", { length: 191 })
      .notNull()
      .references(() => providers.id),
    title: varchar("title", { length: 512 }).notNull(),
    url: varchar("url", { length: 1024 }).notNull(),
    contentType: mysqlEnum("content_type", contentTypeEnum).notNull(), // ARTICLE / SLIDE 両方ポイント対象
    publishedAt: datetime("published_at").notNull(),
    isPresenter: int("is_presenter").default(0).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (table) => ({
    urlUnique: uniqueIndex("articles_url_unique").on(table.url), // 自著限定の前提なのでグローバルunique
    userEventUnique: uniqueIndex("articles_user_event_unique").on(
      table.userId,
      table.eventId,
    ), // MVP: 1人1イベント1記事
    eventIdIdx: index("articles_event_id_idx").on(table.eventId),
    publishedAtIdx: index("articles_published_at_idx").on(table.publishedAt),
    providerIdIdx: index("articles_provider_id_idx").on(table.providerId),
    userIdIdx: index("articles_user_id_idx").on(table.userId),
  }),
);

export const pointLogs = mysqlTable(
  "point_logs",
  {
    id: varchar("id", { length: 191 })
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: varchar("user_id", { length: 191 })
      .notNull()
      .references(() => users.id),
    eventId: varchar("event_id", { length: 191 })
      .notNull()
      .references(() => events.id),
    articleId: varchar("article_id", { length: 191 }).references(
      () => articles.id,
    ), // MANUAL時はnull
    type: mysqlEnum("type", pointTypeEnum).notNull(),
    point: int("point").notNull().default(1),
    reason: varchar("reason", { length: 512 }), // MANUAL時のみ必須（アプリ側バリデーション）
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    userIdIdx: index("point_logs_user_id_idx").on(table.userId),
    eventIdIdx: index("point_logs_event_id_idx").on(table.eventId),
  }),
);

export const usersRelations = relations(users, ({ many }) => ({
  articles: many(articles),
  pointLogs: many(pointLogs),
  providerAccounts: many(userProviderAccounts),
}));
export const providersRelations = relations(providers, ({ many }) => ({
  articles: many(articles),
  providerAccounts: many(userProviderAccounts),
}));
export const eventsRelations = relations(events, ({ many }) => ({
  articles: many(articles),
  pointLogs: many(pointLogs),
}));
export const articlesRelations = relations(articles, ({ one, many }) => ({
  user: one(users, { fields: [articles.userId], references: [users.id] }),
  event: one(events, { fields: [articles.eventId], references: [events.id] }),
  provider: one(providers, {
    fields: [articles.providerId],
    references: [providers.id],
  }),
  pointLogs: many(pointLogs),
}));
export const pointLogsRelations = relations(pointLogs, ({ one }) => ({
  user: one(users, { fields: [pointLogs.userId], references: [users.id] }),
  event: one(events, { fields: [pointLogs.eventId], references: [events.id] }),
  article: one(articles, {
    fields: [pointLogs.articleId],
    references: [articles.id],
  }),
}));
```

### スキーマ上の確定事項

- `PointLog`に`articleId`（nullable）を追加。将来複数記事対応・記事削除時の追跡のため
- `Article.url`はグローバルunique。**「記事投稿は必ず自分が書いたアウトプット」という前提**（読んだ記事のシェアは対象外）のため成立
- `contentType`は`ARTICLE`/`SLIDE`の2種、**両方とも記事ポイント+1の対象**
- MVPでは`@@unique([userId, eventId])`相当（`articles_user_event_unique`）で1人1イベント1記事を強制。将来複数記事対応時はこのuniqueだけ外す
- `UserProviderAccount`は`[userId, providerId]`unique。個人ブログは運用ルールとして**1人1つまで**（サークル内の実態を考慮し、DB制約はそのまま活用）

---

## 4. 記事登録フロー

1. **手動URL登録**：OGP取得（`og:article:published_time`等）で公開日時を自動取得するのを基本とする
   - 取得成功 → 自動セット
   - 取得失敗 → 手入力にフォールバック（詰み状態を避ける）
2. **RSS連携**：オンデマンド取得（記事投稿画面を開いたタイミングでフィード取得、候補から選択登録）
   - RSS取得失敗時はエラーメッセージを表示し、手動URL登録への導線を出す
3. **イベント判定**：登録日時ではなく**公開日時**でイベントを判定する（後日登録OK）
4. **重複制御**：同一イベントに2件目を登録しようとした場合はUI上でエラーメッセージを表示（DB unique制約由来のエラーをユーザー向けメッセージに変換）

---

## 5. 発表管理

- 発表順の生成はランダム生成のみ実装。**部会当日の欠席等の調整はDiscord上で行う前提**とし、アプリ側に再生成・個別編集機能は作らない
- `isPresenter`の確定タイミングは、**発表ポイント付与ボタン押下と同時**
- `presentationOrderJson`は画面を閉じても保持されるため、リロード後も再度チェック→付与ボタンを押せば復旧できる

---

## 6. 権限管理

- 初回管理者は環境変数`INITIAL_ADMIN_DISCORD_ID`にDiscordIDを設定し、該当ユーザーの初回ログイン時に自動でロールを`ADMIN`にする方式
- Discordサーバーのロール連携（`guilds.members.read`等）は**MVPでは行わない**

---

## 7. 関連ドキュメント

- `ISSUES_BACKLOG.md`：Phase0〜9、全33件の実装Issue一覧
- 元PRD（アプリ仕様書 MVP）：PRD.md参照

---

## 8. MVP対象外（変更なし）

バッジ、実績、景品交換、ランキング、Discord募集管理、飛び入り発表追加（後日実装予定）、E2Eテスト
