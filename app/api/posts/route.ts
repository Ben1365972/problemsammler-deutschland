import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { listPosts, createPost } from "@/lib/db/posts";
import { getOrCreateAnonSession, checkAnonRateLimit } from "@/lib/anon";
import { getCampaign, validateStructuredData } from "@/lib/campaigns";

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
  imageUrl: z.string().url().max(500).optional(),
  campaignSlug: z.string().max(60).optional(),
  structuredData: z.record(z.any()).optional(),
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

  // Kampagnen-spezifische Validierung der strukturierten Felder.
  let structuredData: Record<string, any> | undefined;
  let campaignTagNames: string[] = [];
  let categoryName = parsed.data.category;
  let campaignStatus: string | undefined;
  if (parsed.data.campaignSlug) {
    const campaign = getCampaign(parsed.data.campaignSlug);
    if (!campaign) {
      return NextResponse.json(
        { error: "Unbekannte Kampagne." },
        { status: 400 },
      );
    }
    if (campaign.fields) {
      // Bild-Pflicht: imageUrl muss als image-feld gesetzt sein
      const validation = validateStructuredData(
        campaign,
        parsed.data.structuredData || {},
      );
      if (!validation.ok) {
        return NextResponse.json({ error: validation.error }, { status: 400 });
      }
      structuredData = validation.data;
      // Falls die Kampagne ein image-Feld als Pflicht hat, muss imageUrl gesetzt sein.
      const imgField = campaign.fields.find((f) => f.type === "image");
      if (imgField?.required && !parsed.data.imageUrl) {
        return NextResponse.json(
          { error: `Pflichtfeld fehlt: ${imgField.label}` },
          { status: 400 },
        );
      }
    }
    campaignTagNames = [campaign.tag];
    if (!categoryName && campaign.category) categoryName = campaign.category;
    if (campaign.statusOptions && campaign.statusOptions.length > 0) {
      campaignStatus = campaign.statusOptions[0].value; // Default: erster Status
    }
  }

  const allTags = Array.from(
    new Set([...(parsed.data.tags || []), ...campaignTagNames]),
  );

  const post = await createPost({
    title: parsed.data.title,
    body: parsed.data.body,
    categoryName,
    tagNames: allTags,
    authorId: userId,
    anonSessionId,
    anonName: parsed.data.anonName,
    imageUrl: parsed.data.imageUrl,
    campaignSlug: parsed.data.campaignSlug,
    structuredData,
    campaignStatus,
  });
  return NextResponse.json({ post }, { status: 201 });
}
