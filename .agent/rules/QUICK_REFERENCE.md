# Otomuhasebe Development Quick Reference

**Proje:** Multi-Tenant SaaS ERP  
**Lokasyon:** `/var/www/`

## 🔴 GOLDEN RULE: Tenant İzolasyonu

```typescript
// ✅ DOĞRU
where: { tenantId, ... }

// ❌ YANLIŞ - GÜVENLİK RİSKİ
where: { ... } // tenantId yok!
```

## 🎯 Hızlı Kararlar

**Her kod yazmadan önce sor:**
- Tenant-scoped mı, global-scoped mı?
- Cache gerekli mi?
- Async (BullMQ) olmalı mı?
- Migration gerekli mi?

## 📚 Tech Stack

**Backend:** NestJS + Prisma + PostgreSQL + Redis + BullMQ  
**Frontend:** Next.js 15 + MUI v7 + TanStack Query + Zod

## 🛠️ MCP Kısayolları

- **Prisma:** "Şemayı analiz et"
- **Docker:** "Backend'i restart et"
- **DB:** "Yavaş sorguları bul"
- **Tenant:** "Tenant listele"
- **Cache:** "Cache stats göster"
- **Log:** "Hataları bul"

## ✅ Checklist

**Backend:**
- [ ] tenantId filtresi var mı?
- [ ] DTO validation var mı?
- [ ] Index'ler eklendi mi?
- [ ] Async işlem BullMQ'da mı?

**Frontend:**
- [ ] Zod schema backend DTO ile uyumlu mu?
- [ ] TanStack Query kullanıldı mı?
- [ ] Error handling var mı?
- [ ] RBAC kontrolleri var mı?

## 📁 Önemli Konumlar

- Backend: `/var/www/api-stage/server/`
- Frontend: `/var/www/panel-stage/client/`
- Schema: `prisma/schema.prisma`
- MCP'ler: `/var/www/.mcp-servers/`

## 🚨 Yasaklar

❌ tenantId olmadan sorgu  
❌ Native Express  
❌ Redux/Context API  
❌ Hardcoded tenantId  
❌ Controller'da heavy logic  
❌ Sync email/PDF generation

## ✨ Zorunluluklar

✅ Controller → Service → Prisma  
✅ DTO + class-validator  
✅ TanStack Query  
✅ react-hook-form + Zod  
✅ Material UI (sx/styled)  
✅ BullMQ (async işlemler)

---

**Detaylı kurallar:** `/var/www/.agent/rules/MASTER_PROMPT.md`
