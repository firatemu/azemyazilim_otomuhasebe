# TASK 1 — Fix Nullable `tenantId` Columns

## Changes Found

### Tables with Missing `tenantId` (Critical):
1. `expense_categories` - No tenantId, shared globally
2. `price_cards` - No tenantId, shared globally
3. `invoice_items` - No tenantId
4. `order_pickings` - No tenantId
5. `work_order_items` - No tenantId
6. `work_order_activities` - No tenantId
7. `product_barcodes` - No tenantId
8. `cashbox_movements` - No tenantId
9. `bank_account_movements` - No tenantId
10. `journal_entry_lines` - No tenantId
11. `einvoice_inbox` - No tenantId (system table, may remain without tenantId)
12. `equivalency_groups` - No tenantId
13. `company_credit_cards` - No tenantId
14. `product_cost_history` - No tenantId
15. `quote_items` - No tenantId
16. `stocktake_items` - No tenantId
17. `shelf` - No tenantId
18. `product_shelf` - No tenantId
19. `product_location_stocks` - No tenantId
20. `sales_delivery_note_items` - No tenantId
21. `purchase_delivery_note_items` - No tenantId
22. `purchase_delivery_note_logs` - No tenantId
23. `purchase_order_items` - No tenantId
24. `procurement_order_items` - No tenantId
25. `warehouse_transfer_items` - No tenantId
26. `account_contacts` - No tenantId
27. `account_addresses` - No tenantId
28. `account_banks` - No tenantId
29. `invoice_payment_plans` - No tenantId
30. `invoice_logs` - No tenantId
31. `sales_order_logs` - No tenantId
32. `quote_logs` - No tenantId
33. `bank_transfer_logs` - No tenantId
34. `check_bill_logs` - No tenantId
35. `employee_payments` - No tenantId
36. `warehouse_critical_stocks` - No tenantId
37. `warehouse_transfer_logs` - No tenantId
38. `role_permissions` - No tenantId
39. `invoice_collections` - tenantId is nullable
40. `pos_payments` - tenantId is nullable
41. `pos_sessions` - tenantId is nullable

### Tables with `tenantId String?` (Should be NOT NULL):
42. `warehouse` - tenantId is nullable
43. `employee` - tenantId is nullable
44. `cashbox` - tenantId is nullable
45. `bank` - tenantId is nullable
46. `sales_agent` - tenantId is nullable
47. `journal_entry` - tenantId is nullable
48. `check_bill_journal` - tenantId is nullable
49. `bank_loan_plan` - tenantId is nullable
50. `price_list` - tenantId is nullable
51. `salary_plan` - tenantId is nullable
52. `salary_payment` - tenantId is nullable
53. `salary_payment_detail` - tenantId is nullable
54. `advance` - tenantId is nullable
55. `advance_settlement` - tenantId is nullable
56. `company_vehicle` - tenantId is nullable
57. `vehicle_expense` - tenantId is nullable

---

## Prisma Schema Changes

### 1. expense_categories
```prisma
model ExpenseCategory {
  id        String    @id @default(uuid())
  tenantId  String
  tenant    Tenant    @relation(fields: [tenantId], references: [id])
  name      String
  notes     String?
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
  expenses  Expense[]

  @@unique([tenantId, name])
  @@index([tenantId])
  @@map("expense_categories")
}
```

### 2. price_cards
```prisma
model PriceCard {
  id            String        @id @default(uuid())
  productId     String        @map("product_id")
  tenantId      String
  tenant        Tenant        @relation(fields: [tenantId], references: [id])
  type          PriceCardType
  price         Decimal       @db.Decimal(12, 2)
  currency      String        @default("TRY")
  effectiveFrom DateTime?     @map("effective_from")
  effectiveTo   DateTime?     @map("effective_to")
  note          String?
  createdBy     String?       @map("created_by")
  updatedBy     String?       @map("updated_by")
  createdAt     DateTime      @default(now()) @map("created_at")
  updatedAt     DateTime      @updatedAt @map("updated_at")
  vatRate       Int?
  createdByUser User?         @relation("PriceCardCreatedBy", fields: [createdBy], references: [id])
  product       Product       @relation(fields: [productId], references: [id], onDelete: Cascade)
  updatedByUser User?         @relation("PriceCardUpdatedBy", fields: [updatedBy], references: [id])

  @@index([productId, type, createdAt])
  @@index([tenantId])
  @@index([tenantId, productId, type, createdAt])
  @@map("price_cards")
}
```

### 3. invoice_items
```prisma
model InvoiceItem {
  id                  String             @id @default(uuid())
  invoiceId           String             @map("invoice_id")
  productId           String             @map("product_id")
  quantity            Int                @map("quantity")
  unitPrice           Decimal            @map("unit_price") @db.Decimal(10, 2)
  vatRate             Int                @map("vat_rate")
  vatAmount           Decimal            @map("vat_amount") @db.Decimal(10, 2)
  amount              Decimal            @map("amount") @db.Decimal(10, 2)
  discountRate        Decimal?           @default(0) @map("discount_rate") @db.Decimal(10, 2)
  discountAmount      Decimal?           @default(0) @map("discount_amount") @db.Decimal(10, 2)
  withholdingCode     String?            @map("withholding_code")
  withholdingRate     Decimal?           @map("withholding_rate") @db.Decimal(5, 2)
  sctRate             Decimal?           @map("sct_rate") @db.Decimal(5, 2)
  sctAmount           Decimal?           @map("sct_amount") @db.Decimal(10, 2)
  vatExemptionReason  String?            @map("vat_exemption_reason")
  unit                String?            @map("unit")
  shelf               String?            @map("shelf")
  purchaseOrderItemId String?            @map("purchase_order_item_id")
  createdAt           DateTime           @default(now())
  invoice             Invoice            @relation(fields: [invoiceId], references: [id], onDelete: Cascade)
  purchaseOrderItem   PurchaseOrderItem? @relation("PurchaseOrderItemInvoiceItem", fields: [purchaseOrderItemId], references: [id])
  product             Product            @relation(fields: [productId], references: [id])
  invoiceProfits      InvoiceProfit[]
  productMovements    ProductMovement[]

  @@index([invoiceId])
  @@index([productId])
  @@index([tenantId])
  @@index([tenantId, invoiceId])
  @@index([tenantId, productId])
  @@map("invoice_items")
}
```

### 4. order_pickings
```prisma
model OrderPicking {
  id          String         @id @default(uuid())
  orderId     String         @map("order_id")
  orderItemId String         @map("order_item_id")
  locationId  String         @map("location_id")
  quantity    Int            @map("quantity")
  pickedBy    String?        @map("picked_by")
  createdAt   DateTime       @default(now())
  tenantId    String
  tenant      Tenant?        @relation(fields: [tenantId], references: [id])
  picker      User?          @relation("OrderPickingCreatedBy", fields: [pickedBy], references: [id])
  location    Location       @relation("OrderPickingLocation", fields: [locationId], references: [id])
  order       SalesOrder     @relation(fields: [orderId], references: [id], onDelete: Cascade)
  orderItem   SalesOrderItem @relation(fields: [orderItemId], references: [id], onDelete: Cascade)

  @@index([orderId])
  @@index([orderItemId])
  @@index([locationId])
  @@index([tenantId])
  @@map("order_pickings")
}
```

### 5. work_order_items
```prisma
model WorkOrderItem {
  id          String            @id @default(uuid())
  workOrderId String            @map("workOrderId")
  type        WorkOrderItemType @map("type")
  description String            @map("description")
  productId   String?           @map("product_id")
  quantity    Int               @default(1) @map("quantity")
  unitPrice   Decimal           @db.Decimal(12, 2) @map("unitPrice")
  taxRate     Int               @default(20) @map("taxRate")
  taxAmount   Decimal           @default(0) @db.Decimal(12, 2) @map("taxAmount")
  totalPrice  Decimal           @db.Decimal(12, 2) @map("totalPrice")
  version     Int               @default(1) @map("version")
  createdAt   DateTime          @default(now())
  updatedAt   DateTime          @updatedAt
  tenantId    String
  tenant      Tenant?           @relation(fields: [tenantId], references: [id])
  product     Product?          @relation(fields: [productId], references: [id])
  workOrder   WorkOrder         @relation(fields: [workOrderId], references: [id], onDelete: Cascade)

  @@index([workOrderId])
  @@index([productId])
  @@index([tenantId])
  @@map("work_order_items")
}
```

### 6. work_order_activities
```prisma
model WorkOrderActivity {
  id          String    @id @default(uuid())
  workOrderId String
  action      String
  userId      String?
  metadata    Json?
  createdAt   DateTime  @default(now())
  tenantId    String
  tenant      Tenant?   @relation(fields: [tenantId], references: [id])
  workOrder   WorkOrder @relation(fields: [workOrderId], references: [id], onDelete: Cascade)
  user        User?     @relation(fields: [userId], references: [id], onDelete: SetNull)

  @@index([workOrderId])
  @@index([workOrderId, createdAt])
  @@index([tenantId])
  @@map("work_order_activities")
}
```

### 7. product_barcodes
```prisma
model ProductBarcode {
  id        String   @id @default(uuid())
  productId String
  barcode   String
  tenantId  String
  tenant    Tenant?  @relation(fields: [tenantId], references: [id])
  symbology String
  isPrimary Boolean  @default(false)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@unique([tenantId, barcode])
  @@index([productId])
  @@index([tenantId])
  @@map("product_barcodes")
}
```

### 8. cashbox_movements
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

  @@index([cashboxId, date])
  @@index([tenantId, cashboxId, date])
  @@index([tenantId, createdAt])
  @@index([accountId])
  @@index([isTransferred])
  @@map("cashbox_movements")
}
```

### 9. bank_account_movements
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

  @@index([bankAccountId, date])
  @@index([movementType])
  @@map("bank_account_movements")
}
```

