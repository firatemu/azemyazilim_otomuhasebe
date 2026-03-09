-- Turkish to English: column renames and enum value renames
-- Run after 20260305120000_database_i18n

-- ========== customer_vehicles ==========
ALTER TABLE "customer_vehicles" RENAME COLUMN "cariId" TO "account_id";
ALTER TABLE "customer_vehicles" RENAME COLUMN "plaka" TO "plate";
ALTER TABLE "customer_vehicles" RENAME COLUMN "aracMarka" TO "brand";
ALTER TABLE "customer_vehicles" RENAME COLUMN "aracModel" TO "model";
ALTER TABLE "customer_vehicles" RENAME COLUMN "yil" TO "year";
ALTER TABLE "customer_vehicles" RENAME COLUMN "saseno" TO "chassis_no";
ALTER TABLE "customer_vehicles" RENAME COLUMN "motorGucu" TO "engine_power";
ALTER TABLE "customer_vehicles" RENAME COLUMN "aracMotorHacmi" TO "engine_size";
ALTER TABLE "customer_vehicles" RENAME COLUMN "aracYakitTipi" TO "fuel_type";
ALTER TABLE "customer_vehicles" RENAME COLUMN "sanziman" TO "transmission";
ALTER TABLE "customer_vehicles" RENAME COLUMN "renk" TO "color";
ALTER TABLE "customer_vehicles" RENAME COLUMN "tescilTarihi" TO "registration_date";
ALTER TABLE "customer_vehicles" RENAME COLUMN "ruhsatNo" TO "registration_no";
ALTER TABLE "customer_vehicles" RENAME COLUMN "ruhsatSahibi" TO "registration_owner";
ALTER TABLE "customer_vehicles" RENAME COLUMN "km" TO "mileage";
ALTER TABLE "customer_vehicles" RENAME COLUMN "aciklama" TO "notes";
ALTER TABLE "customer_vehicles" RENAME COLUMN "servisDurum" TO "service_status";

-- ========== work_orders ==========
ALTER TABLE "work_orders" RENAME COLUMN "cariId" TO "account_id";

-- ========== work_order_items ==========
ALTER TABLE "work_order_items" RENAME COLUMN "stokId" TO "product_id";

-- ========== part_requests ==========
ALTER TABLE "part_requests" RENAME COLUMN "stokId" TO "product_id";

-- ========== inventory_transactions ==========
ALTER TABLE "inventory_transactions" RENAME COLUMN "stokId" TO "product_id";

-- ========== service_invoices ==========
ALTER TABLE "service_invoices" RENAME COLUMN "cariId" TO "account_id";
ALTER TABLE "service_invoices" RENAME COLUMN "dovizCinsi" TO "currency";

-- ========== invoice_profit ==========
ALTER TABLE "invoice_profit" RENAME COLUMN "faturaId" TO "invoice_id";
ALTER TABLE "invoice_profit" RENAME COLUMN "faturaKalemiId" TO "invoice_item_id";
ALTER TABLE "invoice_profit" RENAME COLUMN "stokId" TO "product_id";
ALTER TABLE "invoice_profit" RENAME COLUMN "miktar" TO "quantity";
ALTER TABLE "invoice_profit" RENAME COLUMN "birimFiyat" TO "unit_price";
ALTER TABLE "invoice_profit" RENAME COLUMN "birimMaliyet" TO "unit_cost";
ALTER TABLE "invoice_profit" RENAME COLUMN "toplamSatisTutari" TO "total_sales_amount";
ALTER TABLE "invoice_profit" RENAME COLUMN "toplamMaliyet" TO "total_cost";
ALTER TABLE "invoice_profit" RENAME COLUMN "kar" TO "profit";
ALTER TABLE "invoice_profit" RENAME COLUMN "karOrani" TO "profit_rate";
ALTER TABLE "invoice_profit" RENAME COLUMN "hesaplamaTarihi" TO "computed_at";

-- ========== VehicleServiceStatus enum ==========
ALTER TYPE "VehicleServiceStatus" RENAME VALUE 'BEKLEMEDE' TO 'WAITING';
ALTER TYPE "VehicleServiceStatus" RENAME VALUE 'MUSTERI_ONAYI_BEKLIYOR' TO 'CUSTOMER_APPROVAL_PENDING';
ALTER TYPE "VehicleServiceStatus" RENAME VALUE 'YAPIM_ASAMASINDA' TO 'IN_PROGRESS';
ALTER TYPE "VehicleServiceStatus" RENAME VALUE 'PARCA_BEKLIYOR' TO 'PART_WAITING';
ALTER TYPE "VehicleServiceStatus" RENAME VALUE 'PARCALAR_TEDARIK_EDILDI' TO 'PARTS_SUPPLIED';
ALTER TYPE "VehicleServiceStatus" RENAME VALUE 'ARAC_HAZIR' TO 'VEHICLE_READY';
ALTER TYPE "VehicleServiceStatus" RENAME VALUE 'TAMAMLANDI' TO 'COMPLETED';

-- ========== accounts default country (data update, optional) ==========
-- Uncomment to set existing NULL or 'Türkiye' to 'Turkey':
-- UPDATE "accounts" SET "country" = 'Turkey' WHERE "country" IS NULL OR "country" = 'Türkiye';
