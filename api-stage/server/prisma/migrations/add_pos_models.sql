-- POS Console: add PaymentMethod values, PosSessionStatus enum, pos_payments and pos_sessions tables.
-- Run with: psql $DATABASE_URL -f prisma/migrations/add_pos_models.sql

-- 1. Add new values to PaymentMethod enum (ignore if already exist)
DO $$ BEGIN
  ALTER TYPE "PaymentMethod" ADD VALUE 'HEDIYE_KARTI';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN
  ALTER TYPE "PaymentMethod" ADD VALUE 'KREDI_HESABI';
EXCEPTION WHEN duplicate_object THEN NULL; END $$;

-- 2. Create PosSessionStatus enum
DO $$ BEGIN
  CREATE TYPE "PosSessionStatus" AS ENUM ('OPEN', 'CLOSED');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- 3. Create pos_payments table (id/invoice_id/tenant_id as TEXT to match existing DB)
CREATE TABLE IF NOT EXISTS "pos_payments" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "invoice_id" TEXT NOT NULL REFERENCES "invoices"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "payment_method" "PaymentMethod" NOT NULL,
  "amount" DECIMAL(12,2) NOT NULL,
  "change" DECIMAL(12,2),
  "gift_card_id" TEXT,
  "notes" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "tenant_id" TEXT REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "created_by" TEXT,
  "updated_by" TEXT
);

CREATE INDEX IF NOT EXISTS "pos_payments_tenant_id_idx" ON "pos_payments"("tenant_id");
CREATE INDEX IF NOT EXISTS "pos_payments_invoice_id_idx" ON "pos_payments"("invoice_id");

-- 4. Create pos_sessions table (id as TEXT to match existing DB)
CREATE TABLE IF NOT EXISTS "pos_sessions" (
  "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid()::text,
  "session_no" TEXT NOT NULL,
  "cashier_id" TEXT NOT NULL,
  "cashbox_id" TEXT NOT NULL,
  "opening_amount" DECIMAL(12,2) NOT NULL,
  "closing_amount" DECIMAL(12,2),
  "closing_notes" TEXT,
  "status" "PosSessionStatus" NOT NULL,
  "opened_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "closed_at" TIMESTAMP(3),
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "tenant_id" TEXT REFERENCES "tenants"("id") ON DELETE CASCADE ON UPDATE CASCADE,
  "created_by" TEXT,
  "updated_by" TEXT,
  UNIQUE("session_no", "tenant_id")
);

CREATE INDEX IF NOT EXISTS "pos_sessions_tenant_id_idx" ON "pos_sessions"("tenant_id");
CREATE INDEX IF NOT EXISTS "pos_sessions_cashier_id_idx" ON "pos_sessions"("cashier_id");
CREATE INDEX IF NOT EXISTS "pos_sessions_status_idx" ON "pos_sessions"("status");
