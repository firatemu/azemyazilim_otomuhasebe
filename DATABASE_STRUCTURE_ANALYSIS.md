# Veritabanı Yapısı Profesyonel Analiz Raporu

**Tarih:** 8 Mart 2026  
**Proje:** Otomuhasebe - SaaS Muhasebe Sistemi  
**Amaç:** Mevcut veritabanı yapısını analiz etmek, güvenlik açıklarını belirlemek ve profesyonelleştirme önerilerinde bulunmak

---

## 📋 Özet

Bu rapor, mevcut Prisma schema yapısını detaylı olarak analiz etmektedir. Odak noktası:
- **Tenant İzolasyonu:** SaaS sisteminde en önemli güvenlik gereksinimi
- **Data Normalizasyon:** Master-detail ilişkileri ve performans
- **Güvenlik Açıkları:** Tenant ID eksikliği ve veri sızıntısı riskleri
- **Profesyonelleştirme:** Endüstri standartlarına uyum

---

## 🚨 KRİTİK GÜVENLİK SORUNLARI

### 1. Tenant ID Nullable Tablolar (ACİL DÜZELTME GEREKİ)

Aşağıdaki tablolarda `tenantId` alanı **nullable** (boş bırakılabilir) olarak tanımlı:

| Tablo Adı | Tenant ID Durumu | Risk Seviyesi | Etkisi |
|------------|------------------|---------------|---------|
| **Product** | `String?` | 🔴 KRİTİK | Ürünler tenant ID olmadan eklenebilir |
| **Account** | `String?` | 🔴 KRİTİK | Cari hesaplar tenant ID olmadan eklenebilir |
| **AccountMovement** | `String?` | 🔴 KRİTİK | Hareketler tenant ID olmadan eklenebilir |
| **AuditLog** | `String?` | 🟡 ORTA | Log kayıtları tenant'sız olabilir |
| **BankTransfer** | `String?` | 🔴 KRİTİK | Banka transferleri tenant'sız olabilir |
| **Collection** | `String?` | 🔴 KRİTİK | Tahsilatlar tenant'sız olabilir |
| **Expense** | `String?` | 🔴 KRİTİK | Giderler tenant'sız olabilir |
| **User** | `String?` | 🟡 ORTA | Kullanıcılar tenant ID'siz olabilir |

### 2. Tenant ID OLMAYAN Tablolar (VERİ SIZINTISI RİSKİ)

Bu tablolarda tenant ID alanı **yok** - SaaS sisteminde kabul edilemez:

| Tablo Adı | Risk Seviyesi | Açıklama |
|------------|---------------|-----------|
| **Module** | 🟡 ORTA | Modül tanımları global - beklenen (sistem tablosu) |
| **Permission** | 🟡 ORTA | İzin tanımları global - beklenen (sistem tablosu) |
| **Plan** | 🟡 ORTA | Plan tanımları global - beklenen (sistem tablosu) |
| **VehicleCatalog** | 🟡 ORTA | Araç kataloğu global - beklenen (referans tablosu) |
| **PostalCode** | 🟡 ORTA | PPK bilgileri global - beklenen (referans tablosu) |
| **ExpenseCategory** | 🟡 ORTA | Gider kategorileri - tenant ID olmalı! |
| **Role** | `tenantId?` | 🔴 KRİTİK - Roller tenant ID'siz olabilir |
| **Unit** | 🔴 KRİTİK - Tenant ID yok, UnitSet üzerinden indirect ilişki |
| **UnitSet** | 🔴 KRİTİK - Tenant ID yok, Product'ten indirect ilişki |

### 3. Mevcut Veri Durumu

```typescript
// Veritabanı kontrol sonucu:
Tenant: { id: 'cmmg5gp2v0007vmr8dgnfw7bu', name: 'Demo Şirket' }

// Mevcut seed verileri:
- Products: 41 adet (tenantId: NULL) ❌
- Accounts: 15 adet (tenantId: NULL) ❌
- Brands: AYRI tablo yok, Product.brand sütunu var ❌
```

---

## 🔍 MASTER-DETAIL İLİŞKİ ANALİZİ

### 🔴 Sorunlu Flat Yapılar (Normalizasyon Gerekli)

#### 1. Brand (Marka) Yapısı

**Şu anki yapı:**
```prisma
model Product {
  brand String? @map("brand")  // ❌ Flat yapı
  // ...
}
```

