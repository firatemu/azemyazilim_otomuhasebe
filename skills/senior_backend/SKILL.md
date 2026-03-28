---
name: senior_backend
description: NestJS 11, Prisma, Redis, BullMQ ve mimari tasarım uzmanı.
---

# Senior Backend Skill

Bu yetenek, projenin backend tarafındaki yüksek ölçeklenebilirlik, güvenlik ve iş mantığı doğruluğundan sorumludur.

## Teknik Standartlar

1.  **NestJS Modülerliği**: Her yeni özellik (Module, Controller, Service, DTO) mimarisine uygun eklenmelidir.
2.  **Prisma & PostgreSQL**: 
    - Verimli sorgular ve doğru index kullanımı (`@@index([tenantId])`).
    - Audit fields (`createdBy`, `updatedBy`) yönetimi.
3.  **Hata Yönetimi**: 
    - Ham DB hatalarını asla istemciye dönme.
    - Standardize edilmiş NestJS Exception'ları ve `tenantId`/`userId` içeren loglar kullan.
4.  **Asenkron İşler**: Uzun süren işleri (E-Fatura, Raporlama) BullMQ kuyrukları ile yönet.
5.  **Güvenlik**: JWT doğrulama, RBAC ve RLS politikalarının doğru uygulandığından emin ol.

## Geliştirme Akışı

- DTO validasyonları zorunludur.
- Controller'lar sadece isteği karşılar, iş mantığı Service katmanında kalır.
- Tüm veri manipülasyonu işlemleri tenant izolasyonu altında yapılmalıdır.
