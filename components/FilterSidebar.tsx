"use client";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";

type Item = { slug: string; name: string; count: number };

export function FilterSidebar({
  categories,
  tags,
  activeCategory,
  activeTags,
  q,
  sort,
}: {
  categories: Item[];
  tags: Item[];
  activeCategory?: string;
  activeTags?: string[];
  q?: string;
  sort?: "neu" | "top";
}) {
  const router = useRouter();
  const params = useSearchParams();
  const [search, setSearch] = useState(q || "");

  function buildHref(next: Record<string, string | undefined>): string {
    const sp = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(next)) {
      if (!v) sp.delete(k);
      else sp.set(k, v);
    }
    const s = sp.toString();
    return s ? `/?${s}` : "/";
  }

  function toggleTag(slug: string) {
    const sp = new URLSearchParams(params.toString());
    const current = (sp.get("tags") || "").split(",").filter(Boolean);
    const idx = current.indexOf(slug);
    if (idx >= 0) current.splice(idx, 1);
    else current.push(slug);
    if (current.length) sp.set("tags", current.join(","));
    else sp.delete("tags");
    const s = sp.toString();
    router.push(s ? `/?${s}` : "/");
  }

  function submitSearch(e: React.FormEvent) {
    e.preventDefault();
    const sp = new URLSearchParams(params.toString());
    if (search.trim()) sp.set("q", search.trim());
    else sp.delete("q");
    const s = sp.toString();
    router.push(s ? `/?${s}` : "/");
  }

  const activeTagsSet = new Set(activeTags || []);

  return (
    <div className="space-y-5">
      <form onSubmit={submitSearch} className="card p-3">
        <label className="label">Suche</label>
        <div className="flex gap-2">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="input"
            placeholder="Stichwort …"
          />
          <button type="submit" className="btn-secondary">Suchen</button>
        </div>
      </form>

      <div className="card p-3">
        <h3 className="mb-2 text-sm font-semibold text-stone-700">Sortierung</h3>
        <div className="flex gap-2">
          <Link
            href={buildHref({ sort: undefined })}
            className={`btn-secondary text-xs ${!sort || sort === "neu" ? "ring-2 ring-brand-500" : ""}`}
          >
            Neueste
          </Link>
          <Link
            href={buildHref({ sort: "top" })}
            className={`btn-secondary text-xs ${sort === "top" ? "ring-2 ring-brand-500" : ""}`}
          >
            Beliebteste
          </Link>
        </div>
      </div>

      <div className="card p-3">
        <h3 className="mb-2 text-sm font-semibold text-stone-700">Kategorien</h3>
        <ul className="space-y-1 text-sm">
          <li>
            <Link
              href={buildHref({ category: undefined })}
              className={`block rounded px-2 py-1 hover:bg-stone-100 ${!activeCategory ? "bg-brand-50 font-medium text-brand-800" : ""}`}
            >
              Alle Kategorien
            </Link>
          </li>
          {categories.map((c) => (
            <li key={c.slug}>
              <Link
                href={buildHref({ category: c.slug })}
                className={`flex items-center justify-between rounded px-2 py-1 hover:bg-stone-100 ${activeCategory === c.slug ? "bg-brand-50 font-medium text-brand-800" : ""}`}
              >
                <span>{c.name}</span>
                <span className="text-xs text-stone-400">{c.count}</span>
              </Link>
            </li>
          ))}
        </ul>
      </div>

      <div className="card p-3">
        <h3 className="mb-2 text-sm font-semibold text-stone-700">Tags</h3>
        {tags.length === 0 ? (
          <p className="text-xs text-stone-400">Noch keine Tags vorhanden.</p>
        ) : (
          <div className="flex flex-wrap gap-1.5">
            {tags.map((t) => {
              const active = activeTagsSet.has(t.slug);
              return (
                <button
                  key={t.slug}
                  onClick={() => toggleTag(t.slug)}
                  className={`chip transition ${active ? "border-brand-400 bg-brand-100 text-brand-800" : ""}`}
                  type="button"
                >
                  #{t.name}
                  <span className="text-stone-400">{t.count}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
