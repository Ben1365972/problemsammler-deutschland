import Link from "next/link";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/admin";
import { prisma } from "@/lib/db/prisma";
import { AdminReportRow } from "@/components/AdminReportRow";

export const dynamic = "force-dynamic";

type SearchParams = { tab?: "open" | "resolved" };

export default async function AdminPage({
  searchParams,
}: {
  searchParams: SearchParams;
}) {
  const session = await getAdminSession();
  if (!session) {
    redirect("/auth/signin?callbackUrl=/admin");
  }

  const tab = searchParams.tab === "resolved" ? "resolved" : "open";

  const [reports, openCount, resolvedCount, postCount, commentCount, hiddenPostCount] =
    await Promise.all([
      prisma.report.findMany({
        where: tab === "open" ? { resolvedAt: null } : { resolvedAt: { not: null } },
        orderBy: { createdAt: "desc" },
        take: 100,
        include: {
          post: {
            select: {
              id: true,
              title: true,
              hidden: true,
              author: { select: { name: true, email: true } },
              anonName: true,
            },
          },
          comment: {
            select: {
              id: true,
              body: true,
              hidden: true,
              postId: true,
              author: { select: { name: true, email: true } },
              anonName: true,
            },
          },
        },
      }),
      prisma.report.count({ where: { resolvedAt: null } }),
      prisma.report.count({ where: { resolvedAt: { not: null } } }),
      prisma.post.count({ where: { hidden: false } }),
      prisma.comment.count({ where: { hidden: false } }),
      prisma.post.count({ where: { hidden: true } }),
    ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Admin</h1>
        <p className="text-sm text-stone-600">
          Eingeloggt als <strong>{session.user?.email}</strong>
        </p>
      </div>

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <div className="card p-4">
          <p className="text-xs text-stone-500">Offene Meldungen</p>
          <p className="text-2xl font-bold text-stone-900">{openCount}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-stone-500">Erledigte Meldungen</p>
          <p className="text-2xl font-bold text-stone-900">{resolvedCount}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-stone-500">Sichtbare Posts</p>
          <p className="text-2xl font-bold text-stone-900">{postCount}</p>
        </div>
        <div className="card p-4">
          <p className="text-xs text-stone-500">Versteckte Posts</p>
          <p className="text-2xl font-bold text-stone-900">{hiddenPostCount}</p>
        </div>
      </div>

      <div className="flex gap-2">
        <Link
          href="/admin?tab=open"
          className={`btn-secondary text-sm ${tab === "open" ? "ring-2 ring-brand-500" : ""}`}
        >
          Offen ({openCount})
        </Link>
        <Link
          href="/admin?tab=resolved"
          className={`btn-secondary text-sm ${tab === "resolved" ? "ring-2 ring-brand-500" : ""}`}
        >
          Erledigt ({resolvedCount})
        </Link>
      </div>

      {reports.length === 0 ? (
        <div className="card p-10 text-center text-stone-500">
          {tab === "open" ? "Keine offenen Meldungen 🎉" : "Noch nichts erledigt."}
        </div>
      ) : (
        <ul className="space-y-3">
          {reports.map((r) => (
            <li key={r.id}>
              <AdminReportRow
                report={{
                  id: r.id,
                  reason: r.reason,
                  detail: r.detail,
                  createdAt: r.createdAt.toISOString(),
                  resolvedAt: r.resolvedAt?.toISOString() || null,
                  resolvedAction: r.resolvedAction,
                  postId: r.postId,
                  commentId: r.commentId,
                  post: r.post
                    ? {
                        id: r.post.id,
                        title: r.post.title,
                        hidden: r.post.hidden,
                        authorName:
                          r.post.author?.name ||
                          r.post.author?.email ||
                          r.post.anonName ||
                          "Anonym",
                      }
                    : null,
                  comment: r.comment
                    ? {
                        id: r.comment.id,
                        body: r.comment.body,
                        hidden: r.comment.hidden,
                        postId: r.comment.postId,
                        authorName:
                          r.comment.author?.name ||
                          r.comment.author?.email ||
                          r.comment.anonName ||
                          "Anonym",
                      }
                    : null,
                }}
              />
            </li>
          ))}
        </ul>
      )}

      <p className="text-xs text-stone-400">
        Admin-Emails werden über die Env-Variable <code>ADMIN_EMAILS</code> gesetzt
        (komma-getrennt). Aktuell genannt:{" "}
        {(process.env.ADMIN_EMAILS || "—").split(",").map((s) => s.trim()).join(", ")}
      </p>
    </div>
  );
}
