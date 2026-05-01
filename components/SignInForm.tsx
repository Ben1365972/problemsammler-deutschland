"use client";
import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";

export function SignInForm() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const res = await signIn("credentials", {
      email,
      password,
      name,
      register: mode === "register" ? "true" : "false",
      redirect: false,
    });
    setLoading(false);
    if (!res || res.error) {
      setError(res?.error || "Anmeldung fehlgeschlagen.");
      return;
    }
    router.push("/");
    router.refresh();
  }

  return (
    <div className="card p-6">
      <div className="mb-4 flex gap-2">
        <button
          type="button"
          onClick={() => setMode("login")}
          className={`btn-secondary flex-1 ${mode === "login" ? "ring-2 ring-brand-500" : ""}`}
        >
          Anmelden
        </button>
        <button
          type="button"
          onClick={() => setMode("register")}
          className={`btn-secondary flex-1 ${mode === "register" ? "ring-2 ring-brand-500" : ""}`}
        >
          Neu registrieren
        </button>
      </div>
      <form onSubmit={submit} className="space-y-3">
        {mode === "register" && (
          <div>
            <label className="label">Anzeigename</label>
            <input
              className="input"
              value={name}
              onChange={(e) => setName(e.target.value)}
              maxLength={40}
              placeholder="Wie sollen wir dich nennen?"
            />
          </div>
        )}
        <div>
          <label className="label">Email</label>
          <input
            type="email"
            required
            className="input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label className="label">Passwort</label>
          <input
            type="password"
            required
            minLength={6}
            className="input"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          {mode === "register" && (
            <p className="mt-1 text-xs text-stone-500">Mindestens 6 Zeichen.</p>
          )}
        </div>
        {error && (
          <p className="rounded border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
            {error}
          </p>
        )}
        <button type="submit" disabled={loading} className="btn-primary w-full">
          {loading ? "Bitte warten …" : mode === "login" ? "Anmelden" : "Registrieren"}
        </button>
      </form>
    </div>
  );
}
