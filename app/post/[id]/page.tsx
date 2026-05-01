import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostById } from "@/lib/db/posts";
import { VoteButton } from "@/components/VoteButton";
import { CommentSection } from "@/components/CommentSection";

export const dynamic = "force-dynamic";

export default async function PostPage({ params }: { params: { id: string } }) {
  const post = await getPostById(params.id);
  if (!post) notFound();

  return (
    <div className="grid gap-6 md:grid-cols-[1fr_280px]">
      <article className="card p-6">
        <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500">
          {post.category && (
            <Link
              href={`/?category=${post.category.slug}`}
              className="chip-brand hover:bg-brand-200"
            >
              {post.category.name}
            </Link>
          )}
          <span>•</span>
          <span>{post.author?.name || post.anonName || "Anonym"}</span>
          <span>•</span>
          <span>{new Date(post.createdAt).toLocaleString("de-DE")}</span>
        </div>
        <h1 className="mt-3 text-2xl font-bold text-stone-900">{post.title}</h1>
        <div className="prose prose-stone mt-4 max-w-none whitespace-pre-wrap text-stone-800">
          {post.body}
        </div>
        {post.tags.length > 0 && (
          <div className="mt-5 flex flex-wrap gap-1.5">
            {post.tags.map(({ tag }) => (
              <Link
                key={tag.slug}
                href={`/?tags=${tag.slug}`}
                className="chip hover:border-brand-300"
              >
                #{tag.name}
              </Link>
            ))}
          </div>
        )}
        <div className="mt-6 flex items-center gap-4">
          <VoteButton postId={post.id} initialCount={post._count.votes} />
        </div>

        <hr className="my-8 border-stone-200" />

        <CommentSection
          postId={post.id}
          initialComments={post.comments.map((c) => ({
            id: c.id,
            body: c.body,
            authorName: c.author?.name || c.anonName || "Anonym",
            createdAt: c.createdAt.toISOString(),
          }))}
        />
      </article>

      <aside className="md:sticky md:top-20 md:h-max">
        <div className="card p-4">
          <h3 className="text-sm font-semibold text-stone-700">Über diesen Beitrag</h3>
          <p className="mt-2 text-xs text-stone-500">
            Du kannst mit ▲ zustimmen und Kommentare schreiben — anonym oder mit Account.
          </p>
          <Link href="/" className="btn-secondary mt-4 w-full">
            ← Zurück zur Liste
          </Link>
        </div>
      </aside>
    </div>
  );
}
