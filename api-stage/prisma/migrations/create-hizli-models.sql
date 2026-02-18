-- Migration: Create HizliToken and EfaturaInbox tables
-- Run this migration manually or via Prisma migrate

-- Drop existing tables if they exist (for clean migration)
DROP TABLE IF EXISTS "efatura_inbox";
DROP TABLE IF EXISTS "hizli_tokens";

-- Create hizli_tokens table
CREATE TABLE "hizli_tokens" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "loginHash" TEXT NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hizli_tokens_pkey" PRIMARY KEY ("id")
);

-- Create indexes for hizli_tokens
CREATE INDEX "hizli_tokens_expiresAt_idx" ON "hizli_tokens"("expiresAt");
CREATE INDEX "hizli_tokens_loginHash_idx" ON "hizli_tokens"("loginHash");

-- Create efatura_inbox table
CREATE TABLE "efatura_inbox" (
    "id" SERIAL NOT NULL,
    "ettn" TEXT NOT NULL,
    "senderVkn" TEXT NOT NULL,
    "senderTitle" TEXT NOT NULL,
    "invoiceNo" TEXT,
    "invoiceDate" TIMESTAMP(3),
    "rawXml" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "efatura_inbox_pkey" PRIMARY KEY ("id"),
    CONSTRAINT "efatura_inbox_ettn_key" UNIQUE ("ettn")
);

-- Create indexes for efatura_inbox
CREATE INDEX "efatura_inbox_senderVkn_idx" ON "efatura_inbox"("senderVkn");
CREATE INDEX "efatura_inbox_createdAt_idx" ON "efatura_inbox"("createdAt");

