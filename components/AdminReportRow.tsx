"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type ReportData = {
  id: string;
  reason: string;
  detail: string | null;
  createdAt: string;
  resolvedAt: string | null;
  resolvedAction: string | null;
  postId: string | null;
  commentId: string | null;
  post: {
    id: string;
    title: string;
    hidden: boolean;
    authorName: string;
  } | null;
  comment: {
    id: string;
    body: string;
    hidden: boolean;
    postId: string;
    authorName: string;
  } | null;
};

const REASON_LABELS: Record<string, string> = {
  spam: "Spam",
  abuse: "Beleidigung",
  off_topic: "Themenfremd",
  other: "Sonstiges",
};

export function AdminReportRow({ report }: { report: ReportData }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function act(action: "hide" | "show" | "dismiss" | "delete") {
    setBusy(true);
    setError(null);
    try {
      const r = await fetch(`/api/admin/reports/${report.id}/resolve`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (!r.ok) {
        const d = await r.json().catch(() => ({}));
        throw new Error(d.error || "Aktion fehlgeschlagen.");
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  const isResolved = !!report.resolvedAt;
  const target = report.post
    ? { type: "Beitrag" as const, hidden: report.post.hidden }
    : report.comment
      ? { type: "Kommentar" as const, hidden: report.comment.hidden }
      : null;

  return (
    <div className="card p-4">
      <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-stone-500">
        <div>
          <span className="chip-brand mr-2">
            {REASON_LABELS[report.reason] || report.reason}
          </span>
          {target && <span>{target.type}</span>}
          {target?.hidden && (
            <span className="ml-2 chip text-red-700">versteckt</span>
          )}
        </div>
        <span>{new Date(report.createdAt).toLocaleString("de-DE")}</span>
      </div>

      {report.detail && (
        <p className="mt-2 rounded bg-stone-50 p-2 text-xs italic text-stone-600">
          „{report.detail}"
        </p>
      )}

      {report.post && (
        <div className="mt-3">
          <Link
            href={`/post/${report.post.id}`}
            className="font-medium text-stone-900 hover:underline"
            target="_blank"
          >
            {report.post.title}
          </Link>
          <p className="text-xs text-stone-500">von {report.post.authorName}</p>
        </div>
      )}
      {report.comment && (
        <div className="mt-3">
          <p className="text-sm text-stone-800">
            {report.comment.body.slice(0, 200)}
            {report.comment.body.length > 200 ? "…" : ""}
          </p>
          <p className="mt-1 text-xs text-stone-500">
            von {report.comment.authorName} ·{" "}
            <Link
              href={`/post/${report.comment.postId}`}
              className="hover:underline"
              target="_blank"
            >
              im Beitrag
            </Link>
          </p>
        </div>
      )}

      {isResolved ? (
        <div className="mt-3 text-xs text-stone-500">
          Erledigt am {new Date(report.resolvedAt!).toLocaleString("de-DE")} ·
          Aktion: <strong>{report.resolvedAction}</strong>
        </div>
      ) : (
        <div className="mt-3 flex flex-wrap gap-2">
          {target && !target.hidden && (
            <button
              onClick={() => act("hide")}
              disabled={busy}
              className="btn-secondary text-xs"
            >
              Verstecken
            </button>
          )}
          {target?.hidden && (
            <button
              onClick={() => act("show")}
              disabled={busy}
              className="btn-secondary text-xs"
            >
              Wieder einblenden
            </button>
          )}
          <button
            onClick={() => act("dismiss")}
            disabled={busy}
            className="btn-secondary text-xs"
          >
            Verwerfen
          </button>
          <button
            onClick={() => {
              if (confirm("Inhalt UNwiderruflich löschen?")) act("delete");
            }}
            disabled={busy}
            className="btn-secondary text-xs text-red-700"
          >
            Endgültig löschen
          </button>
        </div>
      )}
      {error && (
        <p className="mt-2 text-xs text-red-700">{error}</p>
      )}
    </div>
  );
}
