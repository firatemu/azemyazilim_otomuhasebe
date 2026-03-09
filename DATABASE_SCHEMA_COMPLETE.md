# Otomuhasebe - Tam Veritabanı Schema Dokümantasyonu

**Tarih:** 8 Mart 2026  
**Database:** PostgreSQL  
**ORM:** Prisma  
**Proje:** Otomuhasebe SaaS Muhasebe Sistemi

---

## 📋 İçindekiler

1. [Enumlar](#enumlar)
2. [Model Tabloları](#model-tabloları)
3. [İlişki Haritası](#ilişki-haritası)
4. [İndeksler ve Constraintler](#indeksler-ve-constraintler)

---

## 🔖 Enumlar

### TenantStatus
```typescript
enum TenantStatus {
  TRIAL       // Deneme süresi
  ACTIVE      // Aktif abonelik
  SUSPENDED   // Geçici olarak askıya alındı
  CANCELLED   // Abonelik iptal edildi, veri saklandı
  PURGED      // Veri kalıcı olarak silindi
  EXPIRED     // Deneme/abonelik süresi doldu
  CHURNED    // Müşteri kaybı
  DELETED     // Silindi
  PENDING     // Beklemede
}
```

### SubscriptionStatus
```typescript
enum SubscriptionStatus {
  PENDING
  TRIAL
  ACTIVE
  PAST_DUE
  CANCELED
  EXPIRED
}
```

### BillingPeriod
```typescript
enum BillingPeriod {
  MONTHLY
  QUARTERLY
  YEARLY
  LIFETIME
}
```

### PaymentStatus
```typescript
enum PaymentStatus {
  PENDING
  PROCESSING
  SUCCESS
  FAILED
  REFUNDED
  CANCELED
}
```

### UserStatus
```typescript
enum UserStatus {
  ACTIVE
  INACTIVE
  SUSPENDED
  PENDING_VERIFICATION
}
```

### UserRole
```typescript
enum UserRole {
  SUPER_ADMIN        // Sistem yöneticisi
  TENANT_ADMIN       // Tenant yöneticisi
  ADMIN             // Yönetici
  USER              // Kullanıcı
  VIEWER            // Görüntüleyici
  SUPPORT           // Destek
  MANAGER           // Müdür
  TECHNICIAN        // Teknisyen
  WORKSHOP_MANAGER   // Atölye yöneticisi
  RECEPTION         // Resepsiyon
  SERVICE_MANAGER    // Servis yöneticisi
  PROCUREMENT       // Satın alma
  WAREHOUSE        // Depo
  ADVISOR          // Danışman
  PARTS_MANAGER    // Parça yöneticisi
}
```

### TenantType
```typescript
enum TenantType {
  INDIVIDUAL    // Bireysel
  CORPORATE      // Kurumsal
}
```

### PriceCardType
```typescript
enum PriceCardType {
  SALE       // Satış fiyatı
  PURCHASE   // Alış fiyatı
}
```

### MovementType
```typescript
enum MovementType {
  ENTRY               // Giriş
  EXIT                // Çıkış
  SALE                // Satış
  RETURN              // İade
  CANCELLATION_ENTRY   // İptal Girişi
  CANCELLATION_EXIT    // İptal Çıkışı
  COUNT               // Sayım
  COUNT_SURPLUS       // Sayım Fazlası
  COUNT_SHORTAGE      // Sayım Eksiği
}
```

### AccountType
```typescript
enum AccountType {
  CUSTOMER    // Müşteri
  SUPPLIER    // Tedarikçi
  BOTH        // Her ikisi
}
```

### CompanyType
```typescript
enum CompanyType {
  CORPORATE   // Kurumsal
  INDIVIDUAL  // Bireysel
}
```

### DebitCredit
```typescript
enum DebitCredit {
  DEBIT         // Borç
  CREDIT        // Alacak
  CARRY_FORWARD // Devret
}
```

### DocumentType
```typescript
enum DocumentType {
  INVOICE                // Fatura
  COLLECTION            // Tahsilat
  PAYMENT               // Ödeme
  CHECK_PROMISSORY      // Çek/Senet
  CARRY_FORWARD         // Devret
  CORRECTION           // Düzeltme
  CHECK_ENTRY           // Çek Girişi
  CHECK_EXIT            // Çek Çıkışı
  RETURN               // İade
}
```

### BankAccountType
```typescript
enum BankAccountType {
  DEMAND_DEPOSIT      // Vadesiz
  LOAN               // Kredi
  POS                // POS
  COMPANY_CREDIT_CARD // Firma Kredi Kartı
  TIME_DEPOSIT       // Vadeli
  INVESTMENT         // Yatırım
  GOLD               // Altın
  CURRENCY           // Döviz
  OTHER              // Diğer
}
```

### BankMovementType
```typescript
enum BankMovementType {
  INCOMING   // Giriş
  OUTGOING   // Çıkış
}
```

### BankMovementSubType
```typescript
enum BankMovementSubType {
  INCOMING_TRANSFER
  OUTGOING_TRANSFER
  LOAN_USAGE
  LOAN_PAYMENT
  GUARANTEE_CHECK
  GUARANTEE_PROMISSORY
  POS_COLLECTION
  CARD_EXPENSE
  CARD_PAYMENT
  TRANSFER
  OTHER
  LOAN_INSTALLMENT_PAYMENT
}
```

### LoanType
```typescript
enum LoanType {
  EQUAL_INSTALLMENT // Eşit taksit
  REVOLVING       // Devreden
}
```

### LoanStatus
```typescript
enum LoanStatus {
  ACTIVE    // Aktif
  CLOSED    // Kapalı
  CANCELLED // İptal
}
```

### CreditPlanStatus
```typescript
enum CreditPlanStatus {
  PENDING         // Beklemede
  PAID            // Ödendi
  OVERDUE         // Gecikmiş
  PARTIALLY_PAID  // Kısmen ödendi
}
```

### CashboxType
```typescript
enum CashboxType {
  CASH                 // Nakit
  POS                  // POS
  COMPANY_CREDIT_CARD   // Firma Kredi Kartı
  BANK                 // Banka
  CHECK_PROMISSORY      // Çek/Senet
}
```

### CashboxMovementType
```typescript
enum CashboxMovementType {
  COLLECTION                    // Tahsilat
  PAYMENT                      // Ödeme
  INCOMING_TRANSFER            // Giriş transferi
  OUTGOING_TRANSFER           // Çıkış transferi
  CREDIT_CARD                 // Kredi kartı
  TRANSFER                    // Transfer
  CARRY_FORWARD               // Devret
  CHECK_RECEIVED              // Alınan çek
  CHECK_GIVEN                // Verilen çek
  PROMISSORY_RECEIVED        // Alınan senet
  PROMISSORY_GIVEN          // Verilen senet
  CHECK_COLLECTION           // Çek tahsilatı
  PROMISSORY_COLLECTION    // Senet tahsilatı
}
```

### LogAction
```typescript
enum LogAction {
  CREATE                 // Oluşturma
  UPDATE                 // Güncelleme
  DELETE                 // Silme
  STATUS_CHANGE          // Durum değişimi
  CANCELLATION          // İptal
  RESTORE               // Geri yükleme
  CONVERTED_TO_ORDER    // Siparişe dönüştürüldü
  EINVOICE_SENT         // E-fatura gönderildi
  EINVOICE_SEND_ERROR  // E-fatura gönderme hatası
  SHIPMENT             // Sevkiyat
  ENDORSEMENT          // Devretme
}
```

### InvoiceType
```typescript
enum InvoiceType {
  PURCHASE         // Alış
  SALE             // Satış
  SALES_RETURN     // Satış iadesi
  PURCHASE_RETURN  // Alış iadesi
}
```

### InvoiceStatus
```typescript
enum InvoiceStatus {
  DRAFT           // Taslak
  OPEN            // Açık
  CLOSED          // Kapalı
  PARTIALLY_PAID  // Kısmen ödendi
  APPROVED        // Onaylandı
  CANCELLED       // İptal
}
```

### EInvoiceStatus
```typescript
enum EInvoiceStatus {
  PENDING   // Beklemede
  SENT      // Gönderildi
  ERROR     // Hata
  DRAFT     // Taslak
}
```

### CollectionType
```typescript
enum CollectionType {
  COLLECTION  // Tahsilat
  PAYMENT     // Ödeme
}
```

### PaymentMethod
```typescript
enum PaymentMethod {
  CASH              // Nakit
  CREDIT_CARD       // Kredi kartı
  BANK_TRANSFER    // Banka transferi
  CHECK             // Çek
  PROMISSORY_NOTE // Senet
  GIFT_CARD         // Hediye kartı
  LOAN_ACCOUNT    // Kredi hesabı
}
```

### OrderType
```typescript
enum OrderType {
  SALE       // Satış
  PURCHASE  // Alış
}
```

### SalesOrderStatus
```typescript
enum SalesOrderStatus {
  PENDING         // Beklemede
  PREPARING      // Hazırlanıyor
  PREPARED       // Hazırlandı
  SHIPPED        // Sevkedildi
  PARTIALLY_SHIPPED  // Kısmen sevkedildi
  INVOICED       // Faturalandı
  CANCELLED      // İptal
}
```

### QuoteType
```typescript
enum QuoteType {
  SALE       // Satış teklifi
  PURCHASE  // Alış teklifi
}
```

### QuoteStatus
```typescript
enum QuoteStatus {
  OFFERED             // Teklif sunuldu
  APPROVED            // Onaylandı
  REJECTED            // Reddedildi
  CONVERTED_TO_ORDER // Siparişe dönüştürüldü
}
```

### StocktakeType
```typescript
enum StocktakeType {
  PRODUCT_BASED  // Ürün bazlı
  SHELF_BASED   // Raf bazlı
}
```

### StocktakeStatus
```typescript
enum StocktakeStatus {
  DRAFT      // Taslak
  COMPLETED  // Tamamlandı
  APPROVED   // Onaylandı
  CANCELLED  // İptal
}
```

### StockMoveType
```typescript
enum StockMoveType {
  PUT_AWAY   // Yerleştirme
  TRANSFER   // Transfer
  PICKING    // Toplama
  ADJUSTMENT // Düzeltme
  SALE       // Satış
  RETURN     // İade
  DAMAGE     // Hasar
}
```

### TransferType
```typescript
enum TransferType {
  INCOMING   // Giriş
  OUTGOING   // Çıkış
}
```

### CheckBillType
```typescript
enum CheckBillType {
  CHECK        // Çek
  PROMISSORY  // Senet
}
```

### PortfolioType
```typescript
enum PortfolioType {
  CREDIT   // Alacak
  DEBIT    // Borç
}
```

### CheckBillStatus
```typescript
enum CheckBillStatus {
  IN_PORTFOLIO          // Portföyde
  UNPAID                // Ödenmedi
  GIVEN_TO_BANK         // Bankaya verildi
  COLLECTED             // Tahsil edildi
  PAID                  // Ödendi
  ENDORSED              // Devredildi
  RETURNED              // İade edildi
  WITHOUT_COVERAGE    // Teminatsız
  IN_BANK_COLLECTION  // Bankada tahsilatta
  IN_BANK_GUARANTEE // Bankada teminata verildi
}
```

### Gender
```typescript
enum Gender {
  MALE          // Erkek
  FEMALE        // Kadın
  NOT_SPECIFIED // Belirtilmemiş
}
```

### MaritalStatus
```typescript
enum MaritalStatus {
  SINGLE   // Bekar
  MARRIED // Evli
}
```

### EmployeePaymentType
```typescript
enum EmployeePaymentType {
  ENTITLEMENT    // Hakediş
  SALARY         // Maaş
  ADVANCE        // Avans
  BONUS          // Bonus
  DEDUCTION     // Kesinti
  ALLOCATION     // Paylaşım
  ALLOCATION_RETURN  // Paylaşım iadesi
}
```

### ModuleType
```typescript
enum ModuleType {
  WAREHOUSE               // Depo
  CASHBOX                // Kasa
  PERSONNEL              // Personel
  PRODUCT                // Ürün
  CUSTOMER               // Cari
  INVOICE_SALES         // Satış faturası
  INVOICE_PURCHASE      // Alış faturası
  ORDER_SALES           // Satış siparişi
  ORDER_PURCHASE        // Alış siparişi
  INVENTORY_COUNT       // Sayım
  QUOTE                  // Teklif
  DELIVERY_NOTE_SALES  // Satış irsaliyesi
  DELIVERY_NOTE_PURCHASE  // Alış irsaliyesi
  WAREHOUSE_TRANSFER   // Depo transferi
  TECHNICIAN            // Teknisyen
  WORK_ORDER            // İş emri
  SERVICE_INVOICE       // Servis faturası
}
```

### DeliveryNoteSourceType
```typescript
enum DeliveryNoteSourceType {
  ORDER                // Siparişten
  DIRECT               // Doğrudan
  INVOICE_AUTOMATIC // Fatura otomatik
}
```

### DeliveryNoteStatus
```typescript
enum DeliveryNoteStatus {
  NOT_INVOICED  // Faturalanmamış
  INVOICED       // Faturalandı
}
```

### OrderStatus
```typescript
enum OrderStatus {
  PENDING   // Beklemede
  PARTIAL   // Kısmi
  COMPLETED // Tamamlandı
  CANCELLED // İptal
}
```

### OrderItemStatus
```typescript
enum OrderItemStatus {
  PENDING   // Beklemede
  PARTIAL   // Kısmi
  COMPLETED // Tamamlandı
}
```

### SimpleOrderStatus
```typescript
enum SimpleOrderStatus {
  AWAITING_APPROVAL // Onay bekliyor
  APPROVED          // Onaylandı
  ORDER_PLACED     // Sipariş verildi
  INVOICED         // Faturalandı
  CANCELLED        // İptal
}
```

### PurchaseOrderLocalStatus
```typescript
enum PurchaseOrderLocalStatus {
  PENDING         // Beklemede
  PREPARING      // Hazırlanıyor
  PREPARED       // Hazırlandı
  SHIPPED        // Sevkedildi
  PARTIALLY_SHIPPED  // Kısmen sevkedildi
  ORDER_PLACED   // Sipariş verildi
  INVOICED       // Faturalandı
  CANCELLED      // İptal
}
```

### LicenseType
```typescript
enum LicenseType {
  BASE_PLAN  // Temel plan
  MODULE     // Modül
}
```

### InvitationStatus
```typescript
enum InvitationStatus {
  PENDING   // Beklemede
  ACCEPTED  // Kabul edildi
  EXPIRED   // Süresi doldu
  CANCELLED // İptal
}
```

### WorkOrderStatus
```typescript
enum WorkOrderStatus {
  WAITING_DIAGNOSIS       // Tanı beklemede (deprecated)
  PENDING_APPROVAL        // Onay bekliyor
  APPROVED_IN_PROGRESS   // Onaylandı, yapım aşamasında
  PART_WAITING            // Parça bekliyor
  PARTS_SUPPLIED         // Parçalar temin edildi
  VEHICLE_READY          // Araç hazır
  INVOICED_CLOSED        // Faturalandı, kapalı
  CLOSED_WITHOUT_INVOICE // Faturasız kapalı
  CANCELLED              // İptal
}
```

### PartWorkflowStatus
```typescript
enum PartWorkflowStatus {
  NOT_STARTED          // Başlamadı
  PARTS_SUPPLIED_DIRECT // Doğrudan parçalar temin edildi
  PARTS_PENDING        // Parçalar bekliyor
  PARTIALLY_SUPPLIED  // Kısmen temin edildi
  ALL_PARTS_SUPPLIED  // Tüm parçalar temin edildi
}
```

### VehicleWorkflowStatus
```typescript
enum VehicleWorkflowStatus {
  WAITING    // Bekliyor
  IN_PROGRESS // Yapım aşamasında
  READY      // Hazır
  DELIVERED  // Teslim edildi (muhasebe kapatır)
}
```

### PartRequestStatus
```typescript
enum PartRequestStatus {
  REQUESTED  // İstendi
  SUPPLIED   // Temin edildi
  USED       // Kullanıldı
  CANCELLED  // İptal
}
```

### WorkOrderItemType
```typescript
enum WorkOrderItemType {
  LABOR // İşçilik
  PART  // Parça
}
```

### InventoryTransactionType
```typescript
enum InventoryTransactionType {
  DEDUCTION  // Düşüm
  RETURN      // İade
}
```

### TransferStatus
```typescript
enum TransferStatus {
  PREPARING  // Hazırlanıyor
  IN_TRANSIT // Yolda
  COMPLETED  // Tamamlandı
  CANCELLED  // İptal
}
```

### SalaryStatus
```typescript
enum SalaryStatus {
  UNPAID         // Ödenmedi
  PARTIALLY_PAID // Kısmen ödendi
  FULLY_PAID     // Tamamen ödendi
  PENDING        // Beklemede
}
```

### AdvanceStatus
```typescript
enum AdvanceStatus {
  OPEN    // Açık
  PARTIAL // Kısmi
  CLOSED  // Kapalı
}
```

### VehicleServiceStatus
```typescript
enum VehicleServiceStatus {
  WAITING                      // Bekliyor
  CUSTOMER_APPROVAL_PENDING  // Müşteri onayı bekliyor
  IN_PROGRESS                  // Yapım aşamasında
  PART_WAITING                 // Parça bekliyor
  PARTS_SUPPLIED              // Parçalar temin edildi
  VEHICLE_READY               // Araç hazır
  COMPLETED                    // Tamamlandı
}
```

### PosSessionStatus
```typescript
enum PosSessionStatus {
  OPEN   // Açık
  CLOSED // Kapalı
}
```

### VehicleExpenseType
```typescript
enum VehicleExpenseType {
  FUEL              // Yakıt
  MAINTENANCE    // Bakım
  INSPECTION     // Muayene
  TRAFFIC_INSURANCE  // Trafik sigortası
  CASCO             // Kasko
  PENALTY           // Cezalar
  HGS_OGS           // HGS/OGS
  PARKING           // Park
  CAR_WASH          // Yıkama
  OTHER             // Diğer
}
```

### AddressType
```typescript
enum AddressType {
  DELIVERY  // Teslimat
  INVOICE   // Fatura
  CENTER    // Merkez
  BRANCH    // Şube
  WAREHOUSE // Depo
  OTHER     // Diğer
  SHIPMENT  // Sevkiyat
}
```

### RiskStatus
```typescript
enum RiskStatus {
  NORMAL       // Normal
  RISKY        // Riskli
  BLACK_LIST   // Kara liste
  IN_COLLECTION // Tahsilat
}
```

### JournalType
```typescript
enum JournalType {
  ENTRY_PAYROLL                // Giriş Bordro
  EXIT_PAYROLL                 // Çıkış Bordro
  CUSTOMER_DOCUMENT_ENTRY    // Müşteri belge girişi
  CUSTOMER_DOCUMENT_EXIT     // Müşteri belge çıkışı
  OWN_DOCUMENT_ENTRY          // Kendi belge girişi
  OWN_DOCUMENT_EXIT           // Kendi belge çıkışı
  BANK_COLLECTION_ENDORSEMENT   // Banka tahsilatı devri
  BANK_GUARANTEE_ENDORSEMENT  // Banka teminatı devri
  ACCOUNT_DOCUMENT_ENDORSEMENT   // Cari belge devri
  DEBIT_DOCUMENT_EXIT                // Borç belge çıkışı
  RETURN_PAYROLL                    // İade Bordro
}
```

---

## 📊 Model Tabloları

### 1. Tenant (Tenants)

**Açıklama:** SaaS sisteminde müşteri (tenant) tanımı

| Kolon | Tip | Nullable | Varsayılan | Unique | İlişki | Açıklama |
|-------|------|----------|------------|---------|-----------|
| id | String | ❌ | uuid() | ✅ PK | Birincil anahtar |
| uuid | String | ❌ | uuid() | ✅ | UUID |
| name | String | ❌ | - | ❌ | Tenant adı |
| subdomain | String? | ✅ | - | ✅ | Subdomain |
| domain | String? | ✅ | - | ✅ | Domain |
| status | TenantStatus | ✅ | TRIAL | ❌ | Durum |
| cancelledAt | DateTime? | ✅ | - | ❌ | İptal tarihi |
| purgedAt | DateTime? | ✅ | - | ❌ | Silme tarihi |
| createdAt | DateTime | ✅ | now() | ❌ | Oluşturma tarihi |
| updatedAt | DateTime | ✅ | - | ❌ | Güncelleme tarihi |
| tenantType | TenantType | ✅ | CORPORATE | ❌ | Tenant türü |

**İlişkiler:**
- `auditLogs` → AuditLog[] (1:N)
- `bankTransfers` → BankTransfer[] (1:N)
- `unitSets` → UnitSet[] (1:N)
- `simpleOrders` → SimpleOrder[] (1:N)
- `accounts` → Account[] (1:N)
- `checksBills` → CheckBill[] (1:N)
- `invoices` → Invoice[] (1:N)
- `priceLists` → PriceList[] (1:N)
- `invitations` → Invitation[] (1:N)
- `invoiceProfits` → InvoiceProfit[] (1:N)
- `cashboxes` → Cashbox[] (1:N)
- `expenses` → Expense[] (1:N)
- `employees` → Employee[] (1:N)
- `purchaseOrders` → PurchaseOrder[] (1:N)
- `purchaseDeliveryNotes` → PurchaseDeliveryNote[] (1:N)
- `procurementOrders` → ProcurementOrder[] (1:N)
- `salesDeliveryNotes` → SalesDeliveryNote[] (1:N)
- `stocktakes` → Stocktake[] (1:N)
- `salesOrders` → SalesOrder[] (1:N)
- `products` → Product[] (1:N)
- `subscription` → Subscription? (1:1)
- `systemParameters` → SystemParameter[] (1:N)
- `collections` → Collection[] (1:N)
- `quotes` → Quote[] (1:N)
- `settings` → TenantSettings? (1:1)
- `users` → User[] (1:N)
- `warehouseTransfers` → WarehouseTransfer[] (1:N)
- `warehouses` → Warehouse[] (1:N)
- `banks` → Bank[] (1:N)
- `checkBillJournals` → CheckBillJournal[] (1:N)
- `salesAgents` → SalesAgent[] (1:N)
- `salaryPlans` → SalaryPlan[] (1:N)
- `salaryPayments` → SalaryPayment[] (1:N)
- `salaryPaymentDetails` → SalaryPaymentDetail[] (1:N)
- `advances` → Advance[] (1:N)
- `advanceSettlements` → AdvanceSettlement[] (1:N)
- `accountMovements` → AccountMovement[] (1:N)
- `productMovements` → ProductMovement[] (1:N)
- `invoiceCollections` → InvoiceCollection[] (1:N)
- `roles` → Role[] (1:N)
- `tenantPurgeAudits` → TenantPurgeAudit[] (1:N)
- `codeTemplates` → CodeTemplate[] (1:N)
- `customerVehicles` → CustomerVehicle[] (1:N)
- `workOrders` → WorkOrder[] (1:N)
- `partRequests` → PartRequest[] (1:N)
- `inventoryTransactions` → InventoryTransaction[] (1:N)
- `checkBillJournalItems` → CheckBillJournalItem[] (1:N)
- `journalEntries` → JournalEntry[] (1:N)
- `serviceInvoices` → ServiceInvoice[] (1:N)
- `companyVehicles` → CompanyVehicle[] (1:N)
- `vehicleExpenses` → VehicleExpense[] (1:N)
- `posPayments` → PosPayment[] (1:N)
- `posSessions` → PosSession[] (1:N)

**İndeksler:**
- `@@index([subdomain])`
- `@@index([domain])`
- `@@index([status])`
- `@@index([createdAt])`

**Map:** `tenants`

---

### 2. TenantSettings (tenant_settings)

**Açıklama:** Tenant ayarları

| Kolon | Tip | Nullable | Varsayılan | Unique | İlişki | Açıklama |
|-------|------|----------|------------|---------|-----------|
| id | String | ❌ | cuid() | ✅ PK | Birincil anahtar |
| tenantId | String | ❌ | - | ✅ FK, Unique | Tenant ID |
| companyName | String? | ✅ | - | ❌ | Şirket adı |
| taxNumber | String? | ✅ | - | ❌ | Vergi numarası |
| address | String? | ✅ | - | ❌ | Adres |
| logoUrl | String? | ✅ | - | ❌ | Logo URL |
| features | Json? | ✅ | - | ❌ | Özellikler |
| limits | Json? | ✅ | - | ❌ | Sınırlar |
| timezone | String | ✅ | Europe/Istanbul | ❌ | Zaman dilimi |
| locale | String | ✅ | tr-TR | ❌ | Yerel |
| currency | String | ✅ | TRY | ❌ | Para birimi |
| createdAt | DateTime | ✅ | now() | ❌ | Oluşturma tarihi |
| updatedAt | DateTime | ✅ | - | ❌ | Güncelleme tarihi |
| city | String? | ✅ | - | ❌ | Şehir |
| companyType | String? | ✅ | COMPANY | ❌ | Şirket türü |
| country | String? | ✅ | - | ❌ | Ülke |
| district | String? | ✅ | - | ❌ | İlçe |
| email | String? | ✅ | - | ❌ | E-posta |
| firstName | String? | ✅ | - | ❌ | Ad |
| lastName | String? | ✅ | - | ❌ | Soyad |
| mersisNo | String? | ✅ | - | ❌ | MERSİS no |
| neighborhood | String? | ✅ | - | ❌ | Mahalle |
| phone | String? | ✅ | - | ❌ | Telefon |
| postalCode | String? | ✅ | - | ❌ | Posta kodu |
| taxOffice | String? | ✅ | - | ❌ | Vergi dairesi |
| tcNo | String? | ✅ | - | ❌ | TC kimlik no |
| website | String? | ✅ | - | ❌ | Web sitesi |

**İlişkiler:**
- `tenant` → Tenant (N:1)

**Map:** `tenant_settings`

---

### 3. Plan (plans)

**Açıklama:** Abonelik planları

| Kolon | Tip | Nullable | Varsayılan | Unique | İlişki | Açıklama |
|-------|------|----------|------------|---------|-----------|
| id | String | ❌ | cuid() | ✅ PK | Birincil anahtar |
| name | String | ❌ | - | ❌ | Plan adı |
| slug | String | ❌ | - | ✅ | Plan slug |
| description | String? | ✅ | - | ❌ | Açıklama |
| price | Decimal | ❌ | - | ❌ | Fiyat |
| currency | String | ✅ | TRY | ❌ | Para birimi |
| billingPeriod | BillingPeriod | ✅ | MONTHLY | ❌ | Fatura dönemi |
| trialDays | Int | ✅ | 0 | ❌ | Deneme günleri |
| baseUserLimit | Int | ✅ | 1 | ❌ | Temel kullanıcı limiti |
| features | Json? | ✅ | - | ❌ | Özellikler |
| limits | Json? | ✅ | - | ❌ | Sınırlar |
| isActive | Boolean | ✅ | true | ❌ | Aktif mi |
| isPopular | Boolean | ✅ | false | ❌ | Popüler mi |
| isBasePlan | Boolean | ✅ | true | ❌ | Temel plan mı |
| createdAt | DateTime | ✅ | now() | ❌ | Oluşturma tarihi |
| updatedAt | DateTime | ✅ | - | ❌ | Güncelleme tarihi |

**İlişkiler:**
- `subscriptions` → Subscription[] (1:N)

**İndeksler:**
- `@@index([slug])`
- `@@index([isActive])`
- `@@index([isBasePlan])`

**Map:** `plans`

---

### 4. Subscription (subscriptions)

**Açıklama:** Tenant abonelikleri

| Kolon | Tip | Nullable | Varsayılan | Unique | İlişki | Açıklama |
|-------|------|----------|------------|---------|-----------|
| id | String | ❌ | cuid() | ✅ PK | Birincil anahtar |
| tenantId | String | ❌ | - | ✅ FK, Unique | Tenant ID |
| planId | String | ❌ | - | ✅ FK | Plan ID |
| status | SubscriptionStatus | ✅ | TRIAL | ❌ | Durum |
| startDate | DateTime | ✅ | now() | ❌ | Başlangıç tarihi |
| endDate | DateTime | ❌ | - | ❌ | Bitiş tarihi |
| trialEndsAt | DateTime? | ✅ | - | ❌ | Deneme bitiş tarihi |
| canceledAt | DateTime? | ✅ | - | ❌ | İptal tarihi |
| nextBillingDate | DateTime? | ✅ | - | ❌ | Sonraki fatura tarihi |
| lastBillingDate | DateTime? | ✅ | - | ❌ | Son fatura tarihi |
| autoRenew | Boolean | ✅ | true | ❌ | Otomatik yenileme |
| iyzicoSubscriptionRef | String? | ✅ | - | ✅ | İyzico referansı |
| additionalUsers | Int | ✅ | 0 | ❌ | Ek kullanıcılar |
| createdAt | DateTime | ✅ | now() | ❌ | Oluşturma tarihi |
| updatedAt | DateTime | ✅ | - | ❌ | Güncelleme tarihi |

**İlişkiler:**
- `moduleLicenses` → ModuleLicense[] (1:N)
- `payments` → Payment[] (1:N)
- `plan` → Plan (N:1)
- `tenant` → Tenant (N:1)

**İndeksler:**
- `@@index([tenantId])`
- `@@index([planId])`
- `@@index([status])`
- `@@index([endDate])`
- `@@index([nextBillingDate])`

**Map:** `subscriptions`

---

### 5. Payment (payments)

**Açıklama:** Ödemeler

| Kolon | Tip | Nullable | Varsayılan | Unique | İlişki | Açıklama |
|-------|------|----------|------------|---------|-----------|
| id | String | ❌ | cuid() | ✅ PK | Birincil anahtar |
| subscriptionId | String | ❌ | - | ✅ FK | Abonelik ID |
| amount | Decimal | ❌ | - | ❌ | Tutar |
| currency | String | ✅ | TRY | ❌ | Para birimi |
| status | PaymentStatus | ✅ | PENDING | ❌ | Durum |
| iyzicoPaymentId | String? | ✅ | - | ✅ | İyzico ödeme ID |
| iyzicoToken | String? | ✅ | - | ✅ | İyzico token |
| conversationId | String? | ✅ | - | ✅ | Konuşma ID |
| invoiceNumber | String? | ✅ | - | ❌ | Fatura numarası |
| invoiceUrl | String? | ✅ | - | ❌ | Fatura URL |
| paidAt | DateTime? | ✅ | - | ❌ | Ödeme tarihi |
| failedAt | DateTime? | ✅ | - | ❌ | Başarısızlık tarihi |
| refundedAt | DateTime? | ✅ | - | ❌ | İade tarihi |
| errorCode | String? | ✅ | - | ❌ | Hata kodu |
| errorMessage | String? | ✅ | - | ❌ | Hata mesajı |
| paymentMethod | String? | ✅ | - | ❌ | Ödeme yöntemi |
| createdAt | DateTime | ✅ | now() | ❌ | Oluşturma tarihi |
| updatedAt | DateTime | ✅ | - | ❌ | Güncelleme tarihi |

**İlişkiler:**
- `subscription` → Subscription (N:1)

**İndeksler:**
- `@@index([subscriptionId])`
- `@@index([status])`
- `@@index([iyzicoPaymentId])`
- `@@index([conversationId])`
- `@@index([createdAt])`

**Map:** `payments`

---

### 6. AuditLog (audit_logs)

**Açıklama:** Denetim logları

| Kolon | Tip | Nullable | Varsayılan | Unique | İlişki | Açıklama |
|-------|------|----------|------------|---------|-----------|
| id | String | ❌ | cuid() | ✅ PK | Birincil anahtar |
| userId | String? | ✅ | - | ✅ FK | Kullanıcı ID |
| tenantId | String? | ✅ | - | ✅ FK | Tenant ID |
| action | String | ❌ | - | ❌ | İşlem |
| resource | String? | ✅ | - | ❌ | Kaynak |
| resourceId | String? | ✅ | - | ❌ | Kaynak ID |
| metadata | Json? | ✅ | - | ❌ | Meta veriler |
| ipAddress | String? | ✅ | - | ❌ | IP adresi |
| userAgent | String? | ✅ | - | ❌ | User agent |
| createdAt | DateTime | ✅ | now() | ❌ | Oluşturma tarihi |

**İlişkiler:**
- `tenant` → Tenant? (N:1)

**İndeksler:**
- `@@index([userId])`
- `@@index([tenantId])`
- `@@index([action])`
- `@@index([createdAt])`

**Map:** `audit_logs`

---

### 7. User (users)

**Açıklama:** Kullanıcılar

| Kolon | Tip | Nullable | Varsayılan | Unique | İlişki | Açıklama |
|-------|------|----------|------------|---------|-----------|
| id | String | ❌ | uuid() | ✅ PK | Birincil anahtar |
| uuid | String | ❌ | uuid() | ✅ | UUID |
| email | String | ❌ | - | ✅ | E-posta (tenant ile) |
| username | String | ❌ | - | ❌ | Kullanıcı adı |
| password | String | ❌ | - | ❌ | Şifre |
| firstName | String? | ✅ | - | ❌ | Ad |
| lastName | String? | ✅ | - | ❌ | Soyad |
| fullName | String | ❌ | - | ❌ | Tam ad |
| phone | String? | ✅ | - | ❌ | Telefon |
| avatarUrl | String? | ✅ | - | ❌ | Avatar URL |
| role | UserRole | ✅ | USER | ❌ | Rol |
| department | String? | ✅ | - | ❌ | Departman |
| status | UserStatus | ✅ | ACTIVE | ❌ | Durum |
| isActive | Boolean | ✅ | true | ❌ | Aktif mi |
| refreshToken | String? | ✅ | - | ❌ | Refresh token |
| tokenVersion | Int | ✅ | 0 | ❌ | Token sürümü |
| tenantId | String? | ✅ | - | ✅ FK | Tenant ID |
| emailVerified | Boolean | ✅ | false | ❌ | E-posta doğrulandı mı |
| lastLoginAt | DateTime? | ✅ | - | ❌ | Son giriş tarihi |
| createdAt | DateTime | ✅ | now() | ❌ | Oluşturma tarihi |
| updatedAt | DateTime | ✅ | - | ❌ | Güncelleme tarihi |
| roleId | String? | ✅ | - | ✅ FK | Rol ID |

**İlişkiler:**
- `bankTransferLogs` → BankTransferLog[] (1:N)
- `createdBankTransfers` → BankTransfer[] (1:N)
- `deletedBankTransfers` → BankTransfer[] (1:N)
- `updatedBankTransfers` → BankTransfer[] (1:N)
- `checkBillLogs` → CheckBillLog[] (1:N)
- `createdChecksBills` → CheckBill[] (1:N)
- `deletedChecksBills` → CheckBill[] (1:N)
- `updatedChecksBills` → CheckBill[] (1:N)
- `deletedBankTransferRecords` → DeletedBankTransfer[] (1:N)
- `deletedCheckBillRecords` → DeletedCheckBill[] (1:N)
- `invoiceLogs` → InvoiceLog[] (1:N)
- `createdInvoices` → Invoice[] (1:N)
- `deletedInvoices` → Invoice[] (1:N)
- `updatedInvoices` → Invoice[] (1:N)
- `createdCashboxMovements` → CashboxMovement[] (1:N)
- `createdCashboxes` → Cashbox[] (1:N)
- `updatedCashboxes` → Cashbox[] (1:N)
- `createdEmployeePayments` → EmployeePayment[] (1:N)
- `createdEmployees` → Employee[] (1:N)
- `updatedEmployees` → Employee[] (1:N)
- `createdPriceCards` → PriceCard[] (1:N)
- `updatedPriceCards` → PriceCard[] (1:N)
- `createdPurchaseDeliveryNotes` → PurchaseDeliveryNote[] (1:N)
- `deletedPurchaseDeliveryNotes` → PurchaseDeliveryNote[] (1:N)
- `updatedPurchaseDeliveryNotes` → PurchaseDeliveryNote[] (1:N)
- `purchaseDeliveryNoteLogs` → PurchaseDeliveryNoteLog[] (1:N)
- `purchaseOrderLocalLogs` → PurchaseOrderLocalLog[] (1:N)
- `createdProcurementOrders` → ProcurementOrder[] (1:N)
- `deletedProcurementOrders` → ProcurementOrder[] (1:N)
- `updatedProcurementOrders` → ProcurementOrder[] (1:N)
- `createdSalesDeliveryNotes` → SalesDeliveryNote[] (1:N)
- `deletedSalesDeliveryNotes` → SalesDeliveryNote[] (1:N)
- `updatedSalesDeliveryNotes` → SalesDeliveryNote[] (1:N)
- `salesDeliveryNoteLogs` → SalesDeliveryNoteLog[] (1:N)
- `createdStocktakes` → Stocktake[] (1:N)
- `approvedStocktakes` → Stocktake[] (1:N)
- `updatedStocktakes` → Stocktake[] (1:N)
- `sessions` → Session[] (1:N)
- `orderPickings` → OrderPicking[] (1:N)
- `salesOrderLogs` → SalesOrderLog[] (1:N)
- `createdSalesOrders` → SalesOrder[] (1:N)
- `deletedSalesOrders` → SalesOrder[] (1:N)
- `updatedSalesOrders` → SalesOrder[] (1:N)
- `stockMoves` → StockMove[] (1:N)
- `createdCollections` → Collection[] (1:N)
- `deletedCollections` → Collection[] (1:N)
- `quoteLogs` → QuoteLog[] (1:N)
- `createdQuotes` → Quote[] (1:N)
- `deletedQuotes` → Quote[] (1:N)
- `updatedQuotes` → Quote[] (1:N)
- `licenses` → UserLicense[] (1:N)
- `tenant` → Tenant? (N:1)
- `warehouseTransferLogs` → WarehouseTransferLog[] (1:N)
- `createdWarehouseTransfers` → WarehouseTransfer[] (1:N)
- `deletedWarehouseTransfers` → WarehouseTransfer[] (1:N)
- `createdJournals` → JournalEntry[] (1:N)
- `preparedWarehouseTransfers` → WarehouseTransfer[] (1:N)
- `approvedWarehouseTransfers` → WarehouseTransfer[] (1:N)
- `receivedWarehouseTransfers` → WarehouseTransfer[] (1:N)
- `updatedWarehouseTransfers` → WarehouseTransfer[] (1:N)
- `checkBillJournalLogs` → CheckBillJournal[] (1:N)
- `createdSalaryPayments` → SalaryPayment[] (1:N)
- `createdAdvances` → Advance[] (1:N)
- `workOrdersAsTechnician` → WorkOrder[] (1:N)
- `workOrderActivities` → WorkOrderActivity[] (1:N)
- `partRequestsRequested` → PartRequest[] (1:N)
- `createdServiceInvoices` → ServiceInvoice[] (1:N)
- `roleRelation` → Role? (N:1)

**İndeksler:**
- `@@unique([email, tenantId])`
- `@@index([tenantId])`
- `@@index([email])`
- `@@index([username])`
- `@@index([status])`
- `@@index([role])`

**Map:** `users`

---

### 8. Session (sessions)

**Açıklama:** Kullanıcı oturumları

| Kolon | Tip | Nullable | Varsayılan | Unique | İlişki | Açıklama |
|-------|------|----------|------------|---------|-----------|
| id | String | ❌ | cuid() | ✅ PK | Birincil anahtar |
| userId | String | ❌ | - | ✅ FK | Kullanıcı ID |
| token | String | ❌ | - | ✅ | Token |
| refreshToken | String? | ✅ | - | ✅ | Refresh token |
| ipAddress | String? | ✅ | - | ❌ | IP adresi |
| userAgent | String? | ✅ | - | ❌ | User agent |
| expiresAt | DateTime | ❌ | - | ❌ | Son kullanma tarihi |
| createdAt | DateTime | ✅ | now() | ❌ | Oluşturma tarihi |
| updatedAt | DateTime | ✅ | - | ❌ | Güncelleme tarihi |

**İlişkiler:**
- `user` → User (N:1)

**İndeksler:**
- `@@index([userId])`
- `@@index([token])`
- `@@index([refreshToken])`
- `@@index([expiresAt])`

**Map:** `sessions`

---

### 9. Product (products)

**Açıklama:** Ürünler

| Kolon | Tip | Nullable | Varsayılan | Unique | İlişki | Açıklama |
|-------|------|----------|------------|---------|-----------|
| id | String | ❌ | uuid() | ✅ PK | Birincil anahtar |
| code | String | ❌ | - | ✅ | Stok kodu (tenant ile) |
| tenantId | String? | ✅ | - | ✅ FK | Tenant ID ⚠️ NULLABLE! |
| name | String | ❌ | - | ❌ | Stok adı |
| description | String? | ✅ | - | ❌ | Açıklama |
| unit | String | ❌ | - | ❌ | Ölçü birimi |
| purchasePrice | Decimal | ❌ | - | ❌ | Alış fiyatı |
| salePrice | Decimal | ❌ | - | ❌ | Satış fiyatı |
| vatRate | Int | ✅ | 20 | ❌ | KDV oranı |
| criticalQty | Int | ✅ | 0 | ❌ | Kritik miktar |
| category | String? | ✅ | - | ❌ | Kategori ⚠️ FLAT! |
| mainCategory | String? | ✅ | - | ❌ | Ana kategori ⚠️ FLAT! |
| subCategory | String? | ✅ | - | ❌ | Alt kategori ⚠️ FLAT! |
| brand | String? | ✅ | - | ❌ | Marka ⚠️ FLAT! |
| model | String? | ✅ | - | ❌ | Model ⚠️ FLAT! |
| oem | String? | ✅ | - | ❌ | OEM kodu |
| size | String? | ✅ | - | ❌ | Boyut |
| shelf | String? | ✅ | - | ❌ | Raf |
| barcode | String? | ✅ | - | ✅ | Barkod (tenant ile) |
| supplierCode | String? | ✅ | - | ❌ | Tedarikçi kodu |
| equivalencyGroupId | String? | ✅ | - | ✅ FK | Eşdeğerlik grubu ID |
| vehicleBrand | String? | ✅ | - | ❌ | Araç markası ⚠️ FLAT! |
| vehicleModel | String? | ✅ | - | ❌ | Araç modeli ⚠️ FLAT! |
| vehicleEngineSize | String? | ✅ | - | ❌ | Araç motor hacmi ⚠️ FLAT! |
| vehicleFuelType | String? | ✅ | - | ❌ | Araç yakıt türü ⚠️ FLAT! |
| isCategoryOnly | Boolean? | ✅ | false | ❌ | Sadece kategori mi |
| isBrandOnly | Boolean? | ✅ | false | ❌ | Sadece marka mı |
| weight | Decimal? | ✅ | - | ❌ | Ağırlık |
| weightUnit | String? | ✅ | - | ❌ | Ağırlık birimi |
| dimensions | String? | ✅ | - | ❌ | Boyutlar |
| countryOfOrigin | String? | ✅ | - | ❌ | Menşe ülke |
| warrantyMonths | Int? | ✅ | - | ❌ | Garanti süresi (ay) |
| internalNote | String? | ✅ | - | ❌ | İç not |
| minOrderQty | Int? | ✅ | - | ❌ | Min. sipariş miktarı |
| leadTimeDays | Int? | ✅ | - | ❌ | Teslim süresi (gün) |
| createdAt | DateTime | ✅ | now() | ❌ | Oluşturma tarihi |
| updatedAt | DateTime | ✅ | - | ❌ | Güncelleme tarihi |
| unitId | String? | ✅ | - | ✅ FK | Birim ID |

**İlişkiler:**
- `simpleOrders` → SimpleOrder[] (1:N)
- `invoiceItems` → InvoiceItem[] (1:N)
- `invoiceProfits` → InvoiceProfit[] (1:N)
- `priceCards` → PriceCard[] (1:N)
- `productBarcodes` → ProductBarcode[] (1:N)
- `productLocationStocks` → ProductLocationStock[] (1:N)
- `purchaseOrderItems` → PurchaseOrderItem[] (1:N)
- `purchaseDeliveryNoteItems` → PurchaseDeliveryNoteItem[] (1:N)
- `procurementOrderItems` → ProcurementOrderItem[] (1:N)
- `productCostHistories` → ProductCostHistory[] (1:N)
- `priceListItems` → PriceListItem[] (1:N)
- `salesDeliveryNoteItems` → SalesDeliveryNoteItem[] (1:N)
- `stocktakeItems` → StocktakeItem[] (1:N)
- `salesOrderItems` → SalesOrderItem[] (1:N)
- `stockMoves` → StockMove[] (1:N)
- `equivalents` → ProductEquivalent[] (1:N)
- `equivalents2` → ProductEquivalent[] (1:N)
- `productMovements` → ProductMovement[] (1:N)
- `equivalencyGroup` → EquivalencyGroup? (N:1)
- `tenant` → Tenant? (N:1)
- `quoteItems` → QuoteItem[] (1:N)
- `shelves` → ProductShelf[] (1:N)
- `warehouseCriticalStocks` → WarehouseCriticalStock[] (1:N)
- `warehouseTransferItems` → WarehouseTransferItem[] (1:N)
- `workOrderItems` → WorkOrderItem[] (1:N)
- `partRequests` → PartRequest[] (1:N)
- `inventoryTransactions` → InventoryTransaction[] (1:N)
- `unitRef` → Unit? (N:1)

**İndeksler:**
- `@@unique([code, tenantId])`
- `@@unique([barcode, tenantId])`
- `@@index([tenantId])`
- `@@index([tenantId, code])`
- `@@index([tenantId, barcode])`

**Map:** `products`

---

### 10. PriceCard (price_cards)

**Açıklama:** Ürün fiyat kartları

| Kolon | Tip | Nullable | Varsayılan | Unique | İlişki | Açıklama |
|-------|------|----------|------------|---------|-----------|
| id | String | ❌ | uuid() | ✅ PK | Birincil anahtar |
| productId | String | ❌ | - | ✅ FK | Ürün ID |
| type | PriceCardType | ❌ | - | ❌ | Fiyat tipi |
| price | Decimal | ❌ | - | ❌ | Fiyat |
| currency | String | ✅ | TRY | ❌ | Para birimi |
| effectiveFrom | DateTime? | ✅ | - | ❌ | Geçerlilik başlangıcı |
| effectiveTo | DateTime? | ✅ | - | ❌ | Geçerlilik bitişi |
| note | String? | ✅ | - | ❌ | Not |
| createdBy | String? | ✅ | - | ✅ FK | Oluşturan |
| updatedBy | String? | ✅ | - | ✅ FK | Güncelleyen |
| createdAt | DateTime | ✅ | now() | ❌ | Oluşturma tarihi |
| updatedAt | DateTime | ✅ | - | ❌ | Güncelleme tarihi |

**İlişkiler:**
- `createdByUser` → User? (N:1)
- `product` → Product (N:1)
- `updatedByUser` → User? (N:1)

**İndeksler:**
- `@@index([productId, type, createdAt])`

**Map:** `price_cards`

---

### 11. ProductCostHistory (stock_cost_history)

**Açıklama:** Ürün maliyet geçmişi

| Kolon | Tip | Nullable | Varsayılan | Unique | İlişki | Açıklama |
|-------|------|----------|------------|---------|-----------|
| id | String | ❌ | uuid() | ✅ PK | Birincil anahtar |
| productId | String | ❌ | - | ✅ FK | Ürün ID |
| cost | Decimal | ❌ | - | ❌ | Maliyet |
| method | String | ✅ | WEIGHTED_AVERAGE | ❌ | Hesaplama yöntemi |
| computedAt | DateTime | ✅ | now() | ❌ | Hesaplama tarihi |
| brand | String? | ✅ | - | ❌ | Marka |
| mainCategory | String? | ✅ | - | ❌ | Ana kategori |
| subCategory | String? | ✅ | - | ❌ | Alt kategori |
| note | String? | ✅ | - | ❌ | Not |

**İlişkiler:**
- `product` → Product (N:1)

**İndeksler:**
- `@@index([productId, computedAt])`

**Map:** `stock_cost_history`

---

### 12. EquivalencyGroup (equivalency_groups)

**Açıklama:** Ürün eşdeğerlik grupları

| Kolon | Tip | Nullable | Varsayılan | Unique | İlişki | Açıklama |
|-------|------|----------|------------|---------|-----------|
| id | String | ❌ | uuid() | ✅ PK | Birincil anahtar |
| name | String? | ✅ | - | ❌ | Grup adı |
| description | String? | ✅ | - | ❌ | Açıklama |
| createdAt | DateTime | ✅ | now() | ❌ | Oluşturma tarihi |
| updatedAt | DateTime | ✅ | - | ❌ | Güncelleme tarihi |

**İlişkiler:**
- `products` → Product[] (1:N)

**Map:** `equivalency_groups`

---

### 13. ProductEquivalent (product_equivalents)

**Açıklama:** Ürün eşdeğerlikleri

| Kolon | Tip | Nullable | Varsayılan | Unique | İlişki | Açıklama |
|-------|------|----------|------------|---------|-----------|
| id | String | ❌ | uuid() | ✅ PK | Birincil anahtar |
| product1Id | String | ❌ | - | ✅ FK | Ürün 1 ID |
| product2Id | String | ❌ | - | ✅ FK | Ürün 2 ID |
| createdAt | DateTime | ✅ | now() | ❌ | Oluşturma tarihi |

**İlişkiler:**
- `product1` → Product (N:1)
- `product2` → Product (N:1)

**İndeksler:**
- `@@unique([product1Id, product2Id])`

**Map:** `product_equivalents`

---

### 14. ProductMovement (product_movements)

**Açıklama:** Ürün hareketleri

| Kolon | Tip | Nullable | Varsayılan | Unique | İlişki | Açıklama |
|-------|------|----------|------------|---------|-----------|
| id | String | ❌ | uuid() | ✅ PK | Birincil anahtar |
| productId | String | ❌ | - | ✅ FK | Ürün ID |
| movementType | MovementType | ❌ | - | ❌ | Hareket tipi |
| quantity | Int | ❌ | - | ❌ | Miktar |
| unitPrice | Decimal | ❌ | - | ❌ | Birim fiyat |
| notes | String? | ✅ | - | ❌ | Notlar |
| createdAt | DateTime | ✅ | now() | ❌ | Oluşturma tarihi |
| warehouseId | String? | ✅ | - | ✅ FK | Depo ID |
| invoiceItemId | String? | ✅ | - | ✅ FK | Fatura kalemi ID |
| tenantId | String? | ✅ | - | ✅ FK | Tenant ID |

**İlişkiler:**
- `product` → Product (N:1)
- `warehouse` → Warehouse? (N:1)
- `invoiceItem` → InvoiceItem? (N:1)
- `tenant` → Tenant? (N:1)

**İndeksler:**
- `@@index([tenantId])`
- `@@index([invoiceItemId])`

**Map:** `product_movements`

---

### 15. Account (accounts)

**Açıklama:** Cari hesaplar

| Kolon | Tip | Nullable | Varsayılan | Unique | İlişki | Açıklama |
|-------|------|----------|------------|---------|-----------|
| id | String | ❌ | uuid() | ✅ PK | Birincil anahtar |
| code | String | ❌ | - | ✅ | Cari kodu (tenant ile) |
| tenantId | String? | ✅ | - | ✅ FK | Tenant ID ⚠️ NULLABLE! |
| title | String | ❌ | - | ❌ | Cari unvanı |
| type | AccountType | ✅ | CORPORATE | ❌ | Cari tipi |
| companyType | CompanyType? | ✅ | CORPORATE | ❌ | Şirket tipi |
| taxNumber | String? | ✅ | - | ❌ | Vergi numarası |
| taxOffice | String? | ✅ | - | ❌ | Vergi dairesi |
| nationalId | String? | ✅ | - | ❌ | TCKN |
| fullName | String? | ✅ | - | ❌ | Tam ad |
| phone | String? | ✅ | - | ❌ | Telefon |
| email | String? | ✅ | - | ❌ | E-posta |
| country | String? | ✅ | Turkey | ❌ | Ülke |
| city | String? | ✅ | - | ❌ | Şehir |
| district | String? | ✅ | - | ❌ | İlçe |
| address | String? | ✅ | - | ❌ | Adres |
| contactName | String? | ✅ | - | ❌ | İletişim kişisi |
| balance | Decimal | ✅ | 0 | ❌ | Bakiye |
| paymentTermDays | Int? | ✅ | - | ❌ | Ödeme vade günü |
| isActive | Boolean | ✅ | true | ❌ | Aktif mi |
| createdAt | DateTime | ✅ | now() | ❌ | Oluşturma tarihi |
| updatedAt | DateTime | ✅ | - | ❌ | Güncelleme tarihi |
| creditLimit | Decimal? | ✅ | - | ❌ | Kredi limiti |
| creditStatus | RiskStatus? | ✅ | NORMAL | ❌ | Kredi durumu |
| collateralAmount | Decimal? | ✅ | - | ❌ | Teminat miktarı |
| sector | String? | ✅ | - | ❌ | Sektör |
| customCode1 | String? | ✅ | - | ❌ | Özel kod 1 |
| customCode2 | String? | ✅ | - | ❌ | Özel kod 2 |
| website | String? | ✅ | - | ❌ | Web sitesi |
| fax | String? | ✅ | - | ❌ | Faks |
| dueDays | Int? | ✅ | - | ❌ | Vade günleri |
| currency | String? | ✅ | - | ❌ | Para birimi |
| bankInfo | String? | ✅ | - | ❌ | Banka bilgisi |
| priceListId | String? | ✅ | - | ✅ FK | Fiyat listesi ID |
| salesAgentId | String? | ✅ | - | ✅ FK | Satış temsilcisi ID |

**İlişkiler:**
- `bankTransfers` → BankTransfer[] (1:N)
- `bankAccountMovements` → BankAccountMovement[] (1:N)
- `checkBillJournals` → CheckBillJournal[] (1:N)
- `simpleOrders` → SimpleOrder[] (1:N)
- `accountMovements` → AccountMovement[] (1:N)
- `tenant` → Tenant? (N:1)
- `checksBills` → CheckBill[] (1:N)
- `invoices` → Invoice[] (1:N)
- `companyCreditCardMovements` → CompanyCreditCardMovement[] (1:N)
- `cashboxMovements` → CashboxMovement[] (1:N)
- `purchaseOrders` → PurchaseOrder[] (1:N)
- `purchaseDeliveryNotes` → PurchaseDeliveryNote[] (1:N)
- `procurementOrders` → ProcurementOrder[] (1:N)
- `salesDeliveryNotes` → SalesDeliveryNote[] (1:N)
- `salesOrders` → SalesOrder[] (1:N)
- `collections` → Collection[] (1:N)
- `quotes` → Quote[] (1:N)
- `contacts` → AccountContact[] (1:N)
- `addresses` → AccountAddress[] (1:N)
- `banks` → AccountBank[] (1:N)
- `customerVehicles` → CustomerVehicle[] (1:N)
- `workOrders` → WorkOrder[] (1:N)
- `serviceInvoices` → ServiceInvoice[] (1:N)
- `salesAgent` → SalesAgent? (N:1)
- `priceList` → PriceList? (N:1)

**İndeksler:**
- `@@unique([code, tenantId])`
- `@@index([tenantId])`
- `@@index([tenantId, code])`

**Map:** `accounts`

---

### 16. AccountContact (account_contacts)

**Açıklama:** Cari iletişim bilgileri

| Kolon | Tip | Nullable | Varsayılan | Unique | İlişki | Açıklama |
|-------|------|----------|------------|---------|-----------|
| id | String | ❌ | uuid() | ✅ PK | Birincil anahtar |
| accountId | String | ❌ | - | ✅ FK | Cari hesap ID |
| fullName | String | ❌ | - | ❌ | Tam ad |
| title | String? | ✅ | - | ❌ | Unvan |
| phone | String? | ✅ | - | ❌ | Telefon |
| email | String? | ✅ | - | ❌ | E-posta |
| extension | String? | ✅ | - | ❌ | Dahili |
| isDefault | Boolean | ✅ | false | ❌ | Varsayılan mı |
| notes | String? | ✅ | - | ❌ | Notlar |
| createdAt | DateTime | ✅ | now() | ❌ | Oluşturma tarihi |
| updatedAt | DateTime | ✅ | - | ❌ | Güncelleme tarihi |

**İlişkiler:**
- `account` → Account (N:1)

**İndeksler:**
- `@@index([accountId])`

**Map:** `account_contacts`

---

### 17. AccountAddress (account_addresses)

**Açıklama:** Cari adresleri

| Kolon | Tip | Nullable | Varsayılan | Unique | İlişki | Açıklama |
|-------|------|----------|------------|---------|-----------|
| id | String | ❌ | uuid() | ✅ PK | Birincil anahtar |
| accountId | String | ❌ | - | ✅ FK | Cari hesap ID |
| title | String | ❌ | - | ❌ | Başlık |
| type | AddressType | ❌ | - | ❌ | Adres tipi |
| address | String | ❌ | - | ❌ | Adres |
| city | String? | ✅ | - | ❌ | Şehir |
| district | String? | ✅ | - | ❌ | İlçe |
| postalCode | String? | ✅ | - | ❌ | Posta kodu |
| isDefault | Boolean | ✅ | false | ❌ | Varsayılan mı |
| createdAt | DateTime | ✅ | now() | ❌ | Oluşturma tarihi |
| updatedAt | DateTime | ✅ | - | ❌ | Güncelleme tarihi |

**İlişkiler:**
- `account` → Account (N:1)

**İndeksler:**
- `@@index([accountId])`

**Map:** `account_addresses`

---

### 18. AccountBank (account_banks)

**Açıklama:** Cari banka bilgileri

| Kolon | Tip | Nullable | Varsayılan | Unique | İlişki | Açıklama |
|-------|------|----------|------------|---------|-----------|
| id | String | ❌ | uuid() | ✅ PK | Birincil anahtar |
| accountId | String | ❌ | - | ✅ FK | Cari hesap ID |
| bankName | String | ❌ | - | ❌ | Banka adı |
| branchName | String? | ✅ | - | ❌ | Şube adı |
| branchCode | String? | ✅ | - | ❌ | Şube kodu |
| accountNo | String? | ✅ | - | ❌ | Hesap no |
| iban | String | ❌ | - | ❌ | IBAN |
| currency | String? | ✅ | - | ❌ | Para birimi |
| notes | String? | ✅ | - | ❌ | Notlar |
| createdAt | DateTime | ✅ | now() | ❌ | Oluşturma tarihi |
| updatedAt | DateTime | ✅ | - | ❌ | Güncelleme tarihi |

**İlişkiler:**
- `account` → Account (N:1)

**İndeksler:**
- `@@index([accountId])`

**Map:** `account_banks`

---

### 19. AccountMovement (account_movements)

**Açıklama:** Cari hareketleri

| Kolon | Tip | Nullable | Varsayılan | Unique | İlişki | Açıklama |
|-------|------|----------|------------|---------|-----------|
| id | String | ❌ | uuid() | ✅ PK | Birincil anahtar |
| accountId | String | ❌ | - | ✅ FK | Cari hesap ID |
| type | DebitCredit | ❌ | - | ❌ | Tip (borç/alacak) |
| amount | Decimal | ❌ | - | ❌ | Tutar |
| balance | Decimal | ❌ | - | ❌ | Bakiye |
| documentType | DocumentType? | ✅ | - | ❌ | Belge tipi |
| documentNo | String? | ✅ | - | ❌ | Belge no |
| date | DateTime | ✅ | now() | ❌ | Tarih |
| notes | String | ❌ | - | ❌ | Notlar |
| createdAt | DateTime | ✅ | now() | ❌ | Oluşturma tarihi |
| updatedAt | DateTime | ✅ | - | ❌ | Güncelleme tarihi |
| tenantId | String? | ✅ | - | ✅ FK | Tenant ID |

**İlişkiler:**
- `account` → Account (N:1)
- `tenant` → Tenant? (N:1)

**İndeksler:**
- `@@index([tenantId])`
- `@@index([accountId, date])`

**Map:** `account_movements`

---

### 20. Cashbox (cashboxes)

**Açıklama:** Kasalar

| Kolon | Tip | Nullable | Varsayılan | Unique | İlişki | Açıklama |
|-------|------|----------|------------|---------|-----------|
| id | String | ❌ | uuid() | ✅ PK | Birincil anahtar |
| code | String | ❌ | - | ✅ | Kasa kodu (tenant ile) |
| tenantId | String? | ✅ | - | ✅ FK | Tenant ID |
| name | String | ❌ | - | ❌ | Kasa adı |
| type | CashboxType | ❌ | - | ❌ | Kasa tipi |
| balance | Decimal | ✅ | 0 | ❌ | Bakiye |
| isActive | Boolean | ✅ | true | ❌ | Aktif mi |
| createdBy | String? | ✅ | - | ✅ FK | Oluşturan |
| updatedBy | String? | ✅ | - | ✅ FK | Güncelleyen |
| createdAt | DateTime | ✅ | now() | ❌ | Oluşturma tarihi |
| updatedAt | DateTime | ✅ | - | ❌ | Güncelleme tarihi |

**İlişkiler:**
- `bankTransfers` → BankTransfer[] (1:N)
- `checkBillCollections` → CheckBill[] (1:N)
- `corporateCards` → CompanyCreditCard[] (1:N)
- `movements` → CashboxMovement[] (1:N)
- `createdByUser` → User? (N:1)
- `tenant` → Tenant? (N:1)
- `updatedByUser` → User? (N:1)
- `employeePayments` → EmployeePayment[] (1:N)
- `collections` → Collection[] (1:N)
- `advances` → Advance[] (1:N)
- `salaryPaymentDetails` → SalaryPaymentDetail[] (1:N)

**İndeksler:**
- `@@unique([code, tenantId])`
- `@@index([tenantId])`
- `@@index([tenantId, code])`
- `@@index([type])`
- `@@index([isActive])`

**Map:** `cashboxes`

---

### 21. Bank (banks)

**Açıklama:** Bankalar

| Kolon | Tip | Nullable | Varsayılan | Unique | İlişki | Açıklama |
|-------|------|----------|------------|---------|-----------|
| id | String | ❌ | uuid() | ✅ PK | Birincil anahtar |
| tenantId | String? | ✅ | - | ✅ FK | Tenant ID |
| name | String | ❌ | - | ❌ | Banka adı |
| branch | String? | ✅ | - | ❌ | Şube |
| city | String? | ✅ | - | ❌ | Şehir |
| contactName | String? | ✅ | - | ❌ | İletişim kişisi |
| phone | String? | ✅ | - | ❌ | Telefon |
| logo | String? | ✅ | - | ❌ | Logo |
| isActive | Boolean | ✅ | true | ❌ | Aktif mi |
| createdAt | DateTime | ✅ | now() | ❌ | Oluşturma tarihi |
| updatedAt | DateTime | ✅ | - | ❌ | Güncelleme tarihi |

**İlişkiler:**
- `accounts` → BankAccount[] (1:N)
- `tenant` → Tenant? (N:1)

**İndeksler:**
- `@@index([tenantId])`

**Map:** `banks`

---

### 22. BankAccount (bank_accounts)

**Açıklama:** Banka hesapları

| Kolon | Tip | Nullable | Varsayılan | Unique | İlişki | Açıklama |
|-------|------|----------|------------|---------|-----------|
| id | String | ❌ | uuid() | ✅ PK | Birincil anahtar |
| bankId | String | ❌ | - | ✅ FK | Banka ID |
| code | String | ❌ | - | ✅ | Hesap kodu |
| name | String? | ✅ | - | ❌ | Hesap adı |
| accountNo | String? | ✅ | - | ❌ | Hesap no |
| iban | String? | ✅ | - | ❌ | IBAN |
| type | BankAccountType | ❌ | - | ❌ | Hesap tipi |
| balance | Decimal | ✅ | 0 | ❌ | Bakiye |
| isActive | Boolean | ✅ | true | ❌ | Aktif mi |
| commissionRate | Decimal? | ✅ | - | ❌ | Komisyon oranı |
| creditLimit | Decimal? | ✅ | - | ❌ | Kredi limiti |
| usedCreditLimit | Decimal? | ✅ | - | ❌ | Kullanılan kredi |
| cardLimit | Decimal? | ✅ | - | ❌ | Kart limiti |
| statementDay | Int? | ✅ | - | ❌ | Ekstre günü |
| paymentDueDay | Int? | ✅ | - | ❌ | Ödeme günü |
| terminalNo | String? | ✅ | - | ❌ | Terminal no |
| createdAt | DateTime | ✅ | now() | ❌ | Oluşturma tarihi |
| updatedAt | DateTime | ✅ | - | ❌ | Güncelleme tarihi |

**İlişkiler:**
- `movements` → BankAccountMovement[] (1:N)
- `bank` → Bank (N:1)
- `collections` → Collection[] (1:N)
- `salaryPaymentDetails` → SalaryPaymentDetail[] (1:N)
- `loans` → BankLoan[] (1:N)
- `bankTransfers` → BankTransfer[] (1:N)
- `checkBillJournals` → CheckBillJournal[] (1:N)

**İndeksler:**
- `@@index([bankId])`
- `@@index([type])`

**Map:** `bank_accounts`

---

### 23. BankAccountMovement (bank_account_movements)

**Açıklama:** Banka hesap hareketleri

| Kolon | Tip | Nullable | Varsayılan | Unique | İlişki | Açıklama |
|-------|------|----------|------------|---------|-----------|
| id | String | ❌ | uuid() | ✅ PK | Birincil anahtar |
| bankAccountId | String | ❌ | - | ✅ FK | Banka hesap ID |
| movementType | BankMovementType | ❌ | - | ❌ | Hareket tipi |
| movementSubType | BankMovementSubType? | ✅ | - | ❌ | Alt tip |
| amount | Decimal | ❌ | - | ❌ | Tutar |
| commissionRate | Decimal? | ✅ | - | ❌ | Komisyon oranı |
| commissionAmount | Decimal? | ✅ | - | ❌ | Komisyon tutarı |
| netAmount | Decimal? | ✅ | - | ❌ | Net tutar |
| balance | Decimal | ❌ | - | ❌ | Bakiye |
| notes | String? | ✅ | - | ❌ | Notlar |
| referenceNo | String? | ✅ | - | ❌ | Referans no |
| accountId | String? | ✅ | - | ✅ FK | Cari hesap ID |
| date | DateTime | ✅ | now() | ❌ | Tarih |
| createdAt | DateTime | ✅ | now() | ❌ | Oluşturma tarihi |

**İlişkiler:**
- `account` → Account? (N:1)
- `bankAccount` → BankAccount (N:1)

**İndeksler:**
- `@@index([bankAccountId, date])`
- `@@index([movementType])`

**Map:** `bank_account_movements`

---

### 24. BankLoan (bank_loans)

**Açıklama:** Banka kredileri

| Kolon | Tip | Nullable | Varsayılan | Unique | İlişki | Açıklama |
|-------|------|----------|------------|---------|-----------|
| id | String | ❌ | uuid() | ✅ PK | Birincil anahtar |
| bankAccountId | String | ❌ | - | ✅ FK | Banka hesap ID |
| amount | Decimal | ❌ | - | ❌ | Tutar |
| totalRepayment | Decimal | ❌ | - | ❌ | Toplam geri ödeme |
| totalInterest | Decimal | ❌ | - | ❌ | Toplam faiz |
| installmentCount | Int | ❌ | - | ❌ | Taksit sayısı |
| startDate | DateTime | ❌ | - | ❌ | Başlangıç tarihi |
| notes | String? | ✅ | - | ❌ | Notlar |
| loanType | LoanType | ✅ | EQUAL_INSTALLMENT | ❌ | Kredi tipi |
| status | LoanStatus | ✅ | ACTIVE | ❌ | Durum |
| annualInterestRate | Decimal? | ✅ | - | ❌ | Yıllık faiz oranı |
| paymentFrequency | Int | ✅ | 1 | ❌ | Ödeme sıklığı |
| tenantId | String? | ✅ | - | ❌ | Tenant ID |
| createdAt | DateTime | ✅ | now() | ❌ | Oluşturma tarihi |
| updatedAt | DateTime | ✅ | - | ❌ | Güncelleme tarihi |

**İlişkiler:**
- `bankAccount` → BankAccount (N:1)
- `plans` → BankLoanPlan[] (1:N)

**İndeksler:**
- `@@index([bankAccountId])`

**Map:** `bank_loans`

---

### 25. BankLoanPlan (bank_loan_plans)

**Açıklama:** Banka kredi planları

| Kolon | Tip | Nullable | Varsayılan | Unique | İlişki | Açıklama |
|-------|------|----------|------------|---------|-----------|
| id | String | ❌ | uuid() | ✅ PK | Birincil anahtar |
| loanId | String | ❌ | - | ✅ FK | Kredi ID |
| installmentNo | Int | ❌ | - | ❌ | Taksit no |
| dueDate | DateTime | ❌ | - | ❌ | Vade tarihi |
| amount | Decimal | ❌ | - | ❌ | Tutar |
| paidAmount | Decimal | ✅ | 0 | ❌ | Ödenen tutar |
| status | CreditPlanStatus | ✅ | PENDING | ❌ | Durum |
| tenantId | String? | ✅ | - | ❌ | Tenant ID |
| createdAt | DateTime | ✅ | now() | ❌ | Oluşturma tarihi |

**İlişkiler:**
- `loan` → BankLoan (N:1)

**İndeksler:**
- `@@index([loanId])`

**Map:** `bank_loan_plans`

---

### 26. CompanyCreditCard (company_credit_cards)

**Açıklama:** Firma kredi kartları

| Kolon | Tip | Nullable | Varsayılan | Unique | İlişki | Açıklama |
|-------|------|----------|------------|---------|-----------|
| id | String | ❌ | uuid() | ✅ PK | Birincil anahtar |
| cashboxId | String | ❌ | - | ✅ FK | Kasa ID |
| code | String | ❌ | - | ✅ | Kart kodu |
| name | String | ❌ | - | ❌ | Kart adı |
| bankName | String | ❌ | - | ❌ | Banka adı |
| cardType | String? | ✅ | - | ❌ | Kart tipi |
| lastFourDigits | String? | ✅ | - | ❌ | Son 4 hane |
| creditLimit | Decimal? | ✅ | - | ❌ | Kredi limiti |
| balance | Decimal | ✅ | 0 | ❌ | Bakiye |
| isActive | Boolean | ✅ | true | ❌ | Aktif mi |
| createdAt | DateTime | ✅ | now() | ❌ | Oluşturma tarihi |
| updatedAt | DateTime | ✅ | - | ❌ | Güncelleme tarihi |
| statementDate | DateTime? | ✅ | - | ❌ | Ekstre tarihi |
| paymentDueDate | DateTime? | ✅ | - | ❌ | Ödeme vadesi |

**İlişkiler:**
- `movements` → CompanyCreditCardMovement[] (1:N)
- `reminders` → CompanyCreditCardReminder[] (1:N)
- `cashbox` → Cashbox (N:1)
- `collections` → Collection[] (1:N)

**İndeksler:**
- `@@index([cashboxId])`

**Map:** `company_credit_cards`

---

### 27. CompanyCreditCardMovement (company_credit_card_movements)

**Açıklama:** Firma kredi kartı hareketleri

| Kolon | Tip | Nullable | Varsayılan | Unique | İlişki | Açıklama |
|-------|------|----------|------------|---------|-----------|
| id | String | ❌ | uuid() | ✅ PK | Birincil anahtar |
| cardId | String | ❌ | - | ✅ FK | Kart ID |
| amount | Decimal | ❌ | - | ❌ | Tutar |
| balance | Decimal | ❌ | - | ❌ | Bakiye |
| notes | String? | ✅ | - | ❌ | Notlar |
| accountId | String? | ✅ | - | ✅ FK | Cari hesap ID |
| referenceNo | String? | ✅ | - | ❌ | Referans no |
| date | DateTime | ✅ | now() | ❌ | Tarih |
| createdAt | DateTime | ✅ | now() | ❌ | Oluşturma tarihi |

**İlişkiler:**
- `account` → Account? (N:1)
- `card` → CompanyCreditCard (N:1)

**İndeksler:**
- `@@index([cardId, date])`

**Map:** `company_credit_card_movements`

---

### 28. CompanyCreditCardReminder (company_credit_card_reminders)

**Açıklama:** Firma kredi kartı hatırlatıcıları

| Kolon | Tip | Nullable | Varsayılan | Unique | İlişki | Açıklama |
|-------|------|----------|------------|---------|-----------|
| id | String | ❌ | uuid() | ✅ PK | Birincil anahtar |
| cardId | String | ❌ | - | ✅ FK | Kart ID |
| type | String | ❌ | - | ❌ | Tip |
| day | Int | ❌ | - | ❌ | Gün |
| isActive | Boolean | ✅ | true | ❌ | Aktif mi |
| createdAt | DateTime | ✅ | now() | ❌ | Oluşturma tarihi |
| updatedAt | DateTime | ✅ | - | ❌ | Güncelleme tarihi |

**İlişkiler:**
- `card` → CompanyCreditCard (N:1)

**İndeksler:**
- `@@unique([cardId, type])`
- `@@index([day, isActive])`
- `@@index([cardId])`

**Map:** `company_credit_card_reminders`

---

### 29. CashboxMovement (cashbox_movements)

**Açıklama:** Kasa hareketleri

| Kolon | Tip | Nullable | Varsayılan | Unique | İlişki | Açıklama |
|-------|------|----------|------------|---------|-----------|
| id | String | ❌ | uuid() | ✅ PK | Birincil anahtar |
| cashboxId | String | ❌ | - | ✅ FK | Kasa ID |
| movementType | CashboxMovementType | ❌ | - | ❌ | Hareket tipi |
| amount | Decimal | ❌ | - | ❌ | Tutar |
| commissionAmount | Decimal? | ✅ | - | ❌ | Komisyon tutarı |
| bsmvAmount | Decimal? | ✅ | - | ❌ | BSMV tutarı |
| netAmount | Decimal? | ✅ | - | ❌ | Net tutar |
| balance | Decimal | ❌ | - | ❌ | Bakiye |
| documentType | String? | ✅ | - | ❌ | Belge tipi |
| documentNo | String? | ✅ | - | ❌ | Belge no |
| accountId | String? | ✅ | - | ✅ FK | Cari hesap ID |
| notes | String? | ✅ | - | ❌ | Notlar |
| date | DateTime | ✅ | now() | ❌ | Tarih |
| isTransferred | Boolean | ✅ | false | ❌ | Transfer edildi mi |
| transferDate | DateTime? | ✅ | - | ❌ | Transfer tarihi |
| createdBy | String? | ✅ | - | ✅ FK | Oluşturan |
| createdAt | DateTime | ✅ | now() | ❌ | Oluşturma tarihi |

**İlişkiler:**
- `account` → Account? (N:1)
- `createdByUser` → User? (N:1)
- `cashbox` → Cashbox (N:1)

**İndeksler:**
- `@@index([cashboxId, date])`
- `@@index([accountId])`
- `@@index([isTransferred])`

**Map:** `cashbox_movements`

---

### 30. Invoice (invoices)

**Açıklama:** Faturalar

| Kolon | Tip | Nullable | Varsayılan | Unique | İlişki | Açıklama |
|-------|------|----------|------------|---------|-----------|
| id | String | ❌ | uuid() | ✅ PK | Birincil anahtar |
| invoiceNo | String | ❌ | - | ✅ | Fatura no (tenant ile) |
| invoiceType | InvoiceType | ❌ | - | ❌ | Fatura tipi |
| tenantId | String? | ✅ | - | ✅ FK | Tenant ID ⚠️ NULLABLE! |
| accountId | String | ❌ | - | ✅ FK | Cari hesap ID |
| items | InvoiceItem[] | - | - | ❌ | Fatura kalemleri |
| date | DateTime | ✅ | now() | ❌ | Tarih |
| dueDate | DateTime? | ✅ | - | ❌ | Vade tarihi |
| discount | Decimal | ✅ | 0 | ❌ | İndirim |
| totalAmount | Decimal | ❌ | - | ❌ | Toplam tutar |
| vatAmount | Decimal | ❌ | - | ❌ | KDV tutarı |
| sctTotal | Decimal | ✅ | 0 | ❌ | SCT toplamı |
| withholdingTotal | Decimal | ✅ | 0 | ❌ | Tevkifat toplamı |
| grandTotal | Decimal | ❌ | - | ❌ | Genel toplam |
| foreignTotal | Decimal? | ✅ | - | ❌ | Yabancı para birimi toplamı |
| currency | String | ✅ | TRY | ❌ | Para birimi |
| exchangeRate | Decimal | ✅ | 1 | ❌ | Kur |
| notes | String? | ✅ | - | ❌ | Notlar |
| status | InvoiceStatus | ✅ | OPEN | ❌ | Durum |
| payableAmount | Decimal? | ✅ | - | ❌ | Ödenecek tutar |
| paidAmount | Decimal | ✅ | 0 | ❌ | Ödenen tutar |
| orderNo | String? | ✅ | - | ❌ | Sipariş no |
| purchaseOrderId | String? | ✅ | - | ✅ | Satın alma siparişi ID |
| procurementOrderId | String? | ✅ | - | ✅ | Satın alma siparişi ID |
| deliveryNoteId | String? | ✅ | - | ✅ FK | İrsaliye ID |
| purchaseDeliveryNoteId | String? | ✅ | - | ✅ | Satın alma irsaliyesi ID |
| eInvoiceStatus | EInvoiceStatus? | ✅ | PENDING | ❌ | E-fatura durumu |
| eInvoiceEttn | String? | ✅ | - | ✅ | E-fatura ETNN |
| eScenario | String? | ✅ | - | ❌ | E-fatura senaryosu |
| eInvoiceType | String? | ✅ | - | ❌ | E-fatura tipi |
| gibAlias | String? | ✅ | - | ❌ | GIB alias |
| deliveryMethod | String? | ✅ | - | ❌ | Teslimat yöntemi |
| createdBy | String? | ✅ | - | ✅ FK | Oluşturan |
| updatedBy | String? | ✅ | - | ✅ FK | Güncelleyen |
| deletedAt | DateTime? | ✅ | - | ❌ | Silme tarihi |
| deletedBy | String? | ✅ | - | ✅ FK | Silen |
| createdAt | DateTime | ✅ | now() | ❌ | Oluşturma tarihi |
| updatedAt | DateTime | ✅ | - | ❌ | Güncelleme tarihi |
| salesAgentId | String? | ✅ | - | ✅ FK | Satış temsilcisi ID |
| warehouseId | String? | ✅ | - | ✅ FK | Depo ID |

**İlişkiler:**
- `eInvoiceXml` → EInvoiceXML? (1:1)
- `logs` → InvoiceLog[] (1:N)
- `invoiceCollections` → InvoiceCollection[] (1:N)
- `paymentPlans` → InvoicePaymentPlan[] (1:N)
- `account` → Account (N:1)
- `createdByUser` → User? (N:1)
- `deletedByUser` → User? (N:1)
- `deliveryNote` → SalesDeliveryNote? (N:1)
- `purchaseOrder` → PurchaseOrder? (N:1)
- `purchaseDeliveryNote` → PurchaseDeliveryNote? (N:1)
- `procurementOrder` → ProcurementOrder? (N:1)
- `tenant` → Tenant? (N:1)
- `updatedByUser` → User? (N:1)
- `invoiceProfits` → InvoiceProfit[] (1:N)
- `collections` → Collection[] (1:N)
- `posPayments` → PosPayment[] (1:N)
- `salesAgent` → SalesAgent? (N:1)
- `warehouse` → Warehouse? (N:1)

**İndeksler:**
- `@@unique([invoiceNo, tenantId])`
- `@@index([tenantId])`
- `@@index([tenantId, invoiceType])`
- `@@index([tenantId, status])`
- `@@index([tenantId, date])`
- `@@index([accountId])`
- `@@index([status])`
- `@@index([deliveryNoteId])`
- `@@index([warehouseId])`

**Map:** `invoices`

---

### 31. InvoiceLog (invoice_logs)

**Açıklama:** Fatura logları

| Kolon | Tip | Nullable | Varsayılan | Unique | İlişki | Açıklama |
|-------|------|----------|------------|---------|-----------|
| id | String | ❌ | cuid() | ✅ PK | Birincil anahtar |
| invoiceId | String | ❌ | - | ✅ FK | Fatura ID |
| userId | String? | ✅ | - | ✅ FK | Kullanıcı ID |
| actionType | LogAction | ❌ | - | ❌ | İşlem tipi |
| changes | String? | ✅ | - | ❌ | Değişiklikler |
| ipAddress | String? | ✅ | - | ❌ | IP adresi |
| userAgent | String? | ✅ | - | ❌ | User agent |
| createdAt | DateTime | ✅ | now() | ❌ | Oluşturma tarihi |

**İlişkiler:**
- `invoice` → Invoice (N:1)
- `user` → User? (N:1)

**İndeksler:**
- `@@index([invoiceId])`
- `@@index([userId])`

**Map:** `invoice_logs`

---

### 32. InvoiceItem (invoice_items)

**Açıklama:** Fatura kalemleri

| Kolon | Tip | Nullable | Varsayılan | Unique | İlişki | Açıklama |
|-------|------|----------|------------|---------|-----------|
| id | String | ❌ | uuid() | ✅ PK | Birincil anahtar |
| invoiceId | String | ❌ | - | ✅ FK | Fatura ID |
| productId | String | ❌ | - | ✅ FK | Ürün ID |
| quantity | Int | ❌ | - | ❌ | Miktar |
| unitPrice | Decimal | ❌ | - | ❌ | Birim fiyat |
| vatRate | Int | ❌ | - | ❌ | KDV oranı |
| vatAmount | Decimal | ❌ | - | ❌ | KDV tutarı |
| amount | Decimal | ❌ | - | ❌ | Tutar |
| discountRate | Decimal? | ✅ | 0 | ❌ | İndirim oranı |
| discountAmount | Decimal? | ✅ | 0 | ❌ | İndirim tutarı |
| withholdingCode | String? | ✅ | - | ❌ | Tevkifat kodu |
| withholdingRate | Decimal? | ✅ | - | ❌ | Tevkifat oranı |
| sctRate | Decimal? | ✅ | - | ❌ | SCT oranı |
| sctAmount | Decimal? | ✅ | - | ❌ | SCT tutarı |
| vatExemptionReason | String? | ✅ | - | ❌ | KDV muafiyet nedeni |
| unit | String? | ✅ | - | ❌ | Ölçü birimi |
| shelf | String? | ✅ | - | ❌ | Raf |
| purchaseOrderItemId | String? | ✅ | - | ✅ FK | Satın alma siparişi kalemi ID |
| createdAt | DateTime | ✅ | now() | ❌ | Oluşturma tarihi |

**İlişkiler:**
- `invoice` → Invoice (N:1)
- `purchaseOrderItem` → PurchaseOrderItem? (N:1)
- `product` → Product (N:1)
- `invoiceProfits` → InvoiceProfit[] (1:N)
- `productMovements` → ProductMovement[] (1:N)

**İndeksler:**
- `@@index([invoiceId])`
- `@@index([productId])`

**Map:** `invoice_items`

---

### 33. InvoicePaymentPlan (invoice_payment_plans)

**Açıklama:** Fatura ödeme planları

| Kolon | Tip | Nullable | Varsayılan | Unique | İlişki | Açıklama |
|-------|------|----------|------------|---------|-----------|
| id | String | ❌ | uuid() | ✅ PK | Birincil anahtar |
| invoiceId | String | ❌ | - | ✅ FK | Fatura ID |
| dueDate | DateTime | ❌ | - | ❌ | Vade tarihi |
| amount | Decimal | ❌ | - | ❌ | Tutar |
| paymentType | String? | ✅ | - | ❌ | Ödeme tipi |
| notes | String? | ✅ | - | ❌ | Notlar |
| isPaid | Boolean | ✅ | false | ❌ | Ödendi mi |
| createdAt | DateTime | ✅ | now() | ❌ | Oluşturma tarihi |
| updatedAt | DateTime | ✅ | - | ❌ | Güncelleme tarihi |

**İlişkiler:**
- `invoice` → Invoice (N:1)

**İndeksler:**
- `@@index([invoiceId])`

**Map:** `invoice_payment_plans`

---

### 34. EInvoiceXML (einvoice_xml)

**Açıklama:** E-fatura XML'leri

| Kolon | Tip | Nullable | Varsayılan | Unique | İlişki | Açıklama |
|-------|------|----------|------------|---------|-----------|
| id | String | ❌ | uuid() | ✅ PK | Birincil anahtar |
| invoiceId | String | ❌ | - | ✅ FK | Fatura ID |
| xmlData | String | ❌ | - | ❌ | XML verisi |
| createdAt | DateTime | ✅ | now() | ❌ | Oluşturma tarihi |
| updatedAt | DateTime | ✅ | - | ❌ | Güncelleme tarihi |

**İlişkiler:**
- `invoice` → Invoice (N:1)

**Map:** `einvoice_xml`

---

### 35. SalesOrder (sales_orders)

**Açıklama:** Satış siparişleri

| Kolon | Tip | Nullable | Varsayılan | Unique | İlişki | Açıklama |
|-------|------|----------|------------|---------|-----------|
| id | String | ❌ | uuid() | ✅ PK | Birincil anahtar |
| orderNo | String | ❌ | - | ✅ | Sipariş no (tenant ile) |
| type | OrderType | ❌ | - | ❌ | Sipariş tipi |
| date | DateTime | ✅ | now() | ❌ | Tarih |
| tenantId | String? | ✅ | - | ❌ | Tenant ID |
| accountId | String | ❌ | - | ✅ FK | Cari hesap ID |
| status | SalesOrderStatus | ✅ | PENDING | ❌ | Durum |
| totalAmount | Decimal | ❌ | - | ❌ | Toplam tutar |
| vatAmount | Decimal | ❌ | - | ❌ | KDV tutarı |
| grandTotal | Decimal | ❌ | - | ❌ | Genel toplam |
| discount | Decimal | ✅ | 0 | ❌ | İndirim |
| notes | String? | ✅ | - | ❌ | Notlar |
| dueDate | DateTime? | ✅ | - | ❌ | Vade tarihi |
| invoiceNo | String? | ✅ | - | ❌ | Fatura no |
| createdBy | String? | ✅ | - | ✅ FK | Oluşturan |
| updatedBy | String? | ✅ | - | ✅ FK | Güncelleyen |
| deletedBy | String? | ✅ | - | ✅ FK | Silen |
| deletedAt | DateTime? | ✅ | - | ❌ | Silme tarihi |
| createdAt | DateTime | ✅ | now() | ❌ | Oluşturma tarihi |
| updatedAt | DateTime | ✅ | - | ❌ | Güncelleme tarihi |
| deliveryNoteId | String? | ✅ | - | ✅ | İrsaliye ID |

**İlişkiler:**
- `account` → Account (N:1)
- `createdByUser` → User? (N:1)
- `deletedByUser` → User? (N:1)
- `deliveryNote` → SalesDeliveryNote? (N:1)
- `tenant` → Tenant? (N:1)
- `updatedByUser` → User? (N:1)
- `items` → SalesOrderItem[] (1:N)
- `deliveryNotes` → SalesDeliveryNote[] (1:N)
- `orderPickings` → OrderPicking[] (1:N)
- `quotes` → Quote[] (1:N)
- `logs` → SalesOrderLog[] (1:N)

**İndeksler:**
- `@@unique([orderNo, tenantId])`
- `@@index([accountId])`
- `@@index([date])`
- `@@index([orderNo])`
- `@@index([status])`
- `@@index([tenantId])`

**Map:** `sales_orders`

---

### 36. SalesOrderItem (sales_order_items)

**Açıklama:** Satış siparişi kalemleri

| Kolon | Tip | Nullable | Varsayılan | Unique | İlişki | Açıklama |
|-------|------|----------|------------|---------|-----------|
| id | String | ❌ | uuid() | ✅ PK | Birincil anahtar |
| tenantId | String? | ✅ | - | ❌ | Tenant ID |
| orderId | String | ❌ | - | ✅ FK | Sipariş ID |
| productId | String | ❌ | - | ✅ FK | Ürün ID |
| quantity | Int | ❌ | - | ❌ | Miktar |
| unitPrice | Decimal | ❌ | - | ❌ | Birim fiyat |
| vatRate | Int | ❌ | - | ❌ | KDV oranı |
| vatAmount | Decimal | ❌ | - | ❌ | KDV tutarı |
| totalAmount | Decimal | ❌ | - | ❌ | Tutar |
| deliveredQuantity | Int | ✅ | 0 | ❌ | Teslim miktarı |
| createdAt | DateTime | ✅ | now() | ❌ | Oluşturma tarihi |
| updatedAt | DateTime | ✅ | - | ❌ | Güncelleme tarihi |

**İlişkiler:**
- `order` → SalesOrder (N:1)
- `product` → Product (N:1)
- `orderPickings` → OrderPicking[] (1:N)

**İndeksler:**
- `@@index([orderId])`
- `@@index([productId])`
- `@@index([tenantId])`

**Map:** `sales_order_items`

---

### 37. SalesOrderLog (sales_order_logs)

**Açıklama:** Satış siparişi logları

| Kolon | Tip | Nullable | Varsayılan | Unique | İlişki | Açıklama |
|-------|------|----------|------------|---------|-----------|
| id | String | ❌ | uuid() | ✅ PK | Birincil anahtar |
| orderId | String | ❌ | - | ✅ FK | Sipariş ID |
| userId | String? | ✅ | - | ✅ FK | Kullanıcı ID |
| actionType | LogAction | ❌ | - | ❌ | İşlem tipi |
| changes | String? | ✅ | - | ❌ | Değişiklikler |
| ipAddress | String? | ✅ | - | ❌ | IP adresi |
| userAgent | String? | ✅ | - | ❌ | User agent |
| createdAt | DateTime | ✅ | now() | ❌ | Oluşturma tarihi |

**İlişkiler:**
- `order` → SalesOrder (N:1)
- `user` → User? (N:1)

**İndeksler:**
- `@@index([orderId])`
- `@@index([userId])`

**Map:** `sales_order_logs`

---

### 38. OrderPicking (order_pickings)

**Açıklama:** Sipariş toplamaları

| Kolon | Tip | Nullable | Varsayılan | Unique | İlişki | Açıklama |
|-------|------|----------|------------|---------|-----------|
| id | String | ❌ | uuid() | ✅ PK | Birincil anahtar |
| orderId | String | ❌ | - | ✅ FK | Sipariş ID |
| orderItemId | String | ❌ | - | ✅ FK | Sipariş kalemi ID |
| locationId | String | ❌ | - | ✅ FK | Konum ID |
| quantity | Int | ❌ | - | ❌ | Miktar |
| pickedBy | String? | ✅ | - | ✅ FK | Toplayan |
| createdAt | DateTime | ✅ | now() | ❌ | Oluşturma tarihi |

**İlişkiler:**
- `picker` → User? (N:1)
- `location` → Location (N:1)
- `order` → SalesOrder (N:1)
- `orderItem` → SalesOrderItem (N:1)

**İndeksler:**
- `@@index([orderId])`
- `@@index([orderItemId])`
- `@@index([locationId])`

**Map:** `order_pickings`

---

### 39. SalesDeliveryNote (sales_delivery_notes)

**Açıklama:** Satış irsaliyeleri

| Kolon | Tip | Nullable | Varsayılan | Unique | İlişki | Açıklama |
|-------|------|----------|------------|---------|-----------|
| id | String | ❌ | uuid() | ✅ PK | Birincil anahtar |
| deliveryNoteNo | String | ❌ | - | ✅ | İrsaliye no (tenant ile) |
| date | DateTime | ✅ | now() | ❌ | Tarih |
| tenantId | String? | ✅ | - | ❌ | Tenant ID |
| accountId | String | ❌ | - | ✅ FK | Cari hesap ID |
| warehouseId | String? | ✅ | - | ✅ FK | Depo ID |
| sourceType | DeliveryNoteSourceType | ❌ | - | ❌ | Kaynak tipi |
| sourceId | String? | ✅ | - | ❌ | Kaynak ID |
| status | DeliveryNoteStatus | ✅ | NOT_INVOICED | ❌ | Durum |
| subtotal | Decimal | ❌ | - | ❌ | Alt toplam |
| vatAmount | Decimal | ❌ | - | ❌ | KDV tutarı |
| grandTotal | Decimal | ❌ | - | ❌ | Genel toplam |
| discount | Decimal | ✅ | 0 | ❌ | İndirim |
| notes | String? | ✅ | - | ❌ | Notlar |
| createdBy | String? | ✅ | - | ✅ FK | Oluşturan |
| updatedBy | String? | ✅ | - | ✅ FK | Güncelleyen |
| deletedAt | DateTime? | ✅ | - | ❌ | Silme tarihi |
| deletedBy | String? | ✅ | - | ✅ FK | Silen |
| createdAt | DateTime | ✅ | now() | ❌ | Oluşturma tarihi |
| updatedAt | DateTime | ✅ | - | ❌ | Güncelleme tarihi |

**İlişkiler:**
- `invoices` → Invoice[] (1:N)
- `account` → Account (N:1)
- `createdByUser` → User? (N:1)
- `deletedByUser` → User? (N:1)
- `warehouse` → Warehouse? (N:1)
- `tenant` → Tenant? (N:1)
- `updatedByUser` → User? (N:1)
- `items` → SalesDeliveryNoteItem[] (1:N)
- `logs` → SalesDeliveryNoteLog[] (1:N)
- `sourceOrder` → SalesOrder? (N:1)
- `orderFromDeliveryNote` → SalesOrder? (N:1)

**İndeksler:**
- `@@unique([deliveryNoteNo, tenantId])`
- `@@index([tenantId])`
- `@@index([deliveryNoteNo])`
- `@@index([date])`
- `@@index([accountId])`
- `@@index([status])`
- `@@index([sourceId])`

**Map:** `sales_delivery_notes`

---

### 40. SalesDeliveryNoteItem (sales_delivery_note_items)

**Açıklama:** Satış irsaliyesi kalemleri

| Kolon | Tip | Nullable | Varsayılan | Unique | İlişki | Açıklama |
|-------|------|----------|------------|---------|-----------|
| id | String | ❌ | uuid() | ✅ PK | Birincil anahtar |
| tenantId | String? | ✅ | - | ❌ | Tenant ID |
| deliveryNoteId | String | ❌ | - | ✅ FK | İrsaliye ID |
| productId | String | ❌ | - | ✅ FK | Ürün ID |
| quantity | Int | ❌ | - | ❌ | Miktar |
| unitPrice | Decimal | ❌ | - | ❌ | Birim fiyat |
| vatRate | Int | ❌ | - | ❌ | KDV oranı |
| vatAmount | Decimal | ❌ | - | ❌ | KDV tutarı |
| totalAmount | Decimal | ❌ | - | ❌ | Tutar |
| invoicedQuantity | Int | ✅ | 0 | ❌ | Faturalanan miktar |
| createdAt | DateTime | ✅ | now() | ❌ | Oluşturma tarihi |
| updatedAt | DateTime | ✅ | - | ❌ | Güncelleme tarihi |

**İlişkiler:**
- `deliveryNote` → SalesDeliveryNote (N:1)
- `product` → Product (N:1)

**İndeksler:**
- `@@index([deliveryNoteId])`
- `@@index([productId])`
- `@@index([tenantId])`

**Map:** `sales_delivery_note_items`

---

### 41. SalesDeliveryNoteLog (sales_delivery_note_logs)

**Açıklama:** Satış irsaliyesi logları

| Kolon | Tip | Nullable | Varsayılan | Unique | İlişki | Açıklama |
|-------|------|----------|------------|---------|-----------|
| id | String | ❌ | uuid() | ✅ PK | Birincil anahtar |
| deliveryNoteId | String | ❌ | - | ✅ FK | İrsaliye ID |
| userId | String? | ✅ | - | ✅ FK | Kullanıcı ID |
| actionType | LogAction | ❌ | - | ❌ | İşlem tipi |
| changes | String? | ✅ | - | ❌ | Değişiklikler |
| ipAddress | String? | ✅ | - | ❌ | IP adresi |
| userAgent | String? | ✅ | - | ❌ | User agent |
| createdAt | DateTime | ✅ | now() | ❌ | Oluşturma tarihi |

**İlişkiler:**
- `deliveryNote` → SalesDeliveryNote (N:1)
- `user` → User? (N:1)

**İndeksler:**
- `@@index([deliveryNoteId])`
- `@@index([userId])`

**Map:** `sales_delivery_note_logs`

---

### 42. Quote (quotes)

**Açıklama:** Teklifler

| Kolon | Tip | Nullable | Varsayılan | Unique | İlişki | Açıklama |
|-------|------|----------|------------|---------|-----------|
| id | String | ❌ | uuid() | ✅ PK | Birincil anahtar |
| quoteNo | String | ❌ | - | ✅ | Teklif no (tenant ile) |
| tenantId | String? | ✅ | - | ❌ | Tenant ID |
| quoteType | QuoteType | ❌ | - | ❌ | Teklif tipi |
| accountId | String | ❌ | - | ✅ FK | Cari hesap ID |
| date | DateTime | ✅ | now() | ❌ | Tarih |
| validUntil | DateTime? | ✅ | - | ❌ | Geçerlilik bitişi |
| discount | Decimal | ✅ | 0 | ❌ | İndirim |
| totalAmount | Decimal | ❌ | - | ❌ | Toplam tutar |
| vatAmount | Decimal | ❌ | - | ❌ | KDV tutarı |
| grandTotal | Decimal | ❌ | - | ❌ | Genel toplam |
| notes | String? | ✅ | - | ❌ | Notlar |
| status | QuoteStatus | ✅ | OFFERED | ❌ | Durum |
| orderId | String? | ✅ | - | ✅ FK | Sipariş ID |
| createdBy | String? | ✅ | - | ✅ FK | Oluşturan |
| updatedBy | String? | ✅ | - | ✅ FK | Güncelleyen |
| deletedAt | DateTime? | ✅ | - | ❌ | Silme tarihi |
| deletedBy | String? | ✅ | - | ✅ FK | Silen |
| createdAt | DateTime | ✅ | now() | ❌ | Oluşturma tarihi |
| updatedAt | DateTime | ✅ | - | ❌ | Güncelleme tarihi |

**İlişkiler:**
- `items` → QuoteItem[] (1:N)
- `logs` → QuoteLog[] (1:N)
- `account` → Account (N:1)
- `createdByUser` → User? (N:1)
- `deletedByUser` → User? (N:1)
- `order` → SalesOrder? (N:1)
- `tenant` → Tenant? (N:1)
- `updatedByUser` → User? (N:1)

**İndeksler:**
- `@@unique([quoteNo, tenantId])`
- `@@index([tenantId])`
- `@@index([tenantId, quoteNo])`

**Map:** `quotes`

---

### 43. QuoteItem (quote_items)

**Açıklama:** Teklif kalemleri

| Kolon | Tip | Nullable | Varsayılan | Unique | İlişki | Açıklama |
|-------|------|----------|------------|---------|-----------|
| id | String | ❌ | uuid() | ✅ PK | Birincil anahtar |
| quoteId | String | ❌ | - | ✅ FK | Teklif ID |
| productId | String | ❌ | - | ✅ FK | Ürün ID |
| quantity | Int | ❌ | - | ❌ | Miktar |
| unitPrice | Decimal | ❌ | - | ❌ | Birim fiyat |
| vatRate | Int | ❌ | - | ❌ | KDV oranı |
| vatAmount | Decimal | ❌ | - | ❌ | KDV tutarı |
| amount | Decimal | ❌ | - | ❌ | Tutar |
| discountRate | Decimal? | ✅ | - | ❌ | İndirim oranı |
| discountAmount | Decimal? | ✅ | - | ❌ | İndirim tutarı |
| createdAt | DateTime | ✅ | now() | ❌ | Oluşturma tarihi |

**İlişkiler:**
- `product` → Product (N:1)
- `quote` → Quote (N:1)

**Map:** `quote_items`

---

### 44. QuoteLog (quote_logs)

**Açıklama:** Teklif logları

| Kolon | Tip | Nullable | Varsayılan | Unique | İlişki | Açıklama |
|-------|------|----------|------------|---------|-----------|
| id | String | ❌ | uuid() | ✅ PK | Birincil anahtar |
| quoteId | String | ❌ | - | ✅ FK | Teklif ID |
| userId | String? | ✅ | - | ✅ FK | Kullanıcı ID |
| actionType | LogAction | ❌ | - | ❌ | İşlem tipi |
| changes | String? | ✅ | - | ❌ | Değişiklikler |
| ipAddress | String? | ✅ | - | ❌ | IP adresi |
| userAgent | String? | ✅ | - | ❌ | User agent |
| createdAt | DateTime | ✅ | now() | ❌ | Oluşturma tarihi |

**İlişkiler:**
- `quote` → Quote (N:1)
- `user` → User? (N:1)

**İndeksler:**
- `@@index([quoteId])`
- `@@index([userId])`

**Map:** `quote_logs`

---

### 45. Stocktake (stocktakes)

**Açıklama:** Sayımlar

| Kolon | Tip | Nullable | Varsayılan | Unique | İlişki | Açıklama |
|-------|------|----------|------------|---------|-----------|
| id | String | ❌ | uuid() | ✅ PK | Birincil anahtar |
| stocktakeNo | String | ❌ | - | ✅ | Sayım no (tenant ile) |
| tenantId | String? | ✅ | - | ❌ | Tenant ID |
| stocktakeType | StocktakeType | ❌ | - | ❌ | Sayım tipi |
| date | DateTime | ✅ | now() | ❌ | Tarih |
| status | StocktakeStatus | ✅ | DRAFT | ❌ | Durum |
| notes | String? | ✅ | - | ❌ | Notlar |
| createdBy | String? | ✅ | - | ✅ FK | Oluşturan |
| updatedBy | String? | ✅ | - | ✅ FK | Güncelleyen |
| approvedById | String? | ✅ | - | ✅ FK | Onaylayan |
| approvalDate | DateTime? | ✅ | - | ❌ | Onay tarihi |
| createdAt | DateTime | ✅ | now() | ❌ | Oluşturma tarihi |
| updatedAt | DateTime | ✅ | - | ❌ | Güncelleme tarihi |

**İlişkiler:**
- `items` → StocktakeItem[] (1:N)
- `createdByUser` → User? (N:1)
- `approvedByUser` → User? (N:1)
- `tenant` → Tenant? (N:1)
- `updatedByUser` → User? (N:1)

**İndeksler:**
- `@@unique([stocktakeNo, tenantId])`
- `@@index([tenantId])`
- `@@index([tenantId, stocktakeNo])`

**Map:** `stocktakes`

---

### 46. StocktakeItem (stocktake_items)

**Açıklama:** Sayım kalemleri

| Kolon | Tip | Nullable | Varsayılan | Unique | İlişki | Açıklama |
|-------|------|----------|------------|---------|-----------|
| id | String | ❌ | uuid() | ✅ PK | Birincil anahtar |
| stocktakeId | String | ❌ | - | ✅ FK | Sayım ID |
| productId | String | ❌ | - | ✅ FK | Ürün ID |
| locationId | String? | ✅ | - | ✅ FK | Konum ID |
| systemQuantity | Int | ❌ | - | ❌ | Sistem miktarı |
| countedQuantity | Int | ❌ | - | ❌ | Sayılan miktar |
| difference | Int | ❌ | - | ❌ | Fark |
| createdAt | DateTime | ✅ | now() | ❌ | Oluşturma tarihi |

**İlişkiler:**
- `stocktake` → Stocktake (N:1)
- `location` → Location? (N:1)
- `product` → Product (N:1)

**İndeksler:**
- `@@index([stocktakeId])`
- `@@index([productId])`
- `@@index([locationId])`

**Map:** `stocktake_items`

---

### 47. Shelf (shelves)

**Açıklama:** Raf bilgileri

| Kolon | Tip | Nullable | Varsayılan | Unique | İlişki | Açıklama |
|-------|------|----------|------------|---------|-----------|
| id | String | ❌ | uuid() | ✅ PK | Birincil anahtar |
| warehouseId | String | ❌ | - | ✅ FK | Depo ID |
| code | String | ❌ | - | ✅ | Raf kodu (depo ile) |
| notes | String? | ✅ | - | ❌ | Notlar |
| createdAt | DateTime | ✅ | now() | ❌ | Oluşturma tarihi |
| updatedAt | DateTime | ✅ | - | ❌ | Güncelleme tarihi |

**İlişkiler:**
- `warehouse` → Warehouse (N:1)
- `products` → ProductShelf[] (1:N)

**İndeksler:**
- `@@unique([warehouseId, code])`

**Map:** `shelves`

---

### 48. ProductShelf (product_shelves)

**Açıklama:** Ürün raf ilişkileri

| Kolon | Tip | Nullable | Varsayılan | Unique | İlişki | Açıklama |
|-------|------|----------|------------|---------|-----------|
| id | String | ❌ | uuid() | ✅ PK | Birincil anahtar |
| productId | String | ❌ | - | ✅ FK | Ürün ID |
| shelfId | String | ❌ | - | ✅ FK | Raf ID |
| quantity | Int | ✅ | 0 | ❌ | Miktar |
| createdAt | DateTime | ✅ | now() | ❌ | Oluşturma tarihi |
| updatedAt | DateTime | ✅ | - | ❌ | Güncelleme tarihi |

**İlişkiler:**
- `shelf` → Shelf (N:1)
- `product` → Product (N:1)

**İndeksler:**
- `@@unique([productId, shelfId])`

**Map:** `product_shelves`

---

### 49. Warehouse (warehouses)

**Açıklama:** Depolar

| Kolon | Tip | Nullable | Varsayılan | Unique | İlişki | Açıklama |
|-------|------|----------|------------|---------|-----------|
| id | String | ❌ | uuid() | ✅ PK | Birincil anahtar |
| code | String | ❌ | - | ✅ | Depo kodu (tenant ile) |
| tenantId | String? | ✅ | - | ❌ | Tenant ID |
| name | String | ❌ | - | ❌ | Depo adı |
| active | Boolean | ✅ | true | ❌ | Aktif mi |
| address | String? | ✅ | - | ❌ | Adres |
| phone | String? | ✅ | - | ❌ | Telefon |
| manager | String? | ✅ | - | ❌ | Yönetici |
| createdAt | DateTime | ✅ | now() | ❌ | Oluşturma tarihi |
| updatedAt | DateTime | ✅ | - | ❌ | Güncelleme tarihi |
| isDefault | Boolean | ✅ | false | ❌ | Varsayılan mı |

**İlişkiler:**
- `locations` → Location[] (1:N)
- `productLocationStocks` → ProductLocationStock[] (1:N)
- `purchaseDeliveryNotes` → PurchaseDeliveryNote[] (1:N)
- `salesDeliveryNotes` → SalesDeliveryNote[] (1:N)
- `productMovementsTo` → StockMove[] (1:N)
- `productMovementsFrom` → StockMove[] (1:N)
- `warehouseCriticalStocks` → WarehouseCriticalStock[] (1:N)
- `shelves` → Shelf[] (1:N)
- `fromWarehouseTransfers` → WarehouseTransfer[] (1:N)
- `toWarehouseTransfers` → WarehouseTransfer[] (1:N)
- `invoices` → Invoice[] (1:N)
- `inventoryTransactions` → InventoryTransaction[] (1:N)
- `tenant` → Tenant? (N:1)
- `productMovements` → ProductMovement[] (1:N)

**İndeksler:**
- `@@unique([code, tenantId])`
- `@@index([tenantId])`
- `@@index([tenantId, code])`

**Map:** `warehouses`

---

### 50. Location (locations)

**Açıklama:** Depo konumları (kat, koridor, raf, vb.)

| Kolon | Tip | Nullable | Varsayılan | Unique | İlişki | Açıklama |
|-------|------|----------|------------|---------|-----------|
| id | String | ❌ | uuid() | ✅ PK | Birincil anahtar |
| warehouseId | String | ❌ | - | ✅ FK | Depo ID |
| layer | Int | ❌ | - | ❌ | Kat |
| corridor | String | ❌ | - | ❌ | Koridor |
| side | Int | ❌ | - | ❌ | Taraf |
| section | Int | ❌ | - | ❌ | Bölüm |
| level | Int | ❌ | - | ❌ | Seviye |
| code | String | ❌ | - | ✅ | Konum kodu |
| barcode | String | ❌ | - | ✅ | Barkod |
| name | String? | ✅ | - | ❌ | Konum adı |
| active | Boolean | ✅ | true | ❌ | Aktif mi |
| createdAt | DateTime | ✅ | now() | ❌ | Oluşturma tarihi |
| updatedAt | DateTime | ✅ | - | ❌ | Güncelleme tarihi |

**İlişkiler:**
- `warehouse` → Warehouse (N:1)
- `productLocationStocks` → ProductLocationStock[] (1:N)
- `stocktakeItems` → StocktakeItem[] (1:N)
- `orderPickings` → OrderPicking[] (1:N)
- `stockMoves` → StockMove[] (1:N)
- `stockMoves2` → StockMove[] (1:N)
- `fromWarehouseTransferItems` → WarehouseTransferItem[] (1:N)
- `toWarehouseTransferItems` → WarehouseTransferItem[] (1:N)

**İndeksler:**
- `@@unique([warehouseId, code])`
- `@@index([warehouseId])`
- `@@index([code])`
- `@@index([barcode])`

**Map:** `locations`

---

### 51. ProductBarcode (product_barcodes)

**Açıklama:** Ürün barkodları

| Kolon | Tip | Nullable | Varsayılan | Unique | İlişki | Açıklama |
|-------|------|----------|------------|---------|-----------|
| id | String | ❌ | uuid() | ✅ PK | Birincil anahtar |
| productId | String | ❌ | - | ✅ FK | Ürün ID |
| barcode | String | ❌ | - | ✅ | Barkod |
| symbology | String | ❌ | - | ❌ | Semboloji |
| isPrimary | Boolean | ✅ | false | ❌ | Birincil mi |
| createdAt | DateTime | ✅ | now() | ❌ | Oluşturma tarihi |
| updatedAt | DateTime | ✅ | - | ❌ | Güncelleme tarihi |

**İlişkiler:**
- `product` → Product (N:1)

**İndeksler:**
- `@@index([productId])`
- `@@index([barcode])`

**Map:** `product_barcodes`

---

### 52. ProductLocationStock (product_location_stocks)

**Açıklama:** Ürün konum stokları

| Kolon | Tip | Nullable | Varsayılan | Unique | İlişki | Açıklama |
|-------|------|----------|------------|---------|-----------|
| id | String | ❌ | uuid() | ✅ PK | Birincil anahtar |
| warehouseId | String | ❌ | - | ✅ FK | Depo ID |
| locationId | String | ❌ | - | ✅ FK | Konum ID |
| productId | String | ❌ | - | ✅ FK | Ürün ID |
| qtyOnHand | Int | ✅ | 0 | ❌ | Mevcut miktar |
| createdAt | DateTime | ✅ | now() | ❌ | Oluşturma tarihi |
| updatedAt | DateTime | ✅ | - | ❌ | Güncelleme tarihi |

**İlişkiler:**
- `location` → Location (N:1)
- `product` → Product (N:1)
- `warehouse` → Warehouse (N:1)

**İndeksler:**
- `@@unique([warehouseId, locationId, productId])`
- `@@index([warehouseId])`
- `@@index([locationId])`
- `@@index([productId])`

**Map:** `product_location_stocks`

---

### 53. StockMove (stock_moves)

**Açıklama:** Stok hareketleri

| Kolon | Tip | Nullable | Varsayılan | Unique | İlişki | Açıklama |
|-------|------|----------|------------|---------|-----------|
| id | String | ❌ | uuid() | ✅ PK | Birincil anahtar |
| productId | String | ❌ | - | ✅ FK | Ürün ID |
| fromWarehouseId | String? | ✅ | - | ✅ FK | Kaynak depo ID |
| fromLocationId | String? | ✅ | - | ✅ FK | Kaynak konum ID |
| toWarehouseId | String | ❌ | - | ✅ FK | Hedef depo ID |
| toLocationId | String? | ✅ | - | ✅ FK | Hedef konum ID |
| quantity | Int | ❌ | - | ❌ | Miktar |
| moveType | StockMoveType | ❌ | - | ❌ | Hareket tipi |
| refType | String? | ✅ | - | ❌ | Referans tipi |
| refId | String? | ✅ | - | ❌ | Referans ID |
| notes | String? | ✅ | - | ❌ | Notlar |
| createdAt | DateTime | ✅ | now() | ❌ | Oluşturma tarihi |
| createdBy | String? | ✅ | - | ❌ | Oluşturan |

**İlişkiler:**
- `createdByUser` → User? (N:1)
- `fromLocation` → Location? (N:1)
- `fromWarehouse` → Warehouse? (N:1)
- `product` → Product (N:1)
- `toLocation` → Location? (N:1)
- `toWarehouse` → Warehouse (N:1)

**İndeksler:**
- `@@index([productId])`
- `@@index([fromWarehouseId, fromLocationId])`
- `@@index([toWarehouseId, toLocationId])`
- `@@index([moveType])`
- `@@index([createdAt])`
- `@@index([refType, refId])`

**Map:** `stock_moves`

---

### 54. ExpenseCategory (expense_categories)

**Açıklama:** Gider kategorileri

| Kolon | Tip | Nullable | Varsayılan | Unique | İlişki | Açıklama |
|-------|------|----------|------------|---------|-----------|
| id | String | ❌ | uuid() | ✅ PK | Birincil anahtar |
| name | String | ❌ | - | ✅ | Kategori adı |
| notes | String? | ✅ | - | ❌ | Notlar |
| createdAt | DateTime | ✅ | now() | ❌ | Oluşturma tarihi |
| updatedAt | DateTime | ✅ | - | ❌ | Güncelleme tarihi |

**İlişkiler:**
- `expenses` → Expense[] (1:N)

**Map:** `expense_categories`

---

### 55. Expense (expenses)

**Açıklama:** Giderler

| Kolon | Tip | Nullable | Varsayılan | Unique | İlişki | Açıklama |
|-------|------|----------|------------|---------|-----------|
| id | String | ❌ | uuid() | ✅ PK | Birincil anahtar |
| tenantId | String? | ✅ | - | ✅ FK | Tenant ID ⚠️ NULLABLE! |
| categoryId | String | ❌ | - | ✅ FK | Kategori ID |
| notes | String? | ✅ | - | ❌ | Notlar |
| amount | Decimal | ❌ | - | ❌ | Tutar |
| date | DateTime | ✅ | now() | ❌ | Tarih |
| paymentType | PaymentMethod | ❌ | - | ❌ | Ödeme yöntemi |
| createdAt | DateTime | ✅ | now() | ❌ | Oluşturma tarihi |
| updatedAt | DateTime | ✅ | - | ❌ | Güncelleme tarihi |

**İlişkiler:**
- `category` → ExpenseCategory (N:1)
- `tenant` → Tenant? (N:1)

**İndeksler:**
- `@@index([tenantId])`
- `@@index([tenantId, date])`

**Map:** `expenses`

---

### 56. BankTransfer (bank_transfers)

**Açıklama:** Banka transferleri

| Kolon | Tip | Nullable | Varsayılan | Unique | İlişki | Açıklama |
|-------|------|----------|------------|---------|-----------|
| id | String | ❌ | uuid() | ✅ PK | Birincil anahtar |
| tenantId | String? | ✅ | - | ✅ FK | Tenant ID ⚠️ NULLABLE! |
| transferType | TransferType | ❌ | - | ❌ | Transfer tipi |
| cashboxId | String? | ✅ | - | ✅ FK | Kasa ID |
| accountId | String | ❌ | - | ✅ FK | Cari hesap ID |
| amount | Decimal | ❌ | - | ❌ | Tutar |
| date | DateTime | ✅ | now() | ❌ | Tarih |
| notes | String? | ✅ | - | ❌ | Notlar |
| referenceNo | String? | ✅ | - | ❌ | Referans no |
| sender | String? | ✅ | - | ❌ | Gönderen |
| receiver | String? | ✅ | - | ❌ | Alıcı |
| createdBy | String? | ✅ | - | ✅ FK | Oluşturan |
| updatedBy | String? | ✅ | - | ✅ FK | Güncelleyen |
| deletedAt | DateTime? | ✅ | - | ❌ | Silme tarihi |
| deletedBy | String? | ✅ | - | ✅ FK | Silen |
| createdAt | DateTime | ✅ | now() | ❌ | Oluşturma tarihi |
| updatedAt | DateTime | ✅ | - | ❌ | Güncelleme tarihi |
| bankAccountId | String? | ✅ | - | ❌ | Banka hesap ID |

**İlişkiler:**
- `logs` → BankTransferLog[] (1:N)
- `cashbox` → Cashbox? (N:1)
- `bankAccount` → BankAccount? (N:1)
- `account` → Account (N:1)
- `createdByUser` → User? (N:1)
- `deletedByUser` → User? (N:1)
- `tenant` → Tenant? (N:1)
- `updatedByUser` → User? (N:1)

**İndeksler:**
- `@@index([tenantId])`
- `@@index([tenantId, date])`
- `@@index([cashboxId])`
- `@@index([accountId])`
- `@@index([date])`
- `@@index([transferType])`

**Map:** `bank_transfers`

---

### 57. DeletedBankTransfer (deleted_bank_transfers)

**Açıklama:** Silinmiş banka transferleri

| Kolon | Tip | Nullable | Varsayılan | Unique | İlişki | Açıklama |
|-------|------|----------|------------|---------|-----------|
| id | String | ❌ | uuid() | ✅ PK | Birincil anahtar |
| originalId | String | ❌ | - | ❌ | Orijinal ID |
| transferType | TransferType | ❌ | - | ❌ | Transfer tipi |
| cashboxId | String | ❌ | - | ❌ | Kasa ID |
| cashboxName | String | ❌ | - | ❌ | Kasa adı |
| accountId | String | ❌ | - | ❌ | Cari hesap ID |
| accountName | String | ❌ | - | ❌ | Cari adı |
| amount | Decimal | ❌ | - | ❌ | Tutar |
| date | DateTime | ❌ | - | ❌ | Tarih |
| notes | String? | ✅ | - | ❌ | Notlar |
| referenceNo | String? | ✅ | - | ❌ | Referans no |
| sender | String? | ✅ | - | ❌ | Gönderen |
| receiver | String? | ✅ | - | ❌ | Alıcı |
| originalCreatedBy | String? | ✅ | - | ❌ | Orijinal oluşturan |
| originalUpdatedBy | String? | ✅ | - | ❌ | Orijinal güncelleyen |
| originalCreatedAt | DateTime | ❌ | - | ❌ | Orijinal oluşturma tarihi |
| originalUpdatedAt | DateTime | ❌ | - | ❌ | Orijinal güncelleme tarihi |
| deletedBy | String? | ✅ | - | ✅ FK | Silen |
| deletedAt | DateTime | ✅ | now() | ❌ | Silme tarihi |
| deleteReason | String? | ✅ | - | ❌ | Silme nedeni |

**İlişkiler:**
- `deletedByUser` → User? (N:1)

**İndeksler:**
- `@@index([originalId])`
- `@@index([deletedAt])`
- `@@index([cashboxId])`
- `@@index([accountId])`

**Map:** `deleted_bank_transfers`

---

### 58. BankTransferLog (bank_transfer_logs)

**Açıklama:** Banka transfer logları

| Kolon | Tip | Nullable | Varsayılan | Unique | İlişki | Açıklama |
|-------|------|----------|------------|---------|-----------|
| id | String | ❌ | uuid() | ✅ PK | Birincil anahtar |
| bankTransferId | String | ❌ | - | ✅ FK | Transfer ID |
| userId | String? | ✅ | - | ✅ FK | Kullanıcı ID |
| actionType | LogAction | ❌ | - | ❌ | İşlem tipi |
| changes | String? | ✅ | - | ❌ | Değişiklikler |
| ipAddress | String? | ✅ | - | ❌ | IP adresi |
| userAgent | String? | ✅ | - | ❌ | User agent |
| createdAt | DateTime | ✅ | now() | ❌ | Oluşturma tarihi |

**İlişkiler:**
- `bankTransfer` → BankTransfer (N:1)
- `user` → User? (N:1)

**İndeksler:**
- `@@index([bankTransferId])`
- `@@index([userId])`

**Map:** `bank_transfer_logs`

---

### 59. CheckBillJournal (check_bill_journals)

**Açıklama:** Çek/senet bordroları

| Kolon | Tip | Nullable | Varsayılan | Unique | İlişki | Açıklama |
|-------|------|----------|------------|---------|-----------|
| id | String | ❌ | uuid() | ✅ PK | Birincil anahtar |
| journalNo | String | ❌ | - | ❌ | Bordro no |
| type | JournalType | ❌ | - | ❌ | Bordro tipi |
| date | DateTime | ✅ | now() | ❌ | Tarih |
| accountId | String? | ✅ | - | ✅ FK | Cari hesap ID |
| notes | String? | ✅ | - | ❌ | Notlar |
| tenantId | String? | ✅ | - | ❌ | Tenant ID |
| createdById | String? | ✅ | - | ✅ FK | Oluşturan |
| createdAt | DateTime | ✅ | now() | ❌ | Oluşturma tarihi |
| updatedAt | DateTime | ✅ | - | ❌ | Güncelleme tarihi |
| bankAccountId | String? | ✅ | - | ✅ FK | Banka hesap ID |

**İlişkiler:**
- `bankAccount` → BankAccount? (N:1)
- `account` → Account? (N:1)
- `createdBy` → User? (N:1)
- `tenant` → Tenant? (N:1)
- `checkBills` → CheckBill[] (1:N)
- `items` → CheckBillJournalItem[] (1:N)

**Map:** `check_bill_journals`

---

### 60. CheckBillJournalItem (check_bill_journal_items)

**Açıklama:** Çek/senet bordro kalemleri

| Kolon | Tip | Nullable | Varsayılan | Unique | İlişki | Açıklama |
|-------|------|----------|------------|---------|-----------|
| id | String | ❌ | uuid() | ✅ PK | Birincil anahtar |
| journalId | String | ❌ | - | ✅ FK | Bordro ID |
| checkBillId | String | ❌ | - | ✅ FK | Çek/senet ID |
| tenantId | String? | ✅ | - | ❌ | Tenant ID |
| createdAt | DateTime | ✅ | now() | ❌ | Oluşturma tarihi |
| updatedAt | DateTime | ✅ | - | ❌ | Güncelleme tarihi |

**İlişkiler:**
- `journal` → CheckBillJournal (N:1)
- `checkBill` → CheckBill (N:1)
- `tenant` → Tenant? (N:1)

**İndeksler:**
- `@@index([journalId])`
- `@@index([checkBillId])`
- `@@index([tenantId])`

**Map:** `check_bill_journal_items`

---

### 61. CheckBill (checks_bills)

**Açıklama:** Çekler ve senetler

| Kolon | Tip | Nullable | Varsayılan | Unique | İlişki | Açıklama |
|-------|------|----------|------------|---------|-----------|
| id | String | ❌ | uuid() | ✅ PK | Birincil anahtar |
| tenantId | String? | ✅ | - | ✅ FK | Tenant ID |
| type | CheckBillType | ❌ | - | ❌ | Tip (çek/senet) |
| portfolioType | PortfolioType | ❌ | - | ❌ | Portföy tipi |
| accountId | String | ❌ | - | ✅ FK | Cari hesap ID |
| amount | Decimal | ❌ | - | ❌ | Tutar |
| remainingAmount | Decimal | ✅ | 0 | ❌ | Kalan tutar |
| dueDate | DateTime | ❌ | - | ❌ | Vade tarihi |
| bank | String? | ✅ | - | ❌ | Banka |
| branch | String? | ✅ | - | ❌ | Şube |
| accountNo | String? | ✅ | - | ❌ | Hesap no |
| checkNo | String? | ✅ | - | ❌ | Çek no |
| serialNo | String? | ✅ | - | ❌ | Seri no |
| status | CheckBillStatus? | ✅ | - | ❌ | Durum |
| collectionDate | DateTime? | ✅ | - | ❌ | Tahsilat tarihi |
| collectionCashboxId | String? | ✅ | - | ✅ FK | Tahsilat kasası ID |
| isEndorsed | Boolean | ✅ | false | ❌ | Devredildi mi |
| endorsementDate | DateTime? | ✅ | - | ❌ | Devretme tarihi |
| endorsedTo | String? | ✅ | - | ❌ | Kime devredildi |
| notes | String? | ✅ | - | ❌ | Notlar |
| createdBy | String? | ✅ | - | ✅ FK | Oluşturan |
| updatedBy | String? | ✅ | - | ✅ FK | Güncelleyen |
| deletedAt | DateTime? | ✅ | - | ❌ | Silme tarihi |
| deletedBy | String? | ✅ | - | ✅ FK | Silen |
| createdAt | DateTime | ✅ | now() | ❌ | Oluşturma tarihi |
| updatedAt | DateTime | ✅ | - | ❌ | Güncelleme tarihi |
| lastJournalId | String? | ✅ | - | ✅ FK | Son bordro ID |

**İlişkiler:**
- `logs` → CheckBillLog[] (1:N)
- `account` → Account (N:1)
- `createdByUser` → User? (N:1)
- `deletedByUser` → User? (N:1)
- `collectionCashbox` → Cashbox? (N:1)
- `tenant` → Tenant? (N:1)
- `updatedByUser` → User? (N:1)
- `lastJournal` → CheckBillJournal? (N:1)
- `journalItems` → CheckBillJournalItem[] (1:N)

**İndeksler:**
- `@@index([tenantId])`
- `@@index([tenantId, dueDate])`
- `@@index([accountId])`
- `@@index([dueDate])`
- `@@index([status])`
- `@@index([type])`
- `@@index([portfolioType])`

**Map:** `checks_bills`

---

### 62. DeletedCheckBill (deleted_checks_bills)

**Açıklama:** Silinmiş çekler/senetler

| Kolon | Tip | Nullable | Varsayılan | Unique | İlişki | Açıklama |
|-------|------|----------|------------|---------|-----------|
| id | String | ❌ | uuid() | ✅ PK | Birincil anahtar |
| originalId | String | ❌ | - | ❌ | Orijinal ID |
| type | CheckBillType | ❌ | - | ❌ | Tip |
| portfolioType | PortfolioType | ❌ | - | ❌ | Portföy tipi |
| accountId | String | ❌ | - | ❌ | Cari hesap ID |
| accountName | String | ❌ | - | ❌ | Cari adı |
| amount | Decimal | ❌ | - | ❌ | Tutar |
| dueDate | DateTime | ❌ | - | ❌ | Vade tarihi |
| bank | String? | ✅ | - | ❌ | Banka |
| branch | String? | ✅ | - | ❌ | Şube |
| accountNo | String? | ✅ | - | ❌ | Hesap no |
| checkNo | String? | ✅ | - | ❌ | Çek no |
| serialNo | String? | ✅ | - | ❌ | Seri no |
| status | CheckBillStatus | ❌ | - | ❌ | Durum |
| collectionDate | DateTime? | ✅ | - | ❌ | Tahsilat tarihi |
| collectionCashboxId | String? | ✅ | - | ❌ | Tahsilat kasası ID |
| isEndorsed | Boolean | ❌ | - | ❌ | Devredildi mi |
| endorsementDate | DateTime? | ✅ | - | ❌ | Devretme tarihi |
| endorsedTo | String? | ✅ | - | ❌ | Kime devredildi |
| notes | String? | ✅ | - | ❌ | Notlar |
| originalCreatedBy | String? | ✅ | - | ❌ | Orijinal oluşturan |
| originalUpdatedBy | String? | ✅ | - | ❌ | Orijinal güncelleyen |
| originalCreatedAt | DateTime | ❌ | - | ❌ | Orijinal oluşturma tarihi |
| originalUpdatedAt | DateTime | ❌ | - | ❌ | Orijinal güncelleme tarihi |
| deletedBy | String? | ✅ | - | ✅ FK | Silen |
| deletedAt | DateTime | ✅ | now() | ❌ | Silme tarihi |
| deleteReason | String? | ✅ | - | ❌ | Silme nedeni |

**İlişkiler:**
- `deletedByUser` → User? (N:1)

**İndeksler:**
- `@@index([originalId])`
- `@@index([deletedAt])`
- `@@index([accountId])`

**Map:** `deleted_checks_bills`

---

### 63. CheckBillLog (check_bill_logs)

**Açıklama:** Çek/senet logları

| Kolon | Tip | Nullable | Varsayılan | Unique | İlişki | Açıklama |
|-------|------|----------|------------|---------|-----------|
| id | String | ❌ | uuid() | ✅ PK | Birincil anahtar |
| checkBillId | String | ❌ | - | ✅ FK | Çek/senet ID |
| userId | String? | ✅ | - | ✅ FK | Kullanıcı ID |
| actionType | LogAction | ❌ | - | ❌ | İşlem tipi |
| changes | String? | ✅ | - | ❌ | Değişiklikler |
| ipAddress | String? | ✅ | - | ❌ | IP adresi |
| userAgent | String? | ✅ | - | ❌ | User agent |
| createdAt | DateTime | ✅ | now() | ❌ | Oluşturma tarihi |

**İlişkiler:**
- `checkBill` → CheckBill (N:1)
- `user` → User? (N:1)

**İndeksler:**
- `@@index([checkBillId])`
- `@@index([userId])`

**Map:** `check_bill_logs`

---

### 64. Employee (employees)

**Açıklama:** Personeller

| Kolon | Tip | Nullable | Varsayılan | Unique | İlişki | Açıklama |
|-------|------|----------|------------|---------|-----------|
| id | String | ❌ | uuid() | ✅ PK | Birincil anahtar |
| employeeCode | String | ❌ | - | ✅ | Personel kodu (tenant ile) |
| tenantId | String? | ✅ | - | ❌ | Tenant ID |
| identityNumber | String? | ✅ | - | ✅ | TCKN (tenant ile) |
| firstName | String | ❌ | - | ❌ | Ad |
| lastName | String | ❌ | - | ❌ | Soyad |
| birthDate | DateTime? | ✅ | - | ❌ | Doğum tarihi |
| gender | Gender? | ✅ | - | ❌ | Cinsiyet |
| maritalStatus | MaritalStatus? | ✅ | - | ❌ | Medeni hal |
| phone | String? | ✅ | - | ❌ | Telefon |
| email | String? | ✅ | - | ❌ | E-posta |
| address | String? | ✅ | - | ❌ | Adres |
| city | String? | ✅ | - | ❌ | Şehir |
| district | String? | ✅ | - | ❌ | İlçe |
| position | String? | ✅ | - | ❌ | Pozisyon |
| department | String? | ✅ | - | ❌ | Departman |
| startDate | DateTime? | ✅ | - | ❌ | Başlangıç tarihi |
| endDate | DateTime? | ✅ | - | ❌ | Bitiş tarihi |
| isActive | Boolean | ✅ | true | ❌ | Aktif mi |
| salary | Decimal? | ✅ | - | ❌ | Maaş |
| salaryDay | Int? | ✅ | - | ❌ | Maaş günü |
| socialSecurityNo | String? | ✅ | - | ❌ | SGK no |
| iban | String? | ✅ | - | ❌ | IBAN |
| balance | Decimal | ✅ | 0 | ❌ | Bakiye |
| notes | String? | ✅ | - | ❌ | Notlar |
| createdBy | String? | ✅ | - | ✅ FK | Oluşturan |
| updatedBy | String? | ✅ | - | ✅ FK | Güncelleyen |
| createdAt | DateTime | ✅ | now() | ❌ | Oluşturma tarihi |
| updatedAt | DateTime | ✅ | - | ❌ | Güncelleme tarihi |
| bonus | Decimal? | ✅ | - | ❌ | Bonus |

**İlişkiler:**
- `payments` → EmployeePayment[] (1:N)
- `salaryPlans` → SalaryPlan[] (1:N)
- `salaryPayments` → SalaryPayment[] (1:N)
- `advances` → Advance[] (1:N)
- `companyVehicles` → CompanyVehicle[] (1:N)
- `createdByUser` → User? (N:1)
- `tenant` → Tenant? (N:1)
- `updatedByUser` → User? (N:1)

**İndeksler:**
- `@@unique([employeeCode, tenantId])`
- `@@unique([identityNumber, tenantId])`
- `@@index([tenantId])`
- `@@index([tenantId, employeeCode])`
- `@@index([isActive])`
- `@@index([department])`

**Map:** `employees`

---

### 65. EmployeePayment (employee_payments)

**Açıklama:** Personel ödemeleri

| Kolon | Tip | Nullable | Varsayılan | Unique | İlişki | Açıklama |
|-------|------|----------|------------|---------|-----------|
| id | String | ❌ | uuid() | ✅ PK | Birincil anahtar |
| employeeId | String | ❌ | - | ✅ FK | Personel ID |
| type | EmployeePaymentType | ❌ | - | ❌ | Ödeme tipi |
| amount | Decimal | ❌ | - | ❌ | Tutar |
| date | DateTime | ✅ | now() | ❌ | Tarih |
| period | String? | ✅ | - | ❌ | Dönem |
| notes | String? | ✅ | - | ❌ | Notlar |
| cashboxId | String? | ✅ | - | ✅ FK | Kasa ID |
| createdBy | String? | ✅ | - | ✅ FK | Oluşturan |
| createdAt | DateTime | ✅ | now() | ❌ | Oluşturma tarihi |

**İlişkiler:**
- `createdByUser` → User? (N:1)
- `cashbox` → Cashbox? (N:1)
- `employee` → Employee (N:1)

**İndeksler:**
- `@@index([employeeId])`
- `@@index([date])`
- `@@index([type])`

**Map:** `employee_payments`

---

### 66. CodeTemplate (code_templates)

**Açıklama:** Kod şablonları

| Kolon | Tip | Nullable | Varsayılan | Unique | İlişki | Açıklama |
|-------|------|----------|------------|---------|-----------|
| id | String | ❌ | cuid() | ✅ PK | Birincil anahtar |
| tenantId | String | ❌ | - | ✅ FK | Tenant ID |
| module | ModuleType | ❌ | - | ✅ | Modül (tenant ile) |
| name | String | ❌ | - | ❌ | Şablon adı |
| prefix | String | ❌ | - | ❌ | Önek |
| digitCount | Int | ✅ | 3 | ❌ | Hane sayısı |
| currentValue | Int | ✅ | 0 | ❌ | Mevcut değer |
| includeYear | Boolean | ✅ | true | ❌ | Yıl ekle mi |
| isActive | Boolean | ✅ | true | ❌ | Aktif mi |
| createdAt | DateTime | ✅ | now() | ❌ | Oluşturma tarihi |
| updatedAt | DateTime | ✅ | - | ❌ | Güncelleme tarihi |

**İlişkiler:**
- `tenant` → Tenant (N:1)

**İndeksler:**
- `@@unique([module, tenantId])`

**Map:** `code_templates`

---

### 67. VehicleCatalog (vehicle_catalog)

**Açıklama:** Araç kataloğu (sistem tablosu)

| Kolon | Tip | Nullable | Varsayılan | Unique | İlişki | Açıklama |
|-------|------|----------|------------|---------|-----------|
| id | String | ❌ | uuid() | ✅ PK | Birincil anahtar |
| brand | String | ❌ | - | ✅ | Marka (tür ile) |
| model | String | ❌ | - | ✅ | Model (marka ile) |
| engineVolume | String | ❌ | - | ✅ | Motor hacmi |
| fuelType | String | ❌ | - | ✅ | Yakıt türü |
| createdAt | DateTime | ✅ | now() | ❌ | Oluşturma tarihi |
| updatedAt | DateTime | ✅ | - | ❌ | Güncelleme tarihi |

**İndeksler:**
- `@@unique([brand, model, engineVolume, fuelType])`
- `@@index([brand])`
- `@@index([model])`
- `@@index([fuelType])`

**Map:** `vehicle_catalog`

---

### 68. PurchaseOrder (purchase_orders)

**Açıklama:** Satın alma siparişleri

| Kolon | Tip | Nullable | Varsayılan | Unique | İlişki | Açıklama |
|-------|------|----------|------------|---------|-----------|
| id | String | ❌ | uuid() | ✅ PK | Birincil anahtar |
| orderNumber | String | ❌ | - | ✅ | Sipariş no (tenant ile) |
| tenantId | String? | ✅ | - | ❌ | Tenant ID |
| supplierId | String | ❌ | - | ✅ FK | Tedarikçi ID |
| orderDate | DateTime | ✅ | now() | ❌ | Sipariş tarihi |
| expectedDeliveryDate | DateTime? | ✅ | - | ❌ | Tahmini teslimat tarihi |
| status | OrderStatus | ✅ | PENDING | ❌ | Durum |
| totalAmount | Decimal | ❌ | - | ❌ | Toplam tutar |
| notes | String? | ✅ | - | ❌ | Notlar |
| createdAt | DateTime | ✅ | now() | ❌ | Oluşturma tarihi |
| updatedAt | DateTime | ✅ | - | ❌ | Güncelleme tarihi |

**İlişkiler:**
- `invoices` → Invoice? (1:1)
- `items` → PurchaseOrderItem[] (1:N)
- `supplier` → Account (N:1)
- `tenant` → Tenant? (N:1)

**İndeksler:**
- `@@unique([orderNumber, tenantId])`
- `@@index([tenantId])`
- `@@index([tenantId, orderNumber])`
- `@@index([supplierId])`
- `@@index([status])`
- `@@index([orderDate])`

**Map:** `purchase_orders`

---

### 69. PurchaseOrderItem (purchase_order_items)

**Açıklama:** Satın alma siparişi kalemleri

| Kolon | Tip | Nullable | Varsayılan | Unique | İlişki | Açıklama |
|-------|------|----------|------------|---------|-----------|
| id | String | ❌ | uuid() | ✅ PK | Birincil anahtar |
| purchaseOrderId | String | ❌ | - | ✅ FK | Sipariş ID |
| productId | String | ❌ | - | ✅ FK | Ürün ID |
| orderedQuantity | Int | ❌ | - | ❌ | Sipariş miktarı |
| receivedQuantity | Int | ✅ | 0 | ❌ | Teslim miktarı |
| unitPrice | Decimal | ❌ | - | ❌ | Birim fiyat |
| status | OrderItemStatus | ✅ | PENDING | ❌ | Durum |
| createdAt | DateTime | ✅ | now() | ❌ | Oluşturma tarihi |

**İlişkiler:**
- `invoiceItems` → InvoiceItem[] (1:N)
- `product` → Product (N:1)
- `purchaseOrder` → PurchaseOrder (N:1)

**İndeksler:**
- `@@index([purchaseOrderId])`
- `@@index([productId])`

**Map:** `purchase_order_items`

---

### 70. SimpleOrder (simple_orders)

**Açıklama:** Basit siparişler

| Kolon | Tip | Nullable | Varsayılan | Unique | İlişki | Açıklama |
|-------|------|----------|------------|---------|-----------|
| id | String | ❌ | uuid() | ✅ PK | Birincil anahtar |
| tenantId | String? | ✅ | - | ❌ | Tenant ID |
| companyId | String | ❌ | - | ✅ FK | Şirket ID |
| productId | String | ❌ | - | ✅ FK | Ürün ID |
| quantity | Int | ❌ | - | ❌ | Miktar |
| status | SimpleOrderStatus | ✅ | AWAITING_APPROVAL | ❌ | Durum |
| createdAt | DateTime | ✅ | now() | ❌ | Oluşturma tarihi |
| updatedAt | DateTime | ✅ | - | ❌ | Güncelleme tarihi |
| suppliedQuantity | Int | ✅ | 0 | ❌ | Temin edilen miktar |

**İlişkiler:**
- `company` → Account (N:1)
- `tenant` → Tenant? (N:1)
- `product` → Product (N:1)

**İndeksler:**
- `@@index([tenantId])`
- `@@index([tenantId, companyId])`
- `@@index([tenantId, productId])`
- `@@index([companyId])`
- `@@index([productId])`
- `@@index([status])`
- `@@index([createdAt])`

**Map:** `simple_orders`

---

### 71. ProcurementOrder (procurement_orders)

**Açıklama:** Satın alma siparişleri (yerel)

| Kolon | Tip | Nullable | Varsayılan | Unique | İlişki | Açıklama |
|-------|------|----------|------------|---------|-----------|
| id | String | ❌ | uuid() | ✅ PK | Birincil anahtar |
| orderNo | String | ❌ | - | ❌ | Sipariş no |
| date | DateTime | ✅ | now() | ❌ | Tarih |
| tenantId | String? | ✅ | - | ❌ | Tenant ID |
| accountId | String | ❌ | - | ✅ FK | Cari hesap ID |
| status | PurchaseOrderLocalStatus | ✅ | PENDING | ❌ | Durum |
| totalAmount | Decimal | ❌ | - | ❌ | Toplam tutar |
| vatAmount | Decimal | ❌ | - | ❌ | KDV tutarı |
| grandTotal | Decimal | ❌ | - | ❌ | Genel toplam |
| discount | Decimal | ✅ | 0 | ❌ | İndirim |
| notes | String? | ✅ | - | ❌ | Notlar |
| dueDate | DateTime? | ✅ | - | ❌ | Vade tarihi |
| invoiceNo | String? | ✅ | - | ❌ | Fatura no |
| createdBy | String? | ✅ | - | ✅ FK | Oluşturan |
| updatedBy | String? | ✅ | - | ✅ FK | Güncelleyen |
| deletedBy | String? | ✅ | - | ✅ FK | Silen |
| deletedAt | DateTime? | ✅ | - | ❌ | Silme tarihi |
| createdAt | DateTime | ✅ | now() | ❌ | Oluşturma tarihi |
| updatedAt | DateTime | ✅ | - | ❌ | Güncelleme tarihi |
| deliveryNoteId | String? | ✅ | - | ✅ | İrsaliye ID |

**İlişkiler:**
- `account` → Account (N:1)
- `createdByUser` → User? (N:1)
- `deletedByUser` → User? (N:1)
- `deliveryNote` → PurchaseDeliveryNote? (N:1)
- `tenant` → Tenant? (N:1)
- `updatedByUser` → User? (N:1)
- `items` → ProcurementOrderItem[] (1:N)
- `deliveryNotes` → PurchaseDeliveryNote[] (1:N)
- `invoices` → Invoice[] (1:N)
- `logs` → PurchaseOrderLocalLog[] (1:N)

**İndeksler:**
- `@@index([accountId])`
- `@@index([date])`
- `@@index([orderNo])`
- `@@index([status])`
- `@@index([tenantId])`

**Map:** `procurement_orders`

---

### 72. ProcurementOrderItem (purchase_order_local_items)

**Açıklama:** Satın alma siparişi kalemleri (yerel)

| Kolon | Tip | Nullable | Varsayılan | Unique | İlişki | Açıklama |
|-------|------|----------|------------|---------|-----------|
| id | String | ❌ | uuid() | ✅ PK | Birincil anahtar |
| orderId | String | ❌ | - | ✅ FK | Sipariş ID |
| productId | String | ❌ | - | ✅ FK | Ürün ID |
| quantity | Int | ❌ | - | ❌ | Miktar |
| deliveredQuantity | Int | ✅ | 0 | ❌ | Teslim miktarı |
| unitPrice | Decimal | ❌ | - | ❌ | Birim fiyat |
| vatRate | Int | ❌ | - | ❌ | KDV oranı |
| vatAmount | Decimal | ❌ | - | ❌ | KDV tutarı |
| amount | Decimal | ❌ | - | ❌ | Tutar |
| createdAt | DateTime | ✅ | now() | ❌ | Oluşturma tarihi |

**İlişkiler:**
- `order` → ProcurementOrder (N:1)
- `product` → Product (N:1)

**İndeksler:**
- `@@index([orderId])`
- `@@index([productId])`

**Map:** `purchase_order_local_items`

---

### 73. PurchaseOrderLocalLog (purchase_order_local_logs)

**Açıklama:** Satın alma siparişi logları (yerel)

| Kolon | Tip | Nullable | Varsayılan | Unique | İlişki | Açıklama |
|-------|------|----------|------------|---------|-----------|
| id | String | ❌ | uuid() | ✅ PK | Birincil anahtar |
| orderId | String | ❌ | - | ✅ FK | Sipariş ID |
| userId | String? | ✅ | - | ✅ FK | Kullanıcı ID |
| actionType | LogAction | ❌ | - | ❌ | İşlem tipi |
| changes | String? | ✅ | - | ❌ | Değişiklikler |
| ipAddress | String? | ✅ | - | ❌ | IP adresi |
| userAgent | String? | ✅ | - | ❌ | User agent |
| createdAt | DateTime | ✅ | now() | ❌ | Oluşturma tarihi |

**İlişkiler:**
- `order` → ProcurementOrder (N:1)
- `user` → User? (N:1)

**İndeksler:**
- `@@index([orderId])`
- `@@index([userId])`

**Map:** `purchase_order_local_logs`

---

### 74. PurchaseDeliveryNote (purchase_delivery_notes)

**Açıklama:** Satın alma irsaliyeleri

| Kolon | Tip | Nullable | Varsayılan | Unique | İlişki | Açıklama |
|-------|------|----------|------------|---------|-----------|
| id | String | ❌ | uuid() | ✅ PK | Birincil anahtar |
| deliveryNoteNo | String | ❌ | - | ✅ | İrsaliye no (tenant ile) |
| date | DateTime | ✅ | now() | ❌ | Tarih |
| tenantId | String? | ✅ | - | ❌ | Tenant ID |
| accountId | String | ❌ | - | ✅ FK | Cari hesap ID |
| warehouseId | String? | ✅ | - | ✅ FK | Depo ID |
| sourceType | DeliveryNoteSourceType | ❌ | - | ❌ | Kaynak tipi |
| sourceId | String? | ✅ | - | ❌ | Kaynak ID |
| status | DeliveryNoteStatus | ✅ | NOT_INVOICED | ❌ | Durum |
| subtotal | Decimal | ❌ | - | ❌ | Alt toplam |
| vatAmount | Decimal | ❌ | - | ❌ | KDV tutarı |
| grandTotal | Decimal | ❌ | - | ❌ | Genel toplam |
| discount | Decimal | ✅ | 0 | ❌ | İndirim |
| notes | String? | ✅ | - | ❌ | Notlar |
| createdBy | String? | ✅ | - | ✅ FK | Oluşturan |
| updatedBy | String? | ✅ | - | ✅ FK | Güncelleyen |
| deletedBy | String? | ✅ | - | ✅ FK | Silen |
| deletedAt | DateTime? | ✅ | - | ❌ | Silme tarihi |
| createdAt | DateTime | ✅ | now() | ❌ | Oluşturma tarihi |
| updatedAt | DateTime | ✅ | - | ❌ | Güncelleme tarihi |

**İlişkiler:**
- `invoice` → Invoice? (1:1)
- `account` → Account (N:1)
- `createdByUser` → User? (N:1)
- `deletedByUser` → User? (N:1)
- `warehouse` → Warehouse? (N:1)
- `sourceOrder` → ProcurementOrder? (N:1)
- `tenant` → Tenant? (N:1)
- `updatedByUser` → User? (N:1)
- `items` → PurchaseDeliveryNoteItem[] (1:N)
- `logs` → PurchaseDeliveryNoteLog[] (1:N)
- `orderFromDeliveryNote` → ProcurementOrder? (N:1)

**İndeksler:**
- `@@unique([deliveryNoteNo, tenantId])`
- `@@index([tenantId])`
- `@@index([date])`
- `@@index([accountId])`
- `@@index([status])`

**Map:** `purchase_delivery_notes`

---

### 75. PurchaseDeliveryNoteItem (purchase_delivery_note_items)

**Açıklama:** Satın alma irsaliyesi kalemleri

| Kolon | Tip | Nullable | Varsayılan | Unique | İlişki | Açıklama |
|-------|------|----------|------------|---------|-----------|
| id | String | ❌ | uuid() | ✅ PK | Birincil anahtar |
| tenantId | String? | ✅ | - | ❌ | Tenant ID |
| deliveryNoteId | String | ❌ | - | ✅ FK | İrsaliye ID |
| productId | String | ❌ | - | ✅ FK | Ürün ID |
| quantity | Int | ❌ | - | ❌ | Miktar |
| unitPrice | Decimal | ❌ | - | ❌ | Birim fiyat |
| vatRate | Int | ❌ | - | ❌ | KDV oranı |
| vatAmount | Decimal | ❌ | - | ❌ | KDV tutarı |
| totalAmount | Decimal | ❌ | - | ❌ | Tutar |
| createdAt | DateTime | ✅ | now() | ❌ | Oluşturma tarihi |
| updatedAt | DateTime | ✅ | - | ❌ | Güncelleme tarihi |

**İlişkiler:**
- `deliveryNote` → PurchaseDeliveryNote (N:1)
- `product` → Product (N:1)

**İndeksler:**
- `@@index([deliveryNoteId])`
- `@@index([productId])`
- `@@index([tenantId])`

**Map:** `purchase_delivery_note_items`

---

### 76. PurchaseDeliveryNoteLog (purchase_delivery_note_logs)

**Açıklama:** Satın alma irsaliyesi logları

| Kolon | Tip | Nullable | Varsayılan | Unique | İlişki | Açıklama |
|-------|------|----------|------------|---------|-----------|
| id | String | ❌ | uuid() | ✅ PK | Birincil anahtar |
| tenantId | String? | ✅ | - | ❌ | Tenant ID |
| deliveryNoteId | String | ❌ | - | ✅ FK | İrsaliye ID |
| userId | String? | ✅ | - | ✅ FK | Kullanıcı ID |
| actionType | LogAction | ❌ | - | ❌ | İşlem tipi |
| changes | String? | ✅ | - | ❌ | Değişiklikler |
| ipAddress | String? | ✅ | - | ❌ | IP adresi |
| userAgent | String? | ✅ | - | ❌ | User agent |
| createdAt | DateTime | ✅ | now() | ❌ | Oluşturma tarihi |

**İlişkiler:**
- `deliveryNote` → PurchaseDeliveryNote (N:1)
- `user` → User? (N:1)

**İndeksler:**
- `@@index([deliveryNoteId])`
- `@@index([userId])`
- `@@index([tenantId])`

**Map:** `purchase_delivery_note_logs`

---

### 77. Module (modules)

**Açıklama:** Modüller (sistem tablosu)

| Kolon | Tip | Nullable | Varsayılan | Unique | İlişki | Açıklama |
|-------|------|----------|------------|---------|-----------|
| id | String | ❌ | cuid() | ✅ PK | Birincil anahtar |
| name | String | ❌ | - | ❌ | Modül adı |
| slug | String | ❌ | - | ✅ | Modül slug |
| description | String? | ✅ | - | ❌ | Açıklama |
| price | Decimal | ❌ | - | ❌ | Fiyat |
| currency | String | ✅ | TRY | ❌ | Para birimi |
| isActive | Boolean | ✅ | true | ❌ | Aktif mi |
| createdAt | DateTime | ✅ | now() | ❌ | Oluşturma tarihi |
| updatedAt | DateTime | ✅ | - | ❌ | Güncelleme tarihi |

**İlişkiler:**
- `licenses` → ModuleLicense[] (1:N)
- `userLicenses` → UserLicense[] (1:N)

**İndeksler:**
- `@@index([slug])`
- `@@index([isActive])`

**Map:** `modules`

---

### 78. ModuleLicense (module_licenses)

**Açıklama:** Modül lisansları

| Kolon | Tip | Nullable | Varsayılan | Unique | İlişki | Açıklama |
|-------|------|----------|------------|---------|-----------|
| id | String | ❌ | cuid() | ✅ PK | Birincil anahtar |
| subscriptionId | String | ❌ | - | ✅ FK | Abonelik ID |
| moduleId | String | ❌ | - | ✅ FK | Modül ID |
| quantity | Int | ✅ | 1 | ❌ | Miktar |
| createdAt | DateTime | ✅ | now() | ❌ | Oluşturma tarihi |
| updatedAt | DateTime | ✅ | - | ❌ | Güncelleme tarihi |

**İlişkiler:**
- `module` → Module (N:1)
- `subscription` → Subscription (N:1)

**İndeksler:**
- `@@index([subscriptionId])`
- `@@index([moduleId])`

**Map:** `module_licenses`

---

### 79. UserLicense (user_licenses)

**Açıklama:** Kullanıcı lisansları

| Kolon | Tip | Nullable | Varsayılan | Unique | İlişki | Açıklama |
|-------|------|----------|------------|---------|-----------|
| id | String | ❌ | cuid() | ✅ PK | Birincil anahtar |
| userId | String | ❌ | - | ✅ FK | Kullanıcı ID |
| licenseType | LicenseType | ❌ | - | ❌ | Lisans tipi |
| moduleId | String? | ✅ | - | ✅ FK | Modül ID |
| assignedBy | String? | ✅ | - | ❌ | Atayan |
| assignedAt | DateTime | ✅ | now() | ❌ | Atama tarihi |
| revokedAt | DateTime? | ✅ | - | ❌ | İptal tarihi |
| revokedBy | String? | ✅ | - | ❌ | İptal eden |
| createdAt | DateTime | ✅ | now() | ❌ | Oluşturma tarihi |
| updatedAt | DateTime | ✅ | - | ❌ | Güncelleme tarihi |

**İlişkiler:**
- `module` → Module? (N:1)
- `user` → User (N:1)

**İndeksler:**
- `@@unique([userId, licenseType, moduleId])`
- `@@index([userId])`
- `@@index([moduleId])`
- `@@index([licenseType])`

**Map:** `user_licenses`

---

### 80. Invitation (invitations)

**Açıklama:** Davetler

| Kolon | Tip | Nullable | Varsayılan | Unique | İlişki | Açıklama |
|-------|------|----------|------------|---------|-----------|
| id | String | ❌ | cuid() | ✅ PK | Birincil anahtar |
| email | String | ❌ | - | ❌ | E-posta |
| tenantId | String | ❌ | - | ✅ FK | Tenant ID |
| invitedBy | String | ❌ | - | ❌ | Davet eden |
| token | String | ❌ | - | ✅ | Token |
| status | InvitationStatus | ✅ | PENDING | ❌ | Durum |
| expiresAt | DateTime | ❌ | - | ❌ | Son kullanma tarihi |
| acceptedAt | DateTime? | ✅ | - | ❌ | Kabul tarihi |
| acceptedBy | String? | ✅ | - | ❌ | Kabul eden |
| createdAt | DateTime | ✅ | now() | ❌ | Oluşturma tarihi |
| updatedAt | DateTime | ✅ | - | ❌ | Güncelleme tarihi |

**İlişkiler:**
- `tenant` → Tenant (N:1)

**İndeksler:**
- `@@index([email])`
- `@@index([tenantId])`
- `@@index([token])`
- `@@index([status])`

**Map:** `invitations`

---

### 81. HizliToken (hizli_tokens)

**Açıklama:** Hızlı tokenları

| Kolon | Tip | Nullable | Varsayılan | Unique | İlişki | Açıklama |
|-------|------|----------|------------|---------|-----------|
| id | Int | ❌ | autoincrement() | ✅ PK | Birincil anahtar |
| token | String | ❌ | - | ❌ | Token |
| loginHash | String | ❌ | - | ❌ | Login hash |
| generatedAt | DateTime | ✅ | now() | ❌ | Oluşturma tarihi |
| expiresAt | DateTime | ❌ | - | ❌ | Son kullanma tarihi |

**İndeksler:**
- `@@index([expiresAt])`
- `@@index([loginHash])`

**Map:** `hizli_tokens`

---

### 82. EInvoiceInbox (einvoice_inbox)

**Açıklama:** E-fatura gelen kutusu

| Kolon | Tip | Nullable | Varsayılan | Unique | İlişki | Açıklama |
|-------|------|----------|------------|---------|-----------|
| id | Int | ❌ | autoincrement() | ✅ PK | Birincil anahtar |
| ettn | String | ❌ | - | ✅ | ETNN |
| senderVkn | String | ❌ | - | ❌ | Gönderen VKN |
| senderTitle | String | ❌ | - | ❌ | Gönderen unvanı |
| invoiceNo | String? | ✅ | - | ❌ | Fatura no |
| invoiceDate | DateTime? | ✅ | - | ❌ | Fatura tarihi |
| rawXml | String? | ✅ | - | ❌ | Ham XML |
| createdAt | DateTime | ✅ | now() | ❌ | Oluşturma tarihi |

**İndeksler:**
- `@@index([senderVkn])`
- `@@index([createdAt])`

**Map:** `einvoice_inbox`

---

### 83. CustomerVehicle (customer_vehicles)

**Açıklama:** Müşteri araçları

| Kolon | Tip | Nullable | Varsayılan | Unique | İlişki | Açıklama |
|-------|------|----------|------------|---------|-----------|
| id | String | ❌ | uuid() | ✅ PK | Birincil anahtar |
| tenantId | String? | ✅ | - | ❌ | Tenant ID |
| accountId | String | ❌ | - | ✅ FK | Cari hesap ID |
| plate | String | ❌ | - | ✅ | Plaka (tenant ile) |
| brand | String | ❌ | - | ❌ | Marka |
| model | String | ❌ | - | ❌ | Model |
| year | Int? | ✅ | - | ❌ | Yıl |
| chassisno | String? | ✅ | - | ✅ | Şasi no (tenant ile) |
| enginePower | Int? | ✅ | - | ❌ | Motor gücü |
| engineSize | String? | ✅ | - | ❌ | Motor hacmi |
| fuelType | String? | ✅ | - | ❌ | Yakıt türü |
| transmission | String? | ✅ | - | ❌ | Şanzıman |
| color | String? | ✅ | - | ❌ | Renk |
| registrationDate | DateTime? | ✅ | - | ❌ | Tescil tarihi |
| registrationNo | String? | ✅ | - | ❌ | Tescil no |
| registrationOwner | String? | ✅ | - | ❌ | Tescil sahibi |
| mileage | Int? | ✅ | - | ❌ | Kilometre |
| notes | String? | ✅ | - | ❌ | Notlar |
| serviceStatus | VehicleServiceStatus? | ✅ | - | ❌ | Servis durumu |
| createdAt | DateTime | ✅ | now() | ❌ | Oluşturma tarihi |
| updatedAt | DateTime | ✅ | - | ❌ | Güncelleme tarihi |

**İlişkiler:**
- `account` → Account (N:1)
- `tenant` → Tenant? (N:1)
- `workOrders` → WorkOrder[] (1:N)

**İndeksler:**
- `@@unique([plate, tenantId])`
- `@@unique([chassisno, tenantId])`
- `@@index([tenantId])`
- `@@index([accountId])`
- `@@index([serviceStatus])`

**Map:** `customer_vehicles`

---

### 84. WorkOrder (work_orders)

**Açıklama:** İş emirleri

| Kolon | Tip | Nullable | Varsayılan | Unique | İlişki | Açıklama |
|-------|------|----------|------------|---------|-----------|
| id | String | ❌ | uuid() | ✅ PK | Birincil anahtar |
| workOrderNo | String | ❌ | - | ✅ | İş emri no (tenant ile) |
| tenantId | String? | ✅ | - | ❌ | Tenant ID |
| status | WorkOrderStatus | ✅ | WAITING_DIAGNOSIS | ❌ | Durum |
| partWorkflowStatus | PartWorkflowStatus | ✅ | NOT_STARTED | ❌ | Parça iş akışı durumu |
| vehicleWorkflowStatus | VehicleWorkflowStatus | ✅ | WAITING | ❌ | Araç iş akışı durumu |
| customerVehicleId | String | ❌ | - | ✅ FK | Müşteri araç ID |
| accountId | String | ❌ | - | ✅ FK | Cari hesap ID |
| technicianId | String? | ✅ | - | ✅ FK | Teknisyen ID |
| description | String? | ✅ | - | ❌ | Açıklama |
| diagnosisNotes | String? | ✅ | - | ❌ | Tanı notları |
| supplyResponseNotes | String? | ✅ | - | ❌ | Temin yanıt notları |
| estimatedCompletionDate | DateTime? | ✅ | - | ❌ | Tahmini tamamlanma tarihi |
| actualCompletionDate | DateTime? | ✅ | - | ❌ | Gerçek tamamlanma tarihi |
| totalLaborCost | Decimal | ✅ | 0 | ❌ | Toplam işçilik maliyeti |
| totalPartsCost | Decimal | ✅ | 0 | ❌ | Toplam parça maliyeti |
| taxAmount | Decimal | ✅ | 0 | ❌ | Vergi tutarı |
| grandTotal | Decimal | ✅ | 0 | ❌ | Genel toplam |
| version | Int | ✅ | 1 | ❌ | Sürüm |
| createdAt | DateTime | ✅ | now() | ❌ | Oluşturma tarihi |
| updatedAt | DateTime | ✅ | - | ❌ | Güncelleme tarihi |
| deletedAt | DateTime? | ✅ | - | ❌ | Silme tarihi |

**İlişkiler:**
- `account` → Account (N:1)
- `customerVehicle` → CustomerVehicle (N:1)
- `items` → WorkOrderItem[] (1:N)
- `partRequests` → PartRequest[] (1:N)
- `serviceInvoice` → ServiceInvoice? (1:1)
- `technician` → User? (N:1)
- `tenant` → Tenant? (N:1)
- `activities` → WorkOrderActivity[] (1:N)

**İndeksler:**
- `@@unique([workOrderNo, tenantId])`
- `@@index([tenantId])`
- `@@index([status])`
- `@@index([createdAt])`
- `@@index([accountId])`
- `@@index([technicianId])`

**Map:** `work_orders`

---

### 85. WorkOrderActivity (work_order_activities)

**Açıklama:** İş emri aktiviteleri

| Kolon | Tip | Nullable | Varsayılan | Unique | İlişki | Açıklama |
|-------|------|----------|------------|---------|-----------|
| id | String | ❌ | uuid() | ✅ PK | Birincil anahtar |
| workOrderId | String | ❌ | - | ✅ FK | İş emri ID |
| action | String | ❌ | - | ❌ | İşlem |
| userId | String? | ✅ | - | ✅ FK | Kullanıcı ID |
| metadata | Json? | ✅ | - | ❌ | Meta veriler |
| createdAt | DateTime | ✅ | now() | ❌ | Oluşturma tarihi |

**İlişkiler:**
- `workOrder` → WorkOrder (N:1)
- `user` → User? (N:1)

**İndeksler:**
- `@@index([workOrderId])`
- `@@index([workOrderId, createdAt])`

**Map:** `work_order_activities`

---

### 86. WorkOrderItem (work_order_items)

**Açıklama:** İş emri kalemleri

| Kolon | Tip | Nullable | Varsayılan | Unique | İlişki | Açıklama |
|-------|------|----------|------------|---------|-----------|
| id | String | ❌ | uuid() | ✅ PK | Birincil anahtar |
| workOrderId | String | ❌ | - | ✅ FK | İş emri ID |
| type | WorkOrderItemType | ❌ | - | ❌ | Tip |
| description | String | ❌ | - | ❌ | Açıklama |
| productId | String? | ✅ | - | ✅ FK | Ürün ID |
| quantity | Int | ✅ | 1 | ❌ | Miktar |
| unitPrice | Decimal | ❌ | - | ❌ | Birim fiyat |
| taxRate | Int | ✅ | 20 | ❌ | Vergi oranı |
| taxAmount | Decimal | ✅ | 0 | ❌ | Vergi tutarı |
| totalPrice | Decimal | ❌ | - | ❌ | Toplam fiyat |
| version | Int | ✅ | 1 | ❌ | Sürüm |
| createdAt | DateTime | ✅ | now() | ❌ | Oluşturma tarihi |
| updatedAt | DateTime | ✅ | - | ❌ | Güncelleme tarihi |

**İlişkiler:**
- `product` → Product? (N:1)
- `workOrder` → WorkOrder (N:1)

**İndeksler:**
- `@@index([workOrderId])`
- `@@index([productId])`

**Map:** `work_order_items`

---

### 87. PartRequest (part_requests)

**Açıklama:** Parça istekleri

| Kolon | Tip | Nullable | Varsayılan | Unique | İlişki | Açıklama |
|-------|------|----------|------------|---------|-----------|
| id | String | ❌ | uuid() | ✅ PK | Birincil anahtar |
| tenantId | String? | ✅ | - | ❌ | Tenant ID |
| workOrderId | String | ❌ | - | ✅ FK | İş emri ID |
| requestedBy | String | ❌ | - | ✅ FK | İsteyen |
| description | String | ❌ | - | ❌ | Açıklama |
| productId | String? | ✅ | - | ✅ FK | Ürün ID |
| requestedQty | Int | ✅ | 1 | ❌ | İstenen miktar |
| suppliedQty | Int? | ✅ | - | ❌ | Temin edilen miktar |
| status | PartRequestStatus | ✅ | REQUESTED | ❌ | Durum |
| version | Int | ✅ | 1 | ❌ | Sürüm |
| suppliedBy | String? | ✅ | - | ❌ | Temin eden |
| suppliedAt | DateTime? | ✅ | - | ❌ | Temin tarihi |
| usedAt | DateTime? | ✅ | - | ❌ | Kullanım tarihi |
| createdAt | DateTime | ✅ | now() | ❌ | Oluşturma tarihi |
| updatedAt | DateTime | ✅ | - | ❌ | Güncelleme tarihi |

**İlişkiler:**
- `inventoryTransactions` → InventoryTransaction[] (1:N)
- `requestedByUser` → User (N:1)
- `product` → Product? (N:1)
- `workOrder` → WorkOrder (N:1)
- `tenant` → Tenant? (N:1)

**İndeksler:**
- `@@index([tenantId])`
- `@@index([workOrderId])`
- `@@index([status])`

**Map:** `part_requests`

---

### 88. InventoryTransaction (inventory_transactions)

**Açıklama:** Envanter işlemleri

| Kolon | Tip | Nullable | Varsayılan | Unique | İlişki | Açıklama |
|-------|------|----------|------------|---------|-----------|
| id | String | ❌ | uuid() | ✅ PK | Birincil anahtar |
| tenantId | String? | ✅ | - | ❌ | Tenant ID |
| partRequestId | String | ❌ | - | ✅ FK | Parça isteği ID |
| productId | String | ❌ | - | ✅ FK | Ürün ID |
| warehouseId | String? | ✅ | - | ✅ FK | Depo ID |
| quantity | Int | ❌ | - | ❌ | Miktar |
| transactionType | InventoryTransactionType | ✅ | DEDUCTION | ❌ | İşlem tipi |
| createdAt | DateTime | ✅ | now() | ❌ | Oluşturma tarihi |

**İlişkiler:**
- `partRequest` → PartRequest (N:1)
- `product` → Product (N:1)
- `tenant` → Tenant? (N:1)
- `warehouse` → Warehouse? (N:1)

**İndeksler:**
- `@@index([tenantId])`
- `@@index([partRequestId])`
- `@@index([productId])`
- `@@index([tenantId, createdAt])`

**Map:** `inventory_transactions`

---

### 89. ServiceInvoice (service_invoices)

**Açıklama:** Servis faturaları

| Kolon | Tip | Nullable | Varsayılan | Unique | İlişki | Açıklama |
|-------|------|----------|------------|---------|-----------|
| id | String | ❌ | uuid() | ✅ PK | Birincil anahtar |
| tenantId | String? | ✅ | - | ❌ | Tenant ID |
| invoiceNo | String | ❌ | - | ✅ | Fatura no (tenant ile) |
| workOrderId | String | ❌ | - | ✅ | İş emri ID |
| accountId | String | ❌ | - | ✅ FK | Cari hesap ID |
| issueDate | DateTime | ✅ | now() | ❌ | Düzenleme tarihi |
| dueDate | DateTime? | ✅ | - | ❌ | Vade tarihi |
| subtotal | Decimal | ❌ | - | ❌ | Alt toplam |
| taxAmount | Decimal | ❌ | - | ❌ | Vergi tutarı |
| grandTotal | Decimal | ❌ | - | ❌ | Genel toplam |
| currency | String | ✅ | TRY | ❌ | Para birimi |
| createdBy | String? | ✅ | - | ✅ FK | Oluşturan |
| createdAt | DateTime | ✅ | now() | ❌ | Oluşturma tarihi |
| updatedAt | DateTime | ✅ | - | ❌ | Güncelleme tarihi |

**İlişkiler:**
- `account` → Account (N:1)
- `createdByUser` → User? (N:1)
- `journalEntry` → JournalEntry? (1:1)
- `tenant` → Tenant? (N:1)
- `workOrder` → WorkOrder (N:1)
- `collections` → Collection[] (1:N)

**İndeksler:**
- `@@unique([invoiceNo, tenantId])`
- `@@index([tenantId])`
- `@@index([issueDate])`
- `@@index([accountId])`

**Map:** `service_invoices`

---

### 90. JournalEntry (journal_entries)

**Açıklama:** Yevmiye girişleri

| Kolon | Tip | Nullable | Varsayılan | Unique | İlişki | Açıklama |
|-------|------|----------|------------|---------|-----------|
| id | String | ❌ | uuid() | ✅ PK | Birincil anahtar |
| tenantId | String? | ✅ | - | ❌ | Tenant ID |
| referenceType | String | ❌ | - | ❌ | Referans tipi |
| referenceId | String | ❌ | - | ❌ | Referans ID |
| serviceInvoiceId | String? | ✅ | - | ✅ | Servis fatura ID |
| entryDate | DateTime | ✅ | now() | ❌ | Giriş tarihi |
| description | String? | ✅ | - | ❌ | Açıklama |
| createdAt | DateTime | ✅ | now() | ❌ | Oluşturma tarihi |
| createdBy | String? | ✅ | - | ❌ | Oluşturan |

**İlişkiler:**
- `lines` → JournalEntryLine[] (1:N)
- `serviceInvoice` → ServiceInvoice? (N:1)
- `tenant` → Tenant? (N:1)
- `createdByUser` → User? (N:1)

**İndeksler:**
- `@@index([tenantId])`
- `@@index([tenantId, referenceType, referenceId])`
- `@@index([entryDate])`

**Map:** `journal_entries`

---

### 91. JournalEntryLine (journal_entry_lines)

**Açıklama:** Yevmiye giriş kalemleri

| Kolon | Tip | Nullable | Varsayılan | Unique | İlişki | Açıklama |
|-------|------|----------|------------|---------|-----------|
| id | String | ❌ | uuid() | ✅ PK | Birincil anahtar |
| journalEntryId | String | ❌ | - | ✅ FK | Yevmiye giriş ID |
| accountCode | String | ❌ | - | ❌ | Cari kodu |
| accountName | String | ❌ | - | ❌ | Cari adı |
| debit | Decimal | ✅ | 0 | ❌ | Borç |
| credit | Decimal | ✅ | 0 | ❌ | Alacak |
| description | String? | ✅ | - | ❌ | Açıklama |

**İlişkiler:**
- `journalEntry` → JournalEntry (N:1)

**İndeksler:**
- `@@index([journalEntryId])`

**Map:** `journal_entry_lines`

---

### 92. CompanyCreditCardReminder (company_credit_card_reminders)

**Açıklama:** Firma kredi kartı hatırlatıcıları (zaten yukarıda listelendi)

---

### 93. InvoiceProfit (invoice_profit)

**Açıklama:** Fatura karları

| Kolon | Tip | Nullable | Varsayılan | Unique | İlişki | Açıklama |
|-------|------|----------|------------|---------|-----------|
| id | String | ❌ | uuid() | ✅ PK | Birincil anahtar |
| invoiceId | String | ❌ | - | ✅ FK | Fatura ID |
| invoiceItemId | String? | ✅ | - | ✅ FK | Fatura kalemi ID |
| productId | String | ❌ | - | ✅ FK | Ürün ID |
| tenantId | String? | ✅ | - | ❌ | Tenant ID |
| quantity | Int | ❌ | - | ❌ | Miktar |
| unitPrice | Decimal | ❌ | - | ❌ | Birim fiyat |
| unitCost | Decimal | ❌ | - | ❌ | Birim maliyet |
| totalSalesAmount | Decimal | ❌ | - | ❌ | Toplam satış tutarı |
| totalCost | Decimal | ❌ | - | ❌ | Toplam maliyet |
| profit | Decimal | ❌ | - | ❌ | Kar |
| profitRate | Decimal | ❌ | - | ❌ | Kar oranı |
| computedAt | DateTime | ✅ | now() | ❌ | Hesaplama tarihi |
| updatedAt | DateTime | ✅ | - | ❌ | Güncelleme tarihi |

**İlişkiler:**
- `invoice` → Invoice (N:1)
- `invoiceItem` → InvoiceItem? (N:1)
- `product` → Product (N:1)
- `tenants` → Tenant? (N:1)

**İndeksler:**
- `@@index([invoiceId])`
- `@@index([invoiceItemId])`
- `@@index([productId])`
- `@@index([tenantId, invoiceId])`

**Map:** `invoice_profit`

---

### 94. PostalCode (postal_codes)

**Açıklama:** Posta kodları (sistem tablosu)

| Kolon | Tip | Nullable | Varsayılan | Unique | İlişki | Açıklama |
|-------|------|----------|------------|---------|-----------|
| id | String | ❌ | uuid() | ✅ PK | Birincil anahtar |
| city | String | ❌ | - | ❌ | Şehir |
| district | String | ❌ | - | ❌ | İlçe |
| neighborhood | String | ❌ | - | ❌ | Mahalle |
| postalCode | String | ❌ | - | ❌ | Posta kodu |
| createdAt | DateTime | ✅ | now() | ❌ | Oluşturma tarihi |
| updatedAt | DateTime | ✅ | - | ❌ | Güncelleme tarihi |

**İndeksler:**
- `@@unique([city, district, neighborhood])`
- `@@index([city, district])`
- `@@index([city, district, neighborhood])`
- `@@index([city])`
- `@@index([district])`
- `@@index([neighborhood])`
- `@@index([postalCode])`

**Map:** `postal_codes`

---

### 95. SystemParameter (system_parameters)

**Açıklama:** Sistem parametreleri

| Kolon | Tip | Nullable | Varsayılan | Unique | İlişki | Açıklama |
|-------|------|----------|------------|---------|-----------|
| id | String | ❌ | uuid() | ✅ PK | Birincil anahtar |
| tenantId | String? | ✅ | - | ✅ FK | Tenant ID |
| key | String | ❌ | - | ❌ | Anahtar |
| value | Json | ❌ | - | ❌ | Değer |
| description | String? | ✅ | - | ❌ | Açıklama |
| category | String? | ✅ | - | ❌ | Kategori |
| createdAt | DateTime | ✅ | now() | ❌ | Oluşturma tarihi |
| updatedAt | DateTime | ✅ | - | ❌ | Güncelleme tarihi |

**İlişkiler:**
- `tenants` → Tenant? (N:1)

**İndeksler:**
- `@@unique([tenantId, key])`
- `@@index([category])`
- `@@index([tenantId])`

**Map:** `system_parameters`

---

### 96. WarehouseCriticalStock (warehouse_critical_stocks)

**Açıklama:** Depo kritik stokları

| Kolon | Tip | Nullable | Varsayılan | Unique | İlişki | Açıklama |
|-------|------|----------|------------|---------|-----------|
| id | String | ❌ | uuid() | ✅ PK | Birincil anahtar |
| warehouseId | String | ❌ | - | ✅ FK | Depo ID |
| productId | String | ❌ | - | ✅ FK | Ürün ID |
| criticalQty | Int | ✅ | 0 | ❌ | Kritik miktar |
| createdAt | DateTime | ✅ | now() | ❌ | Oluşturma tarihi |
| updatedAt | DateTime | ✅ | - | ❌ | Güncelleme tarihi |

**İlişkiler:**
- `product` → Product (N:1)
- `warehouse` → Warehouse (N:1)

**İndeksler:**
- `@@unique([warehouseId, productId])`
- `@@index([productId])`
- `@@index([warehouseId])`

**Map:** `warehouse_critical_stocks`

---

### 97. WarehouseTransferItem (warehouse_transfer_items)

**Açıklama:** Depo transferi kalemleri

| Kolon | Tip | Nullable | Varsayılan | Unique | İlişki | Açıklama |
|-------|------|----------|------------|---------|-----------|
| id | String | ❌ | uuid() | ✅ PK | Birincil anahtar |
| transferId | String | ❌ | - | ✅ FK | Transfer ID |
| productId | String | ❌ | - | ✅ FK | Ürün ID |
| quantity | Int | ❌ | - | ❌ | Miktar |
| fromLocationId | String? | ✅ | - | ✅ FK | Kaynak konum ID |
| toLocationId | String? | ✅ | - | ✅ FK | Hedef konum ID |
| createdAt | DateTime | ✅ | now() | ❌ | Oluşturma tarihi |

**İlişkiler:**
- `fromLocation` → Location? (N:1)
- `product` → Product (N:1)
- `toLocation` → Location? (N:1)
- `transfer` → WarehouseTransfer (N:1)

**İndeksler:**
- `@@index([productId])`
- `@@index([transferId])`

**Map:** `warehouse_transfer_items`

---

### 98. WarehouseTransferLog (warehouse_transfer_logs)

**Açıklama:** Depo transferi logları

| Kolon | Tip | Nullable | Varsayılan | Unique | İlişki | Açıklama |
|-------|------|----------|------------|---------|-----------|
| id | String | ❌ | uuid() | ✅ PK | Birincil anahtar |
| transferId | String | ❌ | - | ✅ FK | Transfer ID |
| userId | String? | ✅ | - | ✅ FK | Kullanıcı ID |
| actionType | LogAction | ❌ | - | ❌ | İşlem tipi |
| changes | String? | ✅ | - | ❌ | Değişiklikler |
| ipAddress | String? | ✅ | - | ❌ | IP adresi |
| userAgent | String? | ✅ | - | ❌ | User agent |
| createdAt | DateTime | ✅ | now() | ❌ | Oluşturma tarihi |

**İlişkiler:**
- `transfer` → WarehouseTransfer (N:1)
- `user` → User? (N:1)

**İndeksler:**
- `@@index([transferId])`
- `@@index([userId])`

**Map:** `warehouse_transfer_logs`

---

### 99. WarehouseTransfer (warehouse_transfers)

**Açıklama:** Depo transferleri

| Kolon | Tip | Nullable | Varsayılan | Unique | İlişki | Açıklama |
|-------|------|----------|------------|---------|-----------|
| id | String | ❌ | uuid() | ✅ PK | Birincil anahtar |
| transferNo | String | ❌ | - | ✅ | Transfer no (tenant ile) |
| tenantId | String? | ✅ | - | ❌ | Tenant ID |
| date | DateTime | ✅ | now() | ❌ | Tarih |
| fromWarehouseId | String | ❌ | - | ✅ FK | Kaynak depo ID |
| toWarehouseId | String | ❌ | - | ✅ FK | Hedef depo ID |
| status | TransferStatus | ✅ | PREPARING | ❌ | Durum |
| driverName | String? | ✅ | - | ❌ | Sürücü adı |
| vehiclePlate | String? | ✅ | - | ❌ | Araç plakası |
| notes | String? | ✅ | - | ❌ | Notlar |
| preparedById | String? | ✅ | - | ✅ FK | Hazırlayan |
| approvedById | String? | ✅ | - | ✅ FK | Onaylayan |
| receivedById | String? | ✅ | - | ✅ FK | Teslim alan |
| shippingDate | DateTime? | ✅ | - | ❌ | Sevkiyat tarihi |
| deliveryDate | DateTime? | ✅ | - | ❌ | Teslimat tarihi |
| createdBy | String? | ✅ | - | ❌ | Oluşturan |
| updatedBy | String? | ✅ | - | ❌ | Güncelleyen |
| deletedAt | DateTime? | ✅ | - | ❌ | Silme tarihi |
| deletedBy | String? | ✅ | - | ❌ | Silen |
| createdAt | DateTime | ✅ | now() | ❌ | Oluşturma tarihi |
| updatedAt | DateTime | ✅ | - | ❌ | Güncelleme tarihi |

**İlişkiler:**
- `items` → WarehouseTransferItem[] (1:N)
- `logs` → WarehouseTransferLog[] (1:N)
- `createdByUser` → User? (N:1)
- `deletedByUser` → User? (N:1)
- `fromWarehouse` → Warehouse (N:1)
- `preparedByUser` → User? (N:1)
- `approvedByUser` → User? (N:1)
- `tenant` → Tenant? (N:1)
- `receivedByUser` → User? (N:1)
- `toWarehouse` → Warehouse (N:1)
- `updatedByUser` → User? (N:1)

**İndeksler:**
- `@@unique([transferNo, tenantId])`
- `@@index([fromWarehouseId])`
- `@@index([tenantId, status])`
- `@@index([tenantId])`
- `@@index([toWarehouseId])`

**Map:** `warehouse_transfers`

---

### 100. SalesAgent (sales_agents)

**Açıklama:** Satış temsilcileri

| Kolon | Tip | Nullable | Varsayılan | Unique | İlişki | Açıklama |
|-------|------|----------|------------|---------|-----------|
| id | String | ❌ | uuid() | ✅ PK | Birincil anahtar |
| fullName | String | ❌ | - | ❌ | Tam ad |
| phone | String? | ✅ | - | ❌ | Telefon |
| email | String? | ✅ | - | ❌ | E-posta |
| isActive | Boolean | ✅ | true | ❌ | Aktif mi |
| tenantId | String? | ✅ | - | ❌ | Tenant ID |
| createdAt | DateTime | ✅ | now() | ❌ | Oluşturma tarihi |
| updatedAt | DateTime | ✅ | - | ❌ | Güncelleme tarihi |

**İlişkiler:**
- `accounts` → Account[] (1:N)
- `invoices` → Invoice[] (1:N)
- `collections` → Collection[] (1:N)
- `tenant` → Tenant? (N:1)

**İndeksler:**
- `@@index([tenantId])`

**Map:** `sales_agents`

---

### 101. Role (roles)

**Açıklama:** Roller

| Kolon | Tip | Nullable | Varsayılan | Unique | İlişki | Açıklama |
|-------|------|----------|------------|---------|-----------|
| id | String | ❌ | uuid() | ✅ PK | Birincil anahtar |
| name | String | ❌ | - | ❌ | Rol adı |
| description | String? | ✅ | - | ❌ | Açıklama |
| isSystemRole | Boolean | ✅ | false | ❌ | Sistem rolü mü |
| tenantId | String? | ✅ | - | ❌ | Tenant ID ⚠️ NULLABLE! |
| createdAt | DateTime | ✅ | now() | ❌ | Oluşturma tarihi |
| updatedAt | DateTime | ✅ | - | ❌ | Güncelleme tarihi |

**İlişkiler:**
- `users` → User[] (1:N)
- `permissions` → RolePermission[] (1:N)
- `tenant` → Tenant? (N:1)

**İndeksler:**
- `@@unique([tenantId, name])`
- `@@index([tenantId])`

**Map:** `roles`

---

### 102. Permission (permissions)

**Açıklama:** İzinler (sistem tablosu)

| Kolon | Tip | Nullable | Varsayılan | Unique | İlişki | Açıklama |
|-------|------|----------|------------|---------|-----------|
| id | String | ❌ | uuid() | ✅ PK | Birincil anahtar |
| module | String | ❌ | - | ❌ | Modül |
| action | String | ❌ | - | ✅ | İşlem (modül ile) |
| description | String? | ✅ | - | ❌ | Açıklama |
| createdAt | DateTime | ✅ | now() | ❌ | Oluşturma tarihi |

**İlişkiler:**
- `roles` → RolePermission[] (1:N)

**İndeksler:**
- `@@unique([module, action])`

**Map:** `permissions`

---

### 103. RolePermission (role_permissions)

**Açıklama:** Rol izinleri

| Kolon | Tip | Nullable | Varsayılan | Unique | İlişki | Açıklama |
|-------|------|----------|------------|---------|-----------|
| id | String | ❌ | uuid() | ✅ PK | Birincil anahtar |
| roleId | String | ❌ | - | ✅ FK | Rol ID |
| permissionId | String | ❌ | - | ✅ FK | İzin ID |
| createdAt | DateTime | ✅ | now() | ❌ | Oluşturma tarihi |

**İlişkiler:**
- `role` → Role (N:1)
- `permission` → Permission (N:1)

**İndeksler:**
- `@@unique([roleId, permissionId])`

**Map:** `role_permissions`

---

### 104. TenantPurgeAudit (tenant_purge_audits)

**Açıklama:** Tenant veri silme denetimleri

| Kolon | Tip | Nullable | Varsayılan | Unique | İlişki | Açıklama |
|-------|------|----------|------------|---------|-----------|
| id | String | ❌ | uuid() | ✅ PK | Birincil anahtar |
| tenantId | String | ❌ | - | ✅ FK | Tenant ID |
| adminId | String | ❌ | - | ❌ | Yönetici ID |
| adminEmail | String | ❌ | - | ❌ | Yönetici e-posta |
| ipAddress | String | ❌ | - | ❌ | IP adresi |
| deletedFiles | Int | ✅ | 0 | ❌ | Silinen dosya sayısı |
| errors | Json? | ✅ | - | ❌ | Hatalar |
| createdAt | DateTime | ✅ | now() | ❌ | Oluşturma tarihi |

**İlişkiler:**
- `tenant` → Tenant (N:1)

**İndeksler:**
- `@@index([tenantId])`
- `@@index([adminId])`
- `@@index([createdAt])`

**Map:** `tenant_purge_audits`

---

### 105. CompanyVehicle (company_vehicles)

**Açıklama:** Firma araçları

| Kolon | Tip | Nullable | Varsayılan | Unique | İlişki | Açıklama |
|-------|------|----------|------------|---------|-----------|
| id | String | ❌ | uuid() | ✅ PK | Birincil anahtar |
| tenantId | String? | ✅ | - | ❌ | Tenant ID |
| plate | String | ❌ | - | ✅ | Plaka (tenant ile) |
| brand | String | ❌ | - | ❌ | Marka |
| model | String | ❌ | - | ❌ | Model |
| year | Int? | ✅ | - | ❌ | Yıl |
| chassisno | String? | ✅ | - | ❌ | Şasi no |
| engineNo | String? | ✅ | - | ❌ | Motor no |
| registrationDate | DateTime? | ✅ | - | ❌ | Tescil tarihi |
| vehicleType | String? | ✅ | - | ❌ | Araç tipi |
| fuelType | String? | ✅ | - | ❌ | Yakıt türü |
| isActive | Boolean | ✅ | true | ❌ | Aktif mi |
| assignedEmployeeId | String? | ✅ | - | ✅ FK | Atanan personel ID |
| registrationImageUrl | String? | ✅ | - | ❌ | Tescil görseli URL |
| notes | String? | ✅ | - | ❌ | Notlar |
| createdAt | DateTime | ✅ | now() | ❌ | Oluşturma tarihi |
| updatedAt | DateTime | ✅ | - | ❌ | Güncelleme tarihi |
| deletedAt | DateTime? | ✅ | - | ❌ | Silme tarihi |

**İlişkiler:**
- `tenant` → Tenant? (N:1)
- `assignedEmployee` → Employee? (N:1)
- `expenses` → VehicleExpense[] (1:N)

**İndeksler:**
- `@@unique([plate, tenantId])`
- `@@index([tenantId])`
- `@@index([assignedEmployeeId])`

**Map:** `company_vehicles`

---

### 106. VehicleExpense (vehicle_expenses)

**Açıklama:** Araç giderleri

| Kolon | Tip | Nullable | Varsayılan | Unique | İlişki | Açıklama |
|-------|------|----------|------------|---------|-----------|
| id | String | ❌ | uuid() | ✅ PK | Birincil anahtar |
| tenantId | String? | ✅ | - | ❌ | Tenant ID |
| vehicleId | String | ❌ | - | ✅ FK | Araç ID |
| expenseType | VehicleExpenseType | ❌ | - | ❌ | Gider tipi |
| date | DateTime | ✅ | now() | ❌ | Tarih |
| amount | Decimal | ❌ | - | ❌ | Tutar |
| notes | String? | ✅ | - | ❌ | Notlar |
| documentNo | String? | ✅ | - | ❌ | Belge no |
| mileage | Int? | ✅ | - | ❌ | Kilometre |
| createdAt | DateTime | ✅ | now() | ❌ | Oluşturma tarihi |
| updatedAt | DateTime | ✅ | - | ❌ | Güncelleme tarihi |
| deletedAt | DateTime? | ✅ | - | ❌ | Silme tarihi |

**İlişkiler:**
- `tenant` → Tenant? (N:1)
- `vehicle` → CompanyVehicle (N:1)

**İndeksler:**
- `@@index([tenantId])`
- `@@index([vehicleId])`
- `@@index([date])`

**Map:** `vehicle_expenses`

---

### 107. UnitSet (unit_sets)

**Açıklama:** Birim setleri ⚠️ TENANT ID YOK!

| Kolon | Tip | Nullable | Varsayılan | Unique | İlişki | Açıklama |
|-------|------|----------|------------|---------|-----------|
| id | String | ❌ | uuid() | ✅ PK | Birincil anahtar |
| tenantId | String | ❌ | - | ✅ FK | Tenant ID |
| name | String | ❌ | - | ❌ | Set adı |
| description | String? | ✅ | - | ❌ | Açıklama |
| createdAt | DateTime | ✅ | now() | ❌ | Oluşturma tarihi |
| updatedAt | DateTime | ✅ | - | ❌ | Güncelleme tarihi |

**İlişkiler:**
- `units` → Unit[] (1:N)
- `tenant` → Tenant (N:1)

**İndeksler:**
- `@@index([tenantId])`

**Map:** `unit_sets`

---

### 108. Unit (units)

**Açıklama:** Birimler ⚠️ TENANT ID YOK!

| Kolon | Tip | Nullable | Varsayılan | Unique | İlişki | Açıklama |
|-------|------|----------|------------|---------|-----------|
| id | String | ❌ | uuid() | ✅ PK | Birincil anahtar |
| unitSetId | String | ❌ | - | ✅ FK | Birim seti ID |
| name | String | ❌ | - | ❌ | Birim adı |
| code | String? | ✅ | - | ❌ | GIB birim kodu |
| conversionRate | Decimal | ✅ | 1 | ❌ | Dönüşüm oranı |
| isBaseUnit | Boolean | ✅ | false | ❌ | Temel birim mi |
| createdAt | DateTime | ✅ | now() | ❌ | Oluşturma tarihi |
| updatedAt | DateTime | ✅ | - | ❌ | Güncelleme tarihi |

**İlişkiler:**
- `unitSet` → UnitSet (N:1)
- `products` → Product[] (1:N)

**İndeksler:**
- `@@index([unitSetId])`

**Map:** `units`

---

### 109. PriceList (price_lists)

**Açıklama:** Fiyat listeleri

| Kolon | Tip | Nullable | Varsayılan | Unique | İlişki | Açıklama |
|-------|------|----------|------------|---------|-----------|
| id | String | ❌ | uuid() | ✅ PK | Birincil anahtar |
| name | String | ❌ | - | ❌ | Fiyat listesi adı |
| tenantId | String? | ✅ | - | ✅ FK | Tenant ID |
| startDate | DateTime? | ✅ | - | ❌ | Başlangıç tarihi |
| endDate | DateTime? | ✅ | - | ❌ | Bitiş tarihi |
| isActive | Boolean | ✅ | true | ❌ | Aktif mi |
| createdAt | DateTime | ✅ | now() | ❌ | Oluşturma tarihi |
| updatedAt | DateTime | ✅ | - | ❌ | Güncelleme tarihi |

**İlişkiler:**
- `items` → PriceListItem[] (1:N)
- `accounts` → Account[] (1:N)
- `tenant` → Tenant? (N:1)

**İndeksler:**
- `@@index([tenantId])`

**Map:** `price_lists`

---

### 110. PriceListItem (price_list_items)

**Açıklama:** Fiyat listesi kalemleri

| Kolon | Tip | Nullable | Varsayılan | Unique | İlişki | Açıklama |
|-------|------|----------|------------|---------|-----------|
| id | String | ❌ | uuid() | ✅ PK | Birincil anahtar |
| priceListId | String | ❌ | - | ✅ FK | Fiyat listesi ID |
| productId | String | ❌ | - | ✅ FK | Ürün ID |
| price | Decimal | ❌ | - | ❌ | Fiyat |
| discountRate | Decimal? | ✅ | 0 | ❌ | İndirim oranı |
| createdAt | DateTime | ✅ | now() | ❌ | Oluşturma tarihi |
| updatedAt | DateTime | ✅ | - | ❌ | Güncelleme tarihi |

**İlişkiler:**
- `priceList` → PriceList (N:1)
- `product` → Product (N:1)

**İndeksler:**
- `@@unique([priceListId, productId])`
- `@@index([productId])`

**Map:** `price_list_items`

---

### 111. Collection (collections)

**Açıklama:** Tahsilatlar

| Kolon | Tip | Nullable | Varsayılan | Unique | İlişki | Açıklama |
|-------|------|----------|------------|---------|-----------|
| id | String | ❌ | uuid() | ✅ PK | Birincil anahtar |
| tenantId | String? | ✅ | - | ✅ FK | Tenant ID ⚠️ NULLABLE! |
| accountId | String | ❌ | - | ✅ FK | Cari hesap ID |
| invoiceId | String? | ✅ | - | ✅ FK | Fatura ID |
| serviceInvoiceId | String? | ✅ | - | ✅ FK | Servis faturası ID |
| type | CollectionType | ❌ | - | ❌ | Tahsilat tipi |
| amount | Decimal | ❌ | - | ❌ | Tutar |
| date | DateTime | ✅ | now() | ❌ | Tarih |
| paymentType | PaymentMethod | ❌ | - | ❌ | Ödeme yöntemi |
| cashboxId | String? | ✅ | - | ✅ FK | Kasa ID |
| bankAccountId | String? | ✅ | - | ✅ FK | Banka hesap ID |
| companyCreditCardId | String? | ✅ | - | ✅ FK | Firma kredi kartı ID |
| notes | String? | ✅ | - | ❌ | Notlar |
| createdBy | String? | ✅ | - | ✅ FK | Oluşturan |
| deletedAt | DateTime? | ✅ | - | ❌ | Silme tarihi |
| deletedBy | String? | ✅ | - | ✅ FK | Silen |
| createdAt | DateTime | ✅ | now() | ❌ | Oluşturma tarihi |
| updatedAt | DateTime | ✅ | - | ❌ | Güncelleme tarihi |
| salesAgentId | String? | ✅ | - | ✅ FK | Satış temsilcisi ID |

**İlişkiler:**
- `invoices` → InvoiceCollection[] (1:N)
- `bankAccount` → BankAccount? (N:1)
- `account` → Account (N:1)
- `createdByUser` → User? (N:1)
- `deletedByUser` → User? (N:1)
- `invoice` → Invoice? (N:1)
- `serviceInvoice` → ServiceInvoice? (N:1)
- `companyCreditCard` → CompanyCreditCard? (N:1)
- `cashbox` → Cashbox? (N:1)
- `tenant` → Tenant? (N:1)
- `salesAgent` → SalesAgent? (N:1)

**İndeksler:**
- `@@index([tenantId])`
- `@@index([tenantId, deletedAt])`
- `@@index([tenantId, date])`

**Map:** `collections`

---

### 112. InvoiceCollection (invoice_collections)

**Açıklama:** Fatura tahsilatları

| Kolon | Tip | Nullable | Varsayılan | Unique | İlişki | Açıklama |
|-------|------|----------|------------|---------|-----------|
| id | String | ❌ | uuid() | ✅ PK | Birincil anahtar |
| invoiceId | String | ❌ | - | ✅ FK | Fatura ID |
| collectionId | String | ❌ | - | ✅ FK | Tahsilat ID |
| amount | Decimal | ❌ | - | ❌ | Tutar |
| createdAt | DateTime | ✅ | now() | ❌ | Oluşturma tarihi |
| tenantId | String? | ✅ | - | ❌ | Tenant ID |

**İlişkiler:**
- `invoice` → Invoice (N:1)
- `collection` → Collection (N:1)
- `tenant` → Tenant? (N:1)

**İndeksler:**
- `@@unique([invoiceId, collectionId])`
- `@@index([tenantId])`

**Map:** `invoice_collections`

---

### 113. SalaryPlan (salary_plans)

**Açıklama:** Maaş planları

| Kolon | Tip | Nullable | Varsayılan | Unique | İlişki | Açıklama |
|-------|------|----------|------------|---------|-----------|
| id | String | ❌ | uuid() | ✅ PK | Birincil anahtar |
| tenantId | String? | ✅ | - | ❌ | Tenant ID |
| employeeId | String | ❌ | - | ✅ FK | Personel ID |
| year | Int | ❌ | - | ❌ | Yıl |
| month | Int | ❌ | - | ❌ | Ay |
| salary | Decimal | ❌ | - | ❌ | Maaş |
| bonus | Decimal | ✅ | 0 | ❌ | Bonus |
| total | Decimal | ❌ | - | ❌ | Toplam |
| status | SalaryStatus | ✅ | UNPAID | ❌ | Durum |
| paidAmount | Decimal | ✅ | 0 | ❌ | Ödenen tutar |
| remainingAmount | Decimal | ❌ | - | ❌ | Kalan tutar |
| isActive | Boolean | ✅ | true | ❌ | Aktif mi |
| description | String? | ✅ | - | ❌ | Açıklama |
| createdAt | DateTime | ✅ | now() | ❌ | Oluşturma tarihi |
| updatedAt | DateTime | ✅ | - | ❌ | Güncelleme tarihi |

**İlişkiler:**
- `tenant` → Tenant? (N:1)
- `employee` → Employee (N:1)
- `payments` → SalaryPayment[] (1:N)
- `settlements` → AdvanceSettlement[] (1:N)

**İndeksler:**
- `@@unique([employeeId, year, month])`
- `@@index([tenantId])`
- `@@index([employeeId, year])`
- `@@index([status])`
- `@@index([year, month])`

**Map:** `salary_plans`

---

### 114. SalaryPayment (salary_payments)

**Açıklama:** Maaş ödemeleri

| Kolon | Tip | Nullable | Varsayılan | Unique | İlişki | Açıklama |
|-------|------|----------|------------|---------|-----------|
| id | String | ❌ | uuid() | ✅ PK | Birincil anahtar |
| tenantId | String? | ✅ | - | ❌ | Tenant ID |
| employeeId | String | ❌ | - | ✅ FK | Personel ID |
| salaryPlanId | String | ❌ | - | ✅ FK | Maaş planı ID |
| month | Int | ❌ | - | ❌ | Ay |
| year | Int | ❌ | - | ❌ | Yıl |
| totalAmount | Decimal | ❌ | - | ❌ | Toplam tutar |
| paymentDate | DateTime? | ✅ | - | ❌ | Ödeme tarihi |
| status | SalaryStatus | ✅ | PENDING | ❌ | Durum |
| notes | String? | ✅ | - | ❌ | Notlar |
| createdBy | String? | ✅ | - | ✅ FK | Oluşturan |
| createdAt | DateTime | ✅ | now() | ❌ | Oluşturma tarihi |
| updatedAt | DateTime | ✅ | - | ❌ | Güncelleme tarihi |

**İlişkiler:**
- `tenant` → Tenant? (N:1)
- `employee` → Employee (N:1)
- `salaryPlan` → SalaryPlan (N:1)
- `paymentDetails` → SalaryPaymentDetail[] (1:N)
- `createdByUser` → User? (N:1)

**İndeksler:**
- `@@index([tenantId])`
- `@@index([employeeId])`
- `@@index([salaryPlanId])`

**Map:** `salary_payments`

---

### 115. SalaryPaymentDetail (salary_payment_details)

**Açıklama:** Maaş ödeme detayları

| Kolon | Tip | Nullable | Varsayılan | Unique | İlişki | Açıklama |
|-------|------|----------|------------|---------|-----------|
| id | String | ❌ | uuid() | ✅ PK | Birincil anahtar |
| tenantId | String? | ✅ | - | ❌ | Tenant ID |
| salaryPaymentId | String | ❌ | - | ✅ FK | Maaş ödeme ID |
| cashboxId | String? | ✅ | - | ✅ FK | Kasa ID |
| bankAccountId | String? | ✅ | - | ✅ FK | Banka hesap ID |
| amount | Decimal | ❌ | - | ❌ | Tutar |
| paymentMethod | PaymentMethod | ❌ | - | ❌ | Ödeme yöntemi |
| referenceNo | String? | ✅ | - | ❌ | Referans no |
| notes | String? | ✅ | - | ❌ | Notlar |
| createdAt | DateTime | ✅ | now() | ❌ | Oluşturma tarihi |

**İlişkiler:**
- `tenant` → Tenant? (N:1)
- `salaryPayment` → SalaryPayment (N:1)
- `cashbox` → Cashbox? (N:1)
- `bankAccount` → BankAccount? (N:1)

**İndeksler:**
- `@@index([tenantId])`
- `@@index([salaryPaymentId])`
- `@@index([cashboxId])`
- `@@index([bankAccountId])`

**Map:** `salary_payment_details`

---

### 116. Advance (advances)

**Açıklama:** Avanslar

| Kolon | Tip | Nullable | Varsayılan | Unique | İlişki | Açıklama |
|-------|------|----------|------------|---------|-----------|
| id | String | ❌ | uuid() | ✅ PK | Birincil anahtar |
| tenantId | String? | ✅ | - | ❌ | Tenant ID |
| employeeId | String | ❌ | - | ✅ FK | Personel ID |
| cashboxId | String? | ✅ | - | ✅ FK | Kasa ID |
| date | DateTime | ✅ | now() | ❌ | Tarih |
| amount | Decimal | ❌ | - | ❌ | Tutar |
| settledAmount | Decimal | ✅ | 0 | ❌ | Mahsuplanmış tutar |
| remainingAmount | Decimal | ❌ | - | ❌ | Kalan tutar |
| notes | String? | ✅ | - | ❌ | Notlar |
| status | AdvanceStatus | ✅ | OPEN | ❌ | Durum |
| createdBy | String? | ✅ | - | ✅ FK | Oluşturan |
| createdAt | DateTime | ✅ | now() | ❌ | Oluşturma tarihi |
| updatedAt | DateTime | ✅ | - | ❌ | Güncelleme tarihi |

**İlişkiler:**
- `tenant` → Tenant? (N:1)
- `employee` → Employee (N:1)
- `cashbox` → Cashbox? (N:1)
- `settlements` → AdvanceSettlement[] (1:N)
- `createdByUser` → User? (N:1)

**İndeksler:**
- `@@index([tenantId])`
- `@@index([employeeId])`
- `@@index([date])`

**Map:** `advances`

---

### 117. AdvanceSettlement (advance_settlements)

**Açıklama:** Avans mahsuplaştırmaları

| Kolon | Tip | Nullable | Varsayılan | Unique | İlişki | Açıklama |
|-------|------|----------|------------|---------|-----------|
| id | String | ❌ | uuid() | ✅ PK | Birincil anahtar |
| tenantId | String? | ✅ | - | ❌ | Tenant ID |
| advanceId | String | ❌ | - | ✅ FK | Avans ID |
| salaryPlanId | String | ❌ | - | ✅ FK | Maaş planı ID |
| amount | Decimal | ❌ | - | ❌ | Tutar |
| date | DateTime | ✅ | now() | ❌ | Tarih |
| description | String? | ✅ | - | ❌ | Açıklama |

**İlişkiler:**
- `tenant` → Tenant? (N:1)
- `advance` → Advance (N:1)
- `salaryPlan` → SalaryPlan (N:1)

**İndeksler:**
- `@@index([tenantId])`
- `@@index([advanceId])`
- `@@index([salaryPlanId])`

**Map:** `advance_settlements`

---

### 118. PosPayment (pos_payments)

**Açıklama:** POS ödemeleri

| Kolon | Tip | Nullable | Varsayılan | Unique | İlişki | Açıklama |
|-------|------|----------|------------|---------|-----------|
| id | String | ❌ | uuid() | ✅ PK | Birincil anahtar |
| invoiceId | String | ❌ | - | ✅ FK | Fatura ID |
| paymentMethod | PaymentMethod | ❌ | - | ❌ | Ödeme yöntemi |
| amount | Decimal | ❌ | - | ❌ | Tutar |
| change | Decimal? | ✅ | - | ❌ | Paraüstü |
| giftCardId | String? | ✅ | - | ❌ | Hediye kartı ID |
| notes | String? | ✅ | - | ❌ | Notlar |
| createdAt | DateTime | ✅ | now() | ❌ | Oluşturma tarihi |
| updatedAt | DateTime | ✅ | - | ❌ | Güncelleme tarihi |
| tenantId | String? | ✅ | - | ❌ | Tenant ID |
| createdBy | String? | ✅ | - | ❌ | Oluşturan |
| updatedBy | String? | ✅ | - | ❌ | Güncelleyen |

**İlişkiler:**
- `invoice` → Invoice (N:1)
- `tenant` → Tenant? (N:1)

**İndeksler:**
- `@@index([tenantId])`
- `@@index([invoiceId])`

**Map:** `pos_payments`

---

### 119. PosSession (pos_sessions)

**Açıklama:** POS oturumları

| Kolon | Tip | Nullable | Varsayılan | Unique | İlişki | Açıklama |
|-------|------|----------|------------|---------|-----------|
| id | String | ❌ | uuid() | ✅ PK | Birincil anahtar |
| sessionNo | String | ❌ | - | ✅ | Oturum no (tenant ile) |
| cashierId | String | ❌ | - | ❌ | Kasiyer ID |
| cashboxId | String | ❌ | - | ✅ FK | Kasa ID |
| openingAmount | Decimal | ❌ | - | ❌ | Açılış tutarı |
| closingAmount | Decimal? | ✅ | - | ❌ | Kapanış tutarı |
| closingNotes | String? | ✅ | - | ❌ | Kapanış notları |
| status | PosSessionStatus | ✅ | OPEN | ❌ | Durum |
| openedAt | DateTime | ✅ | now() | ❌ | Açılış tarihi |
| closedAt | DateTime? | ✅ | - | ❌ | Kapanış tarihi |
| createdAt | DateTime | ✅ | now() | ❌ | Oluşturma tarihi |
| updatedAt | DateTime | ✅ | - | ❌ | Güncelleme tarihi |
| tenantId | String? | ✅ | - | ❌ | Tenant ID |
| createdBy | String? | ✅ | - | ❌ | Oluşturan |
| updatedBy | String? | ✅ | - | ❌ | Güncelleyen |

**İlişkiler:**
- `tenant` → Tenant? (N:1)

**İndeksler:**
- `@@unique([sessionNo, tenantId])`
- `@@index([tenantId])`
- `@@index([cashierId])`
- `@@index([status])`

**Map:** `pos_sessions`

---

## 🔗 İlişki Haritası

### Merkezi Tablolar

**Tenant** - Merkezi tenant tablosu
- Tüm tablolarda referans
- İlişki sayısı: 80+

**User** - Kullanıcı tablosu
- Role, Tenant ile ilişkili
- Çok sayıda tabloda FK

**Product** - Ürün tablosu
- Tenant, Brand (flat), EquivalencyGroup, Unit ile ilişkili
- InvoiceItem, SalesOrderItem, PurchaseOrderItem, QuoteItem ile ilişkili

### Sistem Tablolar (Tenant ID Yok)

Bunlar global tablolar, tenant ID gerektirmez:
- Module
- Permission
- Plan
- VehicleCatalog
- PostalCode

### Riskli Tablolar (Tenant ID NULLABLE veya YOK)

⚠️ **ACİL DÜZELTME GEREKİREN:**
1. **Product.tenantId** - NULLABLE ❌
2. **Account.tenantId** - NULLABLE ❌
3. **AccountMovement.tenantId** - NULLABLE ❌
4. **AuditLog.tenantId** - NULLABLE ⚠️
5. **BankTransfer.tenantId** - NULLABLE ❌
6. **Collection.tenantId** - NULLABLE ❌
7. **Expense.tenantId** - NULLABLE ❌
8. **User.tenantId** - NULLABLE ⚠️
9. **Role.tenantId** - NULLABLE ❌

🚨 **TENANT ID YOK:**
1. **Unit** - Tenant ID yok! ❌
2. **UnitSet** - Tenant ID yok! ❌
3. **ExpenseCategory** - Tenant ID yok! ❌

### Flat Yapı Analizi (Normalizasyon Gerektiren)

🔴 **Product Tablosu:**
- `brand` - String (flat) → AYRI Brand tablosu önerilir
- `model` - String (flat) → AYRI ProductModel tablosu önerilir
- `category` - String (flat) → AYRI Category tablosu önerilir
- `mainCategory` - String (flat) → AYRI Category tablosu önerilir
- `subCategory` - String (flat) → AYRI Category tablosu önerilir
- `vehicleBrand` - String (flat) → AYRI ProductVehicleCompatibility tablosu önerilir
- `vehicleModel` - String (flat) → AYRI ProductVehicleCompatibility tablosu önerilir
- `vehicleEngineSize` - String (flat) → AYRI ProductVehicleCompatibility tablosu önerilir
- `vehicleFuelType` - String (flat) → AYRI ProductVehicleCompatibility tablosu önerilir

## 📊 İstatistikler

### Tablo Sayısı
- **Toplam Tablo:** 119
- **Tenant Tabloları (tenant ID'li):** 80+
- **Sistem Tabloları (tenant ID'siz):** 5
- **Null Olmayan tenantId'li Tablolar:** 9
- **Tenant ID'siz Tablolar:** 3

### En Büyük İlişkiler
- **Tenant** → 80+ tablo
- **User** → 50+ tablo
- **Product** → 30+ tablo
- **Account** → 30+ tablo
- **Invoice** → 20+ tablo

### Eksik Tenant ID'li Tablolar
1. Product ⚠️
2. Account ⚠️
3. AccountMovement ⚠️
4. AuditLog ⚠️
5. BankTransfer ⚠️
6. Collection ⚠️
7. Expense ⚠️
8. User ⚠️
9. Role ⚠️

### Tenant ID'siz Tablolar (Kritik!)
1. Unit ⚠️
2. UnitSet ⚠️
3. ExpenseCategory ⚠️

## ⚠️ Kritik Bulgular

### 1. Veri Sızıntısı Riski
**Problem:** Product.tenantId nullable olduğu için, marka sorgusu yapılırken tenant filtresi unutulursa, diğer tenant'lardan markalar listelenebilir.

**Örnek Yanlış Sorgu:**
```typescript
// ❌ VERİ SIZINTISI!
const brands = await prisma.product.findMany({
  select: { brand: true },
  distinct: ['brand']
  // tenantId filtresi YOK!
});
```

**Doğrusu:**
```typescript
// ✅ DOĞRU
const brands = await prisma.product.findMany({
  where: { tenantId: currentTenantId },
  select: { brand: true },
  distinct: ['brand']
});
```

### 2. Flat Yapı Problemleri
**Problem:** Brand, model, kategori verileri Product tablosunda flat olarak tutuluyor. Bu durum:
- Marka değiştirmek için tüm ürünleri güncellemek gerekiyor
- Marka bazlı raporlama zorlaşıyor
- Aynı markanın farklı yazımları (Bosch, bosch, BOSCH)
- Master-detail ilişki eksikliği

### 3. Unit Yapısı Problemi
**Problem:** Unit ve UnitSet tablolarında tenant ID yok. Bu durum:
- Tenant izolasyonu sağlanamıyor
- Product tablosu ile indirect ilişki
- Unit bazlı filtreleme yapılamıyor

## 📝 Öneriler

### Acil (Bugün)

1. ✅ **Tenant ID'leri NOT NULL Yapmak**
   - Product, Account, Collection, BankTransfer, Expense, Role, AccountMovement
   - Migration oluşturmak
   - Mevcut verilere tenant ID atamak

2. ✅ **Unit Tablosuna Tenant ID Eklemek**
   - Unit tablosuna tenantId sütunu eklemek
   - UnitSet tablosunu kaldırmak

3. ✅ **ExpenseCategory Tablosuna Tenant ID Eklemek**
   - ExpenseCategory tablosuna tenantId sütunu eklemek

### Kısa Vadeli (Bu Hafta)

4. ✅ **AYRI Brand Tablosu Oluşturmak**
   - Brand model oluşturmak
   - Product.brandId FK eklemek
   - Mevcut verileri aktarmak

5. ✅ **AYRI Category Tablosu Oluşturmak**
   - Hiyerarşik kategori yapısı
   - Product.categoryId FK eklemek

6. ✅ **AYRI ProductModel Tablosu Oluşturmak**
   - Model yönetimi için ayrı tablo

### Uzun Vadeli (Gelecek Hafta)

7. ✅ **Backend Sorgularına Tenant Filtresi Eklemek**
   - Tüm servislerde where: { tenantId: ... } kontrolü
   - Middleware ile zorunlu kılmak

8. ✅ **RLS (Row Level Security) Planlamak**
   - PostgreSQL RLS politikaları oluşturmak
   - Tenant bazlı veri izolasyonu

---

**Dokümantasyon Sonu**

Bu dokümantasyon, Otomuhasebe SaaS Muhasebe Sistemi'nin tam veritabanı yapısını göstermektedir. 119 tablo, tüm kolonlar ve ilişkiler detaylı olarak listelenmiştir.

**Kritik Uyarılar:**
- 🔴 9 tabloda tenantId nullable - VERİ SIZINTISI RİSKİ!
- 🔴 3 tabloda tenantId YOK - CRİTİK GÜVENLİK AÇIĞI!
- 🔴 Product tablosunda 8+ flat yapı - NORMALİZASYON GEREKİYOR!

**İletişim:** Proje ekibi  
**Durum:** Acil eylem gerekiyor