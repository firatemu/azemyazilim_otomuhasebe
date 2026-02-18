-- Create PriceCardType enum if it does not already exist
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'PriceCardType') THEN
        CREATE TYPE "PriceCardType" AS ENUM ('SALE', 'PURCHASE');
    END IF;
END
$$;

-- Create price_cards table
CREATE TABLE IF NOT EXISTS "price_cards" (
    "id" TEXT NOT NULL DEFAULT gen_random_uuid()::text,
    "stok_id" TEXT NOT NULL,
    "type" "PriceCardType" NOT NULL,
    "price" NUMERIC(12, 2) NOT NULL,
    "currency" TEXT NOT NULL DEFAULT 'TRY',
    "effective_from" TIMESTAMP,
    "effective_to" TIMESTAMP,
    "note" TEXT,
    "created_by" TEXT,
    "updated_by" TEXT,
    "created_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "price_cards_pkey" PRIMARY KEY ("id")
);

-- Index for faster lookups by stock and type
CREATE INDEX IF NOT EXISTS "price_cards_stok_type_created_at_idx"
    ON "price_cards" ("stok_id", "type", "created_at" DESC);

-- Foreign keys
ALTER TABLE "price_cards"
    ADD CONSTRAINT "price_cards_stok_id_fkey" FOREIGN KEY ("stok_id")
        REFERENCES "stoklar"("id") ON DELETE CASCADE;

ALTER TABLE "price_cards"
    ADD CONSTRAINT "price_cards_created_by_fkey" FOREIGN KEY ("created_by")
        REFERENCES "users"("id") ON DELETE SET NULL;

ALTER TABLE "price_cards"
    ADD CONSTRAINT "price_cards_updated_by_fkey" FOREIGN KEY ("updated_by")
        REFERENCES "users"("id") ON DELETE SET NULL;

