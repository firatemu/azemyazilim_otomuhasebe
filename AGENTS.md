# OtoMuhasebe AI & UI Standartları

Bu doküman, Cursor, Antigravity ve VS Code gibi araçların AI yönlendirmesi için okuyabileceği şekilde hazırlanmış **ortak** standart kaynağıdır.

## POS İstisnası

- `panel-stage/client/src/app/(main)/pos/**` için bu standartlar **uygulanmaz**.
- POS tasarımı kendi dokunmatik ekosistemi/variable’ları ile ilerler.

## 1) Renk & Tema (Dark/Light Destekli)

- Hard-coded hex/rgb kullanma. Renklerde mutlaka token kullan:
  - `var(--background)`, `var(--foreground)`, `var(--card)`, `var(--border)`, `var(--primary)`, `var(--secondary)`,
    `var(--muted)`, `var(--muted-foreground)`, `var(--destructive)`, `var(--destructive-foreground)`,
    `var(--chart-1)` ... `var(--chart-5)`
- Global override yasağı (POS hariç): `:root { ... }`, `.dark { ... }` gibi global token override ekleme.

## 2) Responsive Bütünlük (Telefon/Tablet Tam Uyum)

- her sayfa `xs` ve `sm` dahil olmak üzere responsive olmalı.
- Sabit `width`/`height` ile kırılan layoutlardan kaçın:
  - Tablolarda kolonlar için `flex` + `minWidth` kullan.
  - Modallar/dialoglar `fullWidth` olmalı; çok küçük ekranda `maxWidth="sm"` tercih edilmeli.
- Kritik farklı yerleşim gerekiyorsa `xs` için ayrı tasarım:
  - `Stack` yönünü `xs` için `column`, daha büyük kırılımlarda `row` yap.
  - Filtreleri accordion/collapse mantığıyla küçült.

## 3) Page & Surface İskeleti (POS hariç)

- Sayfa düzeyinde standart wrapper kullan:
  - `panel-stage/client/src/components/common/StandardPage.tsx` (önerilen)
  - en azından `PageContainer`
- Kart/surface için:
  - `panel-stage/client/src/components/common/StandardCard.tsx` (önerilen)
  - aksi durumda `var(--card)`, `var(--border)`, `var(--radius)` tokenları kullanılmalı.

## 3.1) Listing Sayfa Çerçevesi (Stock-like Teknik Şablon)
`stock/material-list` benzeri “liste/tablolu sayfalar” için sayfa iskeleti (POS hariç) şu ölçülere uyacak şekilde uygulanır:

- Sayfa dış wrapper:
  - `return ( <Box sx={{ pb: 4 }}> ... </Box> )` (alt boşluk 32px)
  - Yatay padding/yere göre düzen ayrıca `ClientMainLayout` üzerinden gelir (sayfa içinde tekrar ekleme).
- Sayfa header (isim + aksiyonlar):
  - `Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, py: 1 }}`
  - Sol ikon kutusu: `width: 40`, `height: 40`, `borderRadius: 2`, `background: 'linear-gradient(135deg, var(--primary), var(--secondary))'`, `display: 'flex'`, `alignItems: 'center'`, `justifyContent: 'center'`
  - Başlık: `Typography variant="h6"`, `fontWeight: 700`, `color: 'var(--foreground)'`, `lineHeight: 1.2`
  - Sağ buton stack: `Box sx={{ display: 'flex', gap: 1 }}`
  - Butonlar: `size="small"`, `borderRadius: 2`, `textTransform: 'none'`, `fontWeight: 600`, `boxShadow: 'none'`
- KPI/Metrics strip:
  - `Paper variant="outlined"`, `sx={{ mb: 2, p: 1.5, display: 'flex', flexWrap: 'wrap', gap: 0 }}`
  - Metric item: `Box sx={{ flex: '1 1 120px', px: 1.5, borderRight: '1px solid var(--divider, var(--border))' }}` (son item borderRight kullanma)
- Toolbar:
  - `Paper variant="outlined"`, `sx={{ mb: 2 }}`
  - İç wrapper: `Box sx={{ p: 2, display: 'flex', flexWrap: 'wrap', gap: 1.5, alignItems: 'center' }}`
- Summary info bar (DataGrid üstü):
  - `Box sx={{ py: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}`
- DataGrid wrapper:
  - `Paper variant="outlined"`, `sx={{ overflow: 'hidden' }}`

## 4) Form Kontrolleri