**Problemler:**
- ❌ Marka değişmek için tüm ürünleri güncellemek gerekir
- ❌ Marka bazlı filtreleme ve raporlama zor
- ❌ Marka ekstra bilgileri (logo, web sitesi, vb.) eklenemez
- ❌ Aynı markanın farklı yazımları (Bosch, bosch, BOSCH)
- ❌ Tenant izolasyonu sorgularda unutulabilir

**Profesyonel yapı önerisi:**
```prisma
model Brand {
  id        String    @id @default(uuid())
  tenantId   String    @map("tenant_id")
  name       String    @map("name")
  code       String?   @map("code")  // Marka kodu
  logoUrl    String?   @map("logo_url")
  website    String?   @map("website")
  isActive   Boolean   @default(true) @map("is_active")
  createdAt  DateTime  @default(now()) @map("created_at")
  updatedAt  DateTime  @updatedAt @map("updated_at")
  products   Product[]

  @@unique([name, tenantId])
  @@index([tenantId])
  @@index([name])
  @@map("brands")
}

model Product {
  id       String   @id @default(uuid())
  tenantId  String   @map("tenant_id")  // ZORUNLU
  brandId  String?  @map("brand_id")    // Foreign key
  brand     Brand?   @relation(fields: [brandId], references: [id])
  // ...
  
  @@unique([code, tenantId])
  @@index([tenantId])
  @@index([brandId])
  @@map("products")
}
```

#### 2. Model Yapısı

**Şu anki yapı:**
```prisma
model Product {
  model String? @map("model")  // ❌ Flat yapı
  // ...
}
```

**Profesyonel yapı önerisi:**
```prisma
model ProductModel {
  id        String    @id @default(uuid())
  tenantId   String    @map("tenant_id")
  brandId    String    @map("brand_id")
  name       String    @map("name")
  code       String?   @map("code")
  isActive   Boolean   @default(true)
  products   Product[]

  @@unique([name, brandId, tenantId])
  @@index([tenantId])
  @@index([brandId])
  @@map("product_models")
}
```

#### 3. Category Yapısı

**Şu anki yapı:**
```prisma
model Product {
  category      String? @map("category")        // ❌ Flat
  mainCategory  String? @map("main_category")  // ❌ Flat
  subCategory   String? @map("sub_category")   // ❌ Flat
  // ...
}
```

**Profesyonel yapı önerisi:**
```prisma
model Category {
  id          String      @id @default(uuid())
  tenantId     String      @map("tenant_id")
  name        String      @map("name")
  code        String?     @map("code")
  parentId    String?     @map("parent_id")
  level       Int         @map("level")        // 1: Ana, 2: Alt, 3: Sub-alt
  isActive    Boolean     @default(true)
  children    Category[]
  parent      Category?   @relation("CategoryHierarchy", fields: [parentId], references: [id])
  products    Product[]

  @@unique([code, tenantId])
  @@index([tenantId])
  @@index([parentId])
  @@map("categories")
}
```

#### 4. Unit (Birim) Yapısı

**Şu anki yapı:**
```prisma
model Unit {
  unitSetId String @map("unit_set_id")  // ❌ Tenant ID yok, UnitSet üzerinden
  unitSet   UnitSet @relation(...)
  // ...
}

model UnitSet {
  // Tenant ID yok! ❌
  units Unit[]
}
```

**Problemler:**
- ❌ Unit ve UnitSet tablolarında tenant ID yok
- ❌ Product tablosu ile indirect ilişki
- ❌ Tenant izolasyonu sağlanamıyor

**Profesyonel yapı önerisi:**
```prisma
model Unit {
  id             String   @id @default(uuid())
  tenantId       String   @map("tenant_id")
  code           String   @map("code")           // GIB Birim Kodu
  name           String   @map("name")
  conversionRate Decimal  @default(1) @map("conversion_rate")
  isBaseUnit     Boolean  @default(false) @map("is_base_unit")
  products       Product[]

  @@unique([code, tenantId])
  @@index([tenantId])
  @@map("units")
}
```

---

## 📊 DATA NORMALİZASYONU

### Normalizasyon Öncelikleri

#### 🔴 Yüksek Öncelik (Acil)

1. **Tenant ID Zorunlu Yapmak**
   - Product.tenantId → NOT NULL
   - Account.tenantId → NOT NULL
   - Collection.tenantId → NOT NULL
   - BankTransfer.tenantId → NOT NULL
   - Expense.tenantId → NOT NULL
   - Role.tenantId → NOT NULL

