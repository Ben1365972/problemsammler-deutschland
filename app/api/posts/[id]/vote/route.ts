import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { toggleVote } from "@/lib/db/posts";
import { getOrCreateAnonSession } from "@/lib/anon";
import { prisma } from "@/lib/db/prisma";

export async function POST(
  _req: NextRequest,
  { params }: { params: { id: string } },
) {
  const post = await prisma.post.findUnique({ where: { id: params.id } });
  if (!post) {
    return NextResponse.json({ error: "Beitrag nicht gefunden." }, { status: 404 });
  }
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;
  let anonSessionId: string | undefined;
  if (!userId) {
    const anon = await getOrCreateAnonSession();
    anonSessionId = anon.id;
  }
  const result = await toggleVote({
    postId: params.id,
    userId,
    anonSessionId,
  });
  const count = await prisma.vote.count({ where: { postId: params.id } });
  return NextResponse.json({ ...result, count });
}
