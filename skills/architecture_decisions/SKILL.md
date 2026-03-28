---
name: architecture_decisions
description: Mimari kararları (ADR) yakalama ve standart dökümantasyon uzmanı.
---

# Architecture Decision Records (ADR) Skill

## Amaç
Geliştirme oturumları sırasında alınan mimari kararları otomatik olarak yakalamak ve yapılandırılmış ADR formatında dökümante etmek.

## Ne Zaman Tetiklenmeli?
- Önemli bir refactoring önerildiğinde.
- Yeni bir teknoloji veya kütüphane eklendiğinde.
- Mevcut bir mimari desen (pattern) değiştirildiğinde.

## Karar Kaydı Nasıl Tutulur?
1. **Kararı Tanımla**: Değişen nedir?
2. **Bağlam (Context)**: Arka planı ve çözülen sorunu açıkla.
3. **Karar**: Seçilen yolu dökümante et.
4. **Gerekçe (Rationale)**: Bu yol neden başkalarına tercih edildi?
5. **Etki (Impact)**: Uzun vadede kod tabanını nasıl etkileyecek?

## Depolama
ADR'leri `docs/adr/*.md` dizinine, üç haneli dizin numarasıyla (ör: `001-use-prisma.md`) kaydet.