### 10. journal_entry_lines
```prisma
model JournalEntryLine {
  id             String       @id @default(uuid())
  journalEntryId String
  accountCode    String
  accountName    String
  debit          Decimal      @default(0) @db.Decimal(12, 2)
  credit         Decimal      @default(0) @db.Decimal(12, 2)
  description    String?
  createdAt      DateTime     @default(now())
  tenantId       String
  tenant         Tenant?      @relation(fields: [tenantId], references: [id])
  journalEntry   JournalEntry @relation(fields: [journalEntryId], references: [id], onDelete: Cascade)

  @@index([journalEntryId])
  @@index([tenantId])
  @@map("journal_entry_lines")
}
```

### 11. equivalency_groups
```prisma
model EquivalencyGroup {
  id          String    @id @default(uuid())
  name        String?   @map("name")
  description String?   @map("description")
  tenantId    String
  tenant      Tenant    @relation(fields: [tenantId], references: [id])
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  products    Product[]

  @@index([tenantId])
  @@map("equivalency_groups")
}
```

### 12. company_credit_cards
```prisma
model CompanyCreditCard {
  id             String                      @id @default(uuid())
  cashboxId      String                      @map("cashbox_id")
  code           String                      @unique @map("code")
  name           String                      @map("name")
  bankName       String                      @map("bank_name")
  cardType       String?                     @map("card_type")
  lastFourDigits String?                     @map("last_four_digits")
  creditLimit    Decimal?                    @map("credit_limit") @db.Decimal(15, 2)
  balance        Decimal                     @default(0) @map("balance") @db.Decimal(15, 2)
  isActive       Boolean                     @default(true) @map("is_active")
  createdAt      DateTime                    @default(now())
  updatedAt      DateTime                    @updatedAt
  statementDate  DateTime?                   @map("statement_date")
  paymentDueDate DateTime?                   @map("payment_due_date")
  tenantId       String
  tenant         Tenant?                     @relation(fields: [tenantId], references: [id])
  movements      CompanyCreditCardMovement[]
  reminders      CompanyCreditCardReminder[]
  cashbox        Cashbox                     @relation(fields: [cashboxId], references: [id], onDelete: Cascade)
  collections    Collection[]

  @@index([cashboxId])
  @@index([tenantId])
  @@map("company_credit_cards")
}
```

### 13. product_cost_history
```prisma
model ProductCostHistory {
  id           String   @id @default(uuid())
  productId    String   @map("product_id")
  cost         Decimal  @db.Decimal(12, 4)
  method       String   @default("WEIGHTED_AVERAGE")
  computedAt   DateTime @default(now()) @map("computed_at")
  brand        String?  @map("brand")
  mainCategory String?  @map("main_category")
  subCategory  String?  @map("sub_category")
  note         String?
  createdAt    DateTime @default(now())
  tenantId     String
  tenant       Tenant?  @relation(fields: [tenantId], references: [id])
  product      Product  @relation("ProductCostHistory", fields: [productId], references: [id], onDelete: Cascade)

  @@index([productId, computedAt])
  @@index([tenantId])
  @@index([tenantId, productId, computedAt])
  @@map("stock_cost_history")
}
```

### 14. quote_items
```prisma
model QuoteItem {
  id             String   @id @default(uuid())
  quoteId        String   @map("quote_id")
  productId      String   @map("product_id")
  quantity       Int      @map("quantity")
  unitPrice      Decimal  @map("unit_price") @db.Decimal(10, 2)
  vatRate        Int      @map("vat_rate")
  vatAmount      Decimal  @map("vat_amount") @db.Decimal(10, 2)
  amount         Decimal  @map("amount") @db.Decimal(10, 2)
  discountRate   Decimal? @map("discount_rate") @db.Decimal(5, 2)
  discountAmount Decimal? @map("discount_amount") @db.Decimal(10, 2)
  createdAt      DateTime @default(now())
  tenantId       String
  tenant         Tenant?  @relation(fields: [tenantId], references: [id])
  product        Product  @relation(fields: [productId], references: [id])
  quote          Quote    @relation(fields: [quoteId], references: [id], onDelete: Cascade)

  @@index([tenantId])
  @@map("quote_items")
}
```

### 15. stocktake_items
```prisma
model StocktakeItem {
  id              String    @id @default(uuid())
  stocktakeId     String    @map("stocktake_id")
  productId       String    @map("product_id")
  locationId      String?   @map("location_id")
  systemQuantity  Int       @map("system_quantity")
  countedQuantity Int       @map("counted_quantity")
  difference      Int       @map("difference")
  createdAt       DateTime  @default(now())
  tenantId        String
  tenant          Tenant?   @relation(fields: [tenantId], references: [id])
  stocktake       Stocktake @relation(fields: [stocktakeId], references: [id], onDelete: Cascade)
  location        Location? @relation(fields: [locationId], references: [id])
  product         Product   @relation(fields: [productId], references: [id])

  @@index([stocktakeId])
  @@index([productId])
  @@index([locationId])
  @@index([tenantId])
  @@map("stocktake_items")
}
```

### 16. shelf
```prisma
model Shelf {
  id          String         @id @default(uuid())
  warehouseId String         @map("warehouse_id")
  code        String         @map("code")
  notes       String?        @map("notes")
  createdAt   DateTime       @default(now())
  updatedAt   DateTime       @updatedAt
  tenantId    String
  tenant      Tenant?        @relation(fields: [tenantId], references: [id])
  warehouse   Warehouse      @relation(fields: [warehouseId], references: [id], onDelete: Cascade)
  products    ProductShelf[]

  @@unique([warehouseId, code])
  @@index([tenantId])
  @@map("shelves")
}
```

### 17. product_shelf
```prisma
model ProductShelf {
  id        String   @id @default(uuid())
  productId String   @map("product_id")
  shelfId   String   @map("shelf_id")
  quantity  Int      @default(0) @map("quantity")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  tenantId  String
  tenant    Tenant?  @relation(fields: [tenantId], references: [id])
  shelf     Shelf    @relation(fields: [shelfId], references: [id], onDelete: Cascade)
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)

  @@unique([productId, shelfId])
  @@index([tenantId])
  @@map("product_shelves")
}
```

### 18. product_location_stocks
```prisma
model ProductLocationStock {
  id          String    @id @default(uuid())
  warehouseId String
  locationId  String
  productId   String
  qtyOnHand   Int       @default(0)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  tenantId    String
  tenant      Tenant?   @relation(fields: [tenantId], references: [id])
  location    Location  @relation(fields: [locationId], references: [id], onDelete: Cascade)
  product     Product   @relation(fields: [productId], references: [id], onDelete: Cascade)
  warehouse   Warehouse @relation(fields: [warehouseId], references: [id], onDelete: Cascade)

  @@unique([warehouseId, locationId, productId])
  @@index([warehouseId])
  @@index([locationId])
  @@index([productId])
  @@index([tenantId])
  @@map("product_location_stocks")
}
```

### 19. sales_delivery_note_items
```prisma
model SalesDeliveryNoteItem {
  id               String            @id @default(uuid())
  deliveryNoteId   String            @map("delivery_note_id")
  productId        String            @map("product_id")
  quantity         Int               @map("quantity")
  unitPrice        Decimal           @map("unit_price") @db.Decimal(10, 2)
  vatRate          Int               @map("vat_rate")
  vatAmount        Decimal           @map("vat_amount") @db.Decimal(10, 2)
  totalAmount      Decimal           @map("total_amount") @db.Decimal(12, 2)
  invoicedQuantity Int               @default(0) @map("invoiced_quantity")
  createdAt        DateTime          @default(now())
  updatedAt        DateTime          @updatedAt
  tenantId         String
  tenant           Tenant?           @relation(fields: [tenantId], references: [id])
  deliveryNote     SalesDeliveryNote @relation(fields: [deliveryNoteId], references: [id], onDelete: Cascade)
  product          Product           @relation("SalesDeliveryNoteItemProduct", fields: [productId], references: [id])

  @@index([deliveryNoteId])
  @@index([productId])
  @@index([tenantId])
  @@map("sales_delivery_note_items")
}
```

### 20. purchase_delivery_note_items
```prisma
model PurchaseDeliveryNoteItem {
  id             String               @id @default(uuid())
  deliveryNoteId String               @map("delivery_note_id")
  productId      String               @map("product_id")
  quantity       Int                  @map("quantity")
  unitPrice      Decimal              @map("unit_price") @db.Decimal(10, 2)
  vatRate        Int                  @map("vat_rate")
  vatAmount      Decimal              @map("vat_amount") @db.Decimal(10, 2)
  totalAmount    Decimal              @map("total_amount") @db.Decimal(12, 2)
  createdAt      DateTime             @default(now())
  updatedAt      DateTime             @updatedAt
  tenantId       String
  tenant         Tenant?              @relation(fields: [tenantId], references: [id])
  deliveryNote   PurchaseDeliveryNote @relation(fields: [deliveryNoteId], references: [id], onDelete: Cascade)
  product        Product              @relation("PurchaseDeliveryNoteItemProduct", fields: [productId], references: [id])

  @@index([deliveryNoteId])
  @@index([productId])
  @@index([tenantId])
  @@map("purchase_delivery_note_items")
}
```

### 21. purchase_delivery_note_logs
```prisma
model PurchaseDeliveryNoteLog {
  id             String               @id @default(uuid())
  deliveryNoteId String               @map("delivery_note_id")
  userId         String?              @map("user_id")
  actionType     LogAction            @map("action_type")
  changes        String?              @map("changes")
  ipAddress      String?              @map("ip_address")
  userAgent      String?              @map("user_agent")
  createdAt      DateTime             @default(now())
  tenantId       String
  tenant         Tenant?              @relation(fields: [tenantId], references: [id])
  deliveryNote   PurchaseDeliveryNote @relation(fields: [deliveryNoteId], references: [id], onDelete: Cascade)
  user           User?                @relation("PurchaseDeliveryNoteLogUser", fields: [userId], references: [id])

  @@index([deliveryNoteId])
  @@index([userId])
  @@index([tenantId])
  @@map("purchase_delivery_note_logs")
}
```

