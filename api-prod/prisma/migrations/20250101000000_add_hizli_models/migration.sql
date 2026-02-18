-- CreateTable
CREATE TABLE "hizli_tokens" (
    "id" SERIAL NOT NULL,
    "token" TEXT NOT NULL,
    "loginHash" TEXT NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hizli_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateTable
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

-- CreateIndex
CREATE INDEX "hizli_tokens_expiresAt_idx" ON "hizli_tokens"("expiresAt");

-- CreateIndex
CREATE INDEX "hizli_tokens_loginHash_idx" ON "hizli_tokens"("loginHash");

-- CreateIndex
CREATE INDEX "efatura_inbox_senderVkn_idx" ON "efatura_inbox"("senderVkn");

-- CreateIndex
CREATE INDEX "efatura_inbox_createdAt_idx" ON "efatura_inbox"("createdAt");

