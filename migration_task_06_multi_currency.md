# TASK 6 — Fix Multi-Currency Architecture

## Changes Found

`Invoice` has `currency` and `exchangeRate`, but financial movement tables do not. This causes incorrect balance calculations for non-TRY transactions.

### Tables Missing Multi-Currency Fields:

1. **`account_movements`** - Missing `currency`, `exchangeRate`, `localAmount`
2. **`cashbox_movements`** - Missing `currency`, `exchangeRate`, `localAmount`
3. **`bank_account_movements`** - Missing `currency`, `exchangeRate`, `localAmount`
4. **`collections`** - Missing `currency`, `exchangeRate`, `localAmount`
5. **`invoice_collections`** - Missing multi-currency support
6. **`salary_payments`** - Missing multi-currency support
7. **`advances`** - Missing multi-currency support

### PriceCard Missing `vatRate`:
- **`price_cards`** - Prices change over time and KDV rate can change with price - need per-record `vatRate` (already added in TASK 1)

---

## Prisma Schema Changes

### AccountMovement - Add multi-currency fields
```prisma
model AccountMovement {
  id           String        @id @default(uuid())
  accountId    String        @map("account_id")
  type         DebitCredit   @map("type")
  amount       Decimal       @map("amount") @db.Decimal(12, 2)
  balance      Decimal       @map("balance") @db.Decimal(12, 2)
  documentType DocumentType? @map("document_type")
  documentNo   String?       @map("document_no")
  date         DateTime      @default(now()) @map("date")
  notes        String        @map("notes")
  createdAt    DateTime      @default(now())
  updatedAt    DateTime      @updatedAt
  tenantId     String?
  tenant       Tenant?       @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  currency     String        @default("TRY")
  exchangeRate Decimal       @default(1) @db.Decimal(10, 4)
  localAmount  Decimal       @db.Decimal(12, 2)
  account      Account       @relation(fields: [accountId], references: [id])

  @@index([tenantId])
  @@index([accountId, date])
  @@index([tenantId, accountId, date])
  @@index([tenantId, createdAt])
  @@map("account_movements")
}
```

### CashboxMovement - Add multi-currency fields
```prisma
model CashboxMovement {
  id               String              @id @default(uuid())
  cashboxId        String              @map("cashbox_id")
  movementType     CashboxMovementType @map("movement_type")
  amount           Decimal             @map("amount") @db.Decimal(15, 2)
  commissionAmount Decimal?            @map("commission_amount") @db.Decimal(15, 2)
  bsmvAmount       Decimal?            @map("bsmv_amount") @db.Decimal(15, 2)
  netAmount        Decimal?            @map("net_amount") @db.Decimal(15, 2)
  balance          Decimal             @map("balance") @db.Decimal(15, 2)
  documentType     String?             @map("document_type")
  documentNo       String?             @map("document_no")
  accountId        String?             @map("account_id")
  notes            String?             @map("notes")
  date             DateTime            @default(now()) @map("date")
  isTransferred    Boolean             @default(false) @map("is_transferred")
  transferDate     DateTime?           @map("transfer_date")
  createdBy        String?             @map("created_by")
  createdAt        DateTime            @default(now())
  tenantId         String
  tenant           Tenant?             @relation(fields: [tenantId], references: [id])
  account          Account?            @relation(fields: [accountId], references: [id])
  createdByUser    User?               @relation("CashboxMovementCreatedBy", fields: [createdBy], references: [id])
  cashbox          Cashbox             @relation(fields: [cashboxId], references: [id])
  currency         String              @default("TRY")
  exchangeRate     Decimal             @default(1) @db.Decimal(10, 4)
  localAmount      Decimal             @db.Decimal(15, 2)

  @@index([cashboxId, date])
  @@index([tenantId, cashboxId, date])
  @@index([tenantId, createdAt])
  @@index([accountId])
  @@index([isTransferred])
  @@map("cashbox_movements")
}
```

