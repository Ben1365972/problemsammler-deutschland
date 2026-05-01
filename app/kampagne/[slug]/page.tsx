import Link from "next/link";
import { notFound } from "next/navigation";
import { getCampaign } from "@/lib/campaigns";
import { listPosts, countPosts } from "@/lib/db/posts";
import { PostCard } from "@/components/PostCard";
import { CampaignGalleryCard } from "@/components/CampaignGalleryCard";
import { CampaignFilters } from "@/components/CampaignFilters";
import { Pagination } from "@/components/Pagination";
import { slugify } from "@/lib/db/posts";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

type SearchParams = Record<string, string | undefined>;

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const c = getCampaign(params.slug);
  if (!c) return { title: "Kampagne nicht gefunden" };
  return {
    title: `${c.title} — Probleme in Deutschland`,
    description: c.description,
  };
}

export default async function CampaignPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: SearchParams;
}) {
  const campaign = getCampaign(params.slug);
  if (!campaign) notFound();

  const page = Math.max(1, parseInt(searchParams.page || "1", 10) || 1);
  const skip = (page - 1) * PAGE_SIZE;
  const sort = searchParams.sort || "neu";
  const q = searchParams.q;

  // Strukturierte Filter aus URL bauen (alle searchParams, die nicht system-keys sind)
  const SYSTEM_KEYS = new Set(["page", "sort", "q", "tab"]);
  const structuredFilters: Record<string, string> = {};
  let campaignStatus: string | undefined;
  for (const [k, v] of Object.entries(searchParams)) {
    if (SYSTEM_KEYS.has(k) || !v) continue;
    if (k === "campaignStatus") {
      campaignStatus = v;
    } else {
      structuredFilters[k] = v;
    }
  }

  // Kampagnen ohne Custom-Form: filtern via Tag-Slug
  let tagSlugsExtra: string[] | undefined;
  if (!campaign.fields) {
    tagSlugsExtra = [slugify(campaign.tag)];
  }

  const [posts, total] = await Promise.all([
    listPosts({
      campaignSlug: campaign.fields ? campaign.slug : undefined,
      tagSlugs: tagSlugsExtra,
      structuredFilters,
      campaignStatus,
      search: q,
      sort,
      take: PAGE_SIZE,
      skip,
    }),
    countPosts({
      campaignSlug: campaign.fields ? campaign.slug : undefined,
      tagSlugs: tagSlugsExtra,
      structuredFilters,
      campaignStatus,
      search: q,
      sort,
    }),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="space-y-6">
      <header className="rounded-2xl bg-gradient-to-br from-brand-50 to-white p-6">
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">
          Kampagne
        </p>
        <h1 className="mt-1 text-2xl font-bold text-stone-900">{campaign.title}</h1>
        <p className="mt-2 max-w-2xl text-stone-700">{campaign.description}</p>
        <div className="mt-4 flex flex-wrap gap-2">
          <Link href={`/kampagne/${campaign.slug}/neu`} className="btn-primary">
            + Beitrag zur Kampagne
          </Link>
          <Link href="/kampagnen" className="btn-secondary text-sm">
            Alle Kampagnen
          </Link>
        </div>
      </header>

      <CampaignFilters
        campaign={{
          filters: campaign.filters || [],
          sortOptions: campaign.sortOptions || [
            { value: "neu", label: "Neueste" },
            { value: "top", label: "Beliebteste" },
            { value: "diskutiert", label: "Diskutiert" },
          ],
        }}
        currentSort={sort}
        currentValues={{ ...structuredFilters, ...(campaignStatus ? { campaignStatus } : {}) }}
      />

      {q && (
        <p className="text-sm text-stone-600">
          {total === 0
            ? <>Keine Treffer für <strong>&bdquo;{q}&ldquo;</strong>.</>
            : <>{total} Treffer für <strong>&bdquo;{q}&ldquo;</strong>.</>}
        </p>
      )}

      {posts.length === 0 ? (
        <div className="card p-10 text-center text-stone-500">
          <p>Noch keine Beiträge in dieser Kampagne.</p>
          <Link href={`/kampagne/${campaign.slug}/neu`} className="btn-primary mt-4">
            Sei die/der Erste
          </Link>
        </div>
      ) : campaign.view === "gallery" ? (
        <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((p) => (
            <li key={p.id}>
              <CampaignGalleryCard
                post={{
                  id: p.id,
                  title: p.title,
                  imageUrl: p.imageUrl,
                  structuredData: (p as any).structuredData,
                  voteCount: p._count.votes,
                  commentCount: p._count.comments,
                }}
              />
            </li>
          ))}
        </ul>
      ) : (
        <ul className="grid gap-4">
          {posts.map((p) => (
            <li key={p.id}>
              <PostCard post={p as any} />
            </li>
          ))}
        </ul>
      )}

      {totalPages > 1 && (
        <div className="mt-4">
          <Pagination currentPage={page} totalPages={totalPages} />
        </div>
      )}
    </div>
  );
}
