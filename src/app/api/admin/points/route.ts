import { auth } from "@/auth";
import { db } from "@/db";
import { pointLogs, users, events } from "@/db/schema";
import { eq, desc } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET() {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const logs = await db
    .select({
      id: pointLogs.id,
      userId: pointLogs.userId,
      eventId: pointLogs.eventId,
      articleId: pointLogs.articleId,
      type: pointLogs.type,
      point: pointLogs.point,
      reason: pointLogs.reason,
      createdAt: pointLogs.createdAt,
      userName: users.displayName,
      eventTitle: events.title,
    })
    .from(pointLogs)
    .leftJoin(users, eq(pointLogs.userId, users.id))
    .leftJoin(events, eq(pointLogs.eventId, events.id))
    .orderBy(desc(pointLogs.createdAt));

  return NextResponse.json(logs);
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { userId, eventId, type, reason, point } = await req.json();

  if (type === "MANUAL" && !reason?.trim()) {
    return NextResponse.json(
      { error: "MANUAL種別は理由が必須です" },
      { status: 400 },
    );
  }

  await db.insert(pointLogs).values({
    userId,
    eventId,
    type,
    reason: reason?.trim() || null,
    point: Number(point) || 1,
  });

  return NextResponse.json({ success: true });
}
