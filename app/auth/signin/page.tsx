import { SignInForm } from "@/components/SignInForm";

export default function SignInPage() {
  return (
    <div className="mx-auto max-w-md">
      <h1 className="text-2xl font-bold text-stone-900">Anmelden</h1>
      <p className="mt-1 text-sm text-stone-600">
        Mit Account kannst du Beiträge unter deinem Namen veröffentlichen und
        erhältst eine eigene Übersicht.
      </p>
      <div className="mt-6">
        <SignInForm />
      </div>
    </div>
  );
}
