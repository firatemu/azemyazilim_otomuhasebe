SHELL := /bin/bash

# ═════════════════════════════════════════════════════════════════
# DOCKER COMPOSE PATHS (after monorepo reorganization)
# ═════════════════════════════════════════════════════════════════
# OLD: docker/compose/docker-compose.base.yml
# NEW: infra/compose/docker-compose.base.yml
# ═════════════════════════════════════════════════════════════════

BASE = infra/compose/docker-compose.base.yml
STAGING = infra/compose/docker-compose.staging.yml
STAGING_DEV = infra/compose/docker-compose.staging.dev.yml
PROD = infra/compose/docker-compose.prod.yml
COMPOSE ?= docker compose

# Prod image tag (örn: 1.0.0) – terminalde export IMAGE_TAG yap
IMAGE_TAG ?= latest

# Staging env: proje kökündeki .env.staging kullanılır
ENV_STAGING ?= .env.staging

# --- STAGING (local build) ---
up-staging:
	@echo "Starting staging environment..."
	$(COMPOSE) -f $(BASE) -f $(STAGING) up -d --build

up-staging-dev:
	@echo "Starting staging DEV (hot-reload) environment..."
	$(COMPOSE) --env-file $(ENV_STAGING) -f $(BASE) -f $(STAGING_DEV) up -d

migrate-staging:
	@echo "Running database migrations (staging)..."
	$(COMPOSE) -f $(BASE) -f $(STAGING) run --rm backend-staging npx prisma migrate deploy

logs-staging:
	@echo "Following logs from staging services..."
	$(COMPOSE) -f $(BASE) -f $(STAGING) logs -f

logs-staging-dev:
	@echo "Following logs from staging DEV services..."
	$(COMPOSE) --env-file $(ENV_STAGING) -f $(BASE) -f $(STAGING_DEV) logs -f

down-staging:
	@echo "Stopping staging environment..."
	$(COMPOSE) -f $(BASE) -f $(STAGING) down

down-staging-dev:
	@echo "Stopping staging DEV environment..."
	$(COMPOSE) --env-file $(ENV_STAGING) -f $(BASE) -f $(STAGING_DEV) down

.PHONY: up-staging up-staging-dev migrate-staging logs-staging logs-staging-dev down-staging down-staging-dev