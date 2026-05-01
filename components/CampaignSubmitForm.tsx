"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { ImageUploader } from "./ImageUploader";

type FieldOption = { value: string; label: string };

type Field =
  | { name: string; type: "text"; label: string; help?: string; required?: boolean; maxLength?: number; placeholder?: string }
  | { name: string; type: "textarea"; label: string; help?: string; required?: boolean; maxLength?: number; placeholder?: string; rows?: number }
  | { name: string; type: "number"; label: string; help?: string; required?: boolean; min?: number; max?: number }
  | { name: string; type: "select"; label: string; help?: string; required?: boolean; options: FieldOption[] }
  | { name: string; type: "multiselect"; label: string; help?: string; required?: boolean; options: FieldOption[] }
  | { name: string; type: "image"; label: string; help?: string; required?: boolean };

type Campaign = {
  slug: string;
  title: string;
  tag: string;
  category?: string;
  fields?: Field[];
};

export function CampaignSubmitForm({ campaign }: { campaign: Campaign }) {
  const router = useRouter();
  const { data: session } = useSession();
  const isCustom = !!(campaign.fields && campaign.fields.length > 0);

  const [title, setTitle] = useState("");
  const [body, setBody] = useState("");
  const [anonName, setAnonName] = useState("");
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [structured, setStructured] = useState<Record<string, any>>({});
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  function setField(name: string, value: any) {
    setStructured((s) => ({ ...s, [name]: value }));
  }

  function toggleMulti(name: string, value: string) {
    setStructured((s) => {
      const cur: string[] = Array.isArray(s[name]) ? s[name] : [];
      const next = cur.includes(value)
        ? cur.filter((v) => v !== value)
        : [...cur, value];
      return { ...s, [name]: next };
    });
  }

  function validateClient(): string | null {
    if (title.trim().length < 3) return "Titel zu kurz (mind. 3 Zeichen).";
    if (body.trim().length < 10) return "Beschreibung zu kurz (mind. 10 Zeichen).";
    if (campaign.fields) {
      for (const f of campaign.fields) {
        const v = structured[f.name];
        const empty =
          v === undefined ||
          v === null ||
          v === "" ||
          (Array.isArray(v) && v.length === 0);
        if (f.type === "image") {
          if (f.required && !imageUrl) return `Pflichtfeld fehlt: ${f.label}`;
          continue;
        }
        if (f.required && empty) return `Pflichtfeld fehlt: ${f.label}`;
      }
    }
    return null;
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const err = validateClient();
    if (err) { setError(err); return; }
    setLoading(true);
    try {
      const r = await fetch("/api/posts", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          title,
          body,
          tags: [],
          category: campaign.category,
          campaignSlug: isCustom ? campaign.slug : undefined,
          structuredData: isCustom ? structured : undefined,
          imageUrl: imageUrl || undefined,
          anonName: anonName || undefined,
        }),
      });
      if (!r.ok) {
        const d = await r.json().catch(() => ({}));
        throw new Error(d.error || "Konnte Beitrag nicht speichern.");
      }
      const { post } = await r.json();
      router.push(`/post/${post.id}`);
    } catch (e: any) {
      setError(e.message);
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
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="In einem Satz: worum geht's?"
        />
      </div>

      {(campaign.fields || []).map((f) => (
        <div key={f.name}>
          {f.type === "image" ? (
            <ImageUploader
              value={imageUrl}
              onChange={setImageUrl}
              disabled={loading}
            />
          ) : (
            <>
              <label className="label" htmlFor={`f-${f.name}`}>
                {f.label}
                {f.required && <span className="text-red-600"> *</span>}
              </label>
              {f.type === "text" && (
                <input
                  id={`f-${f.name}`}
                  className="input"
                  value={structured[f.name] || ""}
                  maxLength={f.maxLength}
                  placeholder={f.placeholder}
                  onChange={(e) => setField(f.name, e.target.value)}
                />
              )}
              {f.type === "textarea" && (
                <textarea
                  id={`f-${f.name}`}
                  className="input"
                  rows={f.rows || 4}
                  value={structured[f.name] || ""}
                  maxLength={f.maxLength}
                  placeholder={f.placeholder}
                  onChange={(e) => setField(f.name, e.target.value)}
                />
              )}
              {f.type === "number" && (
                <input
                  id={`f-${f.name}`}
                  type="number"
                  className="input"
                  value={structured[f.name] ?? ""}
                  min={f.min}
                  max={f.max}
                  onChange={(e) =>
                    setField(f.name, e.target.value === "" ? "" : Number(e.target.value))
                  }
                />
              )}
              {f.type === "select" && (
                <select
                  id={`f-${f.name}`}
                  className="input"
                  value={structured[f.name] || ""}
                  onChange={(e) => setField(f.name, e.target.value)}
                >
                  <option value="">— bitte wählen —</option>
                  {f.options.map((o) => (
                    <option key={o.value} value={o.value}>{o.label}</option>
                  ))}
                </select>
              )}
              {f.type === "multiselect" && (
                <div className="flex flex-wrap gap-2 pt-1">
                  {f.options.map((o) => {
                    const active = (structured[f.name] || []).includes(o.value);
                    return (
                      <button
                        key={o.value}
                        type="button"
                        onClick={() => toggleMulti(f.name, o.value)}
                        className={`chip ${active ? "border-brand-400 bg-brand-100 text-brand-800" : ""}`}
                      >
                        {o.label}
                      </button>
                    );
                  })}
                </div>
              )}
              {f.help && (
                <p className="mt-1 text-xs text-stone-500">{f.help}</p>
              )}
            </>
          )}
        </div>
      ))}

      <div>
        <label className="label" htmlFor="body">Beschreibung / Erläuterung</label>
        <textarea
          id="body"
          required
          minLength={10}
          maxLength={10000}
          rows={6}
          className="input"
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Hintergrund, Quellen, persönliche Erfahrung — was gehört zur Geschichte?"
        />
      </div>

      {/* generisches Bild-Feld nur wenn KEIN explizites image-Feld in der Kampagne */}
      {!isCustom && (
        <ImageUploader
          value={imageUrl}
          onChange={setImageUrl}
          disabled={loading}
        />
      )}
      {isCustom && !campaign.fields?.some((f) => f.type === "image") && (
        <ImageUploader
          value={imageUrl}
          onChange={setImageUrl}
          disabled={loading}
        />
      )}

      {!session?.user && (
        <div>
          <label className="label">Anzeigename (optional)</label>
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
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </p>
      )}

      <div className="flex justify-end gap-2">
        <button type="submit" disabled={loading} className="btn-primary">
          {loading ? "Sende …" : "Beitrag veröffentlichen"}
        </button>
      </div>
    </form>
  );
}
