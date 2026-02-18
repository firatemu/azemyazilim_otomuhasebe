-- Migration: Make banka_hesaplari.hesapAdi nullable
-- Date: 2024-12-22

-- Step 1: Update existing empty strings to NULL (optional, for data consistency)
UPDATE banka_hesaplari SET "hesapAdi" = NULL WHERE "hesapAdi" = '';

-- Step 2: Alter column to allow NULL
ALTER TABLE banka_hesaplari ALTER COLUMN "hesapAdi" DROP NOT NULL;

