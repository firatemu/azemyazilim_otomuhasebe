# TASK 7 — Fix CheckBill Endorsement Field Names

## Changes Found

`CheckBill` table uses ambiguous endorsement field names:

### Current Field Names (Ambiguous):

1. **`endorserName`** - Should be `firstEndorserName` (first endorser)
2. **`endorserTcNo`** - Should be `firstEndorserTcNo` (first endorser)
3. **`endorserPhone`** - Should be `firstEndorserPhone` (first endorser)
4. **`secondEndorserName`** - Exists ✓ (already clear)
5. **`secondEndorserTcNo`** - Exists ✓ (already clear)
6. **`secondEndorserPhone`** - Exists ✓ (already clear)

### Problem:

Current naming is inconsistent:
- "Endorser" without prefix = first endorser (ambiguous)
- "SecondEndorser" with prefix = second endorser (clear)

This causes confusion when working with the data.

---

## Prisma Schema Changes

### CheckBill - Rename endorsement fields
```prisma
model CheckBill {
  id                String         @id @default(uuid())
  accountId         String         @map("account_id")
  type              CheckType      @map("type")
  checkNo           String         @map("check_no")
  amount            Decimal        @map("amount") @db.Decimal(12, 2)
  currency          String         @default("TRY")
  checkDate         DateTime       @map("check_date")
  dueDate           DateTime       @map("due_date")
  bankName          String         @map("bank_name")
  branchName        String         @map("branch_name")
  firstEndorserName String?        @map("first_endorser_name")  // RENAMED FROM endorserName
  firstEndorserTcNo  String?        @map("first_endorser_tc_no") // RENAMED FROM endorserTcNo
  firstEndorserPhone String?        @map("first_endorser_phone") // RENAMED FROM endorserPhone
  secondEndorserName String?        @map("second_endorser_name")
  secondEndorserTcNo  String?        @map("second_endorser_tc_no")
  secondEndorserPhone String?        @map("second_endorser_phone")
  status            CheckStatus    @default(OPEN) @map("status")
  notes             String?        @map("notes")
  isTransferred     Boolean        @default(false) @map("is_transferred")
  transferDate      DateTime?      @map("transfer_date")
  createdAt         DateTime       @default(now())
  updatedAt         DateTime       @updatedAt
  tenantId          String?
  tenant            Tenant?        @relation(fields: [tenantId], references: [id])
  account           Account        @relation(fields: [accountId], references: [id])
  journal           CheckBillJournal?
  logs              CheckBillLog[]
  journalItems      CheckBillJournalItem[]

  @@unique([tenantId, checkNo])
  @@index([tenantId])
  @@index([accountId])
  @@index([checkDate])
  @@index([dueDate])
  @@index([status])
  @@map("checks_bills")
}
```

---

## SQL Migration

```sql
-- ============================================
-- TASK 7: Fix CheckBill Endorsement Field Names
-- ============================================

-- Step 1: Add new columns with correct names
ALTER TABLE checks_bills 
ADD COLUMN first_endorser_name TEXT,
ADD COLUMN first_endorser_tc_no TEXT,
ADD COLUMN first_endorser_phone TEXT;

-- Step 2: Migrate data from old columns to new columns
UPDATE checks_bills 
SET 
    first_endorser_name = endorser_name,
    first_endorser_tc_no = endorser_tc_no,
    first_endorser_phone = endorser_phone
WHERE endorser_name IS NOT NULL 
   OR endorser_tc_no IS NOT NULL 
   OR endorser_phone IS NOT NULL;

-- Step 3: Verify data migration
SELECT 
    COUNT(*) AS total_rows,
    COUNT(CASE WHEN endorser_name IS NOT NULL THEN 1 END) AS old_endorser_name_count,
    COUNT(CASE WHEN first_endorser_name IS NOT NULL THEN 1 END) AS new_endorser_name_count,
    COUNT(CASE WHEN endorser_name IS NOT NULL AND first_endorser_name IS NULL THEN 1 END) AS missing_migrations,
    COUNT(CASE WHEN endorser_name IS NOT NULL AND endorser_name = first_endorser_name THEN 1 END) AS matching_names,
    COUNT(CASE WHEN endorser_tc_no IS NOT NULL AND endorser_tc_no = first_endorser_tc_no THEN 1 END) AS matching_tc_nos,
    COUNT(CASE WHEN endorser_phone IS NOT NULL AND endorser_phone = first_endorser_phone THEN 1 END) AS matching_phones
FROM checks_bills;

-- Step 4: Drop old columns
ALTER TABLE checks_bills DROP COLUMN endorser_name;
ALTER TABLE checks_bills DROP COLUMN endorser_tc_no;
ALTER TABLE checks_bills DROP COLUMN endorser_phone;
```

---

## Data Migration Notes

### Why Rename?

**Before (Ambiguous):**
```prisma
endorserName: String      // Which endorser? First or second?
secondEndorserName: String // This is clear
```

**After (Clear):**
```prisma
firstEndorserName: String  // Clear: first endorser
secondEndorserName: String // Clear: second endorser
```

