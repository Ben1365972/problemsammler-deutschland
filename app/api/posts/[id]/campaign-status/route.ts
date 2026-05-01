import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getAdminSession } from "@/lib/admin";
import { prisma } from "@/lib/db/prisma";
import { getCampaign } from "@/lib/campaigns";

const Schema = z.object({ status: z.string().min(1).max(50) });

export async function POST(
  req: NextRequest,
  { params }: { params: { id: string } },
) {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Nur Admins." }, { status: 403 });
  }
  let body: unknown;
  try { body = await req.json(); } catch {
    return NextResponse.json({ error: "Ungültig." }, { status: 400 });
  }
  const parsed = Schema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Ungültig." }, { status: 400 });
  }
  const post = await prisma.post.findUnique({
    where: { id: params.id },
    select: { id: true, campaignSlug: true },
  });
  if (!post) {
    return NextResponse.json({ error: "Beitrag nicht gefunden." }, { status: 404 });
  }
  if (!post.campaignSlug) {
    return NextResponse.json(
      { error: "Beitrag gehört zu keiner Kampagne." },
      { status: 400 },
    );
  }
  const campaign = getCampaign(post.campaignSlug);
  if (!campaign?.statusOptions) {
    return NextResponse.json(
      { error: "Kampagne hat keinen Status-Workflow." },
      { status: 400 },
    );
  }
  if (!campaign.statusOptions.find((o) => o.value === parsed.data.status)) {
    return NextResponse.json(
      { error: "Status nicht erlaubt." },
      { status: 400 },
    );
  }
  await prisma.post.update({
    where: { id: post.id },
    data: { campaignStatus: parsed.data.status },
  });
  return NextResponse.json({ ok: true });
}
