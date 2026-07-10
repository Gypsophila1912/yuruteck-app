import { connect } from "@tidbcloud/serverless";
import { drizzle } from "drizzle-orm/tidb-serverless";
import { providers } from "./schema";
import { config } from "dotenv";

config(); // .env を読み込む

const db = drizzle(connect({ url: process.env.DATABASE_URL! }));

async function main() {
  console.log("Seeding providers...");

  const existingProviders = await db.select().from(providers);
  const existingNames = new Set(existingProviders.map((p) => p.name));

  const providerNames = [
    "Qiita",
    "Zenn",
    "静かなインターネット",
    "個人ブログ",
    "その他",
  ];

  for (const name of providerNames) {
    if (!existingNames.has(name)) {
      await db.insert(providers).values({ name });
      console.log(`✅ Inserted provider: ${name}`);
    } else {
      console.log(`⏭️ Skipped existing provider: ${name}`);
    }
  }

  console.log("🎉 Seeding finished!");
  process.exit(0);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
