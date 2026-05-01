import { listCategories } from "@/lib/db/meta";
import { NewPostForm } from "@/components/NewPostForm";

export const dynamic = "force-dynamic";

export default async function NewPostPage() {
  const categories = await listCategories();
  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-stone-900">
          Neuen Beitrag schreiben
        </h1>
        <p className="mt-1 text-sm text-stone-600">
          Beschreibe ein Problem, eine Lösung oder gib einen Hinweis. Du kannst
          anonym posten oder dich anmelden.
        </p>
      </div>
      <NewPostForm
        categories={categories.map((c) => ({ name: c.name, slug: c.slug }))}
      />
    </div>
  );
}
