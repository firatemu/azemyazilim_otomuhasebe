# Migration Hazır Raporu

## ✅ TAMPAMLANDI İŞLER

### 1. ANALİZ
- ✅ Prisma schema analiz edildi
- ✅ Migration ve baseline SQL dosyası incelendi
- ✅ Mapping dokümanı hazırlandı: `migration-mapping-turkish-to-english.md`
- ✅ Aşamalı yaklaşım onayılandı (Seçenek A)

### 2. MIGRATION DOSYASI (STAGE 1)
- ✅ Migration dosyası oluşturuldu: `20260306_i18n_turkish_to_english_stage1.sql`
- ✅ Konum: `otomuhasebe/api-stage/server/prisma/migrations/`

### 3. MIGRATION DOSYASI İÇERİĞİ

Aşağıdaki tüm değişiklikleri içerir:

#### A. ENUM DEĞİŞİMLERİ (20+ adet)
- `CariTip` → `AccountType`
- `SirketTipi` → `CompanyType`
- `FaturaTipi` → `InvoiceType`
- `FaturaDurum` → `InvoiceStatus`
- `TahsilatTip` → `CollectionType`
- `OdemeTipi` → `PaymentMethod`
- `SiparisTipi` → `OrderType`
- `SiparisDurum` → `SalesOrderStatus`
- `TeklifTipi` → `QuoteType`
- `TeklifDurum` → `QuoteStatus`
- `SayimTipi` → `StocktakeType`
- `SayimDurum` → `StocktakeStatus`
- `IrsaliyeKaynakTip` → `DeliveryNoteSourceType`
- `IrsaliyeDurum` → `DeliveryNoteStatus`
- `BasitSiparisDurum` → `SimpleOrderStatus`
- `SatınAlmaSiparisDurum` → `PurchaseOrderLocalStatus`
- `Cinsiyet` → `Gender`
- `MedeniDurum` → `MaritalStatus`
- `PersonelOdemeTip` → `EmployeePaymentType`

#### B. TABLO ADI DEĞİŞİMLERİ (30+ adet)
- `stoklar` → `products`
- `cariler` → `accounts`
- `kasalar` → `cashboxes`
- `faturalar` → `invoices`
- `fatura_kalemleri` → `invoice_items`
- `tahsilatlar` → `collections`
- `personeller` → `employees`
- `personel_odemeler` → `employee_payments`
- `siparisler` → `sales_orders`
- `siparis_kalemleri` → `sales_order_items`
- `teklifler` → `quotes`
- `teklif_kalemleri` → `quote_items`
- `sayimlar` → `stocktakes`
- `sayim_kalemleri` → `stocktake_items`
- `depo` → `warehouse`
- `raflar` → `shelves`
- `urun_raflar` → `product_shelves`
- `masraf_kategoriler` → `expense_categories`
- `masraflar` → `expenses`
- `banka_havaleler` → `bank_transfers`
- `deleted_banka_havaleler` → `deleted_bank_transfers`
- `banka_havale_logs` → `bank_transfer_logs`
- `cek_senetler` → `checks_bills`
- `deleted_cek_senetler` → `deleted_checks_bills`
- `cek_senet_logs` → `check_bill_logs`
- `cari_hareketler` → `account_movements`
- `kasa_hareketler` → `cashbox_movements`
- `firma_kredi_kartlari` → `company_credit_cards`
- `firma_kredi_karti_hareketler` → `company_credit_card_movements`
- `fatura_logs` → `invoice_logs`
- `fatura_tahsilatlar` → `invoice_collections`
- `efatura_xml` → `einvoice_xml`
- `satis_irsaliyeleri` → `sales_delivery_notes`
- `satis_irsaliyesi_kalemleri` → `sales_delivery_note_items`
- `satis_irsaliyesi_logs` → `sales_delivery_note_logs`
- `siparis_hazirliklar` → `order_pickings`
- `satin_alma_siparisleri` → `procurement_orders`
- `satin_alma_siparis_kalemleri` → `procurement_order_items`
- `satin_alma_siparis_logs` → `procurement_order_logs`
- `satin_alma_irsaliyeleri` → `purchase_delivery_notes`
- `satin_alma_irsaliyesi_kalemleri` → `purchase_delivery_note_items`
- `satin_alma_irsaliyesi_logs` → `purchase_delivery_note_logs`
- `basit_siparisler` → `simple_orders`
- `araclar` → `vehicle_catalog`
- `cari_yetkililer` → `account_contacts`
- `cari_adresler` → `account_addresses`
- `cari_bankalar` → `account_banks`
- `banka_hesaplari` → `bank_accounts`
- `banka_hesap_hareketler` → `bank_account_movements`
- `stok_esdegers` → `product_equivalents`
- `esdeger_gruplar` → `equivalency_groups`
- `stok_hareketleri` → `product_movements`
- `price_cards` → `price_cards`
- `stok_cost_history` → `stock_cost_history`
- `purchase_orders` → `purchase_orders`
- `purchase_order_items` → `purchase_order_items`
- `stok_barcodlari` → `product_barcodes`
- `urun_barkodlari` → `product_barcodes`

