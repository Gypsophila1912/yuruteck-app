import { db } from "@/db";
import { sql } from "drizzle-orm";

export async function GET() {
  try {
    const result = await db.execute(sql`SELECT 1`);
    return Response.json({ status: "ok", result });
  } catch (e) {
    return Response.json(
      { status: "error", message: String(e) },
      { status: 500 },
    );
  }
}
