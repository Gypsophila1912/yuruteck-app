import { defineConfig } from "drizzle-kit";

// DATABASE_URL をパースして個別パラメータで渡す
// （drizzle-kit の mysql接続ではこちらの方がSSL設定が確実に効く）
const url = new URL(process.env.DATABASE_URL!);

export default defineConfig({
  schema: "./src/db/schema.ts",
  out: "./src/db/migrations",
  dialect: "mysql",
  dbCredentials: {
    host: url.hostname,
    port: Number(url.port) || 4000,
    user: url.username,
    password: decodeURIComponent(url.password),
    database: url.pathname.slice(1), // 先頭の "/" を除去
    ssl: {
      rejectUnauthorized: true,
    },
  },
});