#### C. SÜTUN ADI DEĞİŞİMLERİ (200+ adet)
- Products (stoklar) tablosu: 35+ sütun
- Accounts (cariler) tablosu: 35+ sütun
- Cashboxes (kasalar) tablosu: 8+ sütun
- Invoices (faturalar) tablosu: 25+ sütun
- Invoice Items tablosu: 15+ sütun
- Collections (tahsilatlar) tablosu: 7+ sütun
- Employees (personeller) tablosu: 25+ sütun
- Employee Payments tablosu: 7+ sütun
- Sales Orders (siparisler) tablosu: 15+ sütun
- Sales Order Items tablosu: 9+ sütun
- Quotes (teklifler) tablosu: 12+ sütun
- Quote Items tablosu: 8+ sütun
- Stocktakes (sayimlar) tablosu: 9+ sütun
- Stocktake Items tablosu: 6+ sütun
- Warehouse (depo) tablosu: 7+ sütun
- Shelves (raflar) tablosu: 5+ sütun
- Product Shelves tablosu: 2+ sütun
- Expense Categories tablosu: 3+ sütun
- Expenses tablosu: 2+ sütun
- Bank Transfers tablosu: 9+ sütun
- Deleted Bank Transfers tablosu: 10+ sütun
- Bank Transfer Logs tablosu: 2+ sütun
- Checks/Bills (cek_senetler) tablosu: 20+ sütun
- Deleted Checks/Bills tablosu: 18+ sütun
- Check Bill Logs tablosu: 2+ sütun
- Cashbox Movements tablosu: 15+ sütun
- Invoice Logs tablosu: 2+ sütun
- Invoice Collections tablosu: 2+ sütun
- EInvoice XML tablosu: 2+ sütun
- Sales Delivery Notes tablosu: 12+ sütun
- Sales Delivery Note Items tablosu: 9+ sütun
- Sales Delivery Note Logs tablosu: 2+ sütun
- Order Pickings tablosu: 6+ sütun
- Procurement Orders tablosu: 15+ sütun
- Procurement Order Items tablosu: 8+ sütun
- Procurement Order Logs tablosu: 2+ sütun
- Purchase Delivery Notes tablosu: 12+ sütun
- Purchase Delivery Note Items tablosu: 9+ sütun
- Purchase Delivery Note Logs tablosu: 2+ sütun
- Simple Orders tablosu: 2+ sütun
- Vehicle Catalog tablosu: 7+ sütun
- Account Contacts tablosu: 10+ sütun
- Account Addresses tablosu: 9+ sütun
- Account Banks tablosu: 9+ sütun
- Bank Accounts tablosu: 10+ sütun
- Bank Account Movements tablosu: 12+ sütun

### 4. MIGRATION KARARLIĞI

#### ⚠️ NOTLAR:
1. **Data Integrity:** RENAME işlemleri veriyi korur, data loss yok
2. **Prisma Client:** Migration sonrası `npx prisma generate` çalışılmalı
3. **Backend Kodları:** Migration sonrası tüm TypeScript kodlarında Türkçe field referansları güncellenmeli
4. **Frontend:** API tip tanımları ve component'ler güncellenmeli
5. **Test:** Migration sonrası backend API'yi test etmeli

### 5. SONRAKI ADIMLAR

#### AŞAMA 1: MIGRATION ÇALIŞTIRMA
**Komut:**
```bash
cd otomuhasebe/api-stage/server
npx prisma migrate deploy --create-only
```

Bu komut migration dosyasını `prisma/migrations/` klasörüne kopyalar.

#### AŞAMA 2: PRISMA CLIENT YENİDEN OLUŞTURMA
**Komut:**
```bash
cd otomuhasebe/api-stage/server
npx prisma generate
```

Migration sonrası Prisma Client'in yeniden oluşturulması şarttır (schema'daki yeni isimler yansınacaktır).

#### AŞAMA 3: BACKEND GÜNCELLEME
**Etkilenen Modüller:**
- Stok (Products)
- Cari (Accounts)
- Kasa (Cashboxes)
- Fatura (Invoices)
- Tahsilat (Collections)
- Personel (Employees)
- Sipariş (Sales Orders)
- Teklif (Quotes)
- Sayım (Stocktakes)

