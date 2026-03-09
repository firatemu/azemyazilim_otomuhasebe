# Turkish → English column and enum migration

Bu migration, veritabanındaki kalan Türkçe kolon adlarını ve enum değerlerini İngilizceye çevirir.

## Yapılan değişiklikler

### Tablolar / kolonlar
- **customer_vehicles:** cariId→account_id, plaka→plate, aracMarka→brand, aracModel→model, yil→year, saseno→chassis_no, motorGucu→engine_power, aracMotorHacmi→engine_size, aracYakitTipi→fuel_type, sanziman→transmission, renk→color, tescilTarihi→registration_date, ruhsatNo→registration_no, ruhsatSahibi→registration_owner, km→mileage, aciklama→notes, servisDurum→service_status
- **work_orders:** cariId→account_id
- **work_order_items:** stokId→product_id
- **part_requests:** stokId→product_id
- **inventory_transactions:** stokId→product_id
- **service_invoices:** cariId→account_id, dovizCinsi→currency
- **invoice_profit:** faturaId→invoice_id, faturaKalemiId→invoice_item_id, stokId→product_id, miktar→quantity, birimFiyat→unit_price, birimMaliyet→unit_cost, toplamSatisTutari→total_sales_amount, toplamMaliyet→total_cost, kar→profit, karOrani→profit_rate, hesaplamaTarihi→computed_at

### Enum
- **VehicleServiceStatus:** BEKLEMEDE→WAITING, MUSTERI_ONAYI_BEKLIYOR→CUSTOMER_APPROVAL_PENDING, YAPIM_ASAMASINDA→IN_PROGRESS, PARCA_BEKLIYOR→PART_WAITING, PARCALAR_TEDARIK_EDILDI→PARTS_SUPPLIED, ARAC_HAZIR→VEHICLE_READY, TAMAMLANDI→COMPLETED

### Şema (schema.prisma)
- Account.country varsayılan değeri: "Türkiye" → "Turkey"
- İlgili modellerdeki @map ve enum değerleri yukarıdaki İngilizce adlarla güncellendi.

## Uygulama

```bash
npx prisma migrate deploy
# veya geliştirme ortamında:
npx prisma migrate dev --name turkish_to_english_columns_enums
```

## Opsiyonel: Mevcut cari ülke verisi

Yeni kayıtlar için varsayılan "Turkey" kullanılır. Eski kayıtları da güncellemek için migration.sql içindeki son UPDATE satırının yorumunu kaldırıp migration’ı tekrar çalıştırmayın; bunun yerine bir kerelik:

```sql
UPDATE "accounts" SET "country" = 'Turkey' WHERE "country" IS NULL OR "country" = 'Türkiye';
```

## Bilinçli bırakılan Türkçe / dış sabitler

- **eScenario / eInvoiceType (invoices):** GIB e-fatura senaryo ve tip kodları (TEMEL_FATURA, TICARI_FATURA, SATIS, IADE vb.) Türkçe kalabilir; dış sistemle uyum için.
- **Bazı servisler:** invoice-profit, fatura, sayim vb. modüllerde hâlâ `faturaId`, `stokId`, `kalem` gibi eski alan/model referansları kullanılıyor olabilir. Prisma modeli artık invoiceId, productId, invoiceItems kullandığı için bu referanslar kod tarafında güncellenmeli (ayrı iş).
