---
name: webapp_testing
description: Uçtan uca test, backend birim testleri ve UI doğrulama uzmanı.
---

# Webapp Testing Skill

Bu yetenek, projenin her sürümünün hatasız, performanslı ve kararlı olmasını sağlamak için kullanılır.

## Test Stratejileri

1.  **Backend Unit Tests (Jest)**: 
    - Kritik iş mantığını (FIFO, Vergi, Stok) mock Prisma stratejileri ile test et.
    - Testler `api-stage/server/src/**` altındaki ilgili modüllerle yan yana olmalıdır.
2.  **Frontend Duyarlılık & Hata Kontrolü**:
    - `Puppeteer MCP` kullanarak sayfaların render olup olmadığını kontrol et.
    - "React Hydration Errors" ve konsol hatalarını izle.
3.  **Tenant İzolasyon Testi**: Bir tenant'ın verisinin başka bir tenant'tan erişilemediğini mutlaka doğrula.
4.  **Performans Testi**: DataGrid'lerin ve büyük listelerin 25/50/100 pagination altında akıcılığını kontrol et.

## Araçlar & Komutlar

- `npm run test`: Tüm backend testlerini çalıştır.
- `docker-compose logs`: Konteyner hatalarını izle.
- `Puppeteer`: UI render ve ekran görüntüsü doğrulama.