### 22. purchase_order_items
```prisma
model PurchaseOrderItem {
  id               String          @id @default(uuid())
  purchaseOrderId  String          @map("purchase_order_id")
  productId        String          @map("product_id")
  orderedQuantity  Int             @map("ordered_quantity")
  receivedQuantity Int             @default(0) @map("received_quantity")
  unitPrice        Decimal         @map("unit_price") @db.Decimal(10, 2)
  status           OrderItemStatus @default(PENDING)
  createdAt        DateTime        @default(now()) @map("created_at")
  tenantId         String
  tenant           Tenant?         @relation(fields: [tenantId], references: [id])
  invoiceItems     InvoiceItem[]   @relation("PurchaseOrderItemInvoiceItem")
  product          Product         @relation("PurchaseOrderItemProduct", fields: [productId], references: [id])
  purchaseOrder    PurchaseOrder   @relation(fields: [purchaseOrderId], references: [id], onDelete: Cascade)

  @@index([purchaseOrderId])
  @@index([productId])
  @@index([tenantId])
  @@map("purchase_order_items")
}
```

### 23. procurement_order_items
```prisma
model ProcurementOrderItem {
  id                String           @id @default(uuid())
  orderId           String           @map("order_id")
  productId         String           @map("product_id")
  quantity          Int              @map("quantity")
  deliveredQuantity Int              @default(0) @map("delivered_quantity")
  unitPrice         Decimal          @map("unit_price") @db.Decimal(10, 2)
  vatRate           Int              @map("vat_rate")
  vatAmount         Decimal          @map("vat_amount") @db.Decimal(10, 2)
  amount            Decimal          @map("amount") @db.Decimal(10, 2)
  createdAt         DateTime         @default(now())
  tenantId          String
  tenant            Tenant?          @relation(fields: [tenantId], references: [id])
  order             ProcurementOrder @relation(fields: [orderId], references: [id], onDelete: Cascade)
  product           Product          @relation("ProcurementOrderItemProduct", fields: [productId], references: [id])

  @@index([orderId])
  @@index([productId])
  @@index([tenantId])
  @@map("purchase_order_local_items")
}
```

### 24. warehouse_transfer_items
```prisma
model WarehouseTransferItem {
  id             String            @id @default(uuid())
  transferId     String            @map("transferId")
  productId      String            @map("product_id")
  quantity       Int               @map("quantity")
  fromLocationId String?           @map("fromLocationId")
  toLocationId   String?           @map("toLocationId")
  createdAt      DateTime          @default(now())
  tenantId       String
  tenant         Tenant?           @relation(fields: [tenantId], references: [id])
  fromLocation   Location?         @relation("WarehouseTransferItemFrom", fields: [fromLocationId], references: [id])
  product        Product           @relation(fields: [productId], references: [id])
  toLocation     Location?         @relation("WarehouseTransferItemTo", fields: [toLocationId], references: [id])
  transfer       WarehouseTransfer @relation(fields: [transferId], references: [id], onDelete: Cascade)

  @@index([productId])
  @@index([transferId])
  @@index([tenantId])
  @@map("warehouse_transfer_items")
}
```

### 25. account_contacts
```prisma
model AccountContact {
  id        String   @id @default(uuid())
  accountId String   @map("account_id")
  fullName  String   @map("full_name")
  title     String?  @map("title")
  phone     String?  @map("phone")
  email     String?  @map("email")
  extension String?  @map("extension")
  isDefault Boolean  @default(false) @map("is_default")
  notes     String?  @map("notes")
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  tenantId  String
  tenant    Tenant?  @relation(fields: [tenantId], references: [id])
  account   Account  @relation(fields: [accountId], references: [id], onDelete: Cascade)

  @@index([accountId])
  @@index([tenantId])
  @@map("account_contacts")
}
```

### 26. account_addresses
```prisma
model AccountAddress {
  id         String      @id @default(uuid())
  accountId  String      @map("account_id")
  title      String      @map("title")
  type       AddressType @map("type")
  address    String      @map("address")
  city       String?     @map("city")
  district   String?     @map("district")
  postalCode String?     @map("postal_code")
  isDefault  Boolean     @default(false) @map("is_default")
  createdAt  DateTime    @default(now())
  updatedAt  DateTime    @updatedAt
  tenantId   String
  tenant     Tenant?     @relation(fields: [tenantId], references: [id])
  account    Account     @relation(fields: [accountId], references: [id], onDelete: Cascade)

  @@index([accountId])
  @@index([tenantId])
  @@map("account_addresses")
}
```

### 27. account_banks
```prisma
model AccountBank {
  id         String   @id @default(uuid())
  accountId  String   @map("account_id")
  bankName   String   @map("bank_name")
  branchName String?  @map("branch_name")
  branchCode String?  @map("branch_code")
  accountNo  String?  @map("account_no")
  iban       String   @map("iban")
  currency   String?  @map("currency")
  notes      String?  @map("notes")
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
  tenantId   String
  tenant     Tenant?  @relation(fields: [tenantId], references: [id])
  account    Account  @relation(fields: [accountId], references: [id], onDelete: Cascade)

  @@index([accountId])
  @@index([tenantId])
  @@map("account_banks")
}
```

### 28. invoice_payment_plans
```prisma
model InvoicePaymentPlan {
  id          String   @id @default(uuid())
  invoiceId   String   @map("invoice_id")
  dueDate     DateTime @map("due_date")
  amount      Decimal  @map("amount") @db.Decimal(12, 2)
  paymentType String?  @map("payment_type")
  notes       String?  @map("notes")
  isPaid      Boolean  @default(false) @map("is_paid")
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
  tenantId    String
  tenant      Tenant?  @relation(fields: [tenantId], references: [id])
  invoice     Invoice  @relation(fields: [invoiceId], references: [id], onDelete: Cascade)

  @@index([invoiceId])
  @@index([tenantId])
  @@map("invoice_payment_plans")
}
```

### 29. invoice_logs
```prisma
model InvoiceLog {
  id         String    @id @default(uuid())
  invoiceId  String    @map("invoice_id")
  userId     String?   @map("user_id")
  actionType LogAction @map("action_type")
  changes    String?   @map("changes")
  ipAddress  String?   @map("ip_address")
  userAgent  String?   @map("user_agent")
  createdAt  DateTime  @default(now())
  tenantId   String
  tenant     Tenant?   @relation(fields: [tenantId], references: [id])
  invoice    Invoice   @relation(fields: [invoiceId], references: [id], onDelete: Cascade)
  user       User?     @relation(fields: [userId], references: [id])

  @@index([invoiceId])
  @@index([userId])
  @@index([tenantId])
  @@map("invoice_logs")
}
```

### 30. sales_order_logs
```prisma
model SalesOrderLog {
  id         String     @id @default(uuid())
  orderId    String     @map("order_id")
  userId     String?    @map("user_id")
  actionType LogAction  @map("action_type")
  changes    String?    @map("changes")
  ipAddress  String?    @map("ip_address")
  userAgent  String?    @map("user_agent")
  createdAt  DateTime   @default(now())
  tenantId   String
  tenant     Tenant?    @relation(fields: [tenantId], references: [id])
  order      SalesOrder @relation(fields: [orderId], references: [id], onDelete: Cascade)
  user       User?      @relation(fields: [userId], references: [id])

  @@index([orderId])
  @@index([userId])
  @@index([tenantId])
  @@map("sales_order_logs")
}
```

### 31. quote_logs
```prisma
model QuoteLog {
  id         String    @id @default(uuid())
  quoteId    String    @map("quote_id")
  userId     String?   @map("user_id")
  actionType LogAction @map("action_type")
  changes    String?   @map("changes")
  ipAddress  String?   @map("ip_address")
  userAgent  String?   @map("user_agent")
  createdAt  DateTime  @default(now())
  tenantId   String
  tenant     Tenant?   @relation(fields: [tenantId], references: [id])
  quote      Quote     @relation(fields: [quoteId], references: [id], onDelete: Cascade)
  user       User?     @relation(fields: [userId], references: [id])

  @@index([quoteId])
  @@index([userId])
  @@index([tenantId])
  @@map("quote_logs")
}
```

### 32. bank_transfer_logs
```prisma
model BankTransferLog {
  id             String       @id @default(uuid())
  bankTransferId String       @map("bank_transfer_id")
  userId         String?      @map("user_id")
  actionType     LogAction    @map("action_type")
  changes        String?      @map("changes")
  ipAddress      String?      @map("ip_address")
  userAgent      String?      @map("user_agent")
  createdAt      DateTime     @default(now())
  tenantId       String
  tenant         Tenant?      @relation(fields: [tenantId], references: [id])
  bankTransfer   BankTransfer @relation(fields: [bankTransferId], references: [id], onDelete: Cascade)
  user           User?        @relation(fields: [userId], references: [id])

  @@index([bankTransferId])
  @@index([userId])
  @@index([tenantId])
  @@map("bank_transfer_logs")
}
```

### 33. check_bill_logs
```prisma
model CheckBillLog {
  id          String    @id @default(uuid())
  checkBillId String    @map("check_bill_id")
  userId      String?   @map("user_id")
  actionType  LogAction @map("action_type")
  changes     String?   @map("changes")
  ipAddress   String?   @map("ip_address")
  userAgent   String?   @map("user_agent")
  createdAt   DateTime  @default(now())
  tenantId    String
  tenant      Tenant?   @relation(fields: [tenantId], references: [id])
  checkBill   CheckBill @relation(fields: [checkBillId], references: [id], onDelete: Cascade)
  user        User?     @relation(fields: [userId], references: [id])

  @@index([checkBillId])
  @@index([userId])
  @@index([tenantId])
  @@map("check_bill_logs")
}
```

### 34. employee_payments
```prisma
model EmployeePayment {
  id            String              @id @default(uuid())
  employeeId    String              @map("employee_id")
  type          EmployeePaymentType @map("type")
  amount        Decimal             @map("amount") @db.Decimal(10, 2)
  date          DateTime            @default(now()) @map("date")
  period        String?             @map("period")
  notes         String?             @map("notes")
  cashboxId     String?             @map("cashbox_id")
  createdAt     DateTime            @default(now())
  tenantId      String
  tenant        Tenant?             @relation(fields: [tenantId], references: [id])
  createdByUser User?               @relation("EmployeePaymentCreatedBy", fields: [createdBy], references: [id])
  cashbox       Cashbox?            @relation(fields: [cashboxId], references: [id])
  employee      Employee            @relation(fields: [employeeId], references: [id], onDelete: Cascade)

  @@index([employeeId])
  @@index([date])
  @@index([type])
  @@index([tenantId])
  @@map("employee_payments")
}
```

