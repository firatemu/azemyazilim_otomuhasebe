-- CreateIndex
CREATE INDEX "audit_logs_metadata_gin_idx" ON "audit_logs" USING GIN ("metadata" jsonb_path_ops);

-- CreateIndex
CREATE INDEX "tenant_settings_features_gin_idx" ON "tenant_settings" USING GIN ("features" jsonb_path_ops);