2. **AYRI Brand Tablosu**
   - Brand ve ProductModel tabloları oluşturmak
   - Mevcut product.brand sütunundan verileri aktarmak
   - Product.brandId foreign key eklemek

3. **AYRI Category Tablosu**
   - Hiyerarşik kategori yapısı oluşturmak
   - Mevcut product.mainCategory/subCategory'dan verileri aktarmak

#### 🟡 Orta Öncelik

4. **Unit Yapısını Düzeltmek**
   - Tenant ID eklemek
   - UnitSet tablosunu kaldırmak (veya düzeltmek)

5. **ExpenseCategory Tenant ID**
   - ExpenseCategory tablosuna tenant ID eklemek

#### 🟢 Düşük Öncelik

6. **Vehicle Catalog**
   - Sistem tablosu olarak kalmalı (global)

7. **Postal Code**
   - Sistem tablosu olarak kalmalı (global)

---

## 🔒 GÜVENLİK VE PERFORMANS

### Güvenlik Açıkları

#### 1. Tenant İzolasyonu

**Mevcut Sorun:**
```typescript
// ❌ YANLIŞ: Tenant filtresi yok
const products = await prisma.product.findMany({
  select: { brand: true },
  distinct: ['brand']
})

// Bu sorgu TÜM tenant'lardan markaları getirir!
// Veri sızıntısı riski!
```

**Doğru Yapı:**
```typescript
// ✅ DOĞRU: Tenant filtresi zorunlu
const products = await prisma.product.findMany({
  where: { tenantId: currentTenantId },
  select: { brand: true },
  distinct: ['brand']
})
```

#### 2. Backend Katmanı Güvenliği

**Tüm servislerde şunlar zorunlu:**
```typescript
// ✅ Middleware ile zorunlu tenant kontrolü
@Injectable()
export class TenantService {
  private tenantId: string;

  constructor(private currentUser: CurrentUser) {
    this.tenantId = this.currentUser.tenantId;
  }

  findAll() {
    return prisma.product.findMany({
      where: { tenantId: this.tenantId }  // ✅ Her zaman filtre
    });
  }
}
```

### İndeks Optimizasyonları

#### Eksik İndeksler

Aşağıdaki tablolarda ekstra indeksler önerilir:

```prisma
// Product tablosu:
@@index([tenantId, brand])        // Brand bazlı filtreleme
@@index([tenantId, category])     // Kategori bazlı filtreleme
@@index([tenantId, code])        // Kod bazlı arama
@@index([tenantId, name])        // İsim bazlı arama
@@index([barcode])               // Barkod araması (unique)

// Account tablosu:
@@index([tenantId, type])        // Müşteri/Tedarikçi filtresi
@@index([tenantId, isActive])    // Aktif/Pasif filtresi
@@index([tenantId, city])        // Şehir bazlı raporlar

// Invoice tablosu:
@@index([tenantId, status])      // Durum bazlı filtreleme
@@index([tenantId, date])        // Tarih bazlı filtreleme
@@index([accountId])              // Cari bazlı aramalar
@@index([accountId, date])        // Cari hareket raporları
```

---

## 📋 GÖZDEN KAÇMIŞ SORUNLAR

### 1. Ürün Ayrıntıları

**Şu anki yapı:**
```prisma
model Product {
  // Bazı alanlar:
  vehicleBrand    String?
  vehicleModel    String?
  vehicleEngineSize String?
  vehicleFuelType String?
  // ...
}
```

**Sorun:** Araç özellikleri flat olarak tutuluyor. Birden fazla araç uyumlu olabilir.

**Öneri:**
```prisma
model Product {
  // ...
  vehicleCompatibility ProductVehicleCompatibility[]
}

model ProductVehicleCompatibility {
  id              String @id @default(uuid())
  productId       String
  brand           String
  model           String
  yearFrom        Int?
  yearTo          Int?
  engineSize      String?
  fuelType        String?
  product         Product @relation(...)
  
  @@index([productId])
  @@map("product_vehicle_compatibility")
}
```

### 2. Price (Fiyat) Yapısı

**Şu anki yapı:**
```prisma
model Product {
  purchasePrice Decimal @map("purchase_price")
  salePrice     Decimal @map("sale_price")
  // ...
}
```

**Sorun:** Sadece tek fiyat. Farklı fiyat listeleri, müşteri bazlı fiyatlar desteklenmiyor.

