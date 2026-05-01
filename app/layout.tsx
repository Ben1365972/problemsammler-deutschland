import type { Metadata } from "next";
import "./globals.css";
import Link from "next/link";
import { SessionProvider } from "@/components/SessionProvider";
import { HeaderUser } from "@/components/HeaderUser";

export const metadata: Metadata = {
  title: "Probleme in Deutschland",
  description:
    "Die Plattform, auf der Menschen Probleme aus Deutschland beschreiben, taggen und Lösungen sammeln.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="de">
      <body className="min-h-screen bg-stone-50 font-sans text-stone-900 antialiased">
        <SessionProvider>
          <header className="sticky top-0 z-30 border-b border-stone-200 bg-white/80 backdrop-blur">
            <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
              <Link href="/" className="flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-600 font-bold text-white">
                  D
                </span>
                <span className="text-base font-semibold tracking-tight">
                  Probleme in Deutschland
                </span>
              </Link>
              <nav className="flex items-center gap-2">
                <Link href="/neuer-beitrag" className="btn-primary">
                  + Beitrag schreiben
                </Link>
                <HeaderUser />
              </nav>
            </div>
          </header>
          <main className="mx-auto max-w-6xl px-4 py-8">{children}</main>
          <footer className="mt-16 border-t border-stone-200 py-8 text-center text-sm text-stone-500">
            <p>Eine offene Plattform für konstruktive Diskussion.</p>
          </footer>
        </SessionProvider>
      </body>
    </html>
  );
}
