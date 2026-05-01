import { notFound } from "next/navigation";
import Link from "next/link";
import { getCampaign } from "@/lib/campaigns";
import { CampaignSubmitForm } from "@/components/CampaignSubmitForm";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { slug: string };
}) {
  const c = getCampaign(params.slug);
  if (!c) return { title: "Kampagne nicht gefunden" };
  return { title: `Beitrag zur Kampagne ${c.title}` };
}

export default function NewCampaignPostPage({
  params,
}: {
  params: { slug: string };
}) {
  const campaign = getCampaign(params.slug);
  if (!campaign) notFound();

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-brand-700">
          {campaign.title}
        </p>
        <h1 className="mt-1 text-2xl font-bold text-stone-900">
          {campaign.fields ? "Beitrag mit Template" : "Beitrag schreiben"}
        </h1>
        {campaign.prompt && (
          <p className="mt-2 rounded-lg border border-amber-200 bg-amber-50 p-3 text-sm text-amber-900">
            {campaign.prompt}
          </p>
        )}
      </div>

      <CampaignSubmitForm
        campaign={{
          slug: campaign.slug,
          title: campaign.title,
          tag: campaign.tag,
          category: campaign.category,
          fields: campaign.fields,
        }}
      />

      <p className="text-xs text-stone-500">
        Du bist nicht eingeloggt? Kein Problem — die meisten Felder kannst du
        anonym ausfüllen.{" "}
        <Link href="/auth/signin" className="text-brand-700 hover:underline">
          Anmelden
        </Link>{" "}
        macht dein Profil aber sichtbar.
      </p>
    </div>
  );
}
