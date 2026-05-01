import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/admin";
import { prisma } from "@/lib/db/prisma";

const ActionSchema = z.object({
  action: z.enum(["hide", "show", "dismiss", "delete"]),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Nicht erlaubt." }, { status: 403 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Ungültige Daten." }, { status: 400 });
  }
  const parsed = ActionSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Ungültige Aktion." }, { status: 400 });
  }

  const report = await prisma.report.findUnique({ where: { id: params.id } });
  if (!report) {
    return NextResponse.json({ error: "Meldung nicht gefunden." }, { status: 404 });
  }

  const action = parsed.data.action;

  await prisma.$transaction(async (tx) => {
    if (action === "hide") {
      if (report.postId) {
        await tx.post.update({
          where: { id: report.postId },
          data: { hidden: true },
        });
      }
      if (report.commentId) {
        await tx.comment.update({
          where: { id: report.commentId },
          data: { hidden: true },
        });
      }
    } else if (action === "show") {
      if (report.postId) {
        await tx.post.update({
          where: { id: report.postId },
          data: { hidden: false },
        });
      }
      if (report.commentId) {
        await tx.comment.update({
          where: { id: report.commentId },
          data: { hidden: false },
        });
      }
    } else if (action === "delete") {
      if (report.postId) {
        await tx.post.delete({ where: { id: report.postId } });
      }
      if (report.commentId) {
        await tx.comment.delete({ where: { id: report.commentId } });
      }
    }
    // Bei dismiss machen wir nichts am Inhalt selbst, nur am Report.

    // Alle offenen Reports auf denselben Inhalt schliessen
    const where: any = { resolvedAt: null };
    if (report.postId) where.postId = report.postId;
    if (report.commentId) where.commentId = report.commentId;
    await tx.report.updateMany({
      where,
      data: {
        resolvedAt: new Date(),
        resolvedAction: action,
      },
    });
  });

  return NextResponse.json({ ok: true });
}
