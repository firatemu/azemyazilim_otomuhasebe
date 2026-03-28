---
name: senior_frontend
description: Next.js App Router, SSR/CSR, Zustand ve performans uzmanı.
---

# Senior Frontend Skill

Bu yetenek, projenin frontend tarafındaki teknik mükemmellikten, mimari doğruluğundan ve performanstan sorumludur.

## Teknik Odak Noktaları

1.  **Hybrid Architecture**: Server Components (Layout, Dashboard, Static) ve Client Components (Interactive, DataGrid, Form) dengesini koru.
2.  **Data Fetching**:
    - Server: `serverFetch.ts` kullanarak JWT ve `x-tenant-id` otomatik yönetimini sağla.
    - Client: Axios interceptors ve TanStack Query kullan.
3.  **State Management**: Zustand store'larını (örneğin `posStore.ts`) tek bir amaca hizmet edecek şekilde atomik ve performanslı tasarla.
4.  **Optimization**: 
    - Turbopack uyumlu kod yaz.
    - Büyük listelerde sanallaştırma (Virtualization) kullan.
    - Hydration hatalarını (`Puppeteer MCP` ile) önceden kontrol et.

## Kodlama Standartları

- `use client` direktifini sadece gerekli bileşenlerin en üst seviyesinde kullan.
- MUI bileşenlerini modern bir şekilde (`sx` prop'u ve `styled` helper) özelleştir.
- Hata yönetiminde `Snackbar` (Toast) ve inline validation mesajlarını birleştir.
