import Link from "next/link";
import { listPosts } from "@/lib/db/posts";
import { listCategories, listAllTags } from "@/lib/db/meta";
import { PostCard } from "@/components/PostCard";
import { FilterSidebar } from "@/components/FilterSidebar";

export const dynamic = "force-dynamic";

type SearchParams = {
  category?: string;
  tags?: string;
  q?: string;
  sort?: "neu" | "top";
};

export default async function Home({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const { category, tags, q, sort } = searchParams;
  const tagSlugs = tags ? tags.split(",").filter(Boolean) : undefined;

  const [posts, categories, allTags] = await Promise.all([
    listPosts({ categorySlug: category, tagSlugs, search: q, sort }),
    listCategories(),
    listAllTags(),
  ]);

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

        {posts.length === 0 ? (
          <div className="card p-10 text-center text-stone-500">
            <p className="text-lg">Noch keine Beiträge gefunden.</p>
            <Link href="/neuer-beitrag" className="btn-primary mt-4">
              Schreibe den ersten Beitrag
            </Link>
          </div>
        ) : (
          <ul className="grid gap-4">
            {posts.map((p) => (
              <li key={p.id}>
                <PostCard post={p as any} />
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