### 35. warehouse_critical_stocks
```prisma
model WarehouseCriticalStock {
  id          String    @id @default(uuid())
  warehouseId String
  productId   String
  criticalQty Int       @default(0)
  createdAt   DateTime  @default(now())
  updatedAt   DateTime  @updatedAt
  tenantId    String
  tenant      Tenant?   @relation(fields: [tenantId], references: [id])
  product     Product   @relation(fields: [productId], references: [id], onDelete: Cascade)
  warehouse   Warehouse @relation(fields: [warehouseId], references: [id], onDelete: Cascade)

  @@unique([warehouseId, productId])
  @@index([productId])
  @@index([warehouseId])
  @@index([tenantId])
  @@map("warehouse_critical_stocks")
}
```

### 36. warehouse_transfer_logs
```prisma
model WarehouseTransferLog {
  id         String            @id @default(uuid())
  transferId String
  userId     String?
  actionType LogAction
  changes    String?
  ipAddress  String?
  userAgent  String?
  createdAt  DateTime          @default(now())
  tenantId   String
  tenant     Tenant?           @relation(fields: [tenantId], references: [id])
  transfer   WarehouseTransfer @relation(fields: [transferId], references: [id], onDelete: Cascade)
  user       User?             @relation(fields: [userId], references: [id])

  @@index([transferId])
  @@index([userId])
  @@index([tenantId])
  @@map("warehouse_transfer_logs")
}
```

### 37. role_permissions
```prisma
model RolePermission {
  id           String     @id @default(uuid())
  roleId       String
  permissionId String
  createdAt    DateTime   @default(now())
  tenantId     String
  tenant       Tenant?    @relation(fields: [tenantId], references: [id])
  role         Role       @relation(fields: [roleId], references: [id], onDelete: Cascade)
  permission   Permission @relation(fields: [permissionId], references: [id], onDelete: Cascade)

  @@unique([roleId, permissionId])
  @@index([tenantId])
  @@map("role_permissions")
}
```

### 38-41. Fix nullable tenantId to NOT NULL
For: invoice_collections, pos_payments, pos_sessions, etc.

---

## SQL Migration

