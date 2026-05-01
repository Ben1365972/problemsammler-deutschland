"use client";
import { useSession, signIn, signOut } from "next-auth/react";
import Link from "next/link";

export function HeaderUser() {
  const { data: session, status } = useSession();
  if (status === "loading") {
    return <span className="text-sm text-stone-400">…</span>;
  }
  if (session?.user) {
    return (
      <div className="flex items-center gap-2">
        <span className="hidden text-sm text-stone-600 sm:inline">
          Hallo, {session.user.name || session.user.email}
        </span>
        <button onClick={() => signOut()} className="btn-ghost">
          Abmelden
        </button>
      </div>
    );
  }
  return (
    <Link href="/auth/signin" className="btn-ghost">
      Anmelden
    </Link>
  );
}
