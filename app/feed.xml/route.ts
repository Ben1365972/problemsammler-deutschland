import { NextRequest } from "next/server";
import { listPosts } from "@/lib/db/posts";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const categorySlug = url.searchParams.get("category") || undefined;
  const origin = url.origin;
  const posts = await listPosts({
    categorySlug,
    sort: "neu",
    take: 50,
  });

  const channelTitle = categorySlug
    ? `Probleme in Deutschland — ${categorySlug}`
    : "Probleme in Deutschland";
  const channelLink = categorySlug ? `${origin}/?category=${categorySlug}` : origin;

  const items = posts
    .map((p) => {
      const title = escapeXml(p.title);
      const link = `${origin}/post/${p.id}`;
      const description = escapeXml(p.body.slice(0, 600) + (p.body.length > 600 ? "…" : ""));
      const author = p.author?.name || p.anonName || "Anonym";
      const cats = [p.category?.name, ...p.tags.map((t) => t.tag.name)]
        .filter(Boolean)
        .map((c) => `<category>${escapeXml(c as string)}</category>`)
        .join("");
      return `
    <item>
      <title>${title}</title>
      <link>${link}</link>
      <guid isPermaLink="true">${link}</guid>
      <pubDate>${p.createdAt.toUTCString()}</pubDate>
      <author>noreply@benjaminbalde.com (${escapeXml(author)})</author>
      ${cats}
      <description>${description}</description>
    </item>`;
    })
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>${escapeXml(channelTitle)}</title>
    <link>${channelLink}</link>
    <description>Bürger melden Probleme aus Deutschland</description>
    <language>de-DE</language>
    <atom:link href="${origin}/feed.xml${categorySlug ? `?category=${categorySlug}` : ""}" rel="self" type="application/rss+xml" />
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=300, s-maxage=300",
    },
  });
}

function escapeXml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}
