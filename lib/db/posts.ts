// Repository-Schicht: alle Datenbank-Zugriffe rund um Beiträge bündeln.
// So bleibt der Wechsel zu einem anderen Provider/ORM später einfach.
import { prisma } from "./prisma";

export type SortMode = "neu" | "top" | "diskutiert";

export type PostFilter = {
  categorySlug?: string;
  tagSlugs?: string[];
  search?: string;
  sort?: SortMode;
  take?: number;
  skip?: number;
  includeHidden?: boolean;
};

export async function listPosts(filter: PostFilter = {}) {
  const where: any = {};
  if (!filter.includeHidden) where.hidden = false;
  if (filter.categorySlug) {
    where.category = { slug: filter.categorySlug };
  }
  if (filter.tagSlugs && filter.tagSlugs.length > 0) {
    where.AND = filter.tagSlugs.map((slug) => ({
      tags: { some: { tag: { slug } } },
    }));
  }
  if (filter.search && filter.search.trim().length > 0) {
    const q = filter.search.trim();
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { body: { contains: q, mode: "insensitive" } },
    ];
  }

  let orderBy: any;
  switch (filter.sort) {
    case "top":
      orderBy = [{ votes: { _count: "desc" } }, { createdAt: "desc" }];
      break;
    case "diskutiert":
      orderBy = [{ comments: { _count: "desc" } }, { createdAt: "desc" }];
      break;
    default:
      orderBy = { createdAt: "desc" };
  }

  const posts = await prisma.post.findMany({
    where,
    orderBy,
    take: filter.take ?? 20,
    skip: filter.skip ?? 0,
    include: {
      category: true,
      tags: { include: { tag: true } },
      _count: { select: { votes: true, comments: true } },
      author: { select: { id: true, name: true } },
    },
  });
  return posts;
}

export async function countPosts(
  filter: Omit<PostFilter, "take" | "skip"> = {},
) {
  const where: any = {};
  if (!filter.includeHidden) where.hidden = false;
  if (filter.categorySlug) where.category = { slug: filter.categorySlug };
  if (filter.tagSlugs && filter.tagSlugs.length > 0) {
    where.AND = filter.tagSlugs.map((slug) => ({
      tags: { some: { tag: { slug } } },
    }));
  }
  if (filter.search && filter.search.trim().length > 0) {
    const q = filter.search.trim();
    where.OR = [
      { title: { contains: q, mode: "insensitive" } },
      { body: { contains: q, mode: "insensitive" } },
    ];
  }
  return prisma.post.count({ where });
}

export async function getPostById(id: string, includeHidden = false) {
  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      category: true,
      tags: { include: { tag: true } },
      _count: { select: { votes: true } },
      author: { select: { id: true, name: true } },
      comments: {
        where: includeHidden ? undefined : { hidden: false },
        orderBy: { createdAt: "asc" },
        include: { author: { select: { id: true, name: true } } },
      },
    },
  });
  if (!post) return null;
  if (post.hidden && !includeHidden) return null;
  return post;
}

export async function createPost(input: {
  title: string;
  body: string;
  categoryName?: string;
  tagNames: string[];
  authorId?: string;
  anonSessionId?: string;
  anonName?: string;
  imageUrl?: string;
}) {
  let categoryId: string | undefined;
  if (input.categoryName && input.categoryName.trim().length > 0) {
    const name = input.categoryName.trim();
    const slug = slugify(name);
    const cat = await prisma.category.upsert({
      where: { slug },
      update: {},
      create: { name, slug, isPredefined: false },
    });
    categoryId = cat.id;
  }

  const tagIds: string[] = [];
  for (const raw of input.tagNames) {
    const name = raw.trim();
    if (!name) continue;
    const slug = slugify(name);
    const tag = await prisma.tag.upsert({
      where: { slug },
      update: {},
      create: { name, slug },
    });
    tagIds.push(tag.id);
  }

  return prisma.post.create({
    data: {
      title: input.title.trim(),
      body: input.body.trim(),
      categoryId,
      authorId: input.authorId,
      anonSessionId: input.authorId ? null : input.anonSessionId,
      anonName: input.authorId ? null : input.anonName?.slice(0, 40),
      imageUrl: input.imageUrl,
      tags: {
        create: tagIds.map((tagId) => ({ tagId })),
      },
    },
  });
}

export async function addComment(input: {
  postId: string;
  body: string;
  authorId?: string;
  anonSessionId?: string;
  anonName?: string;
}) {
  return prisma.comment.create({
    data: {
      postId: input.postId,
      body: input.body.trim(),
      authorId: input.authorId,
      anonSessionId: input.authorId ? null : input.anonSessionId,
      anonName: input.authorId ? null : input.anonName?.slice(0, 40),
    },
  });
}

export async function toggleVote(input: {
  postId: string;
  userId?: string;
  anonSessionId?: string;
}) {
  if (input.userId) {
    const existing = await prisma.vote.findUnique({
      where: { postId_userId: { postId: input.postId, userId: input.userId } },
    });
    if (existing) {
      await prisma.vote.delete({ where: { id: existing.id } });
      return { voted: false };
    }
    await prisma.vote.create({
      data: { postId: input.postId, userId: input.userId, value: 1 },
    });
    return { voted: true };
  }
  if (input.anonSessionId) {
    const existing = await prisma.vote.findUnique({
      where: {
        postId_anonSessionId: {
          postId: input.postId,
          anonSessionId: input.anonSessionId,
        },
      },
    });
    if (existing) {
      await prisma.vote.delete({ where: { id: existing.id } });
      return { voted: false };
    }
    await prisma.vote.create({
      data: {
        postId: input.postId,
        anonSessionId: input.anonSessionId,
        value: 1,
      },
    });
    return { voted: true };
  }
  throw new Error("Kein User und keine anonyme Session");
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/ä/g, "ae")
    .replace(/ö/g, "oe")
    .replace(/ü/g, "ue")
    .replace(/ß/g, "ss")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}