### Backward Compatibility

This is a breaking change. Application code needs updates:
- Replace `endorserName` with `firstEndorserName`
- Replace `endorserTcNo` with `firstEndorserTcNo`
- Replace `endorserPhone` with `firstEndorserPhone`

---

## Rollback

```sql
-- ============================================
-- Rollback: Restore old field names
-- ============================================

-- Step 1: Add old columns back
ALTER TABLE checks_bills 
ADD COLUMN endorser_name TEXT,
ADD COLUMN endorser_tc_no TEXT,
ADD COLUMN endorser_phone TEXT;

-- Step 2: Migrate data from new columns to old columns
UPDATE checks_bills 
SET 
    endorser_name = first_endorser_name,
    endorser_tc_no = first_endorser_tc_no,
    endorser_phone = first_endorser_phone
WHERE first_endorser_name IS NOT NULL 
   OR first_endorser_tc_no IS NOT NULL 
   OR first_endorser_phone IS NOT NULL;

-- Step 3: Drop new columns
ALTER TABLE checks_bills DROP COLUMN first_endorser_name;
ALTER TABLE checks_bills DROP COLUMN first_endorser_tc_no;
ALTER TABLE checks_bills DROP COLUMN first_endorser_phone;
```

---

## Verification Queries

```sql
-- Verify new columns exist and old columns don't
SELECT 
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_schema = 'public'
  AND table_name = 'checks_bills'
  AND column_name IN (
    'first_endorser_name', 
    'first_endorser_tc_no', 
    'first_endorser_phone',
    'second_endorser_name', 
    'second_endorser_tc_no', 
    'second_endorser_phone',
    'endorser_name',  -- Should NOT exist
    'endorser_tc_no', -- Should NOT exist
    'endorser_phone'  -- Should NOT exist
  )
ORDER BY column_name;

-- Verify data integrity
SELECT 
    COUNT(*) AS total_checks,
    COUNT(CASE WHEN first_endorser_name IS NOT NULL THEN 1 END) AS has_first_endorser_name,
    COUNT(CASE WHEN first_endorser_tc_no IS NOT NULL THEN 1 END) AS has_first_endorser_tc_no,
    COUNT(CASE WHEN first_endorser_phone IS NOT NULL THEN 1 END) AS has_first_endorser_phone,
    COUNT(CASE WHEN second_endorser_name IS NOT NULL THEN 1 END) AS has_second_endorser_name,
    COUNT(CASE WHEN second_endorser_tc_no IS NOT NULL THEN 1 END) AS has_second_endorser_tc_no,
    COUNT(CASE WHEN second_endorser_phone IS NOT NULL THEN 1 END) AS has_second_endorser_phone
FROM checks_bills;

-- Sample data verification
SELECT 
    check_no,
    amount,
    first_endorser_name,
    second_endorser_name
FROM checks_bills
WHERE first_endorser_name IS NOT NULL
  OR second_endorser_name IS NOT NULL
ORDER BY check_date DESC
LIMIT 10;
```

---

## Application Code Updates

### Before:

```typescript
// Old field names (ambiguous)
const check = await prisma.checkBill.findUnique({
  where: { id: checkId }
});

console.log(check.endorserName);    // Which endorser?
console.log(check.endorserTcNo);
console.log(check.endorserPhone);
```

### After:

```typescript
// New field names (clear)
const check = await prisma.checkBill.findUnique({
  where: { id: checkId }
});

console.log(check.firstEndorserName);   // Clear: first endorser
console.log(check.firstEndorserTcNo);
console.log(check.firstEndorserPhone);
```

---

## Important Notes

1. **Breaking Change**: This is a breaking change for application code
2. **API Updates**: Update all API endpoints that use old field names
3. **Frontend Updates**: Update frontend forms and displays
4. **Migration Testing**: Test thoroughly before production deployment
5. **Backup**: Backup database before migration
6. **Prisma Migration**: Run `npx prisma migrate dev` after SQL migration

---

## Best Practices for Field Naming

1. **Be Explicit**: Use prefixes to avoid ambiguity
2. **Consistent Naming**: Follow same pattern for similar fields
3. **Clear Intent**: Field names should be self-documenting
4. **Avoid Shortcuts**: Don't sacrifice clarity for brevity
5. **Review Naming**: Review field names during schema design

---

## Examples of Improved Clarity

### CheckBill Endorsement:

**Before:**
```sql
endorser_name         -- Ambiguous: first or second?
second_endorser_name  -- Clear: second endorser
```

**After:**
```sql
first_endorser_name   -- Clear: first endorser
second_endorser_name  -- Clear: second endorser
```

### Invoice Payment Terms:

**Before:**
```sql
payment_term1  -- What's the meaning?
payment_term2  -- Why numbered?
```

**After:**
```sql
payment_due_days     -- Clear: due in X days
payment_discount_days -- Clear: discount if paid in X days
```

### Product Pricing:

**Before:**
```sql
price1      -- Which price?
price2      -- Another price?
```

**After:**
```sql
sale_price      -- Clear: selling price
purchase_price  -- Clear: buying price