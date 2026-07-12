import { auth } from "@/auth";
import { db } from "@/db";
import { events } from "@/db/schema";
import { desc } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  // 管理者チェック
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { title, startAt, endAt, isRegular } = await req.json();

  // タイトルが空なら自動採番
  let finalTitle = title?.trim();
  if (!finalTitle) {
    const latestEvents = await db
      .select()
      .from(events)
      .orderBy(desc(events.createdAt))
      .limit(1);

    let nextNumber = 1;
    if (latestEvents.length > 0) {
      const match = latestEvents[0].title.match(/第(\d+)回/);
      if (match) nextNumber = parseInt(match[1], 10) + 1;
    }
    finalTitle = `第${nextNumber}回`;
  }

  await db.insert(events).values({
    title: finalTitle,
    startAt: new Date(startAt),
    endAt: new Date(endAt),
    isRegular: isRegular ? 1 : 0,
  });

  return NextResponse.json({ success: true, title: finalTitle, isRegular });
}