- Mümkünse mevcut tasarım sınıflarını kullan:
  - Select: `className="form-control-select"`
  - TextField: `className="form-control-textfield"`

## 5) Popup / Modal Sayfalar (Minimal Header + Scroll’suz Tasarım)

Popup olarak açılan ekranlar (Dialog/Modal/Drawer içinde açılan “mini sayfalar”) şu kurala uyar:

- Header **minimalist** olmalı:
  - Tek satır başlık + sağda kapat (`X`) + (opsiyonel) tek bir birincil aksiyon
  - Büyük ikonlar, hard-coded gradient header (hex/rgb ile) ve kalabalık buton grupları kullanılmaz
  - Gradient/renk özel efekt istenecekse token + `color-mix(...)` ile yapılmalı (ör: `var(--primary)`)
- İçerik “tek ekranda” görünecek şekilde tasarlanmalı:
  - Amaç: kullanıcı **scroll yapmadan** tüm kritik alanları görebilmeli
  - Gerekirse alanları 2 sütun yerine tek sütuna düşür (`xs` için)
  - Zorunlu durumlarda (çok kalemli tablolar gibi) scroll sadece “kalem listesi” gibi tek bir bölgeye verilir; header/footer sabit kalır
- Dialog ölçüleri:
  - `fullWidth` + uygun `maxWidth` kullan
  - Mobilde taşma yapmayacak şekilde `xs`/`sm` yerleşim düşün
 - Popup yüzeyi/renk standardı:
   - `Dialog`/`PaperProps` için `bgcolor: 'var(--card)'`, `borderRadius: 'var(--radius)'`, `border: '1px solid var(--border)'` gibi token değerler kullan
   - Köşe formu (oval çerçeve):
     - Popup yüzeyinde keskin köşe kullanma; `borderRadius` için genelde `var(--radius-xl)` veya daha büyük değer tercih et
     - `DialogTitle` (üst) ve `DialogActions` (alt) arka planı kullanan yerlerde aynı radius’u koru (çerçeve “oval” görünmeli)
     - `overflow: 'hidden'` ile popup içindeki arka planların radius dışına taşmasını engelle
   - `DialogContent` dış katmanını çoğunlukla `display: 'flex'` + `overflowY: 'hidden'` yap; gerçek scroll’u içteki tek bir wrapper’a (`overflowY: 'auto'`, `maxHeight: 'calc(100vh - ...)'`) ver
   - `DialogActions` alanı görünür kalmalı; `bgcolor: 'var(--muted)'` veya `var(--card)` + `borderTop: '1px solid var(--border)'` tercih et
   - Primary/CTA butonlarda hard-coded `#...` kullanma; `var(--primary)` / `var(--primary-foreground)` ve `color-mix(...)` ile hover/active tonlarını üret
 - (Opsiyonel) CSS module/class ile popup stili yazacaksan:
   - Token tabanlı değerler (`var(--card)`, `var(--muted)`, `var(--border)`, `var(--ring)`) kullan
   - Scrollbar/box-shadow gibi detaylarda bile hex/rgb sabitleme yerine token kullan

## 6) Tablo Ekleme Standartları (DataGrid / tablo ekranları)

Yeni bir tablo eklendiğinde aşağıdaki kurallar uygulanır:

1. Arama:
   - Search input + state (placeholder: “Fatura Ara (No, Cari vb.)” benzeri)
2. Hazır filtreler:
   - `Bugün`, `Bu Hafta`, `Bu Ay` çipleri (veya eşdeğeri)
   - Chip seçimi filtre başlangıç/bitişini otomatik doldurur
3. Yenileme:
   - Aynı filtre/search/sort parametreleriyle yeniden çekim
4. Excel:
   - “Excel İndir” action’ı (backend endpoint ile `xlsx` indirimi)
5. Kolon sıralama:
   - A-Z / Z-A (DataGrid `sortModel` ile + API `sortBy/sortOrder` ile)
6. Otomatik boyut uyumu:
   - Tablo genişliği container’a göre akmalı; sabit toplam genişlik kullanma
   - Kolonlarda `flex` ve `minWidth` ile alan dağıt
7. Sayısal özet (footer sum):
   - Örn: “Tutar” gibi numeric kolonların sayfa altına toplam/özet bilgisi
   - Özet değerler filtre setiyle tutarlı olmalı (tercihen aynı grid satırlarına göre)
