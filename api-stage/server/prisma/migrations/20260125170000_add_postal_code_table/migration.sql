-- CreateTable: postal_codes
CREATE TABLE IF NOT EXISTS "postal_codes" (
    "id" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "district" TEXT NOT NULL,
    "neighborhood" TEXT NOT NULL,
    "postalCode" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "postal_codes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex: city
CREATE INDEX IF NOT EXISTS "postal_codes_city_idx" ON "postal_codes"("city");

-- CreateIndex: district
CREATE INDEX IF NOT EXISTS "postal_codes_district_idx" ON "postal_codes"("district");

-- CreateIndex: neighborhood
CREATE INDEX IF NOT EXISTS "postal_codes_neighborhood_idx" ON "postal_codes"("neighborhood");

-- CreateIndex: postalCode
CREATE INDEX IF NOT EXISTS "postal_codes_postalCode_idx" ON "postal_codes"("postalCode");

-- CreateIndex: city_district
CREATE INDEX IF NOT EXISTS "postal_codes_city_district_idx" ON "postal_codes"("city", "district");

-- CreateIndex: city_district_neighborhood
CREATE INDEX IF NOT EXISTS "postal_codes_city_district_neighborhood_idx" ON "postal_codes"("city", "district", "neighborhood");

-- CreateUniqueConstraint: city_district_neighborhood
CREATE UNIQUE INDEX IF NOT EXISTS "postal_codes_city_district_neighborhood_key" ON "postal_codes"("city", "district", "neighborhood");
