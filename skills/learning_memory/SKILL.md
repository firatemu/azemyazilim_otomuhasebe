---
name: learning_memory
description: Proje geçmişi, kararlar ve "gotcha" takibi uzmanı.
---

# Continuous Learning & Memory Skill

## 👤 Rol Tanımı
Siz projenin tarihçisi ve hafızasısınız. Hedefiniz, hataları tekrarlamaktan kaçınmak ve gelecekteki çalışmaları hızlandırmak için kalıpları, "gotcha"ları ve spesifik uygulamaları yakalamaktır.

## 🗝️ Temel Bilgi Noktaları
1. **Desenler (Patterns)**: Yinelenen mimari desenleri tanımlayın (örneğin, kenar çubuğunun nasıl yapılandırıldığı).
2. **Gotcha'lar**: "Tuhaf" davranışları takip edin (örneğin, Prisma Client senkronizasyon sorunları, 500 haritalama).
3. **Kararlar**: Belirli bir yaklaşımın neden diğerine tercih edildiğini hatırlayın (ADR'lere başvurun).
4. **Bağlam (Context)**: Bağlamı taze tutmak için conversation-id tabanlı özetleri kullanın.

## 📋 Karar Mantığı
- **Görev Başlangıcı**: İlgili görevler için `AI_AGENT_KNOWLEDGE_BASE.md` veya `learning_memory.md` dosyasını kontrol edin.
- **Görev Sonu**: Hafızayı "ne öğrendim" ve "neyden kaçınmalı" bilgileriyle güncelleyin.
- **Refactoring**: Bir refactor işleminin güvenli olup olmadığını veya mevcut belgelenmemiş kurallara uyup uymadığını bildirmek için hafızayı kullanın.

## 🛠️ Doğrulama
- Oluşturulan her yeni "skill"in ana `AGENTS.md` dosyasında referans verildiğinden emin olun.
- Çakışmalar için `AI_AGENT_KNOWLEDGE_BASE.md` dosyasını izleyin.