### BankAccountMovement - Add multi-currency fields
```prisma
model BankAccountMovement {
  id               String               @id @default(uuid())
  bankAccountId    String               @map("bank_account_id")
  movementType     BankMovementType     @map("movement_type")
  movementSubType  BankMovementSubType? @map("movement_sub_type")
  amount           Decimal              @map("amount") @db.Decimal(15, 2)
  commissionRate   Decimal?             @map("commission_rate") @db.Decimal(5, 2)
  commissionAmount Decimal?             @map("commission_amount") @db.Decimal(15, 2)
  netAmount        Decimal?             @map("net_amount") @db.Decimal(15, 2)
  balance          Decimal              @map("balance") @db.Decimal(15, 2)
  notes            String?              @map("notes")
  referenceNo      String?              @map("reference_no")
  accountId        String?              @map("account_id")
  date             DateTime             @default(now()) @map("date")
  createdAt        DateTime             @default(now())
  tenantId         String
  tenant           Tenant?              @relation(fields: [tenantId], references: [id])
  account          Account?             @relation(fields: [accountId], references: [id])
  bankAccount      BankAccount          @relation(fields: [bankAccountId], references: [id], onDelete: Cascade)
  currency         String               @default("TRY")
  exchangeRate     Decimal              @default(1) @db.Decimal(10, 4)
  localAmount      Decimal              @db.Decimal(15, 2)

  @@index([bankAccountId, date])
  @@index([movementType])
  @@map("bank_account_movements")
}
```

### Collection - Add multi-currency fields
```prisma
model Collection {
  id                  String              @id @default(uuid())
  tenantId            String?
  accountId           String              @map("account_id")
  invoiceId           String?             @map("invoice_id")
  serviceInvoiceId    String?             @map("service_invoice_id")
  type                CollectionType      @map("type")
  amount              Decimal             @map("amount") @db.Decimal(12, 2)
  date                DateTime            @default(now()) @map("date")
  paymentType         PaymentMethod       @map("payment_type")
  cashboxId           String?             @map("cashbox_id")
  bankAccountId       String?             @map("bank_account_id")
  companyCreditCardId String?             @map("company_credit_card_id")
  notes               String?             @map("notes")
  createdBy           String?             @map("created_by")
  deletedAt           DateTime?           @map("deleted_at")
  deletedBy           String?             @map("deleted_by")
  createdAt           DateTime            @default(now())
  updatedAt           DateTime            @updatedAt
  invoices            InvoiceCollection[]
  bankAccount         BankAccount?        @relation(fields: [bankAccountId], references: [id])
  account             Account             @relation(fields: [accountId], references: [id])
  createdByUser       User?               @relation("CollectionCreatedBy", fields: [createdBy], references: [id])
  deletedByUser       User?               @relation("CollectionDeletedBy", fields: [deletedBy], references: [id])
  invoice             Invoice?            @relation(fields: [invoiceId], references: [id])
  serviceInvoice      ServiceInvoice?     @relation(fields: [serviceInvoiceId], references: [id], onDelete: SetNull)
  companyCreditCard   CompanyCreditCard?  @relation(fields: [companyCreditCardId], references: [id])
  cashbox             Cashbox?            @relation(fields: [cashboxId], references: [id])
  tenant              Tenant?             @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  salesAgentId        String?             @map("sales_agent_id")
  salesAgent          SalesAgent?         @relation(fields: [salesAgentId], references: [id])
  currency             String              @default("TRY")
  exchangeRate         Decimal             @default(1) @db.Decimal(10, 4)
  localAmount          Decimal             @db.Decimal(12, 2)

  @@index([tenantId])
  @@index([tenantId, deletedAt])
  @@index([tenantId, date])
  @@map("collections")
}
```

### InvoiceCollection - Add multi-currency fields
```prisma
model InvoiceCollection {
  id           String     @id @default(uuid())
  invoiceId    String     @map("invoice_id")
  collectionId String     @map("collection_id")
  amount       Decimal    @map("amount") @db.Decimal(12, 2)
  createdAt    DateTime   @default(now())
  invoice      Invoice    @relation(fields: [invoiceId], references: [id], onDelete: Cascade)
  collection   Collection @relation(fields: [collectionId], references: [id], onDelete: Cascade)
  tenantId     String?
  tenant       Tenant?    @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  currency     String     @default("TRY")
  exchangeRate Decimal    @default(1) @db.Decimal(10, 4)
  localAmount  Decimal    @db.Decimal(12, 2)

  @@unique([invoiceId, collectionId])
  @@index([tenantId])
  @@map("invoice_collections")
}
```