```sql
-- ============================================
-- TASK 1: Fix Nullable/Missing tenantId Columns
-- ============================================

-- ============================================
-- EXPENSE_CATEGORIES - Add tenantId
-- ============================================
-- Step 1: Add nullable column
ALTER TABLE expense_categories ADD COLUMN tenant_id TEXT;

-- Step 2: Backfill - Assign to first tenant or flag for manual review
-- WARNING: This table was shared globally, need to decide on data ownership
-- Option A: Assign all to a default tenant (CHANGE THE UUID BELOW)
UPDATE expense_categories SET tenant_id = 'DEFAULT_TENANT_UUID_HERE' WHERE tenant_id IS NULL;

-- Option B: Flag for manual review
-- SELECT id, name FROM expense_categories; -- Review and update manually

-- Step 3: Add foreign key constraint
ALTER TABLE expense_categories 
ADD CONSTRAINT expense_categories_tenant_fk 
FOREIGN KEY (tenant_id) REFERENCES tenants(id);

-- Step 4: Set NOT NULL
ALTER TABLE expense_categories ALTER COLUMN tenant_id SET NOT NULL;

-- Step 5: Drop old unique constraint
ALTER TABLE expense_categories DROP CONSTRAINT expense_categories_name_key;

-- Step 6: Add new unique constraint
ALTER TABLE expense_categories 
ADD CONSTRAINT expense_categories_tenant_name_unique 
UNIQUE (tenant_id, name);

-- Step 7: Add index
CREATE INDEX expense_categories_tenant_idx ON expense_categories(tenant_id);


-- ============================================
-- PRICE_CARDS - Add tenantId and vatRate
-- ============================================
-- Step 1: Add nullable columns
ALTER TABLE price_cards ADD COLUMN tenant_id TEXT;
ALTER TABLE price_cards ADD COLUMN vat_rate INTEGER;

-- Step 2: Backfill tenantId from products
UPDATE price_cards pc
SET tenant_id = p.tenant_id
FROM products p
WHERE pc.product_id = p.id AND pc.tenant_id IS NULL;

-- Step 3: Backfill vatRate from products (or use NULL)
UPDATE price_cards pc
SET vat_rate = p.vat_rate
FROM products p
WHERE pc.product_id = p.id AND pc.vat_rate IS NULL;

-- Step 4: Add foreign key constraint
ALTER TABLE price_cards 
ADD CONSTRAINT price_cards_tenant_fk 
FOREIGN KEY (tenant_id) REFERENCES tenants(id);

-- Step 5: Set NOT NULL for tenantId
ALTER TABLE price_cards ALTER COLUMN tenant_id SET NOT NULL;

-- Step 6: Add indexes
CREATE INDEX price_cards_tenant_idx ON price_cards(tenant_id);
CREATE INDEX price_cards_tenant_product_type_created_idx 
ON price_cards(tenant_id, product_id, type, created_at);


-- ============================================
-- INVOICE_ITEMS - Add tenantId
-- ============================================
-- Step 1: Add nullable column
ALTER TABLE invoice_items ADD COLUMN tenant_id TEXT;

-- Step 2: Backfill from invoices
UPDATE invoice_items ii
SET tenant_id = i.tenant_id
FROM invoices i
WHERE ii.invoice_id = i.id AND ii.tenant_id IS NULL;

-- Step 3: Add foreign key constraint
ALTER TABLE invoice_items 
ADD CONSTRAINT invoice_items_tenant_fk 
FOREIGN KEY (tenant_id) REFERENCES tenants(id);

-- Step 4: Set NOT NULL
ALTER TABLE invoice_items ALTER COLUMN tenant_id SET NOT NULL;

-- Step 5: Add indexes
CREATE INDEX invoice_items_tenant_idx ON invoice_items(tenant_id);
CREATE INDEX invoice_items_tenant_invoice_idx ON invoice_items(tenant_id, invoice_id);
CREATE INDEX invoice_items_tenant_product_idx ON invoice_items(tenant_id, product_id);


-- ============================================
-- ORDER_PICKINGS - Add tenantId
-- ============================================
-- Step 1: Add nullable column
ALTER TABLE order_pickings ADD COLUMN tenant_id TEXT;

-- Step 2: Backfill from sales_orders
UPDATE order_pickings op
SET tenant_id = so."tenantId"
FROM sales_orders so
WHERE op.order_id = so.id AND op.tenant_id IS NULL;

-- Step 3: Add foreign key constraint
ALTER TABLE order_pickings 
ADD CONSTRAINT order_pickings_tenant_fk 
FOREIGN KEY (tenant_id) REFERENCES tenants(id);

-- Step 4: Set NOT NULL
ALTER TABLE order_pickings ALTER COLUMN tenant_id SET NOT NULL;

-- Step 5: Add index
CREATE INDEX order_pickings_tenant_idx ON order_pickings(tenant_id);


-- ============================================
-- WORK_ORDER_ITEMS - Add tenantId
-- ============================================
-- Step 1: Add nullable column
ALTER TABLE work_order_items ADD COLUMN tenant_id TEXT;

-- Step 2: Backfill from work_orders
UPDATE work_order_items woi
SET tenant_id = wo."tenantId"
FROM work_orders wo
WHERE woi."workOrderId" = wo.id AND woi.tenant_id IS NULL;

-- Step 3: Add foreign key constraint
ALTER TABLE work_order_items 
ADD CONSTRAINT work_order_items_tenant_fk 
FOREIGN KEY (tenant_id) REFERENCES tenants(id);

-- Step 4: Set NOT NULL
ALTER TABLE work_order_items ALTER COLUMN tenant_id SET NOT NULL;

-- Step 5: Add index
CREATE INDEX work_order_items_tenant_idx ON work_order_items(tenant_id);


-- ============================================
-- WORK_ORDER_ACTIVITIES - Add tenantId
-- ============================================
-- Step 1: Add nullable column
ALTER TABLE work_order_activities ADD COLUMN tenant_id TEXT;

-- Step 2: Backfill from work_orders
UPDATE work_order_activities woa
SET tenant_id = wo."tenantId"
FROM work_orders wo
WHERE woa.work_order_id = wo.id AND woa.tenant_id IS NULL;

-- Step 3: Add foreign key constraint
ALTER TABLE work_order_activities 
ADD CONSTRAINT work_order_activities_tenant_fk 
FOREIGN KEY (tenant_id) REFERENCES tenants(id);

-- Step 4: Set NOT NULL
ALTER TABLE work_order_activities ALTER COLUMN tenant_id SET NOT NULL;

-- Step 5: Add index
CREATE INDEX work_order_activities_tenant_idx ON work_order_activities(tenant_id);


-- ============================================
-- PRODUCT_BARCODES - Add tenantId
-- ============================================
-- Step 1: Add nullable column
ALTER TABLE product_barcodes ADD COLUMN tenant_id TEXT;

-- Step 2: Backfill from products
UPDATE product_barcodes pb
SET tenant_id = p.tenant_id
FROM products p
WHERE pb.product_id = p.id AND pb.tenant_id IS NULL;

-- Step 3: Add foreign key constraint
ALTER TABLE product_barcodes 
ADD CONSTRAINT product_barcodes_tenant_fk 
FOREIGN KEY (tenant_id) REFERENCES tenants(id);

-- Step 4: Set NOT NULL
ALTER TABLE product_barcodes ALTER COLUMN tenant_id SET NOT NULL;

-- Step 5: Drop old unique constraint
ALTER TABLE product_barcodes DROP CONSTRAINT product_barcodes_barcode_key;

-- Step 6: Add new unique constraint
ALTER TABLE product_barcodes 
ADD CONSTRAINT product_barcodes_tenant_barcode_unique 
UNIQUE (tenant_id, barcode);

-- Step 7: Add index
CREATE INDEX product_barcodes_tenant_idx ON product_barcodes(tenant_id);


-- ============================================
-- CASHBOX_MOVEMENTS - Add tenantId
-- ============================================
-- Step 1: Add nullable column
ALTER TABLE cashbox_movements ADD COLUMN tenant_id TEXT;

-- Step 2: Backfill from cashboxes
UPDATE cashbox_movements cm
SET tenant_id = c.tenant_id
FROM cashboxes c
WHERE cm.cashbox_id = c.id AND cm.tenant_id IS NULL;

-- Step 3: Add foreign key constraint
ALTER TABLE cashbox_movements 
ADD CONSTRAINT cashbox_movements_tenant_fk 
FOREIGN KEY (tenant_id) REFERENCES tenants(id);

-- Step 4: Set NOT NULL
ALTER TABLE cashbox_movements ALTER COLUMN tenant_id SET NOT NULL;

-- Step 5: Add indexes
CREATE INDEX cashbox_movements_tenant_idx ON cashbox_movements(tenant_id);
CREATE INDEX cashbox_movements_tenant_cashbox_date_idx 
ON cashbox_movements(tenant_id, cashbox_id, date);
CREATE INDEX cashbox_movements_tenant_created_idx 
ON cashbox_movements(tenant_id, created_at);


-- ============================================
-- BANK_ACCOUNT_MOVEMENTS - Add tenantId
-- ============================================
-- Step 1: Add nullable column
ALTER TABLE bank_account_movements ADD COLUMN tenant_id TEXT;

-- Step 2: Backfill from bank_accounts -> banks
UPDATE bank_account_movements bam
SET tenant_id = b.tenant_id
FROM bank_accounts ba
JOIN banks b ON ba.bank_id = b.id
WHERE bam.bank_account_id = ba.id AND bam.tenant_id IS NULL;

-- Step 3: Add foreign key constraint
ALTER TABLE bank_account_movements 
ADD CONSTRAINT bank_account_movements_tenant_fk 
FOREIGN KEY (tenant_id) REFERENCES tenants(id);

-- Step 4: Set NOT NULL
ALTER TABLE bank_account_movements ALTER COLUMN tenant_id SET NOT NULL;

-- Step 5: Add index
CREATE INDEX bank_account_movements_tenant_idx ON bank_account_movements(tenant_id);


-- ============================================
-- JOURNAL_ENTRY_LINES - Add tenantId
-- ============================================
-- Step 1: Add nullable column
ALTER TABLE journal_entry_lines ADD COLUMN tenant_id TEXT;

-- Step 2: Backfill from journal_entries
UPDATE journal_entry_lines jel
SET tenant_id = je.tenant_id
FROM journal_entries je
WHERE jel.journal_entry_id = je.id AND jel.tenant_id IS NULL;

-- Step 3: Add foreign key constraint
ALTER TABLE journal_entry_lines 
ADD CONSTRAINT journal_entry_lines_tenant_fk 
FOREIGN KEY (tenant_id) REFERENCES tenants(id);

-- Step 4: Set NOT NULL
ALTER TABLE journal_entry_lines ALTER COLUMN tenant_id SET NOT NULL;

-- Step 5: Add index
CREATE INDEX journal_entry_lines_tenant_idx ON journal_entry_lines(tenant_id);


-- ============================================
-- EQUIVALENCY_GROUPS - Add tenantId
-- ============================================
-- Step 1: Add nullable column
ALTER TABLE equivalency_groups ADD COLUMN tenant_id TEXT;

-- Step 2: Backfill from first product in group
UPDATE equivalency_groups eg
SET tenant_id = (
  SELECT p.tenant_id 
  FROM products p 
  WHERE p.equivalency_group_id = eg.id 
  LIMIT 1
)
WHERE tenant_id IS NULL;

-- Step 3: Add foreign key constraint
ALTER TABLE equivalency_groups 
ADD CONSTRAINT equivalency_groups_tenant_fk 
FOREIGN KEY (tenant_id) REFERENCES tenants(id);

-- Step 4: Set NOT NULL
ALTER TABLE equivalency_groups ALTER COLUMN tenant_id SET NOT NULL;

-- Step 5: Add index
CREATE INDEX equivalency_groups_tenant_idx ON equivalency_groups(tenant_id);


-- ============================================
-- COMPANY_CREDIT_CARDS - Add tenantId
-- ============================================
-- Step 1: Add nullable column
ALTER TABLE company_credit_cards ADD COLUMN tenant_id TEXT;

-- Step 2: Backfill from cashboxes
UPDATE company_credit_cards ccc
SET tenant_id = c.tenant_id
FROM cashboxes c
WHERE ccc.cashbox_id = c.id AND ccc.tenant_id IS NULL;

-- Step 3: Add foreign key constraint
ALTER TABLE company_credit_cards 
ADD CONSTRAINT company_credit_cards_tenant_fk 
FOREIGN KEY (tenant_id) REFERENCES tenants(id);

-- Step 4: Set NOT NULL
ALTER TABLE company_credit_cards ALTER COLUMN tenant_id SET NOT NULL;

-- Step 5: Add index
CREATE INDEX company_credit_cards_tenant_idx ON company_credit_cards(tenant_id);


-- ============================================
-- PRODUCT_COST_HISTORY - Add tenantId
-- ============================================
-- Step 1: Add nullable column
ALTER TABLE stock_cost_history ADD COLUMN tenant_id TEXT;

-- Step 2: Backfill from products
UPDATE stock_cost_history pch
SET tenant_id = p.tenant_id
FROM products p
WHERE pch.product_id = p.id AND pch.tenant_id IS NULL;

-- Step 3: Add foreign key constraint
ALTER TABLE stock_cost_history 
ADD CONSTRAINT stock_cost_history_tenant_fk 
FOREIGN KEY (tenant_id) REFERENCES tenants(id);

-- Step 4: Set NOT NULL
ALTER TABLE stock_cost_history ALTER COLUMN tenant_id SET NOT NULL;

-- Step 5: Add indexes
CREATE INDEX stock_cost_history_tenant_idx ON stock_cost_history(tenant_id);
CREATE INDEX stock_cost_history_tenant_product_computed_idx 
ON stock_cost_history(tenant_id, product_id, computed_at);


-- ============================================
-- QUOTE_ITEMS - Add tenantId
-- ============================================
-- Step 1: Add nullable column
ALTER TABLE quote_items ADD COLUMN tenant_id TEXT;

-- Step 2: Backfill from quotes
UPDATE quote_items qi
SET tenant_id = q.tenant_id
FROM quotes q
WHERE qi.quote_id = q.id AND qi.tenant_id IS NULL;

-- Step 3: Add foreign key constraint
ALTER TABLE quote_items 
ADD CONSTRAINT quote_items_tenant_fk 
FOREIGN KEY (tenant_id) REFERENCES tenants(id);

-- Step 4: Set NOT NULL
ALTER TABLE quote_items ALTER COLUMN tenant_id SET NOT NULL;

-- Step 5: Add index
CREATE INDEX quote_items_tenant_idx ON quote_items(tenant_id);


-- ============================================
-- STOCKTAKE_ITEMS - Add tenantId
-- ============================================
-- Step 1: Add nullable column
ALTER TABLE stocktake_items ADD COLUMN tenant_id TEXT;

-- Step 2: Backfill from stocktakes
UPDATE stocktake_items si
SET tenant_id = s.tenant_id
FROM stocktakes s
WHERE si.stocktake_id = s.id AND si.tenant_id IS NULL;

-- Step 3: Add foreign key constraint
ALTER TABLE stocktake_items 
ADD CONSTRAINT stocktake_items_tenant_fk 
FOREIGN KEY (tenant_id) REFERENCES tenants(id);

-- Step 4: Set NOT NULL
ALTER TABLE stocktake_items ALTER COLUMN tenant_id SET NOT NULL;

-- Step 5: Add index
CREATE INDEX stocktake_items_tenant_idx ON stocktake_items(tenant_id);


-- ============================================
-- SHELF - Add tenantId
-- ============================================
-- Step 1: Add nullable column
ALTER TABLE shelves ADD COLUMN tenant_id TEXT;

-- Step 2: Backfill from warehouses
UPDATE shelves s
SET tenant_id = w.tenant_id
FROM warehouses w
WHERE s.warehouse_id = w.id AND s.tenant_id IS NULL;

-- Step 3: Add foreign key constraint
ALTER TABLE shelves 
ADD CONSTRAINT shelves_tenant_fk 
FOREIGN KEY (tenant_id) REFERENCES tenants(id);

-- Step 4: Set NOT NULL
ALTER TABLE shelves ALTER COLUMN tenant_id SET NOT NULL;

-- Step 5: Add index
CREATE INDEX shelves_tenant_idx ON shelves(tenant_id);


-- ============================================
-- PRODUCT_SHELF - Add tenantId
-- ============================================
-- Step 1: Add nullable column
ALTER TABLE product_shelves ADD COLUMN tenant_id TEXT;

-- Step 2: Backfill from products
UPDATE product_shelves ps
SET tenant_id = p.tenant_id
FROM products p
WHERE ps.product_id = p.id AND ps.tenant_id IS NULL;

-- Step 3: Add foreign key constraint
ALTER TABLE product_shelves 
ADD CONSTRAINT product_shelves_tenant_fk 
FOREIGN KEY (tenant_id) REFERENCES tenants(id);

-- Step 4: Set NOT NULL
ALTER TABLE product_shelves ALTER COLUMN tenant_id SET NOT NULL;

-- Step 5: Add index
CREATE INDEX product_shelves_tenant_idx ON product_shelves(tenant_id);


-- ============================================
-- PRODUCT_LOCATION_STOCKS - Add tenantId
-- ============================================
-- Step 1: Add nullable column
ALTER TABLE product_location_stocks ADD COLUMN tenant_id TEXT;

-- Step 2: Backfill from warehouses
UPDATE product_location_stocks pls
SET tenant_id = w.tenant_id
FROM warehouses w
WHERE pls.warehouse_id = w.id AND pls.tenant_id IS NULL;

-- Step 3: Add foreign key constraint
ALTER TABLE product_location_stocks 
ADD CONSTRAINT product_location_stocks_tenant_fk 
FOREIGN KEY (tenant_id) REFERENCES tenants(id);

-- Step 4: Set NOT NULL
ALTER TABLE product_location_stocks ALTER COLUMN tenant_id SET NOT NULL;

-- Step 5: Add index
CREATE INDEX product_location_stocks_tenant_idx ON product_location_stocks(tenant_id);


-- ============================================
-- SALES_DELIVERY_NOTE_ITEMS - Add tenantId
-- ============================================
-- Step 1: Add nullable column
ALTER TABLE sales_delivery_note_items ADD COLUMN tenant_id TEXT;

-- Step 2: Backfill from sales_delivery_notes
UPDATE sales_delivery_note_items sdni
SET tenant_id = sdn."tenantId"
FROM sales_delivery_notes sdn
WHERE sdni.delivery_note_id = sdn.id AND sdni.tenant_id IS NULL;

-- Step 3: Add foreign key constraint
ALTER TABLE sales_delivery_note_items 
ADD CONSTRAINT sales_delivery_note_items_tenant_fk 
FOREIGN KEY (tenant_id) REFERENCES tenants(id);

-- Step 4: Set NOT NULL
ALTER TABLE sales_delivery_note_items ALTER COLUMN tenant_id SET NOT NULL;

-- Step 5: Add index
CREATE INDEX sales_delivery_note_items_tenant_idx ON sales_delivery_note_items(tenant_id);


-- ============================================
-- PURCHASE_DELIVERY_NOTE_ITEMS - Add tenantId
-- ============================================
-- Step 1: Add nullable column
ALTER TABLE purchase_delivery_note_items ADD COLUMN tenant_id TEXT;

-- Step 2: Backfill from purchase_delivery_notes
UPDATE purchase_delivery_note_items pdni
SET tenant_id = pdn."tenantId"
FROM purchase_delivery_notes pdn
WHERE pdni.delivery_note_id = pdn.id AND pdni.tenant_id IS NULL;

-- Step 3: Add foreign key constraint
ALTER TABLE purchase_delivery_note_items 
ADD CONSTRAINT purchase_delivery_note_items_tenant_fk 
FOREIGN KEY (tenant_id) REFERENCES tenants(id);

-- Step 4: Set NOT NULL
ALTER TABLE purchase_delivery_note_items ALTER COLUMN tenant_id SET NOT NULL;

-- Step 5: Add index
CREATE INDEX purchase_delivery_note_items_tenant_idx ON purchase_delivery_note_items(tenant_id);


-- ============================================
-- PURCHASE_DELIVERY_NOTE_LOGS - Add tenantId
-- ============================================
-- Step 1: Add nullable column
ALTER TABLE purchase_delivery_note_logs ADD COLUMN tenant_id TEXT;

-- Step 2: Backfill from purchase_delivery_notes
UPDATE purchase_delivery_note_logs pdnl
SET tenant_id = pdn."tenantId"
FROM purchase_delivery_notes pdn
WHERE pdnl.delivery_note_id = pdn.id AND pdnl.tenant_id IS NULL;

-- Step 3: Add foreign key constraint
ALTER TABLE purchase_delivery_note_logs 
ADD CONSTRAINT purchase_delivery_note_logs_tenant_fk 
FOREIGN KEY (tenant_id) REFERENCES tenants(id);

-- Step 4: Set NOT NULL
ALTER TABLE purchase_delivery_note_logs ALTER COLUMN tenant_id SET NOT NULL;

-- Step 5: Add index
CREATE INDEX purchase_delivery_note_logs_tenant_idx ON purchase_delivery_note_logs(tenant_id);


-- ============================================
-- PURCHASE_ORDER_ITEMS - Add tenantId
-- ============================================
-- Step 1: Add nullable column
ALTER TABLE purchase_order_items ADD COLUMN tenant_id TEXT;

-- Step 2: Backfill from purchase_orders
UPDATE purchase_order_items poi
SET tenant_id = po.tenant_id
FROM purchase_orders po
WHERE poi.purchase_order_id = po.id AND poi.tenant_id IS NULL;

-- Step 3: Add foreign key constraint
ALTER TABLE purchase_order_items 
ADD CONSTRAINT purchase_order_items_tenant_fk 
FOREIGN KEY (tenant_id) REFERENCES tenants(id);

-- Step 4: Set NOT NULL
ALTER TABLE purchase_order_items ALTER COLUMN tenant_id SET NOT NULL;

-- Step 5: Add index
CREATE INDEX purchase_order_items_tenant_idx ON purchase_order_items(tenant_id);


-- ============================================
-- PROCUREMENT_ORDER_ITEMS - Add tenantId
-- ============================================
-- Step 1: Add nullable column
ALTER TABLE purchase_order_local_items ADD COLUMN tenant_id TEXT;

-- Step 2: Backfill from procurement_orders
UPDATE purchase_order_local_items poi
SET tenant_id = po."tenantId"
FROM procurement_orders po
WHERE poi.order_id = po.id AND poi.tenant_id IS NULL;

-- Step 3: Add foreign key constraint
ALTER TABLE purchase_order_local_items 
ADD CONSTRAINT purchase_order_local_items_tenant_fk 
FOREIGN KEY (tenant_id) REFERENCES tenants(id);

-- Step 4: Set NOT NULL
ALTER TABLE purchase_order_local_items ALTER COLUMN tenant_id SET NOT NULL;

-- Step 5: Add index
CREATE INDEX purchase_order_local_items_tenant_idx ON purchase_order_local_items(tenant_id);


-- ============================================
-- WAREHOUSE_TRANSFER_ITEMS - Add tenantId
-- ============================================
-- Step 1: Add nullable column
ALTER TABLE warehouse_transfer_items ADD COLUMN tenant_id TEXT;

-- Step 2: Backfill from warehouse_transfers
UPDATE warehouse_transfer_items wti
SET tenant_id = wt."tenantId"
FROM warehouse_transfers wt
WHERE wti."transferId" = wt.id AND wti.tenant_id IS NULL;

-- Step 3: Add foreign key constraint
ALTER TABLE warehouse_transfer_items 
ADD CONSTRAINT warehouse_transfer_items_tenant_fk 
FOREIGN KEY (tenant_id) REFERENCES tenants(id);

-- Step 4: Set NOT NULL
ALTER TABLE warehouse_transfer_items ALTER COLUMN tenant_id SET NOT NULL;

-- Step 5: Add index
CREATE INDEX warehouse_transfer_items_tenant_idx ON warehouse_transfer_items(tenant_id);


-- ============================================
-- ACCOUNT_CONTACTS - Add tenantId
-- ============================================
-- Step 1: Add nullable column
ALTER TABLE account_contacts ADD COLUMN tenant_id TEXT;

-- Step 2: Backfill from accounts
UPDATE account_contacts ac
SET tenant_id = a.tenant_id
FROM accounts a
WHERE ac.account_id = a.id AND ac.tenant_id IS NULL;

-- Step 3: Add foreign key constraint
ALTER TABLE account_contacts 
ADD CONSTRAINT account_contacts_tenant_fk 
FOREIGN KEY (tenant_id) REFERENCES tenants(id);

-- Step 4: Set NOT NULL
ALTER TABLE account_contacts ALTER COLUMN tenant_id SET NOT NULL;

-- Step 5: Add index
CREATE INDEX account_contacts_tenant_idx ON account_contacts(tenant_id);


-- ============================================
-- ACCOUNT_ADDRESSES - Add tenantId
-- ============================================
-- Step 1: Add nullable column
ALTER TABLE account_addresses ADD COLUMN tenant_id TEXT;

-- Step 2: Backfill from accounts
UPDATE account_addresses aa
SET tenant_id = a.tenant_id
FROM accounts a
WHERE aa.account_id = a.id AND aa.tenant_id IS NULL;

-- Step 3: Add foreign key constraint
ALTER TABLE account_addresses 
ADD CONSTRAINT account_addresses_tenant_fk 
FOREIGN KEY (tenant_id) REFERENCES tenants(id);

-- Step 4: Set NOT NULL
ALTER TABLE account_addresses ALTER COLUMN tenant_id SET NOT NULL;

-- Step 5: Add index
CREATE INDEX account_addresses_tenant_idx ON account_addresses(tenant_id);


-- ============================================
-- ACCOUNT_BANKS - Add tenantId
-- ============================================
-- Step 1: Add nullable column
ALTER TABLE account_banks ADD COLUMN tenant_id TEXT;

-- Step 2: Backfill from accounts
UPDATE account_banks ab
SET tenant_id = a.tenant_id
FROM accounts a
WHERE ab.account_id = a.id AND ab.tenant_id IS NULL;

-- Step 3: Add foreign key constraint
ALTER TABLE account_banks 
ADD CONSTRAINT account_banks_tenant_fk 
FOREIGN KEY (tenant_id) REFERENCES tenants(id);

-- Step 4: Set NOT NULL
ALTER TABLE account_banks ALTER COLUMN tenant_id SET NOT NULL;

-- Step 5: Add index
CREATE INDEX account_banks_tenant_idx ON account_banks(tenant_id);


-- ============================================
-- INVOICE_PAYMENT_PLANS - Add tenantId
-- ============================================
-- Step 1: Add nullable column
ALTER TABLE invoice_payment_plans ADD COLUMN tenant_id TEXT;

-- Step 2: Backfill from invoices
UPDATE invoice_payment_plans ipp
SET tenant_id = i.tenant_id
FROM invoices i
WHERE ipp.invoice_id = i.id AND ipp.tenant_id IS NULL;

-- Step 3: Add foreign key constraint
ALTER TABLE invoice_payment_plans 
ADD CONSTRAINT invoice_payment_plans_tenant_fk 
FOREIGN KEY (tenant_id) REFERENCES tenants(id);

-- Step 4: Set NOT NULL
ALTER TABLE invoice_payment_plans ALTER COLUMN tenant_id SET NOT NULL;

-- Step 5: Add index
CREATE INDEX invoice_payment_plans_tenant_idx ON invoice_payment_plans(tenant_id);


-- ============================================
-- INVOICE_LOGS - Add tenantId
-- ============================================
-- Step 1: Add nullable column
ALTER TABLE invoice_logs ADD COLUMN tenant_id TEXT;

-- Step 2: Backfill from invoices
UPDATE invoice_logs il
SET tenant_id = i.tenant_id
FROM invoices i
WHERE il.invoice_id = i.id AND il.tenant_id IS NULL;

-- Step 3: Add foreign key constraint
ALTER TABLE invoice_logs 
ADD CONSTRAINT invoice_logs_tenant_fk 
FOREIGN KEY (tenant_id) REFERENCES tenants(id);

-- Step 4: Set NOT NULL
ALTER TABLE invoice_logs ALTER COLUMN tenant_id SET NOT NULL;

-- Step 5: Add index
CREATE INDEX invoice_logs_tenant_idx ON invoice_logs(tenant_id);


-- ============================================
-- SALES_ORDER_LOGS - Add tenantId
-- ============================================
-- Step 1: Add nullable column
ALTER TABLE sales_order_logs ADD COLUMN tenant_id TEXT;

-- Step 2: Backfill from sales_orders
UPDATE sales_order_logs sol
SET tenant_id = so."tenantId"
FROM sales_orders so
WHERE sol.order_id = so.id AND sol.tenant_id IS NULL;

-- Step 3: Add foreign key constraint
ALTER TABLE sales_order_logs 
ADD CONSTRAINT sales_order_logs_tenant_fk 
FOREIGN KEY (tenant_id) REFERENCES tenants(id);

-- Step 4: Set NOT NULL
ALTER TABLE sales_order_logs ALTER COLUMN tenant_id SET NOT NULL;

-- Step 5: Add index
CREATE INDEX sales_order_logs_tenant_idx ON sales_order_logs(tenant_id);


-- ============================================
-- QUOTE_LOGS - Add tenantId
-- ============================================
-- Step 1: Add nullable column
ALTER TABLE quote_logs ADD COLUMN tenant_id TEXT;

-- Step 2: Backfill from quotes
UPDATE quote_logs ql
SET tenant_id = q.tenant_id
FROM quotes q
WHERE ql.quote_id = q.id AND ql.tenant_id IS NULL;

-- Step 3: Add foreign key constraint
ALTER TABLE quote_logs 
ADD CONSTRAINT quote_logs_tenant_fk 
FOREIGN KEY (tenant_id) REFERENCES tenants(id);

-- Step 4: Set NOT NULL
ALTER TABLE quote_logs ALTER COLUMN tenant_id SET NOT NULL;

-- Step 5: Add index
CREATE INDEX quote_logs_tenant_idx ON quote_logs(tenant_id);


-- ============================================
-- BANK_TRANSFER_LOGS - Add tenantId
-- ============================================
-- Step 1: Add nullable column
ALTER TABLE bank_transfer_logs ADD COLUMN tenant_id TEXT;

-- Step 2: Backfill from bank_transfers
UPDATE bank_transfer_logs btl
SET tenant_id = bt.tenant_id
FROM bank_transfers bt
WHERE btl.bank_transfer_id = bt.id AND btl.tenant_id IS NULL;

-- Step 3: Add foreign key constraint
ALTER TABLE bank_transfer_logs 
ADD CONSTRAINT bank_transfer_logs_tenant_fk 
FOREIGN KEY (tenant_id) REFERENCES tenants(id);

-- Step 4: Set NOT NULL
ALTER TABLE bank_transfer_logs ALTER COLUMN tenant_id SET NOT NULL;

-- Step 5: Add index
CREATE INDEX bank_transfer_logs_tenant_idx ON bank_transfer_logs(tenant_id);


-- ============================================
-- CHECK_BILL_LOGS - Add tenantId
-- ============================================
-- Step 1: Add nullable column
ALTER TABLE check_bill_logs ADD COLUMN tenant_id TEXT;

-- Step 2: Backfill from checks_bills
UPDATE check_bill_logs cbl
SET tenant_id = cb.tenant_id
FROM checks_bills cb
WHERE cbl.check_bill_id = cb.id AND cbl.tenant_id IS NULL;

-- Step 3: Add foreign key constraint
ALTER TABLE check_bill_logs 
ADD CONSTRAINT check_bill_logs_tenant_fk 
FOREIGN KEY (tenant_id) REFERENCES tenants(id);

-- Step 4: Set NOT NULL
ALTER TABLE check_bill_logs ALTER COLUMN tenant_id SET NOT NULL;

-- Step 5: Add index
CREATE INDEX check_bill_logs_tenant_idx ON check_bill_logs(tenant_id);


-- ============================================
-- EMPLOYEE_PAYMENTS - Add tenantId
-- ============================================
-- Step 1: Add nullable column
ALTER TABLE employee_payments ADD COLUMN tenant_id TEXT;

-- Step 2: Backfill from employees
UPDATE employee_payments ep
SET tenant_id = e.tenant_id
FROM employees e
WHERE ep.employee_id = e.id AND ep.tenant_id IS NULL;

-- Step 3: Add foreign key constraint
ALTER TABLE employee_payments 
ADD CONSTRAINT employee_payments_tenant_fk 
FOREIGN KEY (tenant_id) REFERENCES tenants(id);

-- Step 4: Set NOT NULL
ALTER TABLE employee_payments ALTER COLUMN tenant_id SET NOT NULL;

-- Step 5: Add index
CREATE INDEX employee_payments_tenant_idx ON employee_payments(tenant_id);


-- ============================================
-- WAREHOUSE_CRITICAL_STOCKS - Add tenantId
-- ============================================
-- Step 1: Add nullable column
ALTER TABLE warehouse_critical_stocks ADD COLUMN tenant_id TEXT;

-- Step 2: Backfill from warehouses
UPDATE warehouse_critical_stocks wcs
SET tenant_id = w.tenant_id
FROM warehouses w
WHERE wcs.warehouse_id = w.id AND wcs.tenant_id IS NULL;

-- Step 3: Add foreign key constraint
ALTER TABLE warehouse_critical_stocks 
ADD CONSTRAINT warehouse_critical_stocks_tenant_fk 
FOREIGN KEY (tenant_id) REFERENCES tenants(id);

-- Step 4: Set NOT NULL
ALTER TABLE warehouse_critical_stocks ALTER COLUMN tenant_id SET NOT NULL;

-- Step 5: Add index
CREATE INDEX warehouse_critical_stocks_tenant_idx ON warehouse_critical_stocks(tenant_id);


-- ============================================
-- WAREHOUSE_TRANSFER_LOGS - Add tenantId
-- ============================================
-- Step 1: Add nullable column
ALTER TABLE warehouse_transfer_logs ADD COLUMN tenant_id TEXT;

-- Step 2: Backfill from warehouse_transfers
UPDATE warehouse_transfer_logs wtl
SET tenant_id = wt."tenantId"
FROM warehouse_transfers wt
WHERE wtl.transfer_id = wt.id AND wtl.tenant_id IS NULL;

-- Step 3: Add foreign key constraint
ALTER TABLE warehouse_transfer_logs 
ADD CONSTRAINT warehouse_transfer_logs_tenant_fk 
FOREIGN KEY (tenant_id) REFERENCES tenants(id);

-- Step 4: Set NOT NULL
ALTER TABLE warehouse_transfer_logs ALTER COLUMN tenant_id SET NOT NULL;

-- Step 5: Add index
CREATE INDEX warehouse_transfer_logs_tenant_idx ON warehouse_transfer_logs(tenant_id);


-- ============================================
-- ROLE_PERMISSIONS - Add tenantId
-- ============================================
-- Step 1: Add nullable column
ALTER TABLE role_permissions ADD COLUMN tenant_id TEXT;

-- Step 2: Backfill from roles
UPDATE role_permissions rp
SET tenant_id = r.tenant_id
FROM roles r
WHERE rp.role_id = r.id AND rp.tenant_id IS NULL;

-- Step 3: Add foreign key constraint
ALTER TABLE role_permissions 
ADD CONSTRAINT role_permissions_tenant_fk 
FOREIGN KEY (tenant_id) REFERENCES tenants(id);

-- Step 4: Set NOT NULL
ALTER TABLE role_permissions ALTER COLUMN tenant_id SET NOT NULL;

-- Step 5: Add index
CREATE INDEX role_permissions_tenant_idx ON role_permissions(tenant_id);


-- ============================================
-- Fix nullable tenantId to NOT NULL
-- ============================================

-- WAREHOUSE
UPDATE warehouses SET tenant_id = 'DEFAULT_TENANT_UUID_HERE' WHERE tenant_id IS NULL;
ALTER TABLE warehouses ALTER COLUMN tenant_id SET NOT NULL;

-- EMPLOYEE
UPDATE employees SET tenant_id = 'DEFAULT_TENANT_UUID_HERE' WHERE tenant_id IS NULL;
ALTER TABLE employees ALTER COLUMN tenant_id SET NOT NULL;

-- CASHBOX
UPDATE cashboxes SET tenant_id = 'DEFAULT_TENANT_UUID_HERE' WHERE tenant_id IS NULL;
ALTER TABLE cashboxes ALTER COLUMN tenant_id SET NOT NULL;

-- BANK
UPDATE banks SET tenant_id = 'DEFAULT_TENANT_UUID_HERE' WHERE tenant_id IS NULL;
ALTER TABLE banks ALTER COLUMN tenant_id SET NOT NULL;

-- SALES_AGENT
UPDATE sales_agents SET tenant_id = 'DEFAULT_TENANT_UUID_HERE' WHERE tenant_id IS NULL;
ALTER TABLE sales_agents ALTER COLUMN tenant_id SET NOT NULL;

-- JOURNAL_ENTRY
UPDATE journal_entries SET tenant_id = 'DEFAULT_TENANT_UUID_HERE' WHERE tenant_id IS NULL;
ALTER TABLE journal_entries ALTER COLUMN tenant_id SET NOT NULL;

-- CHECK_BILL_JOURNAL
UPDATE check_bill_journals SET tenant_id = 'DEFAULT_TENANT_UUID_HERE' WHERE tenant_id IS NULL;
ALTER TABLE check_bill_journals ALTER COLUMN tenant_id SET NOT NULL;

-- BANK_LOAN_PLAN
UPDATE bank_loan_plans SET tenant_id = 'DEFAULT_TENANT_UUID_HERE' WHERE tenant_id IS NULL;
ALTER TABLE bank_loan_plans ALTER COLUMN tenant_id SET NOT NULL;

-- PRICE_LIST
UPDATE price_lists SET tenant_id = 'DEFAULT_TENANT_UUID_HERE' WHERE tenant_id IS NULL;
ALTER TABLE price_lists ALTER COLUMN tenant_id SET NOT NULL;

-- SALARY_PLAN
UPDATE salary_plans SET tenant_id = 'DEFAULT_TENANT_UUID_HERE' WHERE tenant_id IS NULL;
ALTER TABLE salary_plans ALTER COLUMN tenant_id SET NOT NULL;

-- SALARY_PAYMENT
UPDATE salary_payments SET tenant_id = 'DEFAULT_TENANT_UUID_HERE' WHERE tenant_id IS NULL;
ALTER TABLE salary_payments ALTER COLUMN tenant_id SET NOT NULL;

-- SALARY_PAYMENT_DETAIL
UPDATE salary_payment_details SET tenant_id = 'DEFAULT_TENANT_UUID_HERE' WHERE tenant_id IS NULL;
ALTER TABLE salary_payment_details ALTER COLUMN tenant_id SET NOT NULL;

-- ADVANCE
UPDATE advances SET tenant_id = 'DEFAULT_TENANT_UUID_HERE' WHERE tenant_id IS NULL;
ALTER TABLE advances ALTER COLUMN tenant_id SET NOT NULL;

-- ADVANCE_SETTLEMENT
UPDATE advance_settlements SET tenant_id = 'DEFAULT_TENANT_UUID_HERE' WHERE tenant_id IS NULL;
ALTER TABLE advance_settlements ALTER COLUMN tenant_id SET NOT NULL;

-- COMPANY_VEHICLE
UPDATE company_vehicles SET tenant_id = 'DEFAULT_TENANT_UUID_HERE' WHERE tenant_id IS NULL;
ALTER TABLE company_vehicles ALTER COLUMN tenant_id SET NOT NULL;

-- VEHICLE_EXPENSE
UPDATE vehicle_expenses SET tenant_id = 'DEFAULT_TENANT_UUID_HERE' WHERE tenant_id IS NULL;
ALTER TABLE vehicle_expenses ALTER COLUMN tenant_id SET NOT NULL;

-- INVOICE_COLLECTIONS
UPDATE invoice_collections SET tenant_id = i.tenant_id
FROM invoices i
WHERE invoice_collections.invoice_id = i.id AND invoice_collections.tenant_id IS NULL;
ALTER TABLE invoice_collections ALTER COLUMN tenant_id SET NOT NULL;

-- POS_PAYMENTS
UPDATE pos_payments SET tenant_id = i.tenant_id
FROM invoices i
WHERE pos_payments.invoice_id = i.id AND pos_payments.tenant_id IS NULL;
ALTER TABLE pos_payments ALTER COLUMN tenant_id SET NOT NULL;

-- POS_SESSIONS
UPDATE pos_sessions SET tenant_id = 'DEFAULT_TENANT_UUID_HERE' WHERE tenant_id IS NULL;
ALTER TABLE pos_sessions ALTER COLUMN tenant_id SET NOT NULL;

-- CHECK_BILL_JOURNAL_ITEMS
UPDATE check_bill_journal_items SET tenant_id = j.tenant_id
FROM check_bill_journals j
WHERE check_bill_journal_items.journal_id = j.id AND check_bill_journal_items.tenant_id IS NULL;
ALTER TABLE check_bill_journal_items ALTER COLUMN tenant_id SET NOT NULL;

-- SALES_DELIVERY_NOTE_LOGS
UPDATE sales_delivery_note_logs SET tenant_id = sdn."tenantId"
FROM sales_delivery_notes sdn
WHERE sales_delivery_note_logs.delivery_note_id = sdn.id AND sales_delivery_note_logs.tenant_id IS NULL;
ALTER TABLE sales_delivery_note_logs ALTER COLUMN tenant_id SET NOT NULL;


-- ============================================
-- Special Handling: Role Table
-- ============================================
ALTER TABLE roles 
ADD CONSTRAINT roles_tenant_check
CHECK (
  (is_system_role = true  AND tenant_id IS NULL) OR
  (is_system_role = false AND tenant_id IS NOT NULL)
);


-- ============================================
-- Special Handling: User Table
-- ============================================
ALTER TABLE users 
ADD CONSTRAINT users_tenant_check
CHECK (
  (role IN ('SUPER_ADMIN', 'SUPPORT') AND tenant_id IS NULL) OR
  (role NOT IN ('SUPER_ADMIN', 'SUPPORT') AND tenant_id IS NOT NULL)
);
```

