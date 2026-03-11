CREATE TABLE "public"."product_image" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "imageUrl" TEXT NOT NULL,
    "isPrimary" BOOLEAN NOT NULL DEFAULT false,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "product_image_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "product_image_productId_idx" ON "public"."product_image"("productId");
CREATE INDEX "product_image_productId_isPrimary_idx" ON "public"."product_image"("productId", "isPrimary");

ALTER TABLE "public"."product_image"
ADD CONSTRAINT "product_image_productId_fkey"
FOREIGN KEY ("productId") REFERENCES "public"."product"("id")
ON DELETE CASCADE ON UPDATE CASCADE;

INSERT INTO "public"."product_image" ("id", "productId", "imageUrl", "isPrimary", "sortOrder", "createdAt")
SELECT p."id" || '-legacy-image', p."id", p."imageUrl", true, 0, NOW()
FROM "public"."product" p
WHERE p."imageUrl" IS NOT NULL;
