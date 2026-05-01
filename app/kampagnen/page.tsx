import Link from "next/link";
import { CAMPAIGNS } from "@/lib/campaigns";
import { prisma } from "@/lib/db/prisma";

export const dynamic = "force-dynamic";

export const metadata = {
  title: "Kampagnen — Probleme in Deutschland",
};

export default async function CampaignsOverviewPage() {
  const counts = await prisma.post.groupBy({
    by: ["campaignSlug"],
    where: { hidden: false, campaignSlug: { not: null } },
    _count: { _all: true },
  });
  const countMap = new Map(
    counts.map((c) => [c.campaignSlug as string, c._count._all]),
  );

  const highImpact = CAMPAIGNS.filter((c) => c.isHighImpact);
  const others = CAMPAIGNS.filter((c) => !c.isHighImpact);

  return (
    <div className="space-y-10">
      <header>
        <h1 className="text-3xl font-bold text-stone-900">Kampagnen</h1>
        <p className="mt-2 max-w-2xl text-stone-600">
          Statt nur „ein Problem melden" — gezielte Kampagnen, die in konkrete
          Artefakte münden: Streichgesetz-Vorlagen, ausgearbeitete Gesetzes-Entwürfe,
          Listen für Behörden.
        </p>
      </header>

      <section>
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-stone-500">
          Hauptkampagnen
        </h2>
        <div className="grid gap-4 md:grid-cols-3">
          {highImpact.map((c) => {
            const count = countMap.get(c.slug) || 0;
            return (
              <Link
                key={c.slug}
                href={`/kampagne/${c.slug}`}
                className="card block p-5 transition hover:border-brand-300 hover:shadow-md"
              >
                <h3 className="text-lg font-semibold text-stone-900">{c.title}</h3>
                <p className="mt-1 text-sm text-brand-700">{c.tagline}</p>
                <p className="mt-3 line-clamp-3 text-sm text-stone-600">
                  {c.description}
                </p>
                <div className="mt-4 flex items-center justify-between text-xs text-stone-500">
                  <span>{count} Beiträge</span>
                  <span className="chip-brand">Mit Template</span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>

      <section>
        <h2 className="mb-4 text-xs font-semibold uppercase tracking-wide text-stone-500">
          Weitere Themen
        </h2>
        <div className="grid gap-3 md:grid-cols-2">
          {others.map((c) => {
            const count = countMap.get(c.slug) || 0;
            return (
              <Link
                key={c.slug}
                href={`/kampagne/${c.slug}`}
                className="card block p-4 transition hover:border-brand-300"
              >
                <h3 className="text-base font-semibold text-stone-900">
                  {c.title}
                </h3>
                <p className="text-xs text-brand-700">{c.tagline}</p>
                <p className="mt-2 line-clamp-2 text-sm text-stone-600">
                  {c.description}
                </p>
                <p className="mt-2 text-xs text-stone-500">{count} Beiträge</p>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
