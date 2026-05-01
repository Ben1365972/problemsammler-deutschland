"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

type StatusOption = {
  value: string;
  label: string;
  tone: "neutral" | "info" | "success" | "done";
};

const TONE_CLASS: Record<string, string> = {
  neutral: "bg-stone-100 text-stone-700",
  info: "bg-blue-100 text-blue-800",
  success: "bg-emerald-100 text-emerald-800",
  done: "bg-violet-100 text-violet-800",
};

export function CampaignStatusBadge({
  postId,
  campaignSlug,
  current,
  options,
  canEdit,
}: {
  postId: string;
  campaignSlug: string;
  current: string | null;
  options: StatusOption[];
  canEdit: boolean;
}) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);

  const currentOption =
    options.find((o) => o.value === current) ||
    options[0] || { value: "—", label: "—", tone: "neutral" as const };

  async function setStatus(value: string) {
    setBusy(true);
    setErr(null);
    try {
      const r = await fetch(`/api/posts/${postId}/campaign-status`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status: value }),
      });
      if (!r.ok) {
        const d = await r.json().catch(() => ({}));
        throw new Error(d.error || "Fehler.");
      }
      setOpen(false);
      router.refresh();
    } catch (e: any) {
      setErr(e.message);
    } finally {
      setBusy(false);
    }
  }

  if (!canEdit) {
    return (
      <span
        className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
          TONE_CLASS[currentOption.tone] || "bg-stone-100"
        }`}
      >
        {currentOption.label}
      </span>
    );
  }

  return (
    <div className="relative inline-block">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        disabled={busy}
        className={`inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium ${
          TONE_CLASS[currentOption.tone] || "bg-stone-100"
        } hover:opacity-80`}
      >
        {currentOption.label} ▼
      </button>
      {open && (
        <div className="absolute left-0 top-full z-20 mt-1 w-52 rounded-lg border border-stone-200 bg-white shadow-lg">
          {options.map((o) => (
            <button
              key={o.value}
              type="button"
              onClick={() => setStatus(o.value)}
              disabled={busy}
              className={`block w-full px-3 py-2 text-left text-xs hover:bg-stone-50 ${
                o.value === current ? "font-semibold" : ""
              }`}
            >
              <span
                className={`mr-2 inline-block rounded-full px-2 py-0.5 ${TONE_CLASS[o.tone]}`}
              >
                {o.label}
              </span>
            </button>
          ))}
          {err && <p className="border-t border-stone-200 p-2 text-xs text-red-700">{err}</p>}
        </div>
      )}
    </div>
  );
}
