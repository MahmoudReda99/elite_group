ALTER TABLE "ContainerCatalogItem"
ADD COLUMN "categorySlug" TEXT NOT NULL DEFAULT 'dry-cargo',
ADD COLUMN "categoryName" TEXT NOT NULL DEFAULT 'Dry Cargo container',
ADD COLUMN "subgroupName" TEXT NOT NULL DEFAULT 'Standard',
ADD COLUMN "subgroupSortOrder" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN "illustrationKey" TEXT NOT NULL DEFAULT 'dry';

CREATE INDEX "ContainerCatalogItem_active_categorySlug_subgroupSortOrder_sortOrder_idx"
ON "ContainerCatalogItem"("active", "categorySlug", "subgroupSortOrder", "sortOrder");
