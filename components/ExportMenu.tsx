"use client";
import { useSearchParams } from "next/navigation";

export function ExportMenu() {
  const params = useSearchParams();

  function buildUrl(format: "json" | "csv"): string {
    const sp = new URLSearchParams(params.toString());
    sp.delete("page");
    sp.set("format", format);
    return `/api/export?${sp.toString()}`;
  }

  function buildRssUrl(): string {
    const cat = params.get("category");
    return cat ? `/feed.xml?category=${cat}` : "/feed.xml";
  }

  return (
    <div className="card p-3 text-xs">
      <h3 className="mb-2 text-sm font-semibold text-stone-700">
        Aktuelle Auswahl
      </h3>
      <div className="flex flex-wrap gap-2">
        <a href={buildUrl("json")} className="btn-secondary text-xs" download>
          JSON
        </a>
        <a href={buildUrl("csv")} className="btn-secondary text-xs" download>
          CSV
        </a>
        <a href={buildRssUrl()} className="btn-secondary text-xs" target="_blank" rel="noopener">
          RSS
        </a>
      </div>
      <p className="mt-2 text-stone-400">
        max. 1000 Beiträge · Filter werden übernommen
      </p>
    </div>
  );
}
