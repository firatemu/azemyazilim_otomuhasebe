---
name: code_reviewer
description: Tenant izolasyonu, Prisma güvenliği ve ERP iş kuralları denetim uzmanı.
---

# Code Reviewer Skill

Bu yetenek, projenin güvenlik, bütünlük ve mimari standartlara uyumunu denetlemek için kullanılır. Her kod değişikliği bu süzgeçten geçmelidir.

## Kritik Kontroller

1.  **Multi-Tenant İzolasyonu**: 
    - Prisma sorgularında `tenantId` filtresi var mı?
    - `TenantResolverService` (backend) veya `x-tenant-id` header (frontend) kullanılmış mı?
2.  **Veritabanı İşlemleri (Transactions)**: 
    - Çok aşamalı (Stok + Fatura + Cari) işlemler `$transaction` içinde mi?
    - Rollback mekanizması var mı?
3.  **Güvenli Yazım**:
    - Raw Prisma sorguları yasak. (İstisnalar hariç ve tenant filtresiyle).
    - DTO validasyonları (`class-validator`) eksiksiz mi?
4.  **Soft Delete**: `deletedAt: null` filtresi her sorguda uygulanıyor mu?
5.  **ERP İş Kuralları**: FIFO, maliyet hesaplama ve fatura iptal kurallarına uygun mu?

## Standartlar

- Kod temizliği ve dosya disiplini (`.agent-work` kuralı).
- Semantic commit mesajları ve doğru `task.md` güncellemeleri.
- Türkçe uygulama planları ve raporlar.
