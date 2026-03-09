# Turkish → English Migration Mapping
# Aşamalı Migration Planı

## AŞAMA 1: Kritik Temel Tablolar (Öncelikli)

### 1. PRODUCTS (stoklar) - İLK ÖNCELİK

#### Tablo Adı
- ESKİ: `stoklar`
- YENİ: `products`

#### Sütun Mapping
| Eski (Türkçe) | Yeni (İngilizce) | SQL Map | Not |
|---------------|-----------------|---------|-----|
| stokKodu | code | code | Ürün kodu |
| stokAdi | name | name | Ürün adı |
| aciklama | description | description | Açıklama |
| birim | unit | unit | Birim (Adet, KG, vb.) |
| alisFiyati | purchasePrice | purchase_price | Alış fiyatı |
| satisFiyati | salePrice | sale_price | Satış fiyatı |
| kdvOrani | vatRate | vat_rate | KDV oranı |
| kritikStokMiktari | criticalQuantity | critical_quantity | Kritik stok miktarı |
| kategori | category | category | Kategori |
| anaKategori | mainCategory | main_category | Ana kategori |
| altKategori | subCategory | sub_category | Alt kategori |
| marka | brand | brand | Marka |
| model | model | model | Model |
| oem | oem | oem | OEM kodu |
| olcu | size | size | Ölçü |
| raf | shelf | shelf | Raf |
| barkod | barcode | barcode | Barkod |
| tedarikciKodu | supplierCode | supplier_code | Tedarikçi kodu |
| esdegerGrupId | equivalencyGroupId | equivalency_group_id | Eşdeğer grup ID |

### 2. ACCOUNTS (cariler) - İLK ÖNCELİK

#### Tablo Adı
- ESKİ: `cariler`
- YENİ: `accounts`

#### Sütun Mapping
| Eski (Türkçe) | Yeni (İngilizce) | SQL Map | Not |
|---------------|-----------------|---------|-----|
| cariKodu | code | code | Cari kodu |
| unvan | title | title | Unvan |
| tip | type | type | Tip (Müşteri/Tedarikçi) |
| sirketTipi | companyType | company_type | Şirket tipi |
| vergiNo | taxNumber | tax_number | Vergi no |
| vergiDairesi | taxOffice | tax_office | Vergi dairesi |
| tcKimlikNo | nationalId | national_id | TC kimlik no |
| isimSoyisim | fullName | full_name | İsim soyisim |
| telefon | phone | phone | Telefon |
| email | email | email | E-mail |
| ulke | country | country | Ülke |
| il | city | city | İl |
| ilce | district | district | İlçe |
| adres | address | address | Adres |
| yetkili | contactPerson | contact_person | Yetkili |
| bakiye | balance | balance | Bakiye |
| vadeSuresi | paymentTermDays | payment_term_days | Vade süresi (gün) |
| aktif | isActive | is_active | Aktif mi? |

### 3. CASHBOXES (kasalar)

#### Tablo Adı
- ESKİ: `kasalar`
- YENİ: `cashboxes`

#### Sütun Mapping
| Eski (Türkçe) | Yeni (İngilizce) | SQL Map | Not |
|---------------|-----------------|---------|-----|
| kasaKodu | code | code | Kasa kodu |
| kasaAdi | name | name | Kasa adı |
| kasaTipi | type | type | Kasa tipi |
| bakiye | balance | balance | Bakiye |
| aktif | isActive | is_active | Aktif mi? |

### 4. INVOICES (faturalar)

#### Tablo Adı
- ESKİ: `faturalar`
- YENİ: `invoices`

#### Sütun Mapping
| Eski (Türkçe) | Yeni (İngilizce) | SQL Map | Not |
|---------------|-----------------|---------|-----|
| faturaNo | invoiceNo | invoice_no | Fatura no |
| faturaTipi | type | invoice_type | Fatura tipi |
| tarih | date | date | Tarih |
| vade | dueDate | due_date | Vade tarihi |
| iskonto | discount | discount | İskonto |
| toplamTutar | totalAmount | total_amount | Toplam tutar |
| kdvTutar | vatAmount | vat_amount | KDV tutarı |
| genelToplam | grandTotal | grand_total | Genel toplam |
| aciklama | notes | notes | Açıklama |
| durum | status | status | Durum |
| odenecekTutar | payableAmount | payable_amount | Ödenecek tutar |
| odenenTutar | paidAmount | paid_amount | Ödenen tutar |
| siparisNo | orderNo | order_no | Siparis no |

### 5. INVOICE ITEMS (fatura_kalemleri)

