-- CreateEnum
CREATE TYPE "ContainerCatalogGroup" AS ENUM ('DRY', 'OPEN_TOP_HARDTOP', 'SPECIAL', 'REEFER', 'TANK');

-- CreateTable
CREATE TABLE "ContainerCatalogItem" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "group" "ContainerCatalogGroup" NOT NULL,
    "name" TEXT NOT NULL,
    "summary" TEXT NOT NULL,
    "useCase" TEXT NOT NULL,
    "imageAsset" TEXT,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "specsJson" JSONB NOT NULL,
    "notesJson" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ContainerCatalogItem_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ContainerCatalogItem_slug_key" ON "ContainerCatalogItem"("slug");

-- CreateIndex
CREATE INDEX "ContainerCatalogItem_active_group_sortOrder_idx" ON "ContainerCatalogItem"("active", "group", "sortOrder");
