import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { getPostById } from "@/lib/db/posts";
import { VoteButton } from "@/components/VoteButton";
import { CommentSection } from "@/components/CommentSection";
import { ReportButton } from "@/components/ReportButton";
import { ShareButtons } from "@/components/ShareButtons";

export const dynamic = "force-dynamic";

const SITE_URL =
  process.env.NEXTAUTH_URL || "https://problemsammler.benjaminbalde.com";

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const post = await getPostById(params.id);
  if (!post) {
    return { title: "Beitrag nicht gefunden" };
  }
  const description =
    post.body.slice(0, 200) + (post.body.length > 200 ? "…" : "");
  const url = `${SITE_URL}/post/${post.id}`;

  return {
    title: `${post.title} – Probleme in Deutschland`,
    description,
    alternates: { canonical: url },
    openGraph: {
      type: "article",
      url,
      title: post.title,
      description,
      siteName: "Probleme in Deutschland",
      locale: "de_DE",
      ...(post.imageUrl ? { images: [{ url: post.imageUrl }] } : {}),
      publishedTime: post.createdAt.toISOString(),
    },
    twitter: {
      card: post.imageUrl ? "summary_large_image" : "summary",
      title: post.title,
      description,
      ...(post.imageUrl ? { images: [post.imageUrl] } : {}),
    },
  };
}

export default async function PostPage({ params }: { params: { id: string } }) {
  const post = await getPostById(params.id);
  if (!post) notFound();

  const shareUrl = `${SITE_URL}/post/${post.id}`;

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
        {post.imageUrl && (
          <div className="mt-4 overflow-hidden rounded-lg border border-stone-200">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={post.imageUrl}
              alt=""
              className="max-h-[60vh] w-full object-contain bg-stone-50"
            />
          </div>
        )}
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
        <div className="mt-6 flex flex-wrap items-center gap-4">
          <VoteButton postId={post.id} initialCount={post._count.votes} />
          <ReportButton target={{ postId: post.id }} />
        </div>

        <div className="mt-6 border-t border-stone-200 pt-4">
          <ShareButtons url={shareUrl} title={post.title} />
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
