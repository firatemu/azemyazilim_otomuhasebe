---
name: frontend_design
description: OtoMuhasebe modern UI/UX ve MUI v7 tasarım standartları uzmanı.
---

# Frontend Design Skill

Bu yetenek, OtoMuhasebe projesinin görsel dilini ve kullanıcı arayüzü standartlarını korumak, geliştirmek ve modernize etmek için tasarlanmıştır.

## Temel İlkeler

1.  **MUI v7 Standardizasyonu**: Tüm bileşenler MUI v7 (veya güncel sürüm) standartlarına uygun olmalıdır.
2.  **Renk Tokenları**: Asla hard-coded hex veya rgb kodları kullanma. Daima `var(--primary)`, `var(--background)`, `var(--card)` gibi CSS değişkenlerini kullan.
3.  **Glassmorphism & Modern Estetik**: Arka planlarda bulanıklık (`backdrop-filter`), ince kenarlıklar (`1px solid var(--border)`) ve hafif gölgeler kullanarak premium bir his yarat.
4.  **Responsive Tasarım**: Her bileşen `xs`, `sm`, `md`, `lg`, `xl` kırılımlarında mükemmel görünmelidir.
5.  **StandardPage & StandardCard**: Sayfa ve kart yapılarında projenin ortak bileşenlerini (`panel-stage/client/src/components/common/**`) kullanmayı önceliklendir.

## Tasarım Odaklı Düşünme (Design Thinking)

Kodlamaya başlamadan önce BOLD (Cesur) bir estetik yön seçin:
- **Ton Belirleme**: Brutallist, lüks, retro-füzyon, minimal veya maksimalist; projenin bağlamına uygun bir karakter seçin.
- **Farklılaşma**: Bu arayüzü UNUTULMAZ kılan şey nedir? Tek bir çarpıcı özellik belirleyin.
- **Bütünlük**: Seçilen estetik yönü tüm bileşenlerde (tipografi, boşluklar, renkler) tutarlı bir şekilde uygulayın.

## Frontend Estetik Kuralları

- **Tipografi**: Jenerik fontlardan kaçının (Arial, Inter vb.). Karakteri olan, bağlama uygun font eşleşmeleri yapın.
- **Renk & Tema**: CSS değişkenlerini kullanarak tutarlı bir palet oluşturun. Keskin aksan renkleri kullanmaktan çekinmeyin.
- **Hareket (Motion)**: Mikro etkileşimler ve yumuşak geçişler için sadece CSS veya Motion kütüphanesini kullanın. Sayfa yüklenirken kademeli (staggered) efektler ekleyerek kullanıcıyı karşılayın.
- **Asimetri ve Kompozisyon**: Beklenmedik yerleşimler, ızgara dışı (grid-breaking) öğeler ve cömert negatif alanlar kullanarak derinlik yaratın.
- **Arka Plan Detayları**: Düz renkler yerine derinlik ve atmosfer yaratan gradyanlar, dokular veya cam efekti (glassmorphism) katmanları kullanın.

> [!IMPORTANT]
> "AI üretimi" hissi veren sıradan yerleşimlerden ve klişe renk paletlerinden (mor-beyaz gradyanlar vb.) kaçının. Her tasarımın kendine has bir karakteri olmalıdır.
