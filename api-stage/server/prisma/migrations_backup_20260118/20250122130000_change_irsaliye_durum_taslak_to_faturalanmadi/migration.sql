-- Change IrsaliyeDurum enum: TASLAK -> FATURALANMADI

-- PostgreSQL requires enum value additions to be in separate transactions
-- So we need to use DO blocks or separate statements

-- 1. Add new enum value (must be in separate transaction in PostgreSQL)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM pg_enum WHERE enumlabel = 'FATURALANMADI' AND enumtypid = (SELECT oid FROM pg_type WHERE typname = 'IrsaliyeDurum')) THEN
        ALTER TYPE "IrsaliyeDurum" ADD VALUE 'FATURALANMADI';
    END IF;
END $$;

-- 2. Update all existing TASLAK records to FATURALANMADI
UPDATE "satis_irsaliyeleri"
SET "durum" = 'FATURALANMADI'::"IrsaliyeDurum"
WHERE "durum" = 'TASLAK'::"IrsaliyeDurum";

-- 3. Change default value in table
ALTER TABLE "satis_irsaliyeleri"
ALTER COLUMN "durum" SET DEFAULT 'FATURALANMADI'::"IrsaliyeDurum";

-- Note: PostgreSQL doesn't support removing enum values directly.
-- The old 'TASLAK' value will remain in the enum type but won't be used.
-- To fully remove it, we would need to recreate the enum type (more complex migration).

