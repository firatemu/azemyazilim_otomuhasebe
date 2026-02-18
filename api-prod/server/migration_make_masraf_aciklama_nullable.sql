-- Migration: Make masraf.aciklama nullable
-- Date: 2024-12-22

-- Step 1: Update existing empty strings to NULL (optional, for data consistency)
UPDATE masraflar SET aciklama = NULL WHERE aciklama = '';

-- Step 2: Alter column to allow NULL
ALTER TABLE masraflar ALTER COLUMN aciklama DROP NOT NULL;