**Öneri:**
```prisma
// Mevcut PriceCard yapısı var, ancak:
model Product {
  // Temel fiyatlar (varsayılan)
  basePrice Decimal @map("base_price")
  
  // Müşteri bazlı fiyatlar
  priceCards PriceCard[]
}

model PriceCard {
  id        String        @id @default(uuid())
  productId String
  type      PriceCardType // SALE, PURCHASE, CUSTOMER
  price     Decimal
  // ...
}
```

### 3. Barcode Yapısı

**Şu anki yapı:**
```prisma
model Product {
  barcode String? @unique  // ❌ Tek barkod
  // ...
}

model ProductBarcode {
  barcode String @unique  // ❌ Tenant ID yok!
  // ...
}
```

**Sorun:**
- ProductBarcode tablosunda tenant ID yok
- Unique constraint tenant bazlı olmalı

**Öneri:**
```prisma
model ProductBarcode {
  id        String  @id @default(uuid())
  productId String
  tenantId  String  // ✅ Tenant ID zorunlu
  barcode   String
  isPrimary Boolean
  
  @@unique([productId, barcode])  // ❌ Tenant bazlı değil
  @@unique([tenantId, barcode])  // ✅ Tenant bazlı
  @@map("product_barcodes")
}
```

---

## ✅ PROFESYONELLEŞTİRME ÖNERİLERİ

### Faz 1: Acil Güvenlik Düzeltmeleri (1-2 Gün)

1. **Tenant ID Zorunlu Yapmak**
   ```prisma
   // Migration oluştur
   // Tüm nullable tenantId alanları NOT NULL yap
   ```

2. **Mevcut Verilere Tenant ID Atamak**
   ```typescript
   // Seed script veya migration script
   await prisma.product.updateMany({
     where: { tenantId: null },
     data: { tenantId: 'cmmg5gp2v0007vmr8dgnfw7bu' }
   });
   ```

3. **Backend Sorgularına Tenant Filtresi Eklemek**
   - Tüm servislerde `where: { tenantId: ... }` kontrolü
   - Middleware ile zorunlu kılmak

4. **Marka Sorgusunu Düzeltmek**
   ```typescript
   // Frontend API endpoint
   // WHERE tenantId = ? eklemek zorunlu
   ```

### Faz 2: Normalizasyon (1-2 Hafta)

5. **AYRI Brand Tablosu**
   - Brand model oluşturmak
   - Mevcut verileri aktarmak
   - Product.brandId FK eklemek
   - Product.brand sütununu kaldırmak

6. **AYRI Category Tablosu**
   - Hiyerarşik kategori yapısı
   - Mevcut verileri aktarmak
   - Product.categoryId FK eklemek

7. **Unit Yapısını Düzeltmek**
   - Tenant ID eklemek
   - UnitSet tablosunu kaldırmak

8. **ProductVehicleCompatibility Tablosu**
   - Araç uyumluluğu için master-detail

### Faz 3: RLS (Row Level Security) (2-4 Hafta)

9. **PostgreSQL RLS Kurulumu**
   ```sql
   -- Her tablo için:
   CREATE POLICY tenant_isolation ON products
   FOR ALL TO application_users
   USING (tenant_id = current_tenant_id());
   ```

10. **Backend RLS Entegrasyonu**
    - Tenant ID otomatik inject
    - Sorgu seviyesinde güvenlik

---

## 🎯 HIZLI EYLEM PLANI

### Bugün (8 Mart 2026)

1. ✅ **Schema Analiz Raporunu Tamamla** (Bu rapor)
2. ⏳ **Tenant ID Zorunlu Migration Oluştur**
3. ⏳ **Mevcut Verileri Tenant ID ile Güncelle**
4. ⏳ **Backend Marka Sorgusunu Düzelt**

### Bu Hafta

5. **AYRI Brand Tablosu Oluştur**
6. **AYRI Category Tablosu Oluştur**
7. **Unit Yapısını Düzelt**
8. **Backend Servislerine Tenant Filtresi Ekle**

### Gelecek Hafta

9. **Profesyonel Yapı Testleri**
10. **RLS Planlama**
11. **Dokümantasyon Güncelleme**

---

## 📊 RİSK DEĞERLENDİRMESİ

