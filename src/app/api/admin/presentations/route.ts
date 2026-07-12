import { auth } from "@/auth";
import { db } from "@/db";
import { articles, events, users } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const eventId = req.nextUrl.searchParams.get("eventId");
  if (!eventId) {
    return NextResponse.json({ error: "eventId is required" }, { status: 400 });
  }

  const [event] = await db
    .select()
    .from(events)
    .where(eq(events.id, eventId))
    .limit(1);
  if (!event) {
    return NextResponse.json({ error: "Event not found" }, { status: 404 });
  }

  const eventArticles = await db
    .select({
      id: articles.id,
      userId: articles.userId,
      title: articles.title,
      url: articles.url,
      userName: users.displayName,
    })
    .from(articles)
    .leftJoin(users, eq(articles.userId, users.id))
    .where(eq(articles.eventId, eventId));

  return NextResponse.json({
    articles: eventArticles,
    presentationOrderJson: event.presentationOrderJson ?? [],
  });
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { eventId, orderIds } = await req.json();

  await db
    .update(events)
    .set({ presentationOrderJson: orderIds })
    .where(eq(events.id, eventId));

  return NextResponse.json({ success: true });
}
