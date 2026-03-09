# Turkish to English Internationalization Report

**Project:** Otomuhasebe API (Stage Environment)
**Generated Date:** 2026-03-06
**Purpose:** Comprehensive analysis of Turkish naming conventions and roadmap for English conversion

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Database Schema Analysis (Prisma)](#database-schema-analysis-prisma)
3. [Module-Based Analysis (24 Modules)](#module-based-analysis-24-modules)
4. [Translation Dictionary](#translation-dictionary)
5. [Implementation Roadmap](#implementation-roadmap)
6. [Breaking Changes & Migration Strategy](#breaking-changes--migration-strategy)

---

## Executive Summary

### Overview

This report identifies **all Turkish naming conventions** used throughout the Otomuhasebe API codebase, including:

- Database schema (Prisma models)
- Module folder names
- Controllers, Services, DTOs
- Function names, routes, variables
- Comments and documentation

### Statistics

| Category | Count | Priority |
|----------|-------|----------|
| **Database Schema** | | |
| Turkish Field Names | 9 | 🔴 HIGH |
| Turkish Relation Names | 3 | 🔴 HIGH |
| Turkish Enum Values | 1 | 🔴 HIGH |
| Turkish Comments | 15+ sections | 🟡 MEDIUM |
| **Modules & Code** | | |
| Turkish Module Folders | 24 | 🔴 HIGH |
| Turkish Controllers | 24 | 🔴 HIGH |
| Turkish Services | 24 | 🔴 HIGH |
| Turkish DTOs | 80+ | 🔴 HIGH |
| Turkish Functions | 50+ | 🔴 HIGH |
| Turkish Routes | 150+ | 🔴 HIGH |
| **TOTAL** | **350+** | |

### Recommendations

1. **Phase 1 (Critical)**: Database schema field names and relations
2. **Phase 2 (High Priority)**: Module folders, controllers, services
3. **Phase 3 (Medium Priority)**: Routes, functions, DTOs
4. **Phase 4 (Low Priority)**: Comments and documentation

---

## Database Schema Analysis (Prisma)

### File: `prisma/schema.prisma`

#### 🔴 Turkish Field Names

| Model | Field Name (TR) | English Equivalent | Line | DB Column | Change Required |
|-------|----------------|-------------------|------|-----------|----------------|
| **WarehouseTransfer** | `hazirlayan` | `preparedBy` | N/A | `prepared_by_id` | Relation name only |
| **WarehouseTransfer** | `onaylayan` | `approvedBy` | N/A | `approved_by_id` | Relation name only |
| **WarehouseTransfer** | `teslimAlan` | `receivedBy` | N/A | `received_by_id` | Relation name only |
| **Warehouse** | `faturalar` | `invoices` | ~1439 | `warehouse_id` (FK) | Field name |
| **WarehouseCriticalStock** | `stok` | `product` or `stock` | ~2587 | `product_id` (FK) | Field name |

#### 🔴 Turkish Relation Names

| Relation Name (TR) | English Equivalent | Models | Line |
|-------------------|-------------------|--------|------|
| `WarehouseTransferHazirlayan` | `WarehouseTransferPreparedBy` | User ↔ WarehouseTransfer | 302, 2658 |
| `WarehouseTransferOnaylayan` | `WarehouseTransferApprovedBy` | User ↔ WarehouseTransfer | 303, 2659 |
| `WarehouseTransferTeslimAlan` | `WarehouseTransferReceivedBy` | User ↔ WarehouseTransfer | 304, 2661 |

#### 🔴 Turkish Enum Values

| Enum | Value (TR) | English Equivalent | Line |
|------|-----------|-------------------|------|
| `ModuleType` | `TEKLIF` | `QUOTE` or `OFFER` | ~3036 |

#### 🟡 Turkish Comments (Sample)

| Location | Comment (TR) | Line Range |
|----------|-------------|-----------|
| Account model | `// Risk Yönetimi` | ~545 |
| Account model | `// Detaylar` | ~550 |
| Bank model | `// Banka - Ana banka tanımı` | ~685 |
| BankAccount model | `// Banka Hesabı - Bankaya ait hesaplar` | ~705 |
| BankAccount model | `// POS hesapları için` | ~716 |
| Invoice model | `// e-Dönüşüm Alanları` | ~914 |
| SalaryPlan model | `// Maaş Planı - Her personel için 12 aylık plan` | ~3153 |
| Advance model | `// Avans Sistemi` | ~3242 |

### Prisma Schema Changes Required

```prisma
// BEFORE
model WarehouseTransfer {
  // ...
  preparedByUser User? @relation("WarehouseTransferHazirlayan")
  approvedByUser User? @relation("WarehouseTransferOnaylayan")
  receivedByUser User? @relation("WarehouseTransferTeslimAlan")
}

model User {
  // ...
  preparedWarehouseTransfers WarehouseTransfer[] @relation("WarehouseTransferHazirlayan")
  approvedWarehouseTransfers WarehouseTransfer[] @relation("WarehouseTransferOnaylayan")
  receivedWarehouseTransfers WarehouseTransfer[] @relation("WarehouseTransferTeslimAlan")
}

model Warehouse {
  // ...
  faturalar Invoice[]
}

model WarehouseCriticalStock {
  // ...
  stok Product @relation(...)
}

enum ModuleType {
  // ...
  TEKLIF
}

// AFTER
model WarehouseTransfer {
  // ...
  preparedByUser User? @relation("WarehouseTransferPreparedBy")
  approvedByUser User? @relation("WarehouseTransferApprovedBy")
  receivedByUser User? @relation("WarehouseTransferReceivedBy")
}

model User {
  // ...
  preparedWarehouseTransfers WarehouseTransfer[] @relation("WarehouseTransferPreparedBy")
  approvedWarehouseTransfers WarehouseTransfer[] @relation("WarehouseTransferApprovedBy")
  receivedWarehouseTransfers WarehouseTransfer[] @relation("WarehouseTransferReceivedBy")
}

model Warehouse {
  // ...
  invoices Invoice[]
}

model WarehouseCriticalStock {
  // ...
  product Product @relation(...)
}

enum ModuleType {
  // ...
  QUOTE
}
```

**Important Note:** Database column names are already in English (`prepared_by_id`, `approved_by_id`, etc.). Only Prisma Client field names and relation names need to be changed.

---

## Module-Based Analysis (24 Modules)

### Module List

| # | Module Folder (TR) | English Equivalent | Route (TR) | Route (EN) | Priority |
|---|-------------------|-------------------|-----------|-----------|----------|
| 1 | `avans` | `advance` | `/avans` | `/advance` | 🔴 HIGH |
| 2 | `arac` | `vehicle` | `/arac` | `/vehicle` | 🔴 HIGH |
| 3 | `banka` | `bank` | `/banka` | `/bank` | 🔴 HIGH |
| 4 | `banka-hesap` | `bank-account` | `/banka-hesap` | `/bank-account` | 🔴 HIGH |
| 5 | `banka-havale` | `bank-transfer` | `/banka-havale` | `/bank-transfer` | 🔴 HIGH |
| 6 | `basit-siparis` | `simple-order` | `/basit-siparis` | `/simple-order` | 🔴 HIGH |
| 7 | `cek-senet` | `check-bill` | `/cek-senet` | `/check-bill` | 🔴 HIGH |
| 8 | `depo` | `warehouse` | `/depo` | `/warehouse` | 🔴 HIGH |
| 9 | `firma-kredi-karti` | `company-credit-card` | `/firma-kredi-karti` | `/company-credit-card` | 🔴 HIGH |
| 10 | `fiyat-listesi` | `price-list` | `/fiyat-listesi` | `/price-list` | 🔴 HIGH |
| 11 | `hizli` | `fast` or `quick` | `/hizli` | `/fast` | 🟡 MEDIUM |
| 12 | `maas-odeme` | `salary-payment` | `/maas-odeme` | `/salary-payment` | 🔴 HIGH |
| 13 | `maas-plan` | `salary-plan` | `/maas-plan` | `/salary-plan` | 🔴 HIGH |
| 14 | `masraf` | `expense` | `/masraf` | `/expense` | 🔴 HIGH |
| 15 | `personel` | `employee` or `personnel` | `/personel` | `/employee` | 🔴 HIGH |
| 16 | `raporlama` | `reporting` | `/raporlama` | `/reporting` | 🔴 HIGH |
| 17 | `satin-alma-irsaliyesi` | `purchase-delivery-note` | `/satin-alma-irsaliyesi` | `/purchase-delivery-note` | 🔴 HIGH |
| 18 | `satin-alma-siparisi` | `purchase-order` | `/satin-alma-siparisi` | `/purchase-order` | 🔴 HIGH |
| 19 | `satis-elemani` | `sales-agent` | `/satis-elemani` | `/sales-agent` | 🔴 HIGH |
| 20 | `satis-irsaliyesi` | `sales-delivery-note` | `/satis-irsaliyesi` | `/sales-delivery-note` | 🔴 HIGH |
| 21 | `stok` | `stock` or `inventory` | `/stok` | `/stock` | 🔴 HIGH |
| 22 | `stok-hareket` | `stock-movement` | `/stok-hareket` | `/stock-movement` | 🔴 HIGH |
| 23 | `tahsilat` | `collection` | `/tahsilat` | `/collection` | 🔴 HIGH |
| 24 | `teklif` | `quote` or `offer` | `/teklif` | `/quote` | 🔴 HIGH |

---

### Detailed Module Breakdown

#### 1. Module: `avans` → `advance`

**Location:** `src/modules/avans/`

##### Files to Rename

| Current File | New File |
|-------------|----------|
| `avans.controller.ts` | `advance.controller.ts` |
| `avans.service.ts` | `advance.service.ts` |
| `avans.module.ts` | `advance.module.ts` |
| `dto/create-avans.dto.ts` | `dto/create-advance.dto.ts` |
| `dto/mahsuplastir-avans.dto.ts` | `dto/settle-advance.dto.ts` |

##### Controllers

| Current Class | New Class | Location |
|--------------|-----------|----------|
| `AvansController` | `AdvanceController` | `avans.controller.ts:17` |

**Routes to Change:**

| Current Route | New Route | Method | Function |
|--------------|-----------|--------|----------|
| `/avans/create` | `/advance/create` | POST | `create` |
| `/avans/mahsuplastir` | `/advance/settle` | POST | `settle` |
| `/avans/personel/:personelId` | `/advance/employee/:employeeId` | GET | `getByEmployee` |
| `/avans/:id` | `/advance/:id` | GET | `getDetail` |

##### Services

| Current Class | New Class | Location |
|--------------|-----------|----------|
| `AvansService` | `AdvanceService` | `avans.service.ts` |

**Functions to Rename:**

| Current Function | New Function | Line |
|-----------------|-------------|------|
| `createAvans` | `createAdvance` | ~22 |
| `mahsuplastir` | `settleAdvance` | ~27 |
| `getAvansByPersonel` | `getAdvancesByEmployee` | ~32 |
| `getAvansDetay` | `getAdvanceDetail` | ~37 |

##### DTOs

| Current DTO | New DTO | Location |
|------------|---------|----------|
| `CreateAvansDto` | `CreateAdvanceDto` | `dto/create-avans.dto.ts` |
| `MahsuplastirAvansDto` | `SettleAdvanceDto` | `dto/mahsuplastir-avans.dto.ts` |

**DTO Fields to Rename:**

| Current Field | New Field | Type | Description |
|--------------|-----------|------|-------------|
| `personelId` | `employeeId` | string | Employee ID |
| `tutar` | `amount` | number | Amount |
| `tarih` | `date` | Date | Date |
| `aciklama` | `description` | string | Description |
| `kasaId` | `cashboxId` | string | Cashbox ID |
| `mahsupEdilen` | `settledAmount` | number | Settled amount |
| `kalan` | `remainingAmount` | number | Remaining amount |
| `durum` | `status` | enum | Status |
| `avansId` | `advanceId` | string | Advance ID |
| `planlar` | `plans` | array | Settlement plans |

##### Enums

| Current Enum | New Enum | Values (TR) | Values (EN) |
|-------------|----------|------------|------------|
| `AvansDurum` | `AdvanceStatus` | `ACIK, KISMI, KAPALI` | `OPEN, PARTIAL, CLOSED` |

---

#### 2. Module: `arac` → `vehicle`

**Location:** `src/modules/arac/`

##### Files to Rename

| Current File | New File |
|-------------|----------|
| `arac.controller.ts` | `vehicle.controller.ts` |
| `arac.service.ts` | `vehicle.service.ts` |
| `arac.module.ts` | `vehicle.module.ts` |
| `dto/create-arac.dto.ts` | `dto/create-vehicle.dto.ts` |
| `dto/update-arac.dto.ts` | `dto/update-vehicle.dto.ts` |

##### Controllers

| Current Class | New Class | Location |
|--------------|-----------|----------|
| `AracController` | `VehicleController` | `arac.controller.ts:18` |

**Routes to Change:**

| Current Route | New Route | Method | Function |
|--------------|-----------|--------|----------|
| `/arac` | `/vehicle` | POST | `create` |
| `/arac/markalar` | `/vehicle/brands` | GET | `getBrands` |
| `/arac/yakit-tipleri` | `/vehicle/fuel-types` | GET | `getFuelTypes` |
| `/arac/modeller` | `/vehicle/models` | GET | `getModels` |
| `/arac` | `/vehicle` | GET | `findAll` |
| `/arac/:id` | `/vehicle/:id` | GET | `findOne` |
| `/arac/:id` | `/vehicle/:id` | PATCH | `update` |
| `/arac/:id` | `/vehicle/:id` | DELETE | `remove` |

##### Services

| Current Class | New Class | Location |
|--------------|-----------|----------|
| `AracService` | `VehicleService` | `arac.service.ts` |

**Functions to Rename:**

| Current Function | New Function | Line |
|-----------------|-------------|------|
| `getMarkalar` | `getBrands` | ~29 |
| `getYakitTipleri` | `getFuelTypes` | ~34 |
| `getModeller` | `getModels` | ~39 |

##### DTOs

| Current DTO | New DTO | Location |
|------------|---------|----------|
| `CreateAracDto` | `CreateVehicleDto` | `dto/create-arac.dto.ts` |
| `UpdateAracDto` | `UpdateVehicleDto` | `dto/update-arac.dto.ts` |

**DTO Fields to Rename:**

| Current Field | New Field | Type | Description |
|--------------|-----------|------|-------------|
| `marka` | `brand` | string | Brand |
| `model` | `model` | string | Model |
| `motorHacmi` | `engineSize` | string | Engine size |
| `yakitTipi` | `fuelType` | string | Fuel type |

##### Query Parameters

| Current Param | New Param | Route |
|--------------|-----------|-------|
| `marka` | `brand` | `/vehicle` |
| `yakitTipi` | `fuelType` | `/vehicle` |

---

#### 3. Module: `banka` → `bank`

**Location:** `src/modules/banka/`

##### Files to Rename

| Current File | New File |
|-------------|----------|
| `banka.controller.ts` | `bank.controller.ts` |
| `banka.service.ts` | `bank.service.ts` |
| `banka.module.ts` | `bank.module.ts` |

##### Controllers

| Current Class | New Class |
|--------------|-----------|
| `BankaController` | `BankController` |

**Routes to Change:**

| Current Route | New Route | Method | Function |
|--------------|-----------|--------|----------|
| `/banka/ozet` | `/bank/summary` | GET | `getSummary` |
| `/banka/account/:accountId/movements` | `/bank/account/:accountId/movements` | GET | `getMovements` |
| `/banka/account/:accountId/kredi-kullan` | `/bank/account/:accountId/use-credit` | POST | `useCredit` |
| `/banka/installments/upcoming` | `/bank/installments/upcoming` | GET | `getUpcomingInstallments` |

##### Services

| Current Class | New Class |
|--------------|-----------|
| `BankaService` | `BankService` |

**Functions to Rename:**

| Current Function | New Function | Description |
|-----------------|-------------|-------------|
| `getBankalarOzet` | `getBanksSummary` | Get banks summary |
| `getHareketler` | `getMovements` | Get movements |
| `createHareket` | `createMovement` | Create movement |
| `createPosHareket` | `createPosMovement` | Create POS movement |
| `krediKullan` | `useCredit` | Use credit |
| `getKrediler` | `getLoans` | Get loans |
| `getKrediDetay` | `getLoanDetail` | Get loan detail |
| `getYaklasanTaksitler` | `getUpcomingInstallments` | Get upcoming installments |
| `addKrediPlan` | `addLoanPlan` | Add loan plan |
| `updateKrediPlan` | `updateLoanPlan` | Update loan plan |
| `deleteKrediPlan` | `deleteLoanPlan` | Delete loan plan |

##### Query Parameters

| Current Param | New Param |
|--------------|-----------|
| `baslangic` | `startDate` |
| `bitis` | `endDate` |
| `vadeTarihi` | `dueDate` |

---

#### 4. Module: `banka-hesap` → `bank-account`

**Location:** `src/modules/banka-hesap/`

##### Files to Rename

| Current File | New File |
|-------------|----------|
| `banka-hesap.controller.ts` | `bank-account.controller.ts` |
| `banka-hesap.service.ts` | `bank-account.service.ts` |
| `banka-hesap.module.ts` | `bank-account.module.ts` |

##### Controllers & Routes

| Current | New |
|---------|-----|
| `BankaHesapController` | `BankAccountController` |
| `/banka-hesap` | `/bank-account` |

---

#### 5. Module: `banka-havale` → `bank-transfer`

**Location:** `src/modules/banka-havale/`

##### Controllers & Routes

| Current | New |
|---------|-----|
| `BankaHavaleController` | `BankTransferController` |
| `/banka-havale` | `/bank-transfer` |

##### Query Parameters

| Current Param | New Param |
|--------------|-----------|
| `bankaHesabiId` | `bankAccountId` |
| `baslangicTarihi` | `startDate` |
| `bitisTarihi` | `endDate` |
| `hareketTipi` | `movementType` |

---

#### 6. Module: `basit-siparis` → `simple-order`

**Location:** `src/modules/basit-siparis/`

##### Controllers & Routes

| Current | New |
|---------|-----|
| `BasitSiparisController` | `SimpleOrderController` |
| `/basit-siparis` | `/simple-order` |

##### Enums

| Current | New | Values (TR) | Values (EN) |
|---------|-----|------------|------------|
| `BasitSiparisDurum` | `SimpleOrderStatus` | - | - |

---

#### 7. Module: `cek-senet` → `check-bill`

**Location:** `src/modules/cek-senet/`

##### Files

| Current File | New File |
|-------------|----------|
| `cek-senet.controller.ts` | `check-bill.controller.ts` |
| `bordro.controller.ts` | `payroll.controller.ts` |

##### Controllers & Routes

| Current | New |
|---------|-----|
| `CekSenetController` | `CheckBillController` |
| `/cek-senet` | `/check-bill` |
| `/cek-senet/yaklasan` | `/check-bill/upcoming` |
| `/cek-senet/islem` | `/check-bill/transaction` |

##### Functions

| Current | New |
|---------|-----|
| `getYaklasanCekler` | `getUpcomingChecks` |
| `islemYap` | `processTransaction` |

---

#### 8. Module: `depo` → `warehouse`

**Location:** `src/modules/depo/`

##### Controllers & Routes

| Current | New |
|---------|-----|
| `DepoController` | `WarehouseController` |
| `DepoService` | `WarehouseService` |
| `/depo` | `/warehouse` |

**Note:** This module is a duplicate of the existing `warehouse` module. Consider consolidating.

---

#### 9. Module: `firma-kredi-karti` → `company-credit-card`

**Location:** `src/modules/firma-kredi-karti/`

##### Controllers & Routes

| Current | New |
|---------|-----|
| `FirmaKrediKartiController` | `CompanyCreditCardController` |
| `/firma-kredi-karti` | `/company-credit-card` |

---

#### 10. Module: `fiyat-listesi` → `price-list`

**Location:** `src/modules/fiyat-listesi/`

##### Controllers & Routes

| Current | New |
|---------|-----|
| `FiyatListesiController` | `PriceListController` |
| `/fiyat-listesi` | `/price-list` |
| `/fiyat-listesi/stok/:stokId` | `/price-list/stock/:stockId` |

##### Functions

| Current | New |
|---------|-----|
| `findStokPrice` | `findStockPrice` |

##### Parameters

| Current | New |
|---------|-----|
| `stokId` | `stockId` |
| `cariId` | `accountId` |

---

#### 11. Module: `hizli` → `fast`

**Location:** `src/modules/hizli/`

**Context:** This appears to be related to "Hızlı e-invoice" integration (Turkish tax system).

##### Controllers & Routes

| Current | New |
|---------|-----|
| `HizliController` | `FastController` or `HizliController` (keep as-is) |
| `/hizli` | `/fast` or `/hizli` |

**Recommendation:** Consider keeping as `hizli` since it's a proper name for the e-invoice integration service.

---

#### 12. Module: `maas-odeme` → `salary-payment`

**Location:** `src/modules/maas-odeme/`

##### Controllers & Routes

| Current | New |
|---------|-----|
| `MaasOdemeController` | `SalaryPaymentController` |
| `/maas-odeme` | `/salary-payment` |
| `/maas-odeme/create` | `/salary-payment/create` |
| `/maas-odeme/plan/:planId` | `/salary-payment/plan/:planId` |
| `/maas-odeme/personel/:personelId/:yil` | `/salary-payment/employee/:employeeId/:year` |
| `/maas-odeme/export/excel/:yil/:ay` | `/salary-payment/export/excel/:year/:month` |
| `/maas-odeme/makbuz/:id` | `/salary-payment/receipt/:id` |

##### Functions

| Current | New |
|---------|-----|
| `createOdeme` | `createPayment` |
| `getOdemelerByPlan` | `getPaymentsByPlan` |
| `getOdemelerByPersonel` | `getPaymentsByEmployee` |
| `exportExcel` | `exportExcel` |
| `generateMakbuz` | `generateReceipt` |

##### Parameters

| Current | New |
|---------|-----|
| `personelId` | `employeeId` |
| `yil` | `year` |
| `ay` | `month` |
| `makbuz` | `receipt` |

---

#### 13. Module: `maas-plan` → `salary-plan`

**Location:** `src/modules/maas-plan/`

##### Controllers & Routes

| Current | New |
|---------|-----|
| `MaasPlanController` | `SalaryPlanController` |
| `/maas-plan` | `/salary-plan` |
| `/maas-plan/create` | `/salary-plan/create` |
| `/maas-plan/personel/:personelId/:yil` | `/salary-plan/employee/:employeeId/:year` |
| `/maas-plan/odenecek/:yil/:ay` | `/salary-plan/payable/:year/:month` |
| `/maas-plan/:id` | `/salary-plan/:id` |
| `/maas-plan/yillik/:personelId/:yil` | `/salary-plan/annual/:employeeId/:year` |

##### Functions

| Current | New |
|---------|-----|
| `createPlanForPersonel` | `createPlanForEmployee` |
| `getPlanByPersonel` | `getPlanByEmployee` |
| `getOdenecekMaaslar` | `getPayableSalaries` |
| `deleteYillikPlan` | `deleteAnnualPlan` |

##### Parameters

| Current | New |
|---------|-----|
| `personelId` | `employeeId` |
| `yil` | `year` |
| `ay` | `month` |
| `odenecek` | `payable` |
| `yillik` | `annual` |
| `kalanTutar` | `remainingAmount` |

---

#### 14. Module: `masraf` → `expense`

**Location:** `src/modules/masraf/`

##### Controllers & Routes

| Current | New |
|---------|-----|
| `MasrafController` | `ExpenseController` |
| `/masraf` | `/expense` |
| `/masraf/stats` | `/expense/stats` |
| `/masraf/kategoriler` | `/expense/categories` |

##### Functions

| Current | New |
|---------|-----|
| `findAllKategoriler` | `findAllCategories` |
| `createKategori` | `createCategory` |
| `updateKategori` | `updateCategory` |
| `removeKategori` | `removeCategory` |

##### Parameters

| Current | New |
|---------|-----|
| `kategoriId` | `categoryId` |
| `kategoriAdi` | `categoryName` |
| `aciklama` | `description` |
| `baslangicTarihi` | `startDate` |
| `bitisTarihi` | `endDate` |

---

#### 15. Module: `personel` → `employee`

**Location:** `src/modules/personel/`

##### Controllers & Routes

| Current | New |
|---------|-----|
| `PersonelController` | `EmployeeController` |
| `/personel` | `/employee` |
| `/personel/stats` | `/employee/stats` |
| `/personel/departmanlar` | `/employee/departments` |
| `/personel/odeme` | `/employee/payment` |
| `/personel/:id/odemeler` | `/employee/:id/payments` |

##### Functions

| Current | New |
|---------|-----|
| `getDepartmanlar` | `getDepartments` |
| `createOdeme` | `createPayment` |
| `getOdemeler` | `getPayments` |

##### DTOs

| Current | New |
|---------|-----|
| `CreatePersonelDto` | `CreateEmployeeDto` |
| `UpdatePersonelDto` | `UpdateEmployeeDto` |
| `CreatePersonelOdemeDto` | `CreateEmployeePaymentDto` |

##### Parameters

| Current | New |
|---------|-----|
| `departman` | `department` |
| `aktif` | `active` |
| `personelId` | `employeeId` |
| `kasaId` | `cashboxId` |
| `tutar` | `amount` |
| `tarih` | `date` |
| `aciklama` | `description` |
| `tip` | `type` |
| `donem` | `period` |
| `yeniBakiye` | `newBalance` |

---

#### 16. Module: `raporlama` → `reporting`

**Location:** `src/modules/raporlama/`

##### Controllers & Routes

| Current | New |
|---------|-----|
| `RaporlamaController` | `ReportingController` |
| `/raporlama` | `/reporting` |

---

#### 17. Module: `satin-alma-irsaliyesi` → `purchase-delivery-note`

**Location:** `src/modules/satin-alma-irsaliyesi/`

##### Controllers & Routes

| Current | New |
|---------|-----|
| `SatınAlmaIrsaliyesiController` | `PurchaseDeliveryNoteController` |
| `/satin-alma-irsaliyesi` | `/purchase-delivery-note` |

---

#### 18. Module: `satin-alma-siparisi` → `purchase-order`

**Location:** `src/modules/satin-alma-siparisi/`

##### Controllers & Routes

| Current | New |
|---------|-----|
| `SatinAlmaSiparisiController` | `PurchaseOrderController` |
| `/satin-alma-siparisi` | `/purchase-order` |
| `/satin-alma-siparisi/:id/iptal` | `/purchase-order/:id/cancel` |
| `/satin-alma-siparisi/:id/durum` | `/purchase-order/:id/status` |
| `/satin-alma-siparisi/:id/faturalandi` | `/purchase-order/:id/invoiced` |
| `/satin-alma-siparisi/:id/sevk-et` | `/purchase-order/:id/ship` |
| `/satin-alma-siparisi/:id/create-irsaliye` | `/purchase-order/:id/create-delivery-note` |

##### Functions

| Current | New |
|---------|-----|
| `iptalEt` | `cancel` |
| `faturalandi` | `markAsInvoiced` |
| `sevkEt` | `ship` |
| `createIrsaliyeFromSiparis` | `createDeliveryNoteFromOrder` |

##### Parameters

| Current | New |
|---------|-----|
| `durum` | `status` |
| `cariId` | `accountId` |
| `faturaNo` | `invoiceNo` |
| `kalemler` | `items` |

---

#### 19. Module: `satis-elemani` → `sales-agent`

**Location:** `src/modules/satis-elemani/`

##### Controllers & Routes

| Current | New |
|---------|-----|
| `SatisElemaniController` | `SalesAgentController` |
| `/satis-elemani` | `/sales-agent` |

---

#### 20. Module: `satis-irsaliyesi` → `sales-delivery-note`

**Location:** `src/modules/satis-irsaliyesi/`

##### Controllers & Routes

| Current | New |
|---------|-----|
| `SatisIrsaliyesiController` | `SalesDeliveryNoteController` |
| `/satis-irsaliyesi` | `/sales-delivery-note` |
| `/satis-irsaliyesi/pending/:cariId` | `/sales-delivery-note/pending/:accountId` |

##### Functions

| Current | New |
|---------|-----|
| `getPendingByCari` | `getPendingByAccount` |

##### Parameters

| Current | New |
|---------|-----|
| `cariId` | `accountId` |

---

#### 21. Module: `stok` → `stock`

**Location:** `src/modules/stok/`

##### Controllers & Routes

| Current | New |
|---------|-----|
| `StokController` | `StockController` or `InventoryController` |
| `/stok` | `/stock` or `/inventory` |
| `/stok/export/eslesme` | `/stock/export/matches` |
| `/stok/eslestir` | `/stock/match` |
| `/stok/eslestir-oem` | `/stock/match-by-oem` |
| `/stok/:id/hareketler` | `/stock/:id/movements` |
| `/stok/:id/esdegerler` | `/stock/:id/equivalents` |
| `/stok/:stok1Id/esdeger/:stok2Id` | `/stock/:stock1Id/equivalent/:stock2Id` |
| `/stok/:id/eslesme/:eslesikId` | `/stock/:id/match/:matchId` |
| `/stok/:id/eslestir` | `/stock/:id/match` |

##### Functions

| Current | New |
|---------|-----|
| `eslestirUrunler` | `matchProducts` |
| `eslestirOemIle` | `matchByOem` |
| `eslestirmeKaldir` | `removeMatch` |
| `eslestirmeCiftiKaldir` | `removeMatchPair` |
| `getStokHareketleri` | `getStockMovements` |
| `getEsdegerUrunler` | `getEquivalentProducts` |
| `addEsdeger` | `addEquivalent` |

##### Parameters

| Current | New |
|---------|-----|
| `stokId` | `stockId` or `inventoryId` |
| `anaUrunId` | `mainProductId` |
| `esUrunIds` | `equivalentProductIds` |
| `eslesikId` | `matchId` |
| `esdegerler` | `equivalents` |
| `hareketler` | `movements` |
| `aktif` | `active` |

---

#### 22. Module: `stok-hareket` → `stock-movement`

**Location:** `src/modules/stok-hareket/`

##### Controllers & Routes

| Current | New |
|---------|-----|
| `StokHareketController` | `StockMovementController` |
| `/stok-hareket` | `/stock-movement` |

##### Parameters

| Current | New |
|---------|-----|
| `stokId` | `stockId` |
| `hareketTipi` | `movementType` |

##### Enums

| Current Enum | New Enum | Values (TR) | Values (EN) |
|-------------|----------|------------|------------|
| `HareketTipi` | `MovementType` | `ENTRY, EXIT, SALE, RETURN, CANCELLATION_ENTRY, CANCELLATION_EXIT, COUNT, COUNT_SURPLUS, COUNT_SHORTAGE` | Already in English ✓ |

---

#### 23. Module: `tahsilat` → `collection`

**Location:** `src/modules/tahsilat/`

##### Controllers & Routes

| Current | New |
|---------|-----|
| `TahsilatController` | `CollectionController` |
| `/tahsilat` | `/collection` |
| `/tahsilat/capraz-odeme` | `/collection/cross-payment` |
| `/tahsilat/stats` | `/collection/stats` |

##### Functions

| Current | New |
|---------|-----|
| `createCaprazOdeme` | `createCrossPayment` |

---

#### 24. Module: `teklif` → `quote`

**Location:** `src/modules/teklif/`

##### Controllers & Routes

| Current | New |
|---------|-----|
| `TeklifController` | `QuoteController` |
| `/teklif` | `/quote` |
| `/teklif/:id/durum` | `/quote/:id/status` |
| `/teklif/:id/siparise-donustur` | `/quote/:id/convert-to-order` |

##### Functions

| Current | New |
|---------|-----|
| `sipariseDonustur` | `convertToOrder` |

##### Parameters

| Current | New |
|---------|-----|
| `teklifTipi` | `quoteType` |
| `cariId` | `accountId` |
| `durum` | `status` |

---

## Translation Dictionary

### Common Terms

| Turkish | English | Category |
|---------|---------|----------|
| **A** |
| aciklama | description | Field |
| aktif | active | Field |
| arac | vehicle | Module |
| avans | advance | Module |
| ay | month | Parameter |
| **B** |
| banka | bank | Module |
| baslangic | start | Parameter |
| baslangicTarihi | startDate | Parameter |
| bitis | end | Parameter |
| bitisTarihi | endDate | Parameter |
| **C** |
| cari | account | Field |
| cariId | accountId | Parameter |
| cek | check | Module |
| **D** |
| departman | department | Field |
| depo | warehouse | Module |
| donem | period | Field |
| durum | status | Field |
| **E** |
| esdeger | equivalent | Field |
| eslesme | match | Field |
| eslestir | match | Function |
| **F** |
| fatura | invoice | Field |
| faturalandi | invoiced | Status |
| firma | company | Module |
| fiyat | price | Module |
| **G** |
| guncelle | update | Function |
| **H** |
| hareket | movement | Module |
| hazirlayan | preparedBy | Field |
| hizli | fast/quick | Module |
| **I** |
| iptal | cancel | Function |
| irsaliye | delivery-note | Module |
| islem | transaction | Field |
| **K** |
| kalan | remaining | Field |
| kalem | item | Field |
| kalemler | items | Field |
| kasa | cashbox | Field |
| kasaId | cashboxId | Parameter |
| kategori | category | Field |
| kredi | credit | Field |
| **L** |
| liste | list | Module |
| **M** |
| maas | salary | Module |
| mahsup | settlement | Field |
| mahsuplastir | settle | Function |
| makbuz | receipt | Field |
| marka | brand | Field |
| masraf | expense | Module |
| model | model | Field |
| motorHacmi | engineSize | Field |
| **O** |
| odeme | payment | Module |
| odenecek | payable | Field |
| oem | oem | Field |
| onaylayan | approvedBy | Field |
| ozet | summary | Route |
| **P** |
| personel | employee | Module |
| plan | plan | Module |
| **R** |
| raporlama | reporting | Module |
| **S** |
| satin | purchase | Module |
| satis | sales | Module |
| senet | bill | Module |
| sevk | ship | Function |
| siparis | order | Module |
| stok | stock/inventory | Module |
| **T** |
| tahsilat | collection | Module |
| taksit | installment | Field |
| tarih | date | Field |
| teklif | quote | Module |
| teslimAlan | receivedBy | Field |
| tip | type | Field |
| tutar | amount | Field |
| **V** |
| vade | due | Field |
| vadeTarihi | dueDate | Field |
| **Y** |
| yakit | fuel | Field |
| yakitTipi | fuelType | Field |
| yaklasan | upcoming | Route |
| yeni | new | Prefix |
| yeniBakiye | newBalance | Field |
| yil | year | Parameter |
| yillik | annual | Route |

---

## Implementation Roadmap

### Phase 1: Database Schema (Week 1) 🔴 CRITICAL

**Priority:** Highest
**Breaking Changes:** Yes (Prisma Client regeneration required)

#### Steps:

1. **Backup Database**
   ```bash
   pg_dump $DATABASE_URL > backup_$(date +%Y%m%d).sql
   ```

2. **Update Prisma Schema**
   - Change relation names:
     - `WarehouseTransferHazirlayan` → `WarehouseTransferPreparedBy`
     - `WarehouseTransferOnaylayan` → `WarehouseTransferApprovedBy`
     - `WarehouseTransferTeslimAlan` → `WarehouseTransferReceivedBy`
   - Change field names:
     - `Warehouse.faturalar` → `Warehouse.invoices`
     - `WarehouseCriticalStock.stok` → `WarehouseCriticalStock.product`
   - Change enum value:
     - `ModuleType.TEKLIF` → `ModuleType.QUOTE`

3. **Generate Prisma Client**
   ```bash
   npx prisma generate
   ```

4. **Find & Replace All References**
   ```bash
   # Example for hazirlayan
   grep -r "hazirlayan" src/
   grep -r "WarehouseTransferHazirlayan" src/
   ```

5. **Test All Queries**
   - Update all TypeScript code referencing old field names
   - Run tests

6. **Commit Changes**
   ```bash
   git add .
   git commit -m "refactor(schema): rename Turkish fields to English in Prisma schema"
   ```

**Estimated Time:** 8 hours

---

### Phase 2: Module Folders & Core Files (Week 2-3) 🔴 HIGH

**Priority:** High
**Breaking Changes:** Yes (all imports will break)

#### Strategy: One Module at a Time

For each of the 24 modules:

1. **Rename Folder**
   ```bash
   git mv src/modules/avans src/modules/advance
   ```

2. **Rename Files**
   ```bash
   cd src/modules/advance
   git mv avans.controller.ts advance.controller.ts
   git mv avans.service.ts advance.service.ts
   git mv avans.module.ts advance.module.ts
   ```

3. **Update Imports**
   ```bash
   # Find all imports
   grep -r "from.*avans" src/
   ```

4. **Update Class Names**
   - Replace class declarations
   - Update decorators: `@Controller('avans')` → `@Controller('advance')`

5. **Update app.module.ts**
   ```typescript
   // Before
   import { AvansModule } from './modules/avans/avans.module';

   // After
   import { AdvanceModule } from './modules/advance/advance.module';
   ```

6. **Test Module**
   ```bash
   npm run test:e2e -- --testNamePattern="Advance"
   ```

7. **Commit**
   ```bash
   git add .
   git commit -m "refactor(modules): rename avans module to advance"
   ```

#### Module Rename Order (Priority):

1. `avans` → `advance` (simple, good starting point)
2. `depo` → `warehouse` (check for conflicts with existing `warehouse` module)
3. `arac` → `vehicle` (conflicts with `customer-vehicle`, `company-vehicles`)
4. `stok` → `stock` (widely used, many dependencies)
5. `maas-plan` → `salary-plan`
6. `maas-odeme` → `salary-payment`
7. `personel` → `employee` (conflicts with existing modules?)
8. `tahsilat` → `collection` (conflicts with existing `Collection` model)
9. `teklif` → `quote` (conflicts with existing `Quote` module)
10. ... (continue with remaining 15 modules)

**Estimated Time:** 40 hours (2 hours per module × 24 modules, including testing)

---

### Phase 3: Routes & API Endpoints (Week 4) 🔴 HIGH

**Priority:** High
**Breaking Changes:** YES - All API clients will break

#### Options:

##### Option A: Hard Cut-Over (Fastest, Most Breaking)

Simply change all routes:
```typescript
// Before
@Controller('avans')

// After
@Controller('advance')
```

**Pros:** Clean, no technical debt
**Cons:** All API clients break immediately

##### Option B: Dual Routes (Gradual Migration)

Support both old and new routes temporarily:
```typescript
@Controller(['advance', 'avans']) // NestJS supports multiple routes
export class AdvanceController {
  // ...
}
```

**Pros:** Backwards compatible during migration
**Cons:** Technical debt, more code to maintain

##### Option C: API Versioning (Professional Approach)

Create v2 API with English routes:
```typescript
// v1 (Turkish)
@Controller('v1/avans')
export class AvansControllerV1 { ... }

// v2 (English)
@Controller('v2/advance')
export class AdvanceController { ... }
```

**Pros:** Professional, allows gradual client migration
**Cons:** More complex, duplicate controllers

#### Recommended: Option C (API Versioning)

1. Create `v1` folder with existing Turkish controllers
2. Create `v2` folder with new English controllers
3. Deprecate v1 endpoints (set sunset date)
4. Monitor v1 usage
5. Remove v1 after migration period (e.g., 6 months)

**Estimated Time:** 24 hours

---

### Phase 4: DTOs & Validation (Week 5) 🟡 MEDIUM

**Priority:** Medium
**Breaking Changes:** Yes (request/response schemas change)

#### Steps:

1. **Rename DTO Files**
   ```bash
   git mv dto/create-avans.dto.ts dto/create-advance.dto.ts
   ```

2. **Rename DTO Classes**
   ```typescript
   // Before
   export class CreateAvansDto {
     personelId: string;
     tutar: number;
   }

   // After
   export class CreateAdvanceDto {
     employeeId: string;
     amount: number;
   }
   ```

3. **Update Validation Decorators**
   ```typescript
   @IsNumber()
   @ApiProperty({ description: 'Amount' }) // Update Swagger docs
   amount: number;
   ```

4. **Update Swagger/OpenAPI Documentation**
   - All `@ApiProperty` decorators
   - Example responses
   - Schema names

5. **Update API Tests**
   ```typescript
   // Before
   const dto = { personelId: '123', tutar: 1000 };

   // After
   const dto = { employeeId: '123', amount: 1000 };
   ```

**Estimated Time:** 32 hours (80 DTOs × 0.4 hours each)

---

### Phase 5: Functions & Variables (Week 6-7) 🟡 MEDIUM

**Priority:** Medium
**Breaking Changes:** No (internal only)

#### Steps:

1. **Rename Service Functions**
   ```typescript
   // Before
   async mahsuplastir(dto: MahsuplastirAvansDto) { ... }

   // After
   async settleAdvance(dto: SettleAdvanceDto) { ... }
   ```

2. **Update Function Calls**
   - Find all references
   - Update method calls
   - Update tests

3. **Rename Variables**
   ```typescript
   // Before
   const tutar = dto.tutar;
   const yeniBakiye = eskiBakiye - tutar;

   // After
   const amount = dto.amount;
   const newBalance = oldBalance - amount;
   ```

4. **Update Comments**
   ```typescript
   // Before
   // Avansı mahsuplaştır

   // After
   // Settle the advance payment
   ```

**Estimated Time:** 40 hours

---

### Phase 6: Comments & Documentation (Week 8) 🟢 LOW

**Priority:** Low
**Breaking Changes:** No

#### Steps:

1. **Translate Inline Comments**
   ```typescript
   // Before
   // Risk Yönetimi

   // After
   // Risk Management
   ```

2. **Update README Files**
   - Module documentation
   - API documentation
   - Developer guides

3. **Update JSDoc Comments**
   ```typescript
   /**
    * Mahsuplaştırma işlemi
    * @param dto Mahsuplaştırma bilgileri
    */
   // ↓
   /**
    * Settle advance payment
    * @param dto Settlement information
    */
   ```

**Estimated Time:** 16 hours

---

## Breaking Changes & Migration Strategy

### API Breaking Changes Summary

| Change Type | Impact | Mitigation |
|------------|--------|------------|
| **Routes** | 🔴 HIGH - All API clients | API Versioning (v1/v2) |
| **Request DTOs** | 🔴 HIGH - Request payloads | Transformer middleware |
| **Response DTOs** | 🔴 HIGH - Response schemas | Serialization interceptor |
| **Prisma Fields** | 🟡 MEDIUM - Internal code | Code generation + find/replace |
| **Function Names** | 🟢 LOW - Internal only | Refactoring |
| **Comments** | 🟢 NONE - Documentation | Translation |

### Mitigation Strategies

#### 1. API Versioning

Create separate API versions to support gradual migration:

```typescript
// src/app.module.ts
@Module({
  imports: [
    // V1 Modules (Turkish)
    RouterModule.register([
      {
        path: 'v1',
        module: V1Module,
      },
    ]),
    // V2 Modules (English)
    RouterModule.register([
      {
        path: 'v2',
        module: V2Module,
      },
    ]),
  ],
})
export class AppModule {}
```

**Migration Timeline:**
- **Month 1-2:** Release v2 with English routes
- **Month 3-4:** Deprecation warnings on v1
- **Month 5-6:** Client migration to v2
- **Month 7:** Remove v1 endpoints

#### 2. DTO Transformer Middleware

Auto-convert Turkish field names to English:

```typescript
// src/common/interceptors/dto-transformer.interceptor.ts
@Injectable()
export class DtoTransformerInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();

    // Transform Turkish → English
    if (request.body) {
      request.body = this.transformKeys(request.body, turkishToEnglishMap);
    }

    return next.handle();
  }

  private transformKeys(obj: any, map: Record<string, string>): any {
    // Recursively transform object keys
    // ...
  }
}
```

**Translation Map:**
```typescript
const turkishToEnglishMap = {
  personelId: 'employeeId',
  tutar: 'amount',
  tarih: 'date',
  aciklama: 'description',
  // ... 100+ mappings
};
```

#### 3. Response Serializer

Convert English responses back to Turkish for v1 clients:

```typescript
@Injectable()
export class ResponseSerializerInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const isV1 = request.url.startsWith('/v1');

    return next.handle().pipe(
      map(data => {
        if (isV1) {
          // Transform English → Turkish
          return this.transformKeys(data, englishToTurkishMap);
        }
        return data;
      })
    );
  }
}
```

#### 4. Prisma Migration Script

Automated script to update all Prisma references:

```typescript
// scripts/migrate-prisma-fields.ts
import { promises as fs } from 'fs';
import { glob } from 'glob';

const fieldMappings = {
  'hazirlayan': 'preparedBy',
  'onaylayan': 'approvedBy',
  'teslimAlan': 'receivedBy',
  'faturalar': 'invoices',
  'stok': 'product',
};

async function migrateFiles() {
  const files = await glob('src/**/*.ts');

  for (const file of files) {
    let content = await fs.readFile(file, 'utf-8');
    let modified = false;

    for (const [turkish, english] of Object.entries(fieldMappings)) {
      const regex = new RegExp(`\\.${turkish}\\b`, 'g');
      if (regex.test(content)) {
        content = content.replace(regex, `.${english}`);
        modified = true;
      }
    }

    if (modified) {
      await fs.writeFile(file, content);
      console.log(`✓ Updated: ${file}`);
    }
  }
}

migrateFiles();
```

**Usage:**
```bash
npx ts-node scripts/migrate-prisma-fields.ts
```

#### 5. OpenAPI/Swagger Documentation

Update API documentation to reflect changes:

```typescript
// Before
@ApiProperty({ name: 'personelId', description: 'Personel ID' })
personelId: string;

// After (v2)
@ApiProperty({ name: 'employeeId', description: 'Employee ID' })
employeeId: string;
```

Generate separate Swagger docs for v1 and v2:
- `/api/v1/docs` - Turkish field names (deprecated)
- `/api/v2/docs` - English field names (current)

#### 6. Database Migration (if needed)

**Important:** Current database columns are already in English (e.g., `prepared_by_id`). No database migration is needed. Only Prisma Client TypeScript types will change.

If database columns were Turkish, you would need:

```sql
-- Example (NOT NEEDED for this project)
ALTER TABLE warehouse_transfers
RENAME COLUMN hazirlayan TO prepared_by_id;
```

### Client Migration Guide

Provide documentation for API consumers:

```markdown
# Migration Guide: v1 → v2

## Breaking Changes

### 1. Route Changes

| Old (v1) | New (v2) |
|----------|----------|
| `/avans` | `/advance` |
| `/arac` | `/vehicle` |
| `/personel` | `/employee` |

### 2. Request Field Changes

#### Advance Module

| Old Field | New Field |
|-----------|-----------|
| `personelId` | `employeeId` |
| `tutar` | `amount` |
| `tarih` | `date` |

#### Example:

**Before (v1):**
```json
POST /v1/avans/create
{
  "personelId": "123",
  "tutar": 1000,
  "tarih": "2026-03-06"
}
```

**After (v2):**
```json
POST /v2/advance/create
{
  "employeeId": "123",
  "amount": 1000,
  "date": "2026-03-06"
}
```

### 3. Response Field Changes

Same mappings apply to responses.

## Migration Checklist

- [ ] Update API base URL from `/v1` to `/v2`
- [ ] Update all request payloads (see field mappings)
- [ ] Update response parsers (see field mappings)
- [ ] Update TypeScript/SDK types
- [ ] Test all API calls
- [ ] Deploy updated client

## Support

- **Migration Period:** 6 months (2026-03-06 to 2026-09-06)
- **v1 Sunset Date:** 2026-09-06
- **Questions:** Contact dev@otomuhasebe.com
```

---

## Testing Strategy

### 1. Unit Tests

Update all unit tests to use new names:

```typescript
// Before
describe('AvansService', () => {
  it('should mahsuplastir avans', async () => {
    const dto = { avansId: '1', tutar: 500 };
    // ...
  });
});

// After
describe('AdvanceService', () => {
  it('should settle advance', async () => {
    const dto = { advanceId: '1', amount: 500 };
    // ...
  });
});
```

### 2. Integration Tests

Test API endpoints with both v1 and v2:

```typescript
describe('Advance API', () => {
  describe('POST /v1/avans/create (deprecated)', () => {
    it('should accept Turkish field names', () => {
      return request(app.getHttpServer())
        .post('/v1/avans/create')
        .send({ personelId: '123', tutar: 1000 })
        .expect(201);
    });
  });

  describe('POST /v2/advance/create', () => {
    it('should accept English field names', () => {
      return request(app.getHttpServer())
        .post('/v2/advance/create')
        .send({ employeeId: '123', amount: 1000 })
        .expect(201);
    });
  });
});
```

### 3. E2E Tests

Full workflow tests covering:
- User authentication
- CRUD operations on all modules
- Complex workflows (e.g., order → invoice → payment)
- Edge cases

### 4. Performance Tests

Ensure refactoring doesn't impact performance:
- Response times
- Database query counts
- Memory usage

---

## Rollback Plan

In case of critical issues:

### 1. Git Revert

```bash
# Revert last commit
git revert HEAD

# Revert specific commit
git revert <commit-hash>

# Revert multiple commits
git revert HEAD~5..HEAD
```

### 2. Database Rollback

```bash
# Restore from backup
psql $DATABASE_URL < backup_20260306.sql
```

### 3. Prisma Rollback

```bash
# Reset Prisma schema
git checkout HEAD~1 -- prisma/schema.prisma
npx prisma generate
```

### 4. Deploy Previous Version

```bash
# Using Docker
docker pull otomuhasebe/api:previous-stable
docker-compose up -d

# Using PM2
pm2 deploy production revert 1
```

---

## Monitoring & Validation

### 1. API Usage Metrics

Track v1 vs v2 usage:

```typescript
@Injectable()
export class ApiMetricsInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const version = request.url.startsWith('/v1') ? 'v1' : 'v2';

    // Log to monitoring service (e.g., DataDog, New Relic)
    this.metricsService.increment(`api.requests.${version}`);

    return next.handle();
  }
}
```

### 2. Error Tracking

Monitor errors during migration:
- Field validation errors (missing/incorrect field names)
- Route not found errors
- Type errors

### 3. Deprecation Warnings

Add warnings to v1 responses:

```typescript
@Header('X-API-Warn', 'v1 is deprecated. Please migrate to v2 by 2026-09-06')
@Header('Sunset', 'Sun, 06 Sep 2026 00:00:00 GMT')
```

---

## Conclusion

This comprehensive report provides a complete roadmap for converting the Otomuhasebe API from Turkish to English naming conventions.

### Key Takeaways

1. **Scope:** 350+ Turkish identifiers across database, modules, routes, DTOs, and functions
2. **Priority:** Database schema (CRITICAL) → Modules (HIGH) → Routes (HIGH) → DTOs (MEDIUM) → Functions (MEDIUM) → Comments (LOW)
3. **Timeline:** 8 weeks for complete migration
4. **Strategy:** API versioning (v1/v2) to minimize breaking changes
5. **Risk:** Managed through gradual migration, testing, and rollback plans

### Next Steps

1. **Review & Approve:** Stakeholder review of this report
2. **Create Jira Tickets:** Break down into sprint-sized tasks
3. **Set Timeline:** Assign resources and deadlines
4. **Branch Strategy:** Create `refactor/english-i18n` branch
5. **Start Phase 1:** Begin with database schema changes

### Questions?

Contact the development team for clarification or implementation support.

---

**Report Generated:** 2026-03-06
**Author:** Claude Code Analysis
**Version:** 1.0
