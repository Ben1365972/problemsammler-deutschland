import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { listPosts, createPost } from "@/lib/db/posts";
import { getOrCreateAnonSession, checkAnonRateLimit } from "@/lib/anon";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const categorySlug = url.searchParams.get("category") || undefined;
  const tagsParam = url.searchParams.get("tags") || "";
  const tagSlugs = tagsParam
    ? tagsParam.split(",").map((s) => s.trim()).filter(Boolean)
    : undefined;
  const search = url.searchParams.get("q") || undefined;
  const sort = (url.searchParams.get("sort") as "neu" | "top") || "neu";

  const posts = await listPosts({ categorySlug, tagSlugs, search, sort });
  return NextResponse.json({ posts });
}

const CreatePostSchema = z.object({
  title: z.string().min(3, "Titel zu kurz").max(200),
  body: z.string().min(10, "Beschreibung zu kurz").max(10_000),
  category: z.string().max(80).optional(),
  tags: z.array(z.string().min(1).max(40)).max(10).default([]),
  anonName: z.string().max(40).optional(),
});

export async function POST(req: NextRequest) {
  let payload: unknown;
  try {
    payload = await req.json();
  } catch {
    return NextResponse.json({ error: "Ungültige JSON-Daten." }, { status: 400 });
  }
  const parsed = CreatePostSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues.map((i) => i.message).join(", ") },
      { status: 400 },
    );
  }
  const session = await getServerSession(authOptions);
  const userId = (session?.user as any)?.id as string | undefined;

  let anonSessionId: string | undefined;
  if (!userId) {
    const anon = await getOrCreateAnonSession();
    anonSessionId = anon.id;
    const rl = await checkAnonRateLimit(anon.id);
    if (!rl.ok) {
      return NextResponse.json({ error: rl.reason }, { status: 429 });
    }
  }

  const post = await createPost({
    title: parsed.data.title,
    body: parsed.data.body,
    categoryName: parsed.data.category,
    tagNames: parsed.data.tags,
    authorId: userId,
    anonSessionId,
    anonName: parsed.data.anonName,
  });
  return NextResponse.json({ post }, { status: 201 });
}
