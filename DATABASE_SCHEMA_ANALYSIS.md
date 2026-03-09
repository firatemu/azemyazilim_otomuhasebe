# Database Şema Analiz Raporu

**Tarih:** 2026-03-08  
**Database:** otomuhasebe_stage  
**Toplam Tablo:** 111

---

## 📊 Tenant Sütunu Durumu

### ✅ Tenant Sütunu Olan Tablolar (58 tablo)

#### 52 Tablo - `tenantId` (camelCase):
- audit_logs
- avans_mahsuplasmalar
- avanslar
- banka_havaleler
- banka_kredi_planlari
- banka_krediler
- bankalar
- basit_siparisler
- bordrolar
- cari_hareketler
- cariler
- cek_senetler
- code_templates
- company_vehicles
- customer_vehicles
- fatura_tahsilatlar
- faturalar
- inventory_transactions
- invitations
- invoice_profit
- journal_entries
- kasalar
- maas_odeme_detaylari
- maas_odemeler
- maas_planlari
- masraflar
- part_requests
- personeller
- purchase_orders
- roles
- satin_alma_irsaliyeleri
- satin_alma_siparisleri
- satis_elemanlari
- satis_irsaliyeleri
- sayimlar
- service_invoices
- siparisler
- stok_hareketleri
- stoklar
- subscriptions
- system_parameters
- tahsilatlar
- teklifler
- tenant_purge_audits
- tenant_settings
- users
- vehicle_expenses
- warehouse_transfers
- warehouses
- work_orders

#### 6 Tablo - `tenant_id` (snake_case):
- fatura_kalemleri
- masraf_kategoriler
- price_cards
- product_barcodes
- product_location_stocks
- siparis_kalemleri
- stock_cost_history
- stock_moves

#### Özel Durum:
- **tenants** tablosu: `tenantType` (tenantId değil!)

---

### ❌ Tenant Sütunu OLMAYAN Tablolar (53 tablo)

Bunlara tenant eklememiz gerekiyor:

1. **Log Tabloları** (muhtemelen audit amaçlı):
   - banka_havale_logs
   - cek_senet_logs
   - fatura_logs
   - satin_alma_irsaliyesi_logs
   - satin_alma_siparis_logs
   - satis_irsaliyesi_logs
   - siparis_logs
   - teklif_logs
   - warehouse_transfer_logs
   - work_order_activities

2. **Alt Tablolar / Detail Tablolar**:
   - banka_hesap_hareketler
   - banka_hesaplari
   - cari_adresler
   - cari_bankalar
   - cari_yetkililer
   - deleted_banka_havaleler
   - deleted_cek_senetler
   - firma_kredi_karti_hareketler
   - firma_kredi_karti_hatirlaticilar
   - firma_kredi_kartlari
   - journal_entry_lines
   - kasa_hareketler
   - locations
   - payments
   - personel_odemeler
   - purchase_order_items
   - raflar
   - satin_alma_irsaliyesi_kalemleri
   - satin_alma_siparis_kalemleri
   - satis_irsaliyesi_kalemleri
   - sayim_kalemleri
   - siparis_hazirliklar
   - stok_esdegers
   - teklif_kalemleri
   - urun_raflar
   - warehouse_critical_stocks
   - warehouse_transfer_items
   - work_order_items

3. **Sistem Tabloları** (muhtemelen tenant'a gerek yok):
   - araclar
   - depolar
   - efatura_inbox
   - efatura_xml
   - esdeger_gruplar
   - hizli_tokens
   - module_licenses
   - modules
   - permissions
   - plans
   - postal_codes
   - role_permissions
   - sessions
   - user_licenses

4. **Diğer**:
   - efatura_xml

---

## 🔍 Önemli Bulgu: Tablo Eşleşmeleri

Migration dosyasında beklenen ama bulunamayan tablolar:

| Migration'da Beklenen | Gerçekleşen | Durum |
|----------------------|-------------|-------|
| `work_order_lines` | `work_order_items` ✅ | Eşleşme: work_order_items |
| `units` | BULUNAMADI ❌ | Bu tablo yok |
| `categories` | BULUNAMADI ❌ | Bu tablo yok |
| `brands` | BULUNAMADI ❌ | Bu tablo yok |
| `masraf_kategoriler` | `masraf_kategoriler` ✅ | Var, tenant_id ile |
| `price_cards` | `price_cards` ✅ | Var, tenant_id ile |

---

## 📈 Veri Büyüklüğü

En büyük tablolar (tenant ile):
1. stok_hareketleri - 1072 kB
2. stoklar - 552 kB
3. faturalar - 304 kB
4. fatura_kalemleri - 560 kB
5. satin_alma_irsaliyeleri - 160 kB
6. satis_irsaliyeleri - 160 kB

En büyük tablolar (tenant olmadan):
1. fatura_logs - 272 kB
2. inventory_transactions - 48 kB (tenant var)
3. invoice_profit - 216 kB

---

## 🎯 Migration Stratejisi

### Aşama 1: Tenant Sütunlarını Normalize Et
1. `tenant_id` (snake_case) olan 8 tabloyu `tenantId`'ye çevir
2. Veri kaybı olmadan sütun adını değiştir

### Aşama 2: Tenant Sütunu Ekle
1. Alt tablolara (kalemleri, logs, hareketler vb.) tenant ekle
2. Üst tablonun tenantId'sinden al
3. NOT NULL constraint ekle

### Aşama 3: NOT NULL Yap
1. Tüm tenantId sütunlarını NOT NULL yap
2. Null varsa varsayılan değer ata

### Aşama 4: Foreign Key Ekle
1. Tenant foreign key constraint'leri ekle
2. Referential integrity sağla

---

## ⚠️ Riskler

1. **Üretim Verisi**: 1.8MB veri var, küçük ama önemli
2. **Alt Tablolar**: Çok fazla alt tablo var, careful mapping gerekiyor
3. **Log Tabloları**: Tenant ekleme log tablolarında sorun yaratabilir
4. **Sistem Tabloları**: Bazı tablolara tenant eklenmemeli

---

## 💡 Tavsiye

**En Güvenli Yaklaşım:**
1. Tenant sütunlarını normalize et (Aşama 1)
2. Sadece kritik alt tablolara tenant ekle (Aşama 2)
3. Log ve sistem tablolarını atla (önemsiz)
4. Test ve verify et

**Daha Kapsamlı Yaklaşım:**
1. Tüm alt tablolara tenant ekle
2. Daha kapsamlı audit trail
3. Daha fazla risk