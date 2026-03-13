# 🏢 Oto Muhasebe - Multi-Tenant SaaS ERP Platform

Enterprise-grade monorepo structure for modern ERP platform.

---

## 📁 Project Structure

```
otomuhasebe/
├── api-stage/              # NestJS backend (multi-tenant SaaS)
├── panel-stage/            # Next.js frontend (React + TypeScript)
│
├── infra/                  # Infrastructure as Code
│   ├── compose/            # Docker Compose configurations
│   ├── caddy/              # Reverse proxy configs
│   ├── pgbouncer/          # Connection pooler configs
│   ├── monitoring/         # Prometheus & Grafana
│   └── backup/             # Backup system scripts
│
├── envs/                   # Environment file templates
├── scripts/                # Utility scripts
└── docs/                   # Documentation
```

---

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 20+ (for local development)
- pnpm (package manager)

### 1. Environment Setup

```bash
# Copy environment templates
cp envs/.env.staging.example .env.staging
cp envs/.env.backup.example .env.backup

# Edit with your values
nano .env.staging
nano .env.backup
```

### 2. Start Staging Environment

```bash
# Build and start all services
make up-staging-dev

# View logs
make logs-staging-dev

# Stop services
make down-staging-dev
```

### 3. Access Applications

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:3001
- **Grafana**: http://localhost:3001/grafana
- **Prometheus**: http://localhost:3001/prometheus

---

## 📦 Available Makefile Commands

```bash
# Staging environments
make up-staging          # Start staging (production-like)
make up-staging-dev      # Start staging DEV (hot-reload)
make logs-staging        # View staging logs
make logs-staging-dev    # View staging DEV logs
make down-staging        # Stop staging
make down-staging-dev    # Stop staging DEV

# Database migrations
make migrate-staging     # Run migrations on staging

# Development (within containers)
docker compose exec backend-staging bash
docker compose exec panel-staging bash
```

---

## 🏗️ Architecture

### Backend (NestJS)
- **Framework**: NestJS with Prisma ORM
- **Database**: PostgreSQL with Row-Level Security (RLS)
- **Auth**: JWT + Tenant isolation
- **Caching**: Redis
- **Connection Pooling**: PgBouncer

### Frontend (Next.js)
- **Framework**: Next.js 14 with App Router
- **Styling**: Tailwind CSS
- **State**: React Context + Zustand
- **Forms**: React Hook Form + Zod

### Infrastructure
- **Reverse Proxy**: Caddy (automatic HTTPS)
- **Monitoring**: Prometheus + Grafana
- **Backup**: Automated PostgreSQL backups with MinIO
- **Orchestration**: Docker Compose

---

## 🔄 Database Migrations

```bash
# Create new migration
cd api-stage/server
npx prisma migrate dev --name my_migration

# Deploy migrations (staging)
make migrate-staging

# Reset database (DANGEROUS - use only in dev!)
cd api-stage/server
npx prisma migrate reset
```

---

## 💾 Backup System

Automated PostgreSQL backups run daily at 23:30.

### Manual Backup
```bash
# Backup to local storage + MinIO
docker compose -f infra/compose/docker-compose.backup.yml exec backup \
  /usr/local/bin/backup.sh
```

### Restore Database
```bash
# List available backups
docker compose -f infra/compose/docker-compose.backup.yml exec backup \
  /usr/local/bin/restore.sh

# Test backup integrity (safe - doesn't touch production)
docker compose -f infra/compose/docker-compose.backup.yml exec backup \
  /usr/local/bin/restore-test.sh
```

### Backup Configuration
See `envs/.env.backup.example` for settings:
- Retention period (default: 7 days)
- Schedule (default: 23:30 daily)
- MinIO storage endpoint

---

## 📊 Monitoring

### Grafana Dashboards
- System metrics (CPU, RAM, Disk)
- PostgreSQL performance
- Redis cache hit rate
- Application logs

Access: http://localhost:3001/grafana
Default credentials: See `envs/.env.monitoring.example`

---

## 🔒 Security

### Environment Files
- Real `.env.*` files are **gitignored**
- Only `.env.*.example` files are tracked
- Never commit secrets to repository

### Secrets Management
```bash
# Setup secrets directory (gitignored)
./scripts/setup-secrets.sh

# Secrets stored in:
# - .env.staging (staging environment)
# - .env.production (production environment)
# - MinIO (file storage)
# - PostgreSQL (database credentials)
```

### Row-Level Security (RLS)
- Multi-tenant isolation enforced at database level
- Each tenant can only access their own data
- RLS policies applied to all tables

---

## 🛠️ Development Workflow

### 1. Branch Strategy
```
main          ← Production releases
staging       ← Staging environment
dev/*         ← Feature branches
```

### 2. Local Development
```bash
# Start staging DEV with hot-reload
make up-staging-dev

# Frontend hot-reload: panel-stage/client/
# Backend hot-reload: api-stage/server/
```

### 3. Testing
```bash
# Backend tests
cd api-stage/server
npm test

# E2E tests
cd api-stage
npm run test:e2e
```

---

## 📝 Documentation

| Document | Location |
|----------|----------|
| Database Schema | `docs/DATABASE_SCHEMA_COMPLETE.md` |
| Production Deployment | `docs/PRODUCTION_DEPLOYMENT_GUIDE.md` |
| Monitoring Setup | `docs/MONITORING_DEPLOYMENT_GUIDE.md` |
| Staging Deployment | `scripts/README-staging-deploy.md` |

---

## 🏢 Multi-Tenancy

### Tenant Isolation
- **Application Level**: Tenant ID in JWT claims
- **Database Level**: Row-Level Security (RLS)
- **Infrastructure Level**: Separate databases per tenant (optional)

### Tenant Management
```bash
# Create new tenant
# Via API: POST /api/v1/tenants
# Via admin panel: Settings → Tenants → Add Tenant
```

---

## 🔄 CI/CD

### GitHub Actions
- **On push to main**: Deploy to production
- **On push to staging**: Deploy to staging
- **On pull request**: Run tests + lint

### Deployment Scripts
```bash
# Deploy to staging server
./scripts/deploy-staging-to-server.sh

# Full backup before deployment
./scripts/backup-full.sh
```

---

## 🐛 Troubleshooting

### Container won't start
```bash
# Check logs
docker compose logs -f <service-name>

# Restart service
docker compose restart <service-name>

# Rebuild image
docker compose up -d --build <service-name>
```

### Database connection failed
```bash
# Check PostgreSQL status
docker compose ps postgres

# Check PgBouncer status
docker compose ps pgbouncer

# Test connection
docker compose exec postgres psql -U postgres -d otomuhasebe_saas_db -c "SELECT 1;"
```

### Frontend not accessible
```bash
# Check Caddy status
docker compose logs caddy

# Restart Caddy
docker compose restart caddy
```

---

## 📞 Support

- **Issues**: GitHub Issues
- **Documentation**: `docs/` directory
- **Deployment Guides**: `scripts/README-staging-deploy.md`

---

## 📄 License

Proprietary - All rights reserved.

---

**Built with ❤️ by the Oto Muhasebe Team**