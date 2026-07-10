import {
  mysqlTable,
  varchar,
  timestamp,
  datetime,
  int,
  json,
  mysqlEnum,
  uniqueIndex,
  index,
} from "drizzle-orm/mysql-core";
import { relations } from "drizzle-orm";
import { createId } from "@paralleldrive/cuid2";

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
    role: mysqlEnum(["USER", "ADMIN"]).notNull().default("USER"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (t) => [uniqueIndex("users_discord_id_idx").on(t.discordId)],
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
    userId: varchar("user_id", { length: 191 }).notNull(),
    providerId: varchar("provider_id", { length: 191 }).notNull(),
    rssUrl: varchar("rss_url", { length: 512 }).notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    uniqueIndex("user_provider_accounts_user_provider_idx").on(
      t.userId,
      t.providerId,
    ),
  ],
);

export const events = mysqlTable("events", {
  id: varchar("id", { length: 191 })
    .primaryKey()
    .$defaultFn(() => createId()),
  title: varchar("title", { length: 191 }).notNull(),
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
    userId: varchar("user_id", { length: 191 }).notNull(),
    eventId: varchar("event_id", { length: 191 }).notNull(),
    providerId: varchar("provider_id", { length: 191 }).notNull(),
    title: varchar("title", { length: 512 }).notNull(),
    url: varchar("url", { length: 768 }).notNull(),
    contentType: mysqlEnum("content_type", ["ARTICLE", "SLIDE"]).notNull(),
    publishedAt: datetime("published_at").notNull(),
    isPresenter: int("is_presenter").notNull().default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().onUpdateNow().notNull(),
  },
  (t) => [
    uniqueIndex("articles_url_unique").on(t.url),
    uniqueIndex("articles_user_event_unique").on(t.userId, t.eventId),
    index("articles_event_id_idx").on(t.eventId),
    index("articles_published_at_idx").on(t.publishedAt),
    index("articles_provider_id_idx").on(t.providerId),
    index("articles_user_id_idx").on(t.userId),
  ],
);
export const pointLogs = mysqlTable(
  "point_logs",
  {
    id: varchar("id", { length: 191 })
      .primaryKey()
      .$defaultFn(() => createId()),
    userId: varchar("user_id", { length: 191 }).notNull(),
    eventId: varchar("event_id", { length: 191 }).notNull(),
    articleId: varchar("article_id", { length: 191 }),
    type: mysqlEnum(["ARTICLE", "PRESENTATION", "MANUAL"]).notNull(),
    point: int("point").notNull().default(1),
    reason: varchar("reason", { length: 512 }),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (t) => [
    index("point_logs_user_id_idx").on(t.userId),
    index("point_logs_event_id_idx").on(t.eventId),
  ],
);
// ─── Relations ───────────────────────────────────────────────────────────────
export const usersRelations = relations(users, ({ many }) => ({
  articles: many(articles),
  pointLogs: many(pointLogs),
  userProviderAccounts: many(userProviderAccounts),
}));
export const providersRelations = relations(providers, ({ many }) => ({
  articles: many(articles),
  userProviderAccounts: many(userProviderAccounts),
}));
export const userProviderAccountsRelations = relations(
  userProviderAccounts,
  ({ one }) => ({
    user: one(users, {
      fields: [userProviderAccounts.userId],
      references: [users.id],
    }),
    provider: one(providers, {
      fields: [userProviderAccounts.providerId],
      references: [providers.id],
    }),
  }),
);
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