---

## Data Migration Notes

### ExpenseCategory (Critical - Global Table)
This table was shared globally across all tenants. You have two options:

**Option A: Assign to Default Tenant**
```sql
-- Identify your default tenant UUID
SELECT id, name FROM tenants WHERE status = 'ACTIVE' LIMIT 1;

-- Update all categories to that tenant
UPDATE expense_categories 
SET tenant_id = 'YOUR_DEFAULT_TENANT_UUID_HERE' 
WHERE tenant_id IS NULL;
```

**Option B: Replicate per Tenant**
```sql
-- For each tenant, copy categories
-- This requires a script to iterate through tenants and duplicate categories
-- Consider category names - they should be unique per tenant
```

**Recommendation:** Use Option A for now, then create a UI for each tenant to manage their own categories.

---

## Rollback

```sql
-- Rollback script to revert all changes
-- WARNING: This may cause data loss if not used carefully

-- Drop check constraints
ALTER TABLE users DROP CONSTRAINT users_tenant_check;
ALTER TABLE roles DROP CONSTRAINT roles_tenant_check;

-- Drop indexes
DROP INDEX IF EXISTS expense_categories_tenant_idx;
DROP INDEX IF EXISTS price_cards_tenant_idx;
DROP INDEX IF EXISTS price_cards_tenant_product_type_created_idx;
DROP INDEX IF EXISTS invoice_items_tenant_idx;
DROP INDEX IF EXISTS invoice_items_tenant_invoice_idx;
DROP INDEX IF EXISTS invoice_items_tenant_product_idx;
-- (and so on for all added indexes...)

-- Drop foreign keys
ALTER TABLE expense_categories DROP CONSTRAINT IF EXISTS expense_categories_tenant_fk;
ALTER TABLE price_cards DROP CONSTRAINT IF EXISTS price_cards_tenant_fk;
-- (and so on for all tables...)

-- Drop NOT NULL constraints
ALTER TABLE expense_categories ALTER COLUMN tenant_id DROP NOT NULL;
ALTER TABLE price_cards ALTER COLUMN tenant_id DROP NOT NULL;
-- (and so on for all tables...)

-- Drop tenant_id columns
ALTER TABLE expense_categories DROP COLUMN IF EXISTS tenant_id;
ALTER TABLE price_cards DROP COLUMN IF EXISTS tenant_id;
ALTER TABLE price_cards DROP COLUMN IF EXISTS vat_rate;
-- (and so on for all tables...)

-- Restore old unique constraints
ALTER TABLE expense_categories ADD UNIQUE (name);
ALTER TABLE product_barcodes ADD UNIQUE (barcode);
```