#### Tablo Adı
- ESKİ: `fatura_kalemleri`
- YENİ: `invoice_items`

#### Sütun Mapping
| Eski (Türkçe) | Yeni (İngilizce) | SQL Map | Not |
|---------------|-----------------|---------|-----|
| miktar | quantity | quantity | Miktar |
| birimFiyat | unitPrice | unit_price | Birim fiyat |
| kdvOrani | vatRate | vat_rate | KDV oranı |
| kdvTutar | vatAmount | vat_amount | KDV tutarı |
| tutar | amount | amount | Tutar |

## AŞAMA 2: Diğer Kritik Tablolar

### 6. COLLECTIONS (tahsilatlar)

#### Tablo Adı
- ESKİ: `tahsilatlar`
- YENİ: `collections`

#### Sütun Mapping
| Eski (Türkçe) | Yeni (İngilizce) | SQL Map | Not |
|---------------|-----------------|---------|-----|
| tip | type | type | Tip (Tahsilat/Ödeme) |
| tutar | amount | amount | Tutar |
| tarih | date | date | Tarih |
| odemeTipi | paymentType | payment_type | Ödeme tipi |
| aciklama | notes | notes | Açıklama |

### 7. EMPLOYEES (personeller)

#### Tablo Adı
- ESKİ: `personeller`
- YENİ: `employees`

#### Sütun Mapping
| Eski (Türkçe) | Yeni (İngilizce) | SQL Map | Not |
|---------------|-----------------|---------|-----|
| personelKodu | code | code | Personel kodu |
| ad | firstName | first_name | Ad |
| soyad | lastName | last_name | Soyad |
| isimSoyisim | fullName | full_name | İsim soyisim |
| tcKimlikNo | nationalId | national_id | TC kimlik no |
| dogumTarihi | birthDate | birth_date | Doğum tarihi |
| telefon | phone | phone | Telefon |
| email | email | email | E-mail |
| adres | address | address | Adres |
| il | city | city | İl |
| ilce | district | district | İlçe |
| pozisyon | position | position | Pozisyon |
| departman | department | department | Departman |
| iseBaslamaTarihi | startDate | start_date | İşe başlama tarihi |
| istenCikisTarihi | endDate | end_date | İşten çıkış tarihi |
| aktif | isActive | is_active | Aktif mi? |
| maas | salary | salary | Maaş |
| maasGunu | salaryDay | salary_day | Maaş günü |
| sgkNo | socialSecurityNo | social_security_no | SGK no |
| ibanNo | iban | iban | IBAN no |
| bakiye | balance | balance | Bakiye |

### 8. EMPLOYEE PAYMENTS (personel_odemeler)

#### Sütun Mapping
| Eski (Türkçe) | Yeni (İngilizce) | SQL Map | Not |
|---------------|-----------------|---------|-----|
| tutar | amount | amount | Tutar |
| tarih | date | date | Tarih |
| donem | period | period | Dönem |
| aciklama | notes | notes | Açıklama |

## AŞAMA 3: Sipariş ve İrsaliye

### 9. SALES ORDERS (siparisler)

#### Sütun Mapping
| Eski (Türkçe) | Yeni (İngilizce) | SQL Map | Not |
|---------------|-----------------|---------|-----|
| siparisNo | orderNo | order_no | Siparis no |
| siparisTipi | type | order_type | Siparis tipi |
| tarih | date | date | Tarih |
| vade | dueDate | due_date | Vade tarihi |
| iskonto | discount | discount | İskonto |
| toplamTutar | totalAmount | total_amount | Toplam tutar |
| kdvTutar | vatAmount | vat_amount | KDV tutarı |
| genelToplam | grandTotal | grand_total | Genel toplam |
| aciklama | notes | notes | Açıklama |
| durum | status | status | Durum |

### 10. SALES ORDER ITEMS (siparis_kalemleri)

#### Sütun Mapping
| Eski (Türkçe) | Yeni (İngilizce) | SQL Map | Not |
|---------------|-----------------|---------|-----|
| miktar | quantity | quantity | Miktar |
| sevkEdilenMiktar | deliveredQuantity | delivered_quantity | Sevk edilen miktar |
| birimFiyat | unitPrice | unit_price | Birim fiyat |
| kdvOrani | vatRate | vat_rate | KDV oranı |
| kdvTutar | vatAmount | vat_amount | KDV tutarı |
| tutar | amount | amount | Tutar |

## ENUM MAPPING

