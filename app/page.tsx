import Link from "next/link";
import { listPosts, countPosts, type SortMode } from "@/lib/db/posts";
import { listCategories, listAllTags } from "@/lib/db/meta";
import { PostCard } from "@/components/PostCard";
import { FilterSidebar } from "@/components/FilterSidebar";
import { Pagination } from "@/components/Pagination";

export const dynamic = "force-dynamic";

const PAGE_SIZE = 20;

type SearchParams = {
  category?: string;
  tags?: string;
  q?: string;
  sort?: SortMode;
  page?: string;
};

export default async function Home({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { category, tags, q, sort } = searchParams;
  const tagSlugs = tags ? tags.split(",").filter(Boolean) : undefined;
  const page = Math.max(1, parseInt(searchParams.page || "1", 10) || 1);
  const skip = (page - 1) * PAGE_SIZE;

  const [posts, total, categories, allTags] = await Promise.all([
    listPosts({
      categorySlug: category,
      tagSlugs,
      search: q,
      sort,
      take: PAGE_SIZE,
      skip,
    }),
    countPosts({ categorySlug: category, tagSlugs, search: q, sort }),
    listCategories(),
    listAllTags(),
  ]);
  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE));

  return (
    <div className="grid gap-6 md:grid-cols-[260px_1fr]">
      <aside className="md:sticky md:top-20 md:h-max">
        <FilterSidebar
          categories={categories.map((c) => ({
            slug: c.slug,
            name: c.name,
            count: c._count.posts,
          }))}
          tags={allTags.map((t) => ({
            slug: t.slug,
            name: t.name,
            count: t._count.posts,
          }))}
          activeCategory={category}
          activeTags={tagSlugs}
          q={q}
          sort={sort}
        />
      </aside>

      <section>
        <div className="mb-6 rounded-2xl bg-gradient-to-br from-brand-50 to-white p-6">
          <h1 className="text-2xl font-bold text-stone-900">
            Welche Probleme bewegen Deutschland?
          </h1>
          <p className="mt-2 text-stone-600">
            Beschreibe ein Problem, schlage eine Lösung vor, diskutiere mit anderen.
            Anonym oder mit Account &mdash; ganz wie du willst.
          </p>
        </div>

        {q && (
          <p className="mb-4 text-sm text-stone-600">
            {total === 0
              ? <>Keine Treffer für <strong>&bdquo;{q}&ldquo;</strong>.</>
              : <>{total} Treffer für <strong>&bdquo;{q}&ldquo;</strong>.</>}
          </p>
        )}

        {posts.length === 0 ? (
          <div className="card p-10 text-center text-stone-500">
            <p className="text-lg">
              {q || category || tagSlugs?.length
                ? "Keine Beiträge mit diesen Filtern."
                : "Noch keine Beiträge."}
            </p>
            <Link href="/neuer-beitrag" className="btn-primary mt-4">
              Schreibe den ersten Beitrag
            </Link>
          </div>
        ) : (
          <>
            <ul className="grid gap-4">
              {posts.map((p) => (
                <li key={p.id}>
                  <PostCard post={p as any} />
                </li>
              ))}
            </ul>
            {totalPages > 1 && (
              <div className="mt-8">
                <Pagination
                  currentPage={page}
                  totalPages={totalPages}
                />
              </div>
            )}
          </>
        )}
      </section>
    </div>
  );
}
