// Hilfsfunktionen für anonyme Sessions per Cookie.
// Wir setzen einen Cookie "anon_session", merken die Session in der DB
// und nutzen sie für anonyme Posts/Votes.
import { cookies } from "next/headers";
import { prisma } from "./db/prisma";
import crypto from "crypto";

const COOKIE_NAME = "anon_session";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 Jahr

export async function getOrCreateAnonSession(): Promise<{
  id: string;
  token: string;
}> {
  const store = cookies();
  const existingToken = store.get(COOKIE_NAME)?.value;
  if (existingToken) {
    const found = await prisma.anonSession.findUnique({
      where: { token: existingToken },
    });
    if (found) {
      // touch lastSeen
      await prisma.anonSession.update({
        where: { id: found.id },
        data: { lastSeen: new Date() },
      });
      return { id: found.id, token: found.token };
    }
  }
  const token = crypto.randomBytes(32).toString("hex");
  const session = await prisma.anonSession.create({ data: { token } });
  store.set(COOKIE_NAME, token, {
    maxAge: COOKIE_MAX_AGE,
    httpOnly: true,
    sameSite: "lax",
    path: "/",
  });
  return { id: session.id, token };
}

// Sehr einfaches Rate-Limit für anonyme Posts:
// max. N Beiträge pro Stunde pro Anon-Session.
export async function checkAnonRateLimit(
  sessionId: string,
  maxPerHour = 5,
): Promise<{ ok: boolean; reason?: string }> {
  const since = new Date(Date.now() - 60 * 60 * 1000);
  const count = await prisma.post.count({
    where: { anonSessionId: sessionId, createdAt: { gte: since } },
  });
  if (count >= maxPerHour) {
    return {
      ok: false,
      reason: `Zu viele anonyme Beiträge in der letzten Stunde (max. ${maxPerHour}). Bitte warte etwas oder melde dich an.`,
    };
  }
  return { ok: true };
}
