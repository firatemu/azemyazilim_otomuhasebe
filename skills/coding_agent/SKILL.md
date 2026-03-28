---
name: coding_agent
description: Karmaşık geliştirme görevlerini ve özellik yapılarını koordine eden orkestratör.
---

# Coding Agent Orchestrator Skill

## Amaç
Karmaşık geliştirme görevlerini ve yeni özellik yapılarını uzmanlaşmış arka plan AI ajanlarına delege etmek ve koordine etmek.

## Ne Zaman Tetiklenmeli?
- Yeni bir özellik geliştirilmesi istendiğinde.
- Büyük bir modülün refactor edilmesi gerektiğinde.
- Birden fazla hatanın aynı anda düzeltilmesi istendiğinde.

## Orkestrasyon Mantığı
1. **Ana Görevi Analiz Et**: Büyük görevi daha küçük, bağımsız alt görevlere bölün.
2. **Alt Ajanları Başlat**: Her alt görevi uzmanlaşmış bir ajana (ör: frontend, backend, database) atayın.
3. **Sınırları Belirle**: Her ajan için kapsamı ve arayüzleri netleştirin.
4. **Sonuçları Birleştir**: Her alt ajandan gelen çıktıyı toplayın ve uyumlu bir çözümde birleştirin.
5. **Doğrula**: Entegre çözümün tüm gereksinimleri karşıladığından emin olun.

## İletişim
Orkestratör ve tüm alt ajanlar arasındaki koordinasyonu sağlamak için ortak bir `implementation_plan.md` kullanın. Her alt ajan ilerlemesini orkestratöre raporlamalıdır.
