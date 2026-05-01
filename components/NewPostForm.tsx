"use client";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { useSession } from "next-auth/react";

type Category = { name: string; slug: string };

export function NewPostForm({ categories }: { categories: Category[] }) {
  const router = useRouter();
  const { data: session } = useSession();

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [category, setCategory] = useState("");
  const [newCategory, setNewCategory] = useState("");
  const [tagInput, setTagInput] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [anonName, setAnonName] = useState("");
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Tag-Autocomplete
  useEffect(() => {
    const q = tagInput.trim();
    if (!q) {
      setSuggestions([]);
      return;
    }
    const c = new AbortController();
    fetch(`/api/tags?q=${encodeURIComponent(q)}`, { signal: c.signal })
      .then((r) => r.json())
      .then((d) => setSuggestions((d.tags || []).map((t: any) => t.name)))
      .catch(() => {});
    return () => c.abort();
  }, [tagInput]);

  function addTag(name: string) {
    const t = name.trim();
    if (!t) return;
    if (tags.includes(t)) return;
    if (tags.length >= 10) return;
    setTags([...tags, t]);
    setTagInput("");
    setSuggestions([]);
  }

  function removeTag(t: string) {
    setTags(tags.filter((x) => x !== t));
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const finalCategory = newCategory.trim() || category || undefined;
      const r = await fetch(`/api/posts`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title,
          body,
          category: finalCategory,
          tags,
          anonName: anonName || undefined,
        }),
      });
      if (!r.ok) {
        const data = await r.json().catch(() => ({}));
        throw new Error(data.error || "Fehler beim Speichern.");
      }
      const { post } = await r.json();
      router.push(`/post/${post.id}`);
    } catch (err: any) {
      setError(err.message);
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="card space-y-5 p-6">
      <div>
        <label className="label" htmlFor="title">Titel</label>
        <input
          id="title"
          required
          minLength={3}
          maxLength={200}
          className="input"
          placeholder="z.B. Bürgeramt-Termine sind kaum zu bekommen"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>

      <div>
        <label className="label" htmlFor="body">Beschreibung</label>
        <textarea
          id="body"
          required
          minLength={10}
          maxLength={10000}
          rows={8}
          className="input"
          placeholder="Beschreibe das Problem oder deine Lösung möglichst genau …"
          value={body}
          onChange={(e) => setBody(e.target.value)}
        />
      </div>

      <div>
        <label className="label">Kategorie</label>
        <select
          className="input"
          value={category}
          onChange={(e) => {
            setCategory(e.target.value);
            setNewCategory("");
          }}
        >
          <option value="">— wählen —</option>
          {categories.map((c) => (
            <option key={c.slug} value={c.name}>{c.name}</option>
          ))}
        </select>
        <details className="mt-2 text-sm text-stone-600">
          <summary className="cursor-pointer hover:text-stone-800">
            Eigene Kategorie anlegen
          </summary>
          <input
            className="input mt-2"
            placeholder="Neue Kategorie eingeben"
            value={newCategory}
            onChange={(e) => {
              setNewCategory(e.target.value);
              if (e.target.value) setCategory("");
            }}
            maxLength={80}
          />
        </details>
      </div>

      <div>
        <label className="label">Tags (z.B. „Problem“, „Lösung“, „Details“)</label>
        <div className="flex flex-wrap gap-1.5">
          {tags.map((t) => (
            <span key={t} className="chip-brand">
              #{t}
              <button
                type="button"
                onClick={() => removeTag(t)}
                className="ml-1 text-brand-700 hover:text-brand-900"
                aria-label={`${t} entfernen`}
              >
                ×
              </button>
            </span>
          ))}
        </div>
        <div className="relative mt-2">
          <input
            className="input"
            placeholder="Tag eingeben und Enter drücken"
            value={tagInput}
            onChange={(e) => setTagInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" || e.key === ",") {
                e.preventDefault();
                addTag(tagInput);
              }
            }}
            maxLength={40}
          />
          {suggestions.length > 0 && (
            <ul className="absolute z-10 mt-1 max-h-48 w-full overflow-auto rounded-lg border border-stone-200 bg-white shadow">
              {suggestions.map((s) => (
                <li key={s}>
                  <button
                    type="button"
                    onClick={() => addTag(s)}
                    className="block w-full px-3 py-2 text-left text-sm hover:bg-stone-100"
                  >
                    #{s}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {!session?.user && (
        <div>
          <label className="label">
            Anzeigename (optional — sonst „Anonym“)
          </label>
          <input
            className="input"
            placeholder="z.B. „Berliner Pendler“"
            value={anonName}
            onChange={(e) => setAnonName(e.target.value)}
            maxLength={40}
          />
          <p className="mt-1 text-xs text-stone-500">
            Du bist nicht angemeldet. Dein Beitrag wird anonym gespeichert.
          </p>
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex justify-end gap-2">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? "Sende …" : "Beitrag veröffentlichen"}
        </button>
      </div>
    </form>
  );
}
