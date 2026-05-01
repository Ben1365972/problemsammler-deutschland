// NextAuth-Konfiguration.
//
// Standard: Credentials-Provider (Email + Passwort) — funktioniert OHNE
// externe Konten und ohne Email-Versand. Perfekt für lokales Entwickeln
// und für einen ersten Vercel-Deploy.
//
// Wer GitHub-Login oder Email-Magic-Link will, findet die Hinweise im README.

import type { NextAuthOptions } from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { prisma } from "./db/prisma";
import bcrypt from "bcryptjs";

export const authOptions: NextAuthOptions = {
  session: { strategy: "jwt" },
  pages: { signIn: "/auth/signin" },
  providers: [
    CredentialsProvider({
      name: "Email & Passwort",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Passwort", type: "password" },
        // Wenn der Nutzer noch keinen Account hat, kann er sich direkt registrieren:
        register: { label: "register", type: "hidden" },
        name: { label: "Name", type: "text" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) return null;
        const email = String(credentials.email).toLowerCase().trim();
        const password = String(credentials.password);

        const existing = await prisma.user.findUnique({ where: { email } });

        if (credentials.register === "true") {
          if (existing) {
            throw new Error("Es existiert bereits ein Account mit dieser Email.");
          }
          if (password.length < 6) {
            throw new Error("Das Passwort muss mindestens 6 Zeichen haben.");
          }
          const hash = await bcrypt.hash(password, 10);
          const created = await prisma.user.create({
            data: {
              email,
              name: credentials.name?.toString().trim() || email.split("@")[0],
              passwordHash: hash,
            },
          });
          return { id: created.id, name: created.name, email: created.email };
        }

        // normaler Login
        if (!existing || !existing.passwordHash) {
          throw new Error("Falsche Email oder Passwort.");
        }
        const ok = await bcrypt.compare(password, existing.passwordHash);
        if (!ok) {
          throw new Error("Falsche Email oder Passwort.");
        }
        return { id: existing.id, name: existing.name, email: existing.email };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) token.uid = (user as any).id;
      return token;
    },
    async session({ session, token }) {
      if (session.user && token.uid) {
        (session.user as any).id = token.uid;
      }
      return session;
    },
  },
};
