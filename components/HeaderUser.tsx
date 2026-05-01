"use client";
import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { useEffect, useRef, useState } from "react";

function initialFor(name: string | null | undefined, email: string | null | undefined): string {
  const src = (name || email || "?").trim();
  return src.slice(0, 1).toUpperCase() || "?";
}

export function HeaderUser({ isAdmin = false }: { isAdmin?: boolean }) {
  const { data: session, status } = useSession();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  if (status === "loading") {
    return <span className="text-sm text-stone-400">…</span>;
  }
  if (!session?.user) {
    return (
      <Link href="/auth/signin" className="btn-ghost text-sm">
        Anmelden
      </Link>
    );
  }

  const name = session.user.name || session.user.email || "Konto";
  const initial = initialFor(session.user.name, session.user.email);

  return (
    <div ref={ref} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="menu"
        aria-expanded={open}
        aria-label={`Konto-Menü für ${name}`}
        className="group flex items-center gap-2 rounded-full p-0.5 pr-2 transition hover:bg-stone-100"
      >
        <span className="grid h-8 w-8 place-items-center rounded-full bg-brand-600 text-sm font-semibold text-white">
          {initial}
        </span>
        <span className="hidden text-sm text-stone-700 sm:inline">
          {session.user.name || session.user.email?.split("@")[0]}
        </span>
        <svg
          className={`hidden h-4 w-4 text-stone-400 transition sm:block ${open ? "rotate-180" : ""}`}
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {open && (
        <div
          role="menu"
          className="absolute right-0 top-full z-40 mt-2 w-60 overflow-hidden rounded-xl border border-stone-200 bg-white shadow-lg"
        >
          <div className="border-b border-stone-100 px-4 py-3">
            <p className="truncate text-sm font-medium text-stone-900">
              {session.user.name || session.user.email}
            </p>
            {session.user.name && (
              <p className="truncate text-xs text-stone-500">
                {session.user.email}
              </p>
            )}
            {isAdmin && (
              <span className="mt-1.5 inline-block rounded-full bg-brand-100 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-brand-800">
                Admin
              </span>
            )}
          </div>
          <div className="py-1">
            {isAdmin && (
              <Link
                href="/admin"
                onClick={() => setOpen(false)}
                role="menuitem"
                className="block px-4 py-2 text-sm text-stone-700 hover:bg-stone-50"
              >
                Admin-Bereich
              </Link>
            )}
            <button
              type="button"
              onClick={() => {
                setOpen(false);
                signOut({ callbackUrl: "/" });
              }}
              role="menuitem"
              className="block w-full px-4 py-2 text-left text-sm text-stone-700 hover:bg-stone-50"
            >
              Abmelden
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
