"use client";
import { useState } from "react";

type Target = { postId?: string; commentId?: string };

const REASONS: { value: string; label: string }[] = [
  { value: "spam", label: "Spam / Werbung" },
  { value: "abuse", label: "Beleidigung / Hass" },
  { value: "off_topic", label: "Themenfremd" },
  { value: "other", label: "Sonstiges" },
];

export function ReportButton({
  target,
  size = "sm",
}: {
  target: Target;
  size?: "sm" | "xs";
}) {
  const [open, setOpen] = useState(false);
  const [reason, setReason] = useState("spam");
  const [detail, setDetail] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    e.stopPropagation();
    setLoading(true);
    setError(null);
    try {
      const r = await fetch("/api/reports", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ ...target, reason, detail: detail || undefined }),
      });
      const data = await r.json().catch(() => ({}));
      if (!r.ok) throw new Error(data.error || "Konnte Meldung nicht speichern.");
      setDone(data.message || "Danke, deine Meldung wurde aufgenommen.");
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  const triggerCls =
    size === "xs"
      ? "text-xs text-stone-400 hover:text-red-600 underline-offset-2 hover:underline"
      : "text-xs text-stone-500 hover:text-red-600 underline-offset-2 hover:underline";

  return (
    <>
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          setOpen(true);
        }}
        className={triggerCls}
        aria-label="Beitrag melden"
      >
        melden
      </button>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="w-full max-w-md rounded-xl bg-white p-5 shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {done ? (
              <div>
                <h3 className="text-lg font-semibold text-stone-900">Danke!</h3>
                <p className="mt-2 text-sm text-stone-600">{done}</p>
                <div className="mt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="btn-primary"
                  >
                    Schliessen
                  </button>
                </div>
              </div>
            ) : (
              <form onSubmit={submit} className="space-y-3">
                <h3 className="text-lg font-semibold text-stone-900">
                  {target.postId ? "Beitrag melden" : "Kommentar melden"}
                </h3>
                <p className="text-xs text-stone-500">
                  Wir prüfen Meldungen und entfernen Inhalte, die gegen die Hausregeln
                  verstossen.
                </p>
                <div>
                  <label className="label">Grund</label>
                  <select
                    className="input"
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                  >
                    {REASONS.map((r) => (
                      <option key={r.value} value={r.value}>{r.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="label">Erklärung (optional)</label>
                  <textarea
                    className="input"
                    rows={3}
                    maxLength={500}
                    value={detail}
                    onChange={(e) => setDetail(e.target.value)}
                    placeholder="Was genau stört?"
                  />
                </div>
                {error && (
                  <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-xs text-red-700">
                    {error}
                  </p>
                )}
                <div className="flex justify-end gap-2">
                  <button
                    type="button"
                    onClick={() => setOpen(false)}
                    className="btn-secondary"
                  >
                    Abbrechen
                  </button>
                  <button type="submit" disabled={loading} className="btn-primary">
                    {loading ? "Sende …" : "Melden"}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </>
  );
}
