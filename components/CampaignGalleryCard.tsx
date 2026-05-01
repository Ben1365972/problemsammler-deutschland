import Link from "next/link";

type Props = {
  post: {
    id: string;
    title: string;
    imageUrl: string | null;
    structuredData: any;
    voteCount: number;
    commentCount: number;
  };
};

export function CampaignGalleryCard({ post }: Props) {
  const sd = post.structuredData || {};
  const behoerde = sd.behoerde || null;
  const seiten = sd.anzahl_seiten || null;
  const zeit = sd.zeitaufwand || null;

  return (
    <Link
      href={`/post/${post.id}`}
      className="card block overflow-hidden transition hover:border-brand-300 hover:shadow-md"
    >
      <div className="aspect-[4/3] w-full bg-stone-100">
        {post.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={post.imageUrl}
            alt={post.title}
            loading="lazy"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex h-full items-center justify-center text-stone-400">
            kein Bild
          </div>
        )}
      </div>
      <div className="p-4">
        <h3 className="text-sm font-semibold leading-snug text-stone-900">
          {post.title}
        </h3>
        {(behoerde || zeit || seiten) && (
          <div className="mt-2 flex flex-wrap gap-1.5 text-xs text-stone-600">
            {behoerde && <span className="chip">{behoerde}</span>}
            {seiten && <span className="chip">{seiten} S.</span>}
            {zeit && <span className="chip">{zeit}</span>}
          </div>
        )}
        <div className="mt-3 flex items-center gap-3 text-xs text-stone-500">
          <span>▲ {post.voteCount}</span>
          <span>💬 {post.commentCount}</span>
        </div>
      </div>
    </Link>
  );
}
