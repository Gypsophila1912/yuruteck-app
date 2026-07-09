import { drizzle } from "drizzle-orm/tidb-serverless";
import { connect } from "@tidbcloud/serverless";
import * as schema from "./schema";

export const db = drizzle(connect({ url: process.env.DATABASE_URL! }), {
  schema,
});
