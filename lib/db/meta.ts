// Repository für Kategorien & Tags
import { prisma } from "./prisma";

export async function listCategories() {
  return prisma.category.findMany({
    orderBy: [{ isPredefined: "desc" }, { name: "asc" }],
    include: { _count: { select: { posts: true } } },
  });
}

export async function listTagsByPrefix(prefix: string, limit = 10) {
  const p = prefix.trim();
  const where = p ? { name: { contains: p, mode: "insensitive" as const } } : {};
  return prisma.tag.findMany({
    where,
    take: limit,
    orderBy: { name: "asc" },
  });
}

export async function listAllTags() {
  return prisma.tag.findMany({
    orderBy: { name: "asc" },
    include: { _count: { select: { posts: true } } },
  });
}
