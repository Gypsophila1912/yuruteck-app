import { auth } from "@/auth";
import { db } from "@/db";
import { pointLogs } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextRequest, NextResponse } from "next/server";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;
  const { point, reason } = await req.json();

  await db
    .update(pointLogs)
    .set({ point: Number(point), reason: reason?.trim() || null })
    .where(eq(pointLogs.id, id));

  return NextResponse.json({ success: true });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (session?.user?.role !== "ADMIN") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const { id } = await params;

  await db.delete(pointLogs).where(eq(pointLogs.id, id));

  return NextResponse.json({ success: true });
}