---

## Verification Queries

```sql
-- Verify no NULL tenant_id values remain (except AuditLog)
SELECT table_name 
FROM information_schema.columns 
WHERE column_name = 'tenant_id' 
  AND table_schema = 'public'
  AND is_nullable = 'YES'
  AND table_name != 'audit_logs'
  AND table_name != 'einvoice_inbox';

-- Verify all tables have tenant_id column
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_type = 'BASE TABLE'
  AND table_name NOT IN (
    'plans', 'modules', 'permissions', 'vehicle_catalog', 'postal_codes',
    'einvoice_inbox', 'audit_logs'
  )
  AND table_name NOT IN (
    SELECT table_name 
    FROM information_schema.columns 
    WHERE column_name = 'tenant_id' 
      AND table_schema = 'public'
  );

-- Verify foreign keys exist
SELECT 
    tc.table_name, 
    kcu.column_name, 
    ccu.table_name AS foreign_table_name,
    ccu.column_name AS foreign_column_name 
FROM 
    information_schema.table_constraints AS tc 
    JOIN information_schema.key_column_usage AS kcu
      ON tc.constraint_name = kcu.constraint_name
      AND tc.table_schema = kcu.table_schema
    JOIN information_schema.constraint_column_usage AS ccu
      ON ccu.constraint_name = tc.constraint_name
      AND ccu.table_schema = tc.table_schema
WHERE tc.constraint_type = 'FOREIGN KEY' 
  AND ccu.table_name = 'tenants'
  AND ccu.column_name = 'id';

-- Verify indexes exist
SELECT 
    schemaname,
    tablename,
    indexname,
    indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND indexname LIKE '%tenant%';

-- Verify check constraints
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'users'::regclass
  OR conrelid = 'roles'::regclass;
```

---

## Important Notes

1. **Backup First**: Always backup your database before running migrations
2. **Test in Staging**: Run these migrations on a staging environment first
3. **Default Tenant UUID**: Replace `'DEFAULT_TENANT_UUID_HERE'` with actual tenant UUID
4. **ExpenseCategory**: This table requires manual review due to global sharing
5. **Performance**: Run migrations during low-traffic periods
6. **Application Updates**: Update application code to handle new tenantId fields
7. **Prisma Migration**: After SQL migration, run `npx prisma migrate dev` to sync schema