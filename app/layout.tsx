import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { SessionProvider } from "@/components/SessionProvider";
import { HeaderUser } from "@/components/HeaderUser";
import { getAdminSession } from "@/lib/admin";

const SITE_URL =
  process.env.NEXTAUTH_URL || "https://problemsammler.benjaminbalde.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Probleme in Deutschland",
    template: "%s",
  },
  description:
    "Die Plattform, auf der Bürger Probleme aus Deutschland beschreiben, taggen und Lösungen sammeln.",
  openGraph: {
    type: "website",
    siteName: "Probleme in Deutschland",
    locale: "de_DE",
    url: SITE_URL,
    title: "Probleme in Deutschland",
    description:
      "Die Plattform, auf der Bürger Probleme aus Deutschland beschreiben, taggen und Lösungen sammeln.",
  },
  twitter: { card: "summary" },
  alternates: {
    types: {
      "application/rss+xml": [
        { url: "/feed.xml", title: "Probleme in Deutschland — RSS" },
      ],
    },
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const adminSession = await getAdminSession();
  const isAdmin = !!adminSession;

  return (
    <html lang="de">
      <body className="min-h-screen bg-stone-50 font-sans text-stone-900 antialiased">
        <SessionProvider>
          <header className="sticky top-0 z-30 border-b border-stone-200 bg-white/80 backdrop-blur">
            <div className="mx-auto flex max-w-6xl items-center justify-between gap-4 px-4 py-3">
              <Link href="/" className="flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 font-bold text-white">
                  D
                </span>
                <span className="hidden text-base font-semibold tracking-tight sm:inline">
                  Probleme in Deutschland
                </span>
              </Link>
              <nav className="flex items-center gap-1">
                <Link
                  href="/kampagnen"
                  className="hidden rounded-lg px-3 py-2 text-sm font-medium text-stone-700 transition hover:bg-stone-100 sm:inline-flex"
                >
                  Kampagnen
                </Link>
                <Link
                  href="/neuer-beitrag"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-brand-600 px-3 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 sm:px-4"
                >
                  <svg
                    className="h-5 w-5"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="3"
                    viewBox="0 0 24 24"
                    aria-hidden="true"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m-8-8h16" />
                  </svg>
                  <span>Beitrag</span>
                </Link>
                <span className="mx-1 hidden h-6 w-px bg-stone-200 sm:inline-block" aria-hidden="true" />
                <HeaderUser isAdmin={isAdmin} />
              </nav>
            </div>
          </header>
          <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
          <footer className="mt-16 border-t border-stone-200 py-8 text-center text-sm text-stone-500">
            <p>Eine offene Plattform für konstruktive Diskussion.</p>
            <p className="mt-2 flex items-center justify-center gap-3 text-xs">
              <Link href="/kampagnen" className="hover:text-stone-700 sm:hidden">
                Kampagnen
              </Link>
              <span className="sm:hidden">·</span>
              <Link href="/feed.xml" className="hover:text-stone-700">RSS</Link>
              <span>·</span>
              <Link href="/api/export?format=json" className="hover:text-stone-700">
                Daten-Export
              </Link>
            </p>
          </footer>
        </SessionProvider>
      </body>
    </html>
  );
}
