---
name: git_commit_helper
description: Sementik commit mesajları ve değişiklik özeti hazırlama uzmanı.
---

# Git Commit Helper Skill

Bu yetenek, projenin sürüm geçmişinin ("git log") temiz, anlamlı ve takip edilebilir olmasını sağlar.

## Commit Yazım Kuralları

1.  **Conventional Commits**: `feat:`, `fix:`, `refactor:`, `docs:`, `chore:`, `test:` gibi standart ön ekleri kullan.
2.  **Türkçe Mesajlar**: Commit başlıkları ve açıklamaları Türkçe olmalıdır.
3.  **Kapsam Belirtme**: Değişikliğin hangi modülü (örn: `pos`, `invoice`, `auth`) etkilediğini parantez içinde belirt.
4.  **Detaylı Açıklama**: Karmaşık değişikliklerde birden fazla satır kullanarak "ne" yapıldığını ve "neden" yapıldığını açıkla.

## Örnekler

- `feat(pos): yeni ödeme yöntemi (kredi kartı) eklendi`
- `fix(auth): tenant izolasyonu sızıntısı giderildi`
- `refactor(ui): MUI v7 uyumluluğu için renk tokenları güncellendi`
- `docs(api): invoice-service swagger dökümanları tamamlandı`
