import { getServerSession } from "next-auth";
import { authOptions } from "./auth";

function adminEmails(): string[] {
  return (process.env.ADMIN_EMAILS || "")
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
}

export function isEmailAdmin(email: string | null | undefined): boolean {
  if (!email) return false;
  const emails = adminEmails();
  if (emails.length === 0) return false;
  return emails.includes(email.toLowerCase());
}

export async function getAdminSession() {
  const session = await getServerSession(authOptions);
  const email = session?.user?.email;
  if (!email || !isEmailAdmin(email)) return null;
  return session;
}

export async function requireAdmin() {
  const session = await getAdminSession();
  if (!session) throw new Error("forbidden");
  return session;
}