### SalaryPayment - Add multi-currency fields
```prisma
model SalaryPayment {
  id             String                @id @default(uuid())
  tenantId       String?               @map("tenantId")
  employeeId     String                @map("employee_id")
  salaryPlanId   String                @map("plan_id")
  month          Int                   @map("month")
  year           Int                   @map("year")
  totalAmount    Decimal               @map("total_amount") @db.Decimal(12, 2)
  paymentDate    DateTime?             @map("payment_date")
  status         SalaryStatus          @default(PENDING) @map("status")
  notes          String?               @map("notes")
  createdBy      String?               @map("created_by")
  createdAt      DateTime              @default(now())
  updatedAt      DateTime              @updatedAt
  tenant         Tenant?               @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  employee       Employee              @relation(fields: [employeeId], references: [id], onDelete: Cascade)
  salaryPlan     SalaryPlan            @relation(fields: [salaryPlanId], references: [id], onDelete: Cascade)
  paymentDetails SalaryPaymentDetail[]
  createdByUser  User?                 @relation("SalaryPaymentCreatedBy", fields: [createdBy], references: [id])
  currency       String                @default("TRY")
  exchangeRate   Decimal               @default(1) @db.Decimal(10, 4)
  localAmount    Decimal               @db.Decimal(12, 2)

  @@index([tenantId])
  @@index([employeeId])
  @@index([salaryPlanId])
  @@map("salary_payments")
}
```

### Advance - Add multi-currency fields
```prisma
model Advance {
  id              String              @id @default(uuid())
  tenantId        String?             @map("tenantId")
  employeeId      String              @map("employee_id")
  cashboxId       String?             @map("cashbox_id")
  date            DateTime            @default(now()) @map("date")
  amount          Decimal             @map("amount") @db.Decimal(12, 2)
  settledAmount   Decimal             @default(0) @map("settled_amount") @db.Decimal(12, 2)
  remainingAmount Decimal             @map("remaining_amount") @db.Decimal(12, 2)
  notes           String?             @map("notes")
  status          AdvanceStatus       @default(OPEN) @map("status")
  createdBy       String?             @map("created_by")
  createdAt       DateTime            @default(now())
  updatedAt       DateTime            @updatedAt
  tenant          Tenant?             @relation(fields: [tenantId], references: [id], onDelete: Cascade)
  employee        Employee            @relation(fields: [employeeId], references: [id], onDelete: Cascade)
  cashbox         Cashbox?            @relation(fields: [cashboxId], references: [id])
  settlements     AdvanceSettlement[]
  createdByUser   User?               @relation("AdvanceCreatedBy", fields: [createdBy], references: [id])
  currency        String              @default("TRY")
  exchangeRate    Decimal             @default(1) @db.Decimal(10, 4)
  localAmount     Decimal             @db.Decimal(12, 2)

  @@index([tenantId])
  @@index([employeeId])
  @@index([date])
  @@map("advances")
}
```

---

## SQL Migration

