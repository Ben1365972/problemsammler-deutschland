import Link from "next/link";

type Props = {
  post: {
    id: string;
    title: string;
    body: string;
    createdAt: string | Date;
    category: { name: string; slug: string } | null;
    tags: { tag: { name: string; slug: string } }[];
    _count: { votes: number; comments: number };
    author: { id: string; name: string | null } | null;
    anonName: string | null;
  };
};

function timeAgo(d: string | Date): string {
  const date = typeof d === "string" ? new Date(d) : d;
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  const intervals: [number, string, string][] = [
    [60 * 60 * 24 * 365, "Jahr", "Jahren"],
    [60 * 60 * 24 * 30, "Monat", "Monaten"],
    [60 * 60 * 24, "Tag", "Tagen"],
    [60 * 60, "Stunde", "Stunden"],
    [60, "Minute", "Minuten"],
  ];
  for (const [s, sing, plur] of intervals) {
    const value = Math.floor(seconds / s);
    if (value >= 1) {
      return `vor ${value} ${value === 1 ? sing : plur}`;
    }
  }
  return "gerade eben";
}

export function PostCard({ post }: Props) {
  const author = post.author?.name || post.anonName || "Anonym";
  return (
    <Link href={`/post/${post.id}`} className="block">
      <article className="card p-5 transition hover:border-brand-300 hover:shadow-md">
        <div className="flex flex-wrap items-center gap-2 text-xs text-stone-500">
          {post.category && (
            <span className="chip-brand">{post.category.name}</span>
          )}
          <span>•</span>
          <span>{author}</span>
          <span>•</span>
          <span>{timeAgo(post.createdAt)}</span>
        </div>
        <h2 className="mt-2 text-lg font-semibold leading-tight text-stone-900">
          {post.title}
        </h2>
        <p className="mt-2 line-clamp-3 text-sm text-stone-600">{post.body}</p>
        {post.tags.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {post.tags.map(({ tag }) => (
              <span key={tag.slug} className="chip">#{tag.name}</span>
            ))}
          </div>
        )}
        <div className="mt-4 flex items-center gap-4 text-sm text-stone-500">
          <span className="flex items-center gap-1">▲ {post._count.votes}</span>
          <span className="flex items-center gap-1">
            💬 {post._count.comments}
          </span>
        </div>
      </article>
    </Link>
  );
}
