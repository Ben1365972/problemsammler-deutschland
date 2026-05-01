import { handleUpload, type HandleUploadBody } from "@vercel/blob/client";
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getOrCreateAnonSession } from "@/lib/anon";
import { prisma } from "@/lib/db/prisma";

const MAX_UPLOADS_PER_HOUR_ANON = 5;
const MAX_UPLOADS_PER_HOUR_USER = 30;

export async function POST(request: NextRequest): Promise<NextResponse> {
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    return NextResponse.json(
      {
        error:
          "Bilder-Upload ist noch nicht eingerichtet. Vercel-Blob-Storage muss im Dashboard verbunden werden.",
      },
      { status: 503 },
    );
  }

  const body = (await request.json()) as HandleUploadBody;

  try {
    const jsonResponse = await handleUpload({
      body,
      request,
      onBeforeGenerateToken: async () => {
        const session = await getServerSession(authOptions);
        const userId = (session?.user as any)?.id as string | undefined;

        // Rate-Limit (sehr lose): zähle existierende Posts mit imageUrl letzte Stunde
        const since = new Date(Date.now() - 60 * 60 * 1000);
        const where: any = { createdAt: { gte: since }, NOT: { imageUrl: null } };
        let limit = MAX_UPLOADS_PER_HOUR_USER;
        if (userId) {
          where.authorId = userId;
        } else {
          const anon = await getOrCreateAnonSession();
          where.anonSessionId = anon.id;
          limit = MAX_UPLOADS_PER_HOUR_ANON;
        }
        const recentCount = await prisma.post.count({ where });
        if (recentCount >= limit) {
          throw new Error(
            `Zu viele Uploads in der letzten Stunde (max. ${limit}). Bitte warte etwas.`,
          );
        }

        return {
          allowedContentTypes: [
            "image/jpeg",
            "image/png",
            "image/webp",
            "image/gif",
          ],
          maximumSizeInBytes: 8 * 1024 * 1024, // 8 MB
          addRandomSuffix: true,
          tokenPayload: JSON.stringify({ userId, anon: !userId }),
        };
      },
      onUploadCompleted: async () => {
        // optional: server-side hook nach Upload
      },
    });
    return NextResponse.json(jsonResponse);
  } catch (error) {
    return NextResponse.json(
      { error: (error as Error).message },
      { status: 400 },
    );
  }
}
