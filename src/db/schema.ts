import { mysqlTable, varchar, timestamp } from "drizzle-orm/mysql-core";

export const test = mysqlTable("test", {
  id: varchar("id", { length: 191 }).primaryKey(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
