"use client";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

export function Pagination({
  currentPage,
  totalPages,
}: {
  currentPage: number;
  totalPages: number;
}) {
  const params = useSearchParams();

  function pageHref(p: number): string {
    const sp = new URLSearchParams(params.toString());
    if (p <= 1) sp.delete("page");
    else sp.set("page", String(p));
    const s = sp.toString();
    return s ? `/?${s}` : "/";
  }

  const pages: number[] = [];
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, currentPage + 2);
  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <nav
      aria-label="Seiten-Navigation"
      className="flex items-center justify-center gap-1 text-sm"
    >
      <Link
        href={pageHref(currentPage - 1)}
        aria-disabled={currentPage <= 1}
        className={`btn-secondary text-xs ${currentPage <= 1 ? "pointer-events-none opacity-40" : ""}`}
      >
        ← Zurück
      </Link>
      {start > 1 && (
        <>
          <Link href={pageHref(1)} className="btn-secondary text-xs">1</Link>
          {start > 2 && <span className="px-1 text-stone-400">…</span>}
        </>
      )}
      {pages.map((p) => (
        <Link
          key={p}
          href={pageHref(p)}
          className={`btn-secondary text-xs ${p === currentPage ? "ring-2 ring-brand-500" : ""}`}
          aria-current={p === currentPage ? "page" : undefined}
        >
          {p}
        </Link>
      ))}
      {end < totalPages && (
        <>
          {end < totalPages - 1 && <span className="px-1 text-stone-400">…</span>}
          <Link href={pageHref(totalPages)} className="btn-secondary text-xs">
            {totalPages}
          </Link>
        </>
      )}
      <Link
        href={pageHref(currentPage + 1)}
        aria-disabled={currentPage >= totalPages}
        className={`btn-secondary text-xs ${currentPage >= totalPages ? "pointer-events-none opacity-40" : ""}`}
      >
        Weiter →
      </Link>
    </nav>
  );
}
