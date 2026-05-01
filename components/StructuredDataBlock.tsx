import type { Campaign } from "@/lib/campaigns";

export function StructuredDataBlock({
  campaign,
  data,
}: {
  campaign: Campaign;
  data: Record<string, any> | null | undefined;
}) {
  if (!data || !campaign.fields) return null;
  // Image-Felder bewusst nicht hier rendern (das tut die Detail-Seite oben).
  const fields = campaign.fields.filter((f) => f.type !== "image");
  const items = fields
    .map((f) => {
      const raw = data[f.name];
      if (raw === undefined || raw === null || raw === "") return null;
      let display: string;
      if (f.type === "select") {
        display = f.options.find((o) => o.value === raw)?.label || String(raw);
      } else if (f.type === "multiselect") {
        const arr = Array.isArray(raw) ? raw : [raw];
        display = arr
          .map((v: string) => f.options.find((o) => o.value === v)?.label || v)
          .join(", ");
      } else {
        display = String(raw);
      }
      return { label: f.label, value: display, multiline: f.type === "textarea" };
    })
    .filter(Boolean) as { label: string; value: string; multiline: boolean }[];

  if (items.length === 0) return null;

  return (
    <div className="rounded-xl border border-brand-200 bg-brand-50/40 p-5">
      <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-brand-700">
        Kampagne: {campaign.title}
      </p>
      <dl className="space-y-3">
        {items.map((it, idx) => (
          <div key={idx} className="grid grid-cols-1 gap-1 sm:grid-cols-[180px_1fr] sm:gap-3">
            <dt className="text-xs font-medium uppercase tracking-wide text-stone-500">
              {it.label}
            </dt>
            <dd
              className={`text-sm text-stone-800 ${it.multiline ? "whitespace-pre-wrap" : ""}`}
            >
              {it.value}
            </dd>
          </div>
        ))}
      </dl>
    </div>
  );
}
