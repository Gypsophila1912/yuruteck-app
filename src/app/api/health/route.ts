import { db } from "@/db";
import { test } from "@/db/schema";

export async function GET() {
  try {
    const rows = await db.select().from(test).limit(1);
    return Response.json({ status: "ok", rows });
  } catch (e) {
    return Response.json(
      { status: "error", message: String(e) },
      { status: 500 },
    );
  }
}