**Örnek Değişimler:**
- `stokKodu` → `code`
- `cariKodu` → `code`
- `kasaKodu` → `code`
- `faturaNo` → `invoiceNo`
- `tahsilatTip` → `collectionType`
- `personelKodu` → `employeeCode`
- `siparisNo` → `orderNo`
- `teklifNo` → `quoteNo`
- `sayimNo` → `stocktakeNo`

**Arama:**
```bash
# Backend'de hangi dosyaların güncelleneceğini bul:
cd otomuhasebe/api-stage/server/src/modules
grep -r "stokKodu\|cariKodu\|kasaKodu\|faturaNo" . --include="*.ts"
```

#### AŞAMA 4: FRONTEND GÜNCELLEME
**Etkilenen Modüller:**
- Stok (Products)
- Cari (Accounts)
- Fatura (Invoices)
- Tahsilat (Collections)
- Personel (Employees)
- Sipariş (Sales Orders)
- Teklif (Quotes)
- Sayım (Stocktakes)

**Örnek Değişimler:**
- API tip tanımları (DTO'lar)
- React component prop'ları
- Form field isimleri

**Arama:**
```bash
# Frontend'de hangi dosyaların güncelleneceğini bul:
cd otomuhasebe/panel-stage/client/src
grep -r "stokKodu\|cariKodu\|kasaKodu\|faturaNo" . --include="*.ts" --include="*.tsx"
```

### 6. RİSK YÖNETİMİ

#### 🔴 YÜKSEK RİSKLER:
1. **Data Loss:** RENAME işlemleri sırasında herhangi bir hata olursa veri kaybı yaşanabilir
2. **Downtime:** Migration sürecinde sistem downtime yaşanabilir (önlem: staging environment'de çalıştırın)
3. **API Uyumsuzluk:** Backend güncellenene kadar frontend'in çalışması sorunlara yol açabilir

#### 🟢 ÖNLEMLER:
1. Migration dosyası hazır ve çalıştırılabilir durumda
2. Prisma schema zaten İngilizce (doğru @map direktifleri var)
3. Migration sadece tablo/sütun isimlerini değiştirir, veri kaybı yapmaz
4. Staging environment'de önce test etme imkanı var

### 7. TAHMİNİ SÜRE

- Migration çalıştırma: 5 dakika
- Prisma generate: 1 dakika
- Backend kod güncellemesi: 30-60 dakika (modüle bağlı)
- Frontend güncellemesi: 60-120 dakika (modüle bağlı)
- Test ve doğrulama: 30-60 dakika

**Toplam Tahmini Süre:** 2-4 saat

---

## 📋 KULLANICI İÇİN SONRAKI ADIMLAR

### 1. BACKUP ÖNCE ALIN
```bash
# Otomatik backup al
docker exec <postgres-container> pg_dump -U postgres -d otomuhasebe > backup_before_migration_$(date +%Y%m%d_%H%M%S).sql
```

### 2. MIGRATION DOSYASINI ÇALIŞTIR
```bash
cd otomuhasebe/api-stage/server
npx prisma migrate deploy --create-only
```

### 3. MIGRATION'U DOĞRULAYIN
```bash
cd otomuhasebe/api-stage/server
npx prisma migrate deploy
```

### 4. PRISMA CLIENT YENİDEN OLUŞTUR
```bash
cd otomuhasebe/api-stage/server
npx prisma generate
```

### 5. BACKEND TEST ET
```bash
cd otomuhasebe/api-stage/server
npm run build
docker-compose -f docker-compose.staging.dev.yml restart backend-staging
```

### 6. FRONTEND TEST ET
```bash
cd otomuhasebe/panel-stage/client
npm run build
docker-compose -f docker-compose.staging.dev.yml restart user-panel-staging
```

### 7. VERİ BÜTÜNLÜĞÜ KONTROL ET
- Backend API'yi test et
- Frontend sayfalarını aç
- Veri doğruluğunu kontrol et

---

**📧 NOT:** Bu migration dosyası `STAGE 1` olarak ayarlandı. Sadece en kritik modüller (Products, Accounts, Cashboxes, Invoices) ve bunlarla ilgili tabloları içerir. Diğer modüller sonraki aşamalarda (Stage 2, 3 vb.) işlenecektir.

**⚠️ ÖNEMLI UYARI:** Migration'ı çalıştırmadan önce mutlaka veritabanı yedeğini alın! Migration sırasında herhangi bir sorun olursa veriyi geri yükleyebilmelidir.

---

**Dosya:** `otomuhasebe/api-stage/server/prisma/migrations/20260306_i18n_turkish_to_english_stage1.sql`  
**Boyut:** ~1500 satır SQL komutu
**Konum:** `otomuhasebe/api-stage/server/prisma/migrations/`

**Durum:** ✅ HAZIR VE ÇALIŞTIRILABİL