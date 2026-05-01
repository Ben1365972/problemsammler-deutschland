import { NextRequest } from "next/server";
import { listPosts, type SortMode } from "@/lib/db/posts";

const MAX_EXPORT = 1000;

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const format = (url.searchParams.get("format") || "json").toLowerCase();
  const categorySlug = url.searchParams.get("category") || undefined;
  const tagsParam = url.searchParams.get("tags") || "";
  const tagSlugs = tagsParam
    ? tagsParam.split(",").map((s) => s.trim()).filter(Boolean)
    : undefined;
  const search = url.searchParams.get("q") || undefined;
  const sort = (url.searchParams.get("sort") as SortMode) || "neu";

  const posts = await listPosts({
    categorySlug,
    tagSlugs,
    search,
    sort,
    take: MAX_EXPORT,
  });

  const records = posts.map((p) => ({
    id: p.id,
    title: p.title,
    body: p.body,
    category: p.category?.name || null,
    tags: p.tags.map((t) => t.tag.name),
    author: p.author?.name || p.anonName || "Anonym",
    votes: p._count.votes,
    comments: p._count.comments,
    imageUrl: p.imageUrl,
    createdAt: p.createdAt.toISOString(),
    url: `${url.origin}/post/${p.id}`,
  }));

  const filename = `probleme-export-${new Date().toISOString().slice(0, 10)}`;

  if (format === "csv") {
    const csv = toCsv(records);
    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}.csv"`,
        "Cache-Control": "no-store",
      },
    });
  }

  // default: JSON
  return new Response(JSON.stringify({ exportedAt: new Date().toISOString(), count: records.length, posts: records }, null, 2), {
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="${filename}.json"`,
      "Cache-Control": "no-store",
    },
  });
}

function toCsv(rows: Record<string, any>[]): string {
  if (rows.length === 0) return "id,title,body,category,tags,author,votes,comments,imageUrl,createdAt,url\n";
  const cols = ["id", "title", "body", "category", "tags", "author", "votes", "comments", "imageUrl", "createdAt", "url"];
  const escape = (val: any): string => {
    if (val === null || val === undefined) return "";
    const s = Array.isArray(val) ? val.join("; ") : String(val);
    if (/[",\n\r]/.test(s)) return `"${s.replace(/"/g, '""')}"`;
    return s;
  };
  const head = cols.join(",");
  const body = rows.map((r) => cols.map((c) => escape(r[c])).join(",")).join("\n");
  return "﻿" + head + "\n" + body + "\n"; // BOM für Excel-UTF-8
}