```sql
-- ============================================
-- TASK 6: Fix Multi-Currency Architecture
-- ============================================

-- ============================================
-- ACCOUNT_MOVEMENTS
-- ============================================
-- Step 1: Add columns
ALTER TABLE account_movements 
ADD COLUMN currency TEXT NOT NULL DEFAULT 'TRY',
ADD COLUMN exchange_rate DECIMAL(10,4) NOT NULL DEFAULT 1,
ADD COLUMN local_amount DECIMAL(12,2);

-- Step 2: Backfill local_amount (for existing rows, local_amount = amount)
UPDATE account_movements 
SET local_amount = amount 
WHERE local_amount IS NULL;

-- Step 3: Set NOT NULL
ALTER TABLE account_movements ALTER COLUMN local_amount SET NOT NULL;


-- ============================================
-- CASHBOX_MOVEMENTS
-- ============================================
-- Step 1: Add columns
ALTER TABLE cashbox_movements 
ADD COLUMN currency TEXT NOT NULL DEFAULT 'TRY',
ADD COLUMN exchange_rate DECIMAL(10,4) NOT NULL DEFAULT 1,
ADD COLUMN local_amount DECIMAL(15,2);

-- Step 2: Backfill local_amount
UPDATE cashbox_movements 
SET local_amount = amount 
WHERE local_amount IS NULL;

-- Step 3: Set NOT NULL
ALTER TABLE cashbox_movements ALTER COLUMN local_amount SET NOT NULL;


-- ============================================
-- BANK_ACCOUNT_MOVEMENTS
-- ============================================
-- Step 1: Add columns
ALTER TABLE bank_account_movements 
ADD COLUMN currency TEXT NOT NULL DEFAULT 'TRY',
ADD COLUMN exchange_rate DECIMAL(10,4) NOT NULL DEFAULT 1,
ADD COLUMN local_amount DECIMAL(15,2);

-- Step 2: Backfill local_amount
UPDATE bank_account_movements 
SET local_amount = amount 
WHERE local_amount IS NULL;

-- Step 3: Set NOT NULL
ALTER TABLE bank_account_movements ALTER COLUMN local_amount SET NOT NULL;


-- ============================================
-- COLLECTIONS
-- ============================================
-- Step 1: Add columns
ALTER TABLE collections 
ADD COLUMN currency TEXT NOT NULL DEFAULT 'TRY',
ADD COLUMN exchange_rate DECIMAL(10,4) NOT NULL DEFAULT 1,
ADD COLUMN local_amount DECIMAL(12,2);

-- Step 2: Backfill local_amount
UPDATE collections 
SET local_amount = amount 
WHERE local_amount IS NULL;

-- Step 3: Set NOT NULL
ALTER TABLE collections ALTER COLUMN local_amount SET NOT NULL;


-- ============================================
-- INVOICE_COLLECTIONS
-- ============================================
-- Step 1: Add columns
ALTER TABLE invoice_collections 
ADD COLUMN currency TEXT NOT NULL DEFAULT 'TRY',
ADD COLUMN exchange_rate DECIMAL(10,4) NOT NULL DEFAULT 1,
ADD COLUMN local_amount DECIMAL(12,2);

-- Step 2: Backfill local_amount from amount
UPDATE invoice_collections 
SET local_amount = amount 
WHERE local_amount IS NULL;

-- Step 3: Set NOT NULL
ALTER TABLE invoice_collections ALTER COLUMN local_amount SET NOT NULL;


-- ============================================
-- SALARY_PAYMENTS
-- ============================================
-- Step 1: Add columns
ALTER TABLE salary_payments 
ADD COLUMN currency TEXT NOT NULL DEFAULT 'TRY',
ADD COLUMN exchange_rate DECIMAL(10,4) NOT NULL DEFAULT 1,
ADD COLUMN local_amount DECIMAL(12,2);

-- Step 2: Backfill local_amount from total_amount
UPDATE salary_payments 
SET local_amount = total_amount 
WHERE local_amount IS NULL;

-- Step 3: Set NOT NULL
ALTER TABLE salary_payments ALTER COLUMN local_amount SET NOT NULL;


-- ============================================
-- ADVANCES
-- ============================================
-- Step 1: Add columns
ALTER TABLE advances 
ADD COLUMN currency TEXT NOT NULL DEFAULT 'TRY',
ADD COLUMN exchange_rate DECIMAL(10,4) NOT NULL DEFAULT 1,
ADD COLUMN local_amount DECIMAL(12,2);

-- Step 2: Backfill local_amount from amount
UPDATE advances 
SET local_amount = amount 
WHERE local_amount IS NULL;

-- Step 3: Set NOT NULL
ALTER TABLE advances ALTER COLUMN local_amount SET NOT NULL;
```

---

## Data Migration Notes

### Backfill Logic

For all existing records:
- `currency` = 'TRY' (Turkish Lira - base currency)
- `exchangeRate` = 1 (no conversion needed)
- `localAmount` = `amount` (already in TRY)

This is safe because all existing data is assumed to be in TRY.

### Future Currency Handling

For new multi-currency transactions:
```sql
-- Example: USD invoice payment
INSERT INTO collections (
  account_id, 
  amount, 
  currency, 
  exchange_rate, 
  local_amount
) VALUES (
  'account-uuid', 
  1000.00,           -- amount in USD
  'USD', 
  32.50,             -- 1 USD = 32.50 TRY
  32500.00           -- local_amount in TRY
);

-- Balance calculations should use local_amount
SELECT SUM(local_amount) AS balance_try
FROM account_movements
WHERE account_id = 'account-uuid';
```

---

## Rollback

