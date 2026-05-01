import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/db/prisma";
import { getOrCreateAnonSession } from "@/lib/anon";

const ReportSchema = z
  .object({
    postId: z.string().cuid().optional(),
    commentId: z.string().cuid().optional(),
    reason: z.enum(["spam", "abuse", "off_topic", "other"]),
    detail: z.string().max(500).optional(),
  })
  .refine((d) => Boolean(d.postId) !== Boolean(d.commentId), {
    message: "Genau eines von postId oder commentId muss gesetzt sein.",
  });

export async function POST(req: NextRequest) {
  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Ungültige Daten." }, { status: 400 });
  }
  const parsed = ReportSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues.map((i) => i.message).join(", ") },
      { status: 400 },
    );
  }

  // Existenz prüfen
  if (parsed.data.postId) {
    const exists = await prisma.post.findUnique({
      where: { id: parsed.data.postId },
      select: { id: true },
    });
    if (!exists) {
      return NextResponse.json({ error: "Beitrag nicht gefunden." }, { status: 404 });
    }
  }
  if (parsed.data.commentId) {
    const exists = await prisma.comment.findUnique({
      where: { id: parsed.data.commentId },
      select: { id: true },
    });
    if (!exists) {
      return NextResponse.json({ error: "Kommentar nicht gefunden." }, { status: 404 });
    }
  }

  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;
  let anonSessionId: string | undefined;
  if (!userId) {
    const anon = await getOrCreateAnonSession();
    anonSessionId = anon.id;
  }

  // Doppel-Reports vermeiden: gleicher Reporter + gleicher Inhalt + offen
  const existing = await prisma.report.findFirst({
    where: {
      postId: parsed.data.postId,
      commentId: parsed.data.commentId,
      resolvedAt: null,
      ...(userId
        ? { reporterUserId: userId }
        : { reporterAnonSessionId: anonSessionId }),
    },
  });
  if (existing) {
    return NextResponse.json(
      { ok: true, dedup: true, message: "Bereits gemeldet, danke." },
      { status: 200 },
    );
  }

  await prisma.report.create({
    data: {
      postId: parsed.data.postId,
      commentId: parsed.data.commentId,
      reason: parsed.data.reason,
      detail: parsed.data.detail,
      reporterUserId: userId,
      reporterAnonSessionId: userId ? null : anonSessionId,
    },
  });

  return NextResponse.json({ ok: true }, { status: 201 });
}
