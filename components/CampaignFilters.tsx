"use client";
import Link from "next/link";
import { useSearchParams, usePathname } from "next/navigation";

type Option = { value: string; label: string };
type Filter = { field: string; label: string; options: Option[] };
type Sort = { value: string; label: string };

export function CampaignFilters({
  campaign,
  currentSort,
  currentValues,
}: {
  campaign: { filters: Filter[]; sortOptions: Sort[] };
  currentSort: string;
  currentValues: Record<string, string>;
}) {
  const params = useSearchParams();
  const pathname = usePathname();

  function buildHref(updates: Record<string, string | undefined>): string {
    const sp = new URLSearchParams(params.toString());
    for (const [k, v] of Object.entries(updates)) {
      if (!v) sp.delete(k);
      else sp.set(k, v);
    }
    sp.delete("page");
    const s = sp.toString();
    return s ? `${pathname}?${s}` : pathname;
  }

  if (campaign.filters.length === 0 && campaign.sortOptions.length <= 1) {
    return null;
  }

  return (
    <div className="card flex flex-wrap items-center gap-x-4 gap-y-3 p-3 text-xs">
      {campaign.sortOptions.length > 1 && (
        <div className="flex flex-wrap items-center gap-1">
          <span className="text-stone-500">Sortierung:</span>
          {campaign.sortOptions.map((s) => (
            <Link
              key={s.value}
              href={buildHref({ sort: s.value === "neu" ? undefined : s.value })}
              className={`btn-secondary text-xs ${
                currentSort === s.value || (s.value === "neu" && currentSort === "neu")
                  ? "ring-2 ring-brand-500"
                  : ""
              }`}
            >
              {s.label}
            </Link>
          ))}
        </div>
      )}

      {campaign.filters.map((f) => (
        <div key={f.field} className="flex flex-wrap items-center gap-1">
          <span className="text-stone-500">{f.label}:</span>
          <Link
            href={buildHref({ [f.field]: undefined })}
            className={`btn-secondary text-xs ${!currentValues[f.field] ? "ring-2 ring-brand-500" : ""}`}
          >
            Alle
          </Link>
          {f.options.map((o) => (
            <Link
              key={o.value}
              href={buildHref({ [f.field]: o.value })}
              className={`btn-secondary text-xs ${currentValues[f.field] === o.value ? "ring-2 ring-brand-500" : ""}`}
            >
              {o.label}
            </Link>
          ))}
        </div>
      ))}
    </div>
  );
}
