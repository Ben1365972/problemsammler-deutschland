"use client";
import { useState } from "react";
import { useSession } from "next-auth/react";

type Comment = {
  id: string;
  body: string;
  authorName: string;
  createdAt: string;
};

export function CommentSection({
  postId,
  initialComments,
}: {
  postId: string;
  initialComments: Comment[];
}) {
  const { data: session } = useSession();
  const [comments, setComments] = useState<Comment[]>(initialComments);
  const [body, setBody] = useState("");
  const [anonName, setAnonName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (body.trim().length < 2) return;
    setLoading(true);
    setError(null);
    try {
      const r = await fetch(`/api/posts/${postId}/comments`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ body, anonName: anonName || undefined }),
      });
      if (!r.ok) {
        const data = await r.json().catch(() => ({}));
        throw new Error(data.error || "Fehler beim Speichern.");
      }
      const { comment } = await r.json();
      setComments((prev) => [
        ...prev,
        {
          id: comment.id,
          body: comment.body,
          authorName:
            session?.user?.name || anonName || "Anonym",
          createdAt: comment.createdAt,
        },
      ]);
      setBody("");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <h2 className="text-lg font-semibold text-stone-900">
        Kommentare ({comments.length})
      </h2>

      <form onSubmit={submit} className="mt-4 space-y-3">
        <textarea
          required
          minLength={2}
          maxLength={4000}
          rows={3}
          className="input"
          placeholder="Schreibe einen Kommentar …"
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
        {!session?.user && (
          <input
            className="input"
            placeholder="Dein Name (optional, sonst anonym)"
            value={anonName}
            onChange={(e) => setAnonName(e.target.value)}
            maxLength={40}
          />
        )}
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
        <div className="flex justify-end">
          <button type="submit" disabled={loading} className="btn-primary">
            {loading ? "Sende …" : "Kommentar abschicken"}
          </button>
        </div>
      </form>

      <ul className="mt-6 space-y-4">
        {comments.length === 0 ? (
          <li className="text-sm text-stone-500">Noch keine Kommentare. Sei die/der Erste!</li>
        ) : (
          comments.map((c) => (
            <li key={c.id} className="rounded-lg border border-stone-200 bg-stone-50 p-4">
              <div className="text-xs text-stone-500">
                <strong className="text-stone-700">{c.authorName}</strong>
                {" — "}
                {new Date(c.createdAt).toLocaleString("de-DE")}
              </div>
              <p className="mt-2 whitespace-pre-wrap text-sm text-stone-800">
                {c.body}
              </p>
            </li>
          ))
        )}
      </ul>
    </div>
  );
}
