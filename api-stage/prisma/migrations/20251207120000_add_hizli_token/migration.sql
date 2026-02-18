-- CreateTable
CREATE TABLE "hizli_tokens" (
    "id" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "encryptedUsername" TEXT NOT NULL,
    "encryptedPassword" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "hizli_tokens_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "hizli_tokens_token_key" ON "hizli_tokens"("token");

-- CreateIndex
CREATE INDEX "hizli_tokens_expiresAt_idx" ON "hizli_tokens"("expiresAt");

-- CreateIndex
CREATE INDEX "hizli_tokens_token_idx" ON "hizli_tokens"("token");

