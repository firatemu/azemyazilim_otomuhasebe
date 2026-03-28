---
name: skill_creator
description: Mevcut mimariye uygun yeni AI rolleri ve yetenekleri oluşturma uzmanı.
---

# Skill Creator Skill

Bu yetenek, projenin değişen ihtiyaçlarına göre yeni AI rollerini (Skills) tanımlamak ve mevcut rolleri optimize etmek için kullanılır.

## Görevler

1.  **İhtiyaç Analizi**: Yeni bir özellik veya mimari değişiklik gerektiğinde, hangi role ihtiyaç olduğunu belirle.
2.  **Yetenek Tanımlama**: `SKILL.md` dosyasını `frontmatter` standartlarına uygun olarak oluştur.
3.  **Mimari Uyumluluk**: Yeni yeteneklerin projenin genel AI yönetim dokümanları (`AGENTS.md`, `AI_AGENT_KNOWLEDGE_BASE.md`) ile çelişmediğinden emin ol.
4.  **Dokümantasyon**: Yetenekleri net ve eyleme dökülebilir talimatlarla tanımla.

## Skill Yapısı

Her yeni yetenek şu dizin yapısına sahip olmalıdır:
- `skills/<skill_name>/SKILL.md`: Ana talimatlar.
- `skills/<skill_name>/examples/`: (Opsiyonel) Referans kod blokları.
- `skills/<skill_name>/scripts/`: (Opsiyonel) Yardımcı scriptler.