8. Pagination:
   - Sayfa açılışında varsayılan `25`
   - Kullanıcı `25 / 50 / 100` değiştirebilmeli
   - DataGrid `pageSizeOptions` mutlaka bu aralığı içermeli
9. Dark/Light uyumu:
   - Grid toolbar/header/borders/hover renkleri tokenlar üzerinden ayarlı olmalı
10. Dashboard KPI:
   - Tabloyla ilişkili 3-4 adet özet kart (KPI) sayfanın üst bölümüne eklenmeli
   - KPI’lar tablo filtreleriyle uyumlu güncellenmeli
11. Denetim bilgisi gösterimi:
   - Tablo satırlarında denetim (oluşturulma/güncellenme) bilgisi metin kolonunda kalabalık yaratmayacak şekilde ikonla gösterilmeli
   - Denetim ikonu tıklanınca `Popover` açılmalı (tooltip yerine popover tercih edilir)
   - Popover içinde en az `Oluşturma` ve `Güncelleme` zamanları bulunmalı
   - Tarih/saat gösterimleri geçersiz değerde kırılmamalı; güvenli format helper kullanılmalı
   - Popover yüzeyi token tabanlı olmalı (`var(--card)`, `var(--border)`, `var(--muted-foreground)`)

## 7) Tablo Ekleme Kontrol Listesi

- Arama var mı?
- Bugün/Hafta/Ay filtreleri var mı?
- Yenileme butonu var mı?
- Excel indirme var mı?
- Kolon sort A-Z/Z-A mümkün mü?
- Pagination: default 25 + {25,50,100} var mı?
- Sayısal kolon için footer sum/özet var mı?
- Renkler tokenlarla dark/light uyumlu mu?
- Üstte tabloyla uyumlu 3-4 KPI kart var mı?

## 8) Özelleştirilmiş AI Rolleri (Skills)

Proje kapsamında AI'nın (Antigravity) daha spesifik konularda uzmanlaşmış "Alt-Agent" gibi çalışması için aşağıdaki roller/yetenekler tanımlanmıştır. Bir özellik geliştirirken veya inceleme yaparken bu yeteneklerin `SKILL.md` dosyalarındaki talimatlara başvurulmalıdır:

| Rol (Skill) | Dizin Pası | Temel Uzmanlık |
| :--- | :--- | :--- |
| **Frontend Design** | `skills/frontend_design/` | MUI v7 Uygulama, Modern Tasarım Standartları |
| **Skill Creator** | `skills/skill_creator/` | Yeni Rol & Yetenek Yapılandırma |
| **Senior Frontend** | `skills/senior_frontend/` | Next.js App Router, SSR/CSR, Zustand |
| **Code Reviewer** | `skills/code_reviewer/` | Tenant Güvenliği, İş Kuralları Denetimi |
| **Senior Backend** | `skills/senior_backend/` | NestJS 11, Prisma, BullMQ, Redis |
| **Senior Architect** | `skills/senior_architect/` | Sistem Tasarımı, Veritabanı Stratejisi |
| **Webapp Testing** | `skills/webapp_testing/` | Jest, Puppeteer, Uçtan Uca Doğrulama |
| **Git Commit Helper** | `skills/git_commit_helper/` | Sementik Commit Mesajları & Raporlama |
| **Ui Ux Pro Max** | `skills/ui_ux_pro_max/` | "Wow" Faktörü ve Mikro-Animasyonlar |
| **Arch. Decisions** | `skills/architecture_decisions/` | ADR Yakalama ve Standart Dökümantasyon |
| **Bug Hunter** | `skills/bug_hunter/` | Karmaşık Hata Tanılama ve Düzeltme |
| **Coding Agent** | `skills/coding_agent/` | Ajan Orkestrasyonu ve Feature Build |
| **Financial Auditor** | `skills/financial_auditor/` | Finansal Denetim ve ERP Hesap Takibi |
| **Inventory Spec.** | `skills/inventory_specialist/` | Stok Bütünlüğü ve WMS Uzmanlığı |
| **Learning Memory** | `skills/learning_memory/` | Proje Tarihçesi ve Gotcha Takibi |
| **Research Expert** | `skills/research_expert/` | Kapsamlı Bilgi Toplama ve Analiz |

> [!NOTE]
> Herhangi bir modül geliştirilirken, ilgili disiplindeki (Backend, Frontend, UX vb.) `SKILL.md` kurallarının bu ana `AGENTS.md` standartlarıyla birlikte uygulanması zorunludur.
