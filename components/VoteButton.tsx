"use client";
import { useState } from "react";

export function VoteButton({
  postId,
  initialCount,
}: {
  postId: string;
  initialCount: number;
}) {
  const [count, setCount] = useState(initialCount);
  const [voted, setVoted] = useState(false);
  const [loading, setLoading] = useState(false);

  async function vote() {
    setLoading(true);
    try {
      const r = await fetch(`/api/posts/${postId}/vote`, { method: "POST" });
      if (!r.ok) throw new Error(await r.text());
      const data = await r.json();
      setVoted(!!data.voted);
      setCount(data.count);
    } catch (e) {
      console.error(e);
      alert("Konnte Stimme nicht speichern.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      onClick={vote}
      disabled={loading}
      className={`inline-flex items-center gap-2 rounded-lg border px-4 py-2 text-sm font-medium transition ${
        voted
          ? "border-brand-500 bg-brand-50 text-brand-800"
          : "border-stone-300 bg-white text-stone-800 hover:bg-stone-50"
      }`}
    >
      <span>▲</span>
      <span>{count}</span>
      <span className="text-stone-500">{voted ? "Zustimmung gegeben" : "Zustimmen"}</span>
    </button>
  );
}
