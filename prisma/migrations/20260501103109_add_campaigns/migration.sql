-- AlterTable
ALTER TABLE "Post" ADD COLUMN     "campaignSlug" TEXT,
ADD COLUMN     "campaignStatus" TEXT,
ADD COLUMN     "structuredData" JSONB;

-- CreateIndex
CREATE INDEX "Post_campaignSlug_idx" ON "Post"("campaignSlug");

-- CreateIndex
CREATE INDEX "Post_campaignStatus_idx" ON "Post"("campaignStatus");