| Risk | Şiddet | Olasılık | Genel Risk | Öncelik |
|------|---------|-----------|-----------|----------|
| Tenant ID eksikliği | 🔴 Yüksek | 🔴 Kesin | 🔴 KRİTİK | Acil |
| Veri sızıntısı | 🔴 Yüksek | 🟡 Olası | 🔴 KRİTİK | Acil |
| Flat brand yapısı | 🟡 Orta | 🔴 Kesin | 🟡 ORTA | Orta |
| Performance sorunları | 🟡 Orta | 🟡 Olası | 🟢 Düşük | Düşük |
| Normalizasyon eksikliği | 🟡 Orta | 🔴 Kesin | 🟡 ORTA | Orta |

---

## 🚀 KARAR VE SONUÇ

### Acil Düzeltmeler (Bugün)

1. ✅ **Tenant ID NOT NULL Migration**
2. ✅ **Mevcut verilere tenant ID atama**
3. ✅ **Backend tenant filtresi kontrolü**

### Kısa Vadeli (Bu Hafta)

4. ✅ **AYRI Brand ve Category tabloları**
5. ✅ **Unit yapısı düzeltme**
6. ✅ **Marka sorgusu düzeltme**

### Uzun Vadeli (Gelecek Hafta)

7. ✅ **RLS kurulumu**
8. ✅ **Araç uyumluluğu tablosu**
9. ✅ **Gelişmiş fiyat yönetimi**

---

## 📚 EKLER

### Test Sorguları

```sql
-- 1. Tenant ID NULL olan ürünleri bul
SELECT COUNT(*) FROM products WHERE tenant_id IS NULL;

-- 2. Tenant ID NULL olan cari hesapları bul
SELECT COUNT(*) FROM accounts WHERE tenant_id IS NULL;

-- 3. Tenant bazlı marka sayısı
SELECT tenant_id, COUNT(DISTINCT brand) 
FROM products 
GROUP BY tenant_id;

-- 4. Tenant bazlı ürün sayısı
SELECT tenant_id, COUNT(*) 
FROM products 
GROUP BY tenant_id;
```

### Migration Örneği

```typescript
// Prisma Migration: MakeTenantIdRequired
// migrations/YYYYMMDDHHMMSS_make_tenant_id_required/migration.sql

-- Product
ALTER TABLE "products" 
ALTER COLUMN "tenant_id" SET NOT NULL;

-- Account
ALTER TABLE "accounts" 
ALTER COLUMN "tenant_id" SET NOT NULL;

-- Collection
ALTER TABLE "collections" 
ALTER COLUMN "tenant_id" SET NOT NULL;

-- BankTransfer
ALTER TABLE "bank_transfers" 
ALTER COLUMN "tenant_id" SET NOT NULL;

-- Expense
ALTER TABLE "expenses" 
ALTER COLUMN "tenant_id" SET NOT NULL;

-- Role
ALTER TABLE "roles" 
ALTER COLUMN "tenant_id" SET NOT NULL;

-- Unit (Eğer tabloyu değiştireceksek)
ALTER TABLE "units" 
ADD COLUMN "tenant_id" TEXT NOT NULL;

-- Brand tablosu oluştur
CREATE TABLE "brands" (
    "id" TEXT NOT NULL,
    "tenant_id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "logo_url" TEXT,
    "website" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "brands_pkey" PRIMARY KEY ("id")
);

-- Brand tablosu indeksler
CREATE UNIQUE INDEX "brands_name_tenantId_key" ON "brands"("name", "tenant_id");
CREATE INDEX "brands_tenantId_idx" ON "brands"("tenant_id");
CREATE INDEX "brands_name_idx" ON "brands"("name");

-- Product tablosuna brandId ekle
ALTER TABLE "products" 
ADD COLUMN "brand_id" TEXT;

-- Mevcut brand sütunundan verileri aktar
INSERT INTO "brands" ("id", "tenant_id", "name")
SELECT 
    gen_random_uuid(),
    tenant_id,
    brand
FROM "products" 
WHERE brand IS NOT NULL AND brand != ''
GROUP BY tenant_id, brand;

-- Product.brandId güncelle
UPDATE "products" p
SET "brand_id" = b.id
FROM "brands" b
WHERE p.brand = b.name AND p.tenant_id = b.tenant_id;

-- Product.brand sütununu kaldır (geçiş süreci sonunda)
-- ALTER TABLE "products" DROP COLUMN "brand";
```

---

**Rapor Sonu**

Bu rapor, veritabanı yapısındaki kritik güvenlik açıklarını ve profesyonelleştirme fırsatlarını göstermektedir. Acil düzeltmeler hemen uygulanmalıdır.

**İletişim:** Proje ekibi  
**Durum:** Acil aksiyon gerekiyor