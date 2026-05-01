import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { addComment } from "@/lib/db/posts";
import { getOrCreateAnonSession } from "@/lib/anon";
import { prisma } from "@/lib/db/prisma";

const CommentSchema = z.object({
  body: z.string().min(2).max(4000),
  anonName: z.string().max(40).optional(),
});

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const post = await prisma.post.findUnique({ where: { id: params.id } });
  if (!post) {
    return NextResponse.json({ error: "Beitrag nicht gefunden." }, { status: 404 });
  }
  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Ungültige Daten." }, { status: 400 });
  }
  const parsed = CommentSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ error: "Kommentar ungültig." }, { status: 400 });
  }
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;
  let anonSessionId: string | undefined;
  if (!userId) {
    const anon = await getOrCreateAnonSession();
    anonSessionId = anon.id;
  }
  const comment = await addComment({
    postId: params.id,
    body: parsed.data.body,
    authorId: userId,
    anonSessionId,
    anonName: parsed.data.anonName,
  });
  return NextResponse.json({ comment }, { status: 201 });
}
