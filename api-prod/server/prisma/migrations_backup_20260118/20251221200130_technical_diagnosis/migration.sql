-- CreateTable: TechnicalFinding
CREATE TABLE "technical_findings" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "workOrderId" TEXT NOT NULL,
    "title" VARCHAR(200) NOT NULL,
    "description" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "technical_findings_pkey" PRIMARY KEY ("id")
);

-- CreateTable: DiagnosticNote
CREATE TABLE "diagnostic_notes" (
    "id" TEXT NOT NULL,
    "tenantId" TEXT NOT NULL,
    "workOrderId" TEXT NOT NULL,
    "note" TEXT NOT NULL,
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "version" INTEGER NOT NULL DEFAULT 1,

    CONSTRAINT "diagnostic_notes_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "technical_findings_tenantId_workOrderId_idx" ON "technical_findings"("tenantId", "workOrderId");

-- CreateIndex
CREATE INDEX "technical_findings_tenantId_createdAt_idx" ON "technical_findings"("tenantId", "createdAt");

-- CreateIndex
CREATE INDEX "diagnostic_notes_tenantId_workOrderId_idx" ON "diagnostic_notes"("tenantId", "workOrderId");

-- CreateIndex
CREATE INDEX "diagnostic_notes_tenantId_createdAt_idx" ON "diagnostic_notes"("tenantId", "createdAt");

-- AddForeignKey
ALTER TABLE "technical_findings" ADD CONSTRAINT "technical_findings_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "work_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "diagnostic_notes" ADD CONSTRAINT "diagnostic_notes_workOrderId_fkey" FOREIGN KEY ("workOrderId") REFERENCES "work_orders"("id") ON DELETE CASCADE ON UPDATE CASCADE;