```sql
-- ============================================
-- Rollback: Drop multi-currency columns
-- ============================================

-- ACCOUNT_MOVEMENTS
ALTER TABLE account_movements DROP COLUMN IF EXISTS currency;
ALTER TABLE account_movements DROP COLUMN IF EXISTS exchange_rate;
ALTER TABLE account_movements DROP COLUMN IF EXISTS local_amount;

-- CASHBOX_MOVEMENTS
ALTER TABLE cashbox_movements DROP COLUMN IF EXISTS currency;
ALTER TABLE cashbox_movements DROP COLUMN IF EXISTS exchange_rate;
ALTER TABLE cashbox_movements DROP COLUMN IF EXISTS local_amount;

-- BANK_ACCOUNT_MOVEMENTS
ALTER TABLE bank_account_movements DROP COLUMN IF EXISTS currency;
ALTER TABLE bank_account_movements DROP COLUMN IF EXISTS exchange_rate;
ALTER TABLE bank_account_movements DROP COLUMN IF EXISTS local_amount;

-- COLLECTIONS
ALTER TABLE collections DROP COLUMN IF EXISTS currency;
ALTER TABLE collections DROP COLUMN IF EXISTS exchange_rate;
ALTER TABLE collections DROP COLUMN IF EXISTS local_amount;

-- INVOICE_COLLECTIONS
ALTER TABLE invoice_collections DROP COLUMN IF EXISTS currency;
ALTER TABLE invoice_collections DROP COLUMN IF EXISTS exchange_rate;
ALTER TABLE invoice_collections DROP COLUMN IF EXISTS local_amount;

-- SALARY_PAYMENTS
ALTER TABLE salary_payments DROP COLUMN IF EXISTS currency;
ALTER TABLE salary_payments DROP COLUMN IF EXISTS exchange_rate;
ALTER TABLE salary_payments DROP COLUMN IF EXISTS local_amount;

-- ADVANCES
ALTER TABLE advances DROP COLUMN IF EXISTS currency;
ALTER TABLE advances DROP COLUMN IF EXISTS exchange_rate;
ALTER TABLE advances DROP COLUMN IF EXISTS local_amount;
```

---

## Verification Queries

```sql
-- Verify no NULL local_amount values
SELECT 'account_movements' AS table_name, COUNT(*) AS null_count
FROM account_movements 
WHERE local_amount IS NULL

UNION ALL

SELECT 'cashbox_movements', COUNT(*)
FROM cashbox_movements 
WHERE local_amount IS NULL

UNION ALL

SELECT 'bank_account_movements', COUNT(*)
FROM bank_account_movements 
WHERE local_amount IS NULL

UNION ALL

SELECT 'collections', COUNT(*)
FROM collections 
WHERE local_amount IS NULL

UNION ALL

SELECT 'invoice_collections', COUNT(*)
FROM invoice_collections 
WHERE local_amount IS NULL

UNION ALL

SELECT 'salary_payments', COUNT(*)
FROM salary_payments 
WHERE local_amount IS NULL

UNION ALL

SELECT 'advances', COUNT(*)
FROM advances 
WHERE local_amount IS NULL;

-- Verify currency and exchange_rate defaults
SELECT 
    table_name,
    column_name,
    column_default
FROM information_schema.columns
WHERE table_schema = 'public'
  AND column_name IN ('currency', 'exchange_rate', 'local_amount')
  AND table_name IN (
    'account_movements', 'cashbox_movements', 'bank_account_movements',
    'collections', 'invoice_collections', 'salary_payments', 'advances'
  )
ORDER BY table_name, column_name;

-- Verify data integrity (all existing records should be TRY with rate 1)
SELECT 
    'account_movements' AS table_name,
    COUNT(*) AS total_rows,
    COUNT(CASE WHEN currency = 'TRY' THEN 1 END) AS try_rows,
    COUNT(CASE WHEN exchange_rate = 1 THEN 1 END) AS rate_1_rows,
    COUNT(CASE WHEN amount = local_amount THEN 1 END) AS matching_amounts
FROM account_movements

UNION ALL

SELECT 'cashbox_movements', COUNT(*), 
    COUNT(CASE WHEN currency = 'TRY' THEN 1 END),
    COUNT(CASE WHEN exchange_rate = 1 THEN 1 END),
    COUNT(CASE WHEN amount = local_amount THEN 1 END)
FROM cashbox_movements

UNION ALL

SELECT 'bank_account_movements', COUNT(*), 
    COUNT(CASE WHEN currency = 'TRY' THEN 1 END),
    COUNT(CASE WHEN exchange_rate = 1 THEN 1 END),
    COUNT(CASE WHEN amount = local_amount THEN 1 END)
FROM bank_account_movements

UNION ALL

SELECT 'collections', COUNT(*), 
    COUNT(CASE WHEN currency = 'TRY' THEN 1 END),
    COUNT(CASE WHEN exchange_rate = 1 THEN 1 END),
    COUNT(CASE WHEN amount = local_amount THEN 1 END)
FROM collections

UNION ALL

SELECT 'invoice_collections', COUNT(*), 
    COUNT(CASE WHEN currency = 'TRY' THEN 1 END),
    COUNT(CASE WHEN exchange_rate = 1 THEN 1 END),
    COUNT(CASE WHEN amount = local_amount THEN 1 END)
FROM invoice_collections

UNION ALL

SELECT 'salary_payments', COUNT(*), 
    COUNT(CASE WHEN currency = 'TRY' THEN 1 END),
    COUNT(CASE WHEN exchange_rate = 1 THEN 1 END),
    COUNT(CASE WHEN total_amount = local_amount THEN 1 END)
FROM salary_payments

UNION ALL

SELECT 'advances', COUNT(*), 
    COUNT(CASE WHEN currency = 'TRY' THEN 1 END),
    COUNT(CASE WHEN exchange_rate = 1 THEN 1 END),
    COUNT(CASE WHEN amount = local_amount THEN 1 END)
FROM advances;
```