### 1. CariTip → AccountType
```prisma
// ESKİ
enum CariTip {
  MUSTERI
  TEDARIKCI
  HER_IKISI
}

// YENİ
enum AccountType {
  CUSTOMER
  SUPPLIER
  BOTH
}
```

### 2. SirketTipi → CompanyType
```prisma
// ESKİ
enum SirketTipi {
  KURUMSAL
  SAHIS
}

// YENİ
enum CompanyType {
  CORPORATE
  INDIVIDUAL
}
```

### 3. FaturaTipi → InvoiceType
```prisma
// ESKİ
enum FaturaTipi {
  ALIS
  SATIS
  SATIS_IADE
  ALIS_IADE
}

// YENİ
enum InvoiceType {
  PURCHASE
  SALE
  SALES_RETURN
  PURCHASE_RETURN
}
```

### 4. FaturaDurum → InvoiceStatus
```prisma
// ESKİ
enum FaturaDurum {
  ACIK
  KAPALI
  KISMEN_ODENDI
  ONAYLANDI
  IPTAL
}

// YENİ
enum InvoiceStatus {
  DRAFT
  OPEN
  PARTIALLY_PAID
  APPROVED
  CANCELLED
}
```

### 5. TahsilatTip → CollectionType
```prisma
// ESKİ
enum TahsilatTip {
  TAHSILAT
  ODEME
}

// YENİ
enum CollectionType {
  COLLECTION
  PAYMENT
}
```

### 6. OdemeTipi → PaymentMethod
```prisma
// ESKİ
enum OdemeTipi {
  NAKIT
  KREDI_KARTI
  BANKA_HAVALESI
  CEK
  SENET
}

// YENİ
enum PaymentMethod {
  CASH
  CREDIT_CARD
  BANK_TRANSFER
  CHECK
  PROMISSORY_NOTE
  GIFT_CARD
  LOAN_ACCOUNT
}
```

## MIGRATION SQL ÖRNEĞİ

### Table Rename
```sql
-- Tablo adı değişimi
ALTER TABLE "stoklar" RENAME TO "products";
ALTER TABLE "cariler" RENAME TO "accounts";
ALTER TABLE "kasalar" RENAME TO "cashboxes";
ALTER TABLE "faturalar" RENAME TO "invoices";
```

### Column Rename
```sql
-- Sütun adı değişimi
ALTER TABLE "products" RENAME COLUMN "stokKodu" TO "code";
ALTER TABLE "products" RENAME COLUMN "stokAdi" TO "name";
ALTER TABLE "products" RENAME COLUMN "alisFiyati" TO "purchase_price";
ALTER TABLE "products" RENAME COLUMN "satisFiyati" TO "sale_price";

ALTER TABLE "accounts" RENAME COLUMN "cariKodu" TO "code";
ALTER TABLE "accounts" RENAME COLUMN "unvan" TO "title";
ALTER TABLE "accounts" RENAME COLUMN "vergiNo" TO "tax_number";
```

### Enum Rename
```sql
-- Enum değerleri değişimi
ALTER TYPE "CariTip" RENAME TO "AccountType";
ALTER TYPE "AccountType" RENAME VALUE "MUSTERI" TO "CUSTOMER";
ALTER TYPE "AccountType" RENAME VALUE "TEDARIKCI" TO "SUPPLIER";
ALTER TYPE "AccountType" RENAME VALUE "HER_IKISI" TO "BOTH";
```

## DİKKAT EDİLMESİ NOKTALAR

1. **Data Integrity:** RENAME işlemleri veriyi korur, data loss yok
2. **Foreign Keys:** FK constraint'lerini kontrol et
3. **Indexes:** Index adlarını güncelle
4. **Prisma Client:** Migration sonrası `npx prisma generate` çalıştır
5. **Backend:** Tüm TypeScript kodlarında kullanımı güncelle
6. **Frontend:** API tip tanımlarını güncelle
7. **Test:** Her aşama sonrası test et
8. **Backup:** İşlem öncesi full database backup al

## SIRA VE ÖNCELİK

1. **AŞAMA 1A:** Products (stoklar) → products
2. **AŞAMA 1B:** Accounts (cariler) → accounts
3. **AŞAMA 1C:** Cashboxes (kasalar) → cashboxes
4. **AŞAMA 1D:** Invoices (faturalar) → invoices
5. **AŞAMA 2A:** Collections (tahsilatlar) → collections
6. **AŞAMA 2B:** Employees (personeller) → employees
7. **AŞAMA 3A:** Sales Orders (siparisler) → sales_orders
8. **AŞAMA 3B:** Sales Order Items (siparis_kalemleri) → sales_order_items