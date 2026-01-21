SHELL := /bin/bash

BASE = docker/compose/docker-compose.base.yml
STAGING = docker/compose/docker-compose.staging.yml
STAGING_DEV = docker/compose/docker-compose.staging.dev.yml
PROD = docker/compose/docker-compose.prod.yml
COMPOSE ?= docker compose

# Prod image tag (örn: 1.0.0) – terminalde export IMAGE_TAG yap
IMAGE_TAG ?= latest

# --- STAGING (local build) ---
up-staging:
	@echo "Starting staging environment..."
	$(COMPOSE) -f $(BASE) -f $(STAGING) up -d --build

up-staging-dev:
	@echo "Starting staging DEV (hot-reload) environment..."
	$(COMPOSE) --env-file docker/compose/.env.staging -f $(BASE) -f $(STAGING_DEV) up -d

migrate-staging:
	@echo "Running database migrations (staging)..."
	$(COMPOSE) -f $(BASE) -f $(STAGING) run --rm backend-staging npx prisma migrate deploy

logs-staging:
	@echo "Following logs from staging services..."
	$(COMPOSE) -f $(BASE) -f $(STAGING) logs -f

logs-staging-dev:
	@echo "Following logs from staging DEV services..."
	$(COMPOSE) --env-file docker/compose/.env.staging -f $(BASE) -f $(STAGING_DEV) logs -f

down-staging:
	@echo "Stopping staging environment..."
	$(COMPOSE) -f $(BASE) -f $(STAGING) down

down-staging-dev:
	@echo "Stopping staging DEV environment..."
	$(COMPOSE) --env-file docker/compose/.env.staging -f $(BASE) -f $(STAGING_DEV) down

# --- PRODUCTION (image pull) ---
build-prod:
	IMAGE_TAG=$(IMAGE_TAG) $(COMPOSE) -f $(BASE) -f $(PROD) build

pull-prod:
	IMAGE_TAG=$(IMAGE_TAG) $(COMPOSE) -f $(BASE) -f $(PROD) pull

migrate-prod:
	IMAGE_TAG=$(IMAGE_TAG) $(COMPOSE) -f $(BASE) -f $(PROD) run --rm backend npx prisma migrate deploy

up-prod:
	IMAGE_TAG=$(IMAGE_TAG) $(COMPOSE) -f $(BASE) -f $(PROD) up -d

logs-prod:
	IMAGE_TAG=$(IMAGE_TAG) $(COMPOSE) -f $(BASE) -f $(PROD) logs -f

down-prod:
	$(COMPOSE) -f $(BASE) -f $(PROD) down

.PHONY: up-staging up-staging-dev migrate-staging logs-staging logs-staging-dev down-staging down-staging-dev \
        build-prod pull-prod migrate-prod up-prod logs-prod down-prod

deploy-prod:
	IMAGE_TAG=${IMAGE_TAG:-latest} make -C /var/www pull-prod && make -C /var/www migrate-prod && make -C /var/www up-prod

backup-prod:
	mkdir -p /var/www/backups && pg_dump -Fc -U user -h localhost -p 5432 prod_db > /var/www/backups/prod_$(date +%F_%H%M).dump

restore-prod:
	@if [ -z "$$DUMP" ]; then echo "DUMP dosyası: make restore-prod DUMP=backups/xxx.dump"; exit 1; fi; pg_restore -c -d prod_db $$DUMP