---

## Important Notes

1. **Backfill Safety**: All existing records are assumed to be in TRY
2. **Application Updates**: Update application code to use `localAmount` for balance calculations
3. **Currency API**: Implement currency exchange rate API integration
4. **Default Currency**: Set tenant-specific default currency in `tenant_settings`
5. **Exchange Rate Validation**: Validate exchange rates before saving
6. **Historical Rates**: Store historical exchange rates for accurate reporting
7. **Prisma Migration**: Run `npx prisma migrate dev` after SQL migration
8. **Testing**: Test multi-currency transactions thoroughly before production

---

## Multi-Currency Best Practices

### 1. Always Calculate in Base Currency

```sql
-- CORRECT: Use local_amount for all calculations
SELECT SUM(local_amount) AS balance
FROM account_movements
WHERE account_id = 'xxx';

-- INCORRECT: Don't use amount directly for multi-tenant balances
SELECT SUM(amount) AS balance
FROM account_movements
WHERE account_id = 'xxx';
```

### 2. Store Exchange Rates at Transaction Time

```sql
-- Get current exchange rate
INSERT INTO collections (
  account_id,
  amount,
  currency,
  exchange_rate,
  local_amount
) VALUES (
  'account-uuid',
  1000.00,
  'USD',
  (SELECT rate FROM exchange_rates WHERE currency = 'USD' ORDER BY date DESC LIMIT 1),
  1000.00 * (SELECT rate FROM exchange_rates WHERE currency = 'USD' ORDER BY date DESC LIMIT 1)
);
```

### 3. Display in User's Preferred Currency

```sql
-- Get tenant's base currency
SELECT currency FROM tenant_settings WHERE tenant_id = 'xxx';

-- Convert display amount if needed
SELECT 
    amount,
    currency,
    exchange_rate,
    local_amount / exchange_rate AS amount_in_display_currency
FROM collections
WHERE id = 'xxx';
```

### 4. Maintain Exchange Rate History

```sql
-- Consider adding exchange_rates table
CREATE TABLE exchange_rates (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    currency TEXT NOT NULL,
    rate DECIMAL(10,4) NOT NULL,
    date DATE NOT NULL,
    created_at TIMESTAMP DEFAULT NOW(),
    UNIQUE(currency, date)
);

-- Daily exchange rates from TCMB or ECB
INSERT INTO exchange_rates (currency, rate, date)
VALUES ('USD', 32.50, CURRENT_DATE);
```

---

## Performance Considerations

1. **Index Impact**: New columns don't require new indexes initially
2. **Query Performance**: Multi-currency queries should use indexes on tenant_id
3. **Storage**: Each row adds ~20 bytes for 3 new fields
4. **Memory**: More data loaded into memory for queries

---

## Future Enhancements

1. **Exchange Rate Automation**: Auto-fetch daily rates from central bank
2. **Currency Conversion API**: REST endpoint for real-time conversion
3. **Multi-Currency Reporting**: Reports in multiple currencies
4. **Currency Settings**: Per-tenant currency preferences
5. **Historical Exchange Rates**: Track rate changes over time
6. **Currency Validation**: Prevent invalid currency codes