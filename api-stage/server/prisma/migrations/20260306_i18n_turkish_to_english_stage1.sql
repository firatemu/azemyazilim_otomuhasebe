-- ============================================================
-- TURKISH → ENGLISH MIGRATION - STAGE 1 (KRİTİK TABLOLAR)
-- Tarih: 06.03.2026
-- Açıklama: En kritik modül isimlerini İngilizce'ye çevirir
-- ============================================================

BEGIN;

-- ============================================================
-- 1. ENUM DEĞİŞİMLERİ
-- ============================================================

-- CariTip → AccountType
ALTER TYPE "CariTip" RENAME TO "AccountType";
ALTER TYPE "AccountType" RENAME VALUE "MUSTERI" TO "CUSTOMER";
ALTER TYPE "AccountType" RENAME VALUE "TEDARIKCI" TO "SUPPLIER";
ALTER TYPE "AccountType" RENAME VALUE "HER_IKISI" TO "BOTH";

-- SirketTipi → CompanyType
ALTER TYPE "SirketTipi" RENAME TO "CompanyType";
ALTER TYPE "CompanyType" RENAME VALUE "KURUMSAL" TO "CORPORATE";
ALTER TYPE "CompanyType" RENAME VALUE "SAHIS" TO "INDIVIDUAL";

-- FaturaTipi → InvoiceType
ALTER TYPE "FaturaTipi" RENAME TO "InvoiceType";
ALTER TYPE "InvoiceType" RENAME VALUE "ALIS" TO "PURCHASE";
ALTER TYPE "InvoiceType" RENAME VALUE "SATIS" TO "SALE";
ALTER TYPE "InvoiceType" RENAME VALUE "SATIS_IADE" TO "SALES_RETURN";
ALTER TYPE "InvoiceType" RENAME VALUE "ALIS_IADE" TO "PURCHASE_RETURN";

-- FaturaDurum → InvoiceStatus
ALTER TYPE "FaturaDurum" RENAME TO "InvoiceStatus";
ALTER TYPE "InvoiceStatus" RENAME VALUE "ACIK" TO "OPEN";
ALTER TYPE "InvoiceStatus" RENAME VALUE "KAPALI" TO "CLOSED";
ALTER TYPE "InvoiceStatus" RENAME VALUE "KISMEN_ODENDI" TO "PARTIALLY_PAID";
ALTER TYPE "InvoiceStatus" RENAME VALUE "ONAYLANDI" TO "APPROVED";
ALTER TYPE "InvoiceStatus" RENAME VALUE "IPTAL" TO "CANCELLED";

-- TahsilatTip → CollectionType
ALTER TYPE "TahsilatTip" RENAME TO "CollectionType";
ALTER TYPE "CollectionType" RENAME VALUE "TAHSILAT" TO "COLLECTION";
ALTER TYPE "CollectionType" RENAME VALUE "ODEME" TO "PAYMENT";

-- OdemeTipi → PaymentMethod
ALTER TYPE "OdemeTipi" RENAME TO "PaymentMethod";
ALTER TYPE "PaymentMethod" RENAME VALUE "NAKIT" TO "CASH";
ALTER TYPE "PaymentMethod" RENAME VALUE "KREDI_KARTI" TO "CREDIT_CARD";
ALTER TYPE "PaymentMethod" RENAME VALUE "BANKA_HAVALESI" TO "BANK_TRANSFER";
ALTER TYPE "PaymentMethod" RENAME VALUE "CEK" TO "CHECK";
ALTER TYPE "PaymentMethod" RENAME VALUE "SENET" TO "PROMISSORY_NOTE";
ALTER TYPE "PaymentMethod" ADD VALUE IF NOT EXISTS "GIFT_CARD";
ALTER TYPE "PaymentMethod" ADD VALUE IF NOT EXISTS "LOAN_ACCOUNT";

-- SiparisTipi → OrderType
ALTER TYPE "SiparisTipi" RENAME TO "OrderType";
ALTER TYPE "OrderType" RENAME VALUE "SATIS" TO "SALE";
ALTER TYPE "OrderType" RENAME VALUE "SATIN_ALMA" TO "PURCHASE";

-- SiparisDurum → SalesOrderStatus
ALTER TYPE "SiparisDurum" RENAME TO "SalesOrderStatus";
ALTER TYPE "SalesOrderStatus" RENAME VALUE "BEKLEMEDE" TO "PENDING";
ALTER TYPE "SalesOrderStatus" RENAME VALUE "HAZIRLANIYOR" TO "PREPARING";
ALTER TYPE "SalesOrderStatus" RENAME VALUE "HAZIRLANDI" TO "PREPARED";
ALTER TYPE "SalesOrderStatus" RENAME VALUE "SEVK_EDILDI" TO "SHIPPED";
ALTER TYPE "SalesOrderStatus" RENAME VALUE "KISMI_SEVK" TO "PARTIALLY_SHIPPED";
ALTER TYPE "SalesOrderStatus" RENAME VALUE "FATURALANDI" TO "INVOICED";
ALTER TYPE "SalesOrderStatus" RENAME VALUE "IPTAL" TO "CANCELLED";

-- TeklifTipi → QuoteType
ALTER TYPE "TeklifTipi" RENAME TO "QuoteType";
ALTER TYPE "QuoteType" RENAME VALUE "SATIS" TO "SALE";
ALTER TYPE "QuoteType" RENAME VALUE "SATIN_ALMA" TO "PURCHASE";

-- TeklifDurum → QuoteStatus
ALTER TYPE "TeklifDurum" RENAME TO "QuoteStatus";
ALTER TYPE "QuoteStatus" RENAME VALUE "TEKLIF" TO "OFFERED";
ALTER TYPE "QuoteStatus" RENAME VALUE "ONAYLANDI" TO "APPROVED";
ALTER TYPE "QuoteStatus" RENAME VALUE "REDDEDILDI" TO "REJECTED";
ALTER TYPE "QuoteStatus" RENAME VALUE "SIPARISE_DONUSTU" TO "CONVERTED_TO_ORDER";

-- SayimTipi → StocktakeType
ALTER TYPE "SayimTipi" RENAME TO "StocktakeType";
ALTER TYPE "StocktakeType" RENAME VALUE "URUN_BAZLI" TO "PRODUCT_BASED";
ALTER TYPE "StocktakeType" RENAME VALUE "RAF_BAZLI" TO "SHELF_BASED";

-- SayimDurum → StocktakeStatus
ALTER TYPE "SayimDurum" RENAME TO "StocktakeStatus";
ALTER TYPE "StocktakeStatus" RENAME VALUE "TASLAK" TO "DRAFT";
ALTER TYPE "StocktakeStatus" RENAME VALUE "TAMAMLANDI" TO "COMPLETED";
ALTER TYPE "StocktakeStatus" RENAME VALUE "ONAYLANDI" TO "APPROVED";
ALTER TYPE "StocktakeStatus" RENAME VALUE "IPTAL" TO "CANCELLED";

-- IrsaliyeKaynakTip → DeliveryNoteSourceType
ALTER TYPE "IrsaliyeKaynakTip" RENAME TO "DeliveryNoteSourceType";
ALTER TYPE "DeliveryNoteSourceType" RENAME VALUE "SIPARIS" TO "ORDER";
ALTER TYPE "DeliveryNoteSourceType" RENAME VALUE "DOGRUDAN" TO "DIRECT";
ALTER TYPE "DeliveryNoteSourceType" RENAME VALUE "FATURA_OTOMATIK" TO "INVOICE_AUTOMATIC";

-- IrsaliyeDurum → DeliveryNoteStatus
ALTER TYPE "IrsaliyeDurum" RENAME TO "DeliveryNoteStatus";
ALTER TYPE "DeliveryNoteStatus" RENAME VALUE "FATURALANMADI" TO "NOT_INVOICED";
ALTER TYPE "DeliveryNoteStatus" RENAME VALUE "FATURALANDI" TO "INVOICED";

-- BasitSiparisDurum → SimpleOrderStatus
ALTER TYPE "BasitSiparisDurum" RENAME TO "SimpleOrderStatus";
ALTER TYPE "SimpleOrderStatus" RENAME VALUE "ONAY_BEKLIYOR" TO "AWAITING_APPROVAL";
ALTER TYPE "SimpleOrderStatus" RENAME VALUE "ONAYLANDI" TO "APPROVED";
ALTER TYPE "SimpleOrderStatus" RENAME VALUE "SIPARIS_VERILDI" TO "ORDER_PLACED";
ALTER TYPE "SimpleOrderStatus" RENAME VALUE "FATURALANDI" TO "INVOICED";
ALTER TYPE "SimpleOrderStatus" RENAME VALUE "IPTAL_EDILDI" TO "CANCELLED";

-- SatınAlmaSiparisDurum → PurchaseOrderLocalStatus
ALTER TYPE "SatınAlmaSiparisDurum" RENAME TO "PurchaseOrderLocalStatus";
ALTER TYPE "PurchaseOrderLocalStatus" RENAME VALUE "BEKLEMEDE" TO "PENDING";
ALTER TYPE "PurchaseOrderLocalStatus" RENAME VALUE "HAZIRLANIYOR" TO "PREPARING";
ALTER TYPE "PurchaseOrderLocalStatus" RENAME VALUE "HAZIRLANDI" TO "PREPARED";
ALTER TYPE "PurchaseOrderLocalStatus" RENAME VALUE "SEVK_EDILDI" TO "SHIPPED";
ALTER TYPE "PurchaseOrderLocalStatus" RENAME VALUE "KISMI_SEVK" TO "PARTIALLY_SHIPPED";
ALTER TYPE "PurchaseOrderLocalStatus" RENAME VALUE "SIPARIS_VERILDI" TO "ORDER_PLACED";
ALTER TYPE "PurchaseOrderLocalStatus" RENAME VALUE "FATURALANDI" TO "INVOICED";
ALTER TYPE "PurchaseOrderLocalStatus" RENAME VALUE "IPTAL" TO "CANCELLED";

-- Cinsiyet → Gender
ALTER TYPE "Cinsiyet" RENAME TO "Gender";
ALTER TYPE "Gender" RENAME VALUE "ERKEK" TO "MALE";
ALTER TYPE "Gender" RENAME VALUE "KADIN" TO "FEMALE";
ALTER TYPE "Gender" RENAME VALUE "BELIRTILMEMIS" TO "NOT_SPECIFIED";

-- MedeniDurum → MaritalStatus
ALTER TYPE "MedeniDurum" RENAME TO "MaritalStatus";
ALTER TYPE "MaritalStatus" RENAME VALUE "BEKAR" TO "SINGLE";
ALTER TYPE "MaritalStatus" RENAME VALUE "EVLI" TO "MARRIED";

-- PersonelOdemeTip → EmployeePaymentType
ALTER TYPE "PersonelOdemeTip" RENAME TO "EmployeePaymentType";
ALTER TYPE "EmployeePaymentType" RENAME VALUE "HAK_EDIS" TO "ENTITLEMENT";
ALTER TYPE "EmployeePaymentType" RENAME VALUE "MAAS" TO "SALARY";
ALTER TYPE "EmployeePaymentType" RENAME VALUE "AVANS" TO "ADVANCE";
ALTER TYPE "EmployeePaymentType" RENAME VALUE "PRIM" TO "BONUS";
ALTER TYPE "EmployeePaymentType" RENAME VALUE "KESINTI" TO "DEDUCTION";
ALTER TYPE "EmployeePaymentType" RENAME VALUE "ZIMMET" TO "ALLOCATION";
ALTER TYPE "EmployeePaymentType" RENAME VALUE "ZIMMET_IADE" TO "ALLOCATION_RETURN";

-- ============================================================
-- 2. TABLO ADI DEĞİŞİMLERİ
-- ============================================================

ALTER TABLE "stoklar" RENAME TO "products";
ALTER TABLE "cariler" RENAME TO "accounts";
ALTER TABLE "kasalar" RENAME TO "cashboxes";
ALTER TABLE "faturalar" RENAME TO "invoices";
ALTER TABLE "fatura_kalemleri" RENAME TO "invoice_items";
ALTER TABLE "tahsilatlar" RENAME TO "collections";
ALTER TABLE "personeller" RENAME TO "employees";
ALTER TABLE "personel_odemeler" RENAME TO "employee_payments";
ALTER TABLE "siparisler" RENAME TO "sales_orders";
ALTER TABLE "siparis_kalemleri" RENAME TO "sales_order_items";
ALTER TABLE "teklifler" RENAME TO "quotes";
ALTER TABLE "teklif_kalemleri" RENAME TO "quote_items";
ALTER TABLE "teklif_logs" RENAME TO "quote_logs";
ALTER TABLE "siparis_logs" RENAME TO "sales_order_logs";
ALTER TABLE "sayimlar" RENAME TO "stocktakes";
ALTER TABLE "sayim_kalemleri" RENAME TO "stocktake_items";
ALTER TABLE "depo" RENAME TO "warehouse";
ALTER TABLE "raflar" RENAME TO "shelves";
ALTER TABLE "urun_raflar" RENAME TO "product_shelves";
ALTER TABLE "masraf_kategoriler" RENAME TO "expense_categories";
ALTER TABLE "masraflar" RENAME TO "expenses";
ALTER TABLE "banka_havaleler" RENAME TO "bank_transfers";
ALTER TABLE "deleted_banka_havaleler" RENAME TO "deleted_bank_transfers";
ALTER TABLE "banka_havale_logs" RENAME TO "bank_transfer_logs";
ALTER TABLE "cek_senetler" RENAME TO "checks_bills";
ALTER TABLE "deleted_cek_senetler" RENAME TO "deleted_checks_bills";
ALTER TABLE "cek_senet_logs" RENAME TO "check_bill_logs";
ALTER TABLE "cari_hareketler" RENAME TO "account_movements";
ALTER TABLE "kasa_hareketler" RENAME TO "cashbox_movements";
ALTER TABLE "firma_kredi_kartlari" RENAME TO "company_credit_cards";
ALTER TABLE "firma_kredi_karti_hareketler" RENAME TO "company_credit_card_movements";
ALTER TABLE "fatura_logs" RENAME TO "invoice_logs";
ALTER TABLE "fatura_tahsilatlar" RENAME TO "invoice_collections";
ALTER TABLE "efatura_xml" RENAME TO "einvoice_xml";
ALTER TABLE "satis_irsaliyeleri" RENAME TO "sales_delivery_notes";
ALTER TABLE "satis_irsaliyesi_kalemleri" RENAME TO "sales_delivery_note_items";
ALTER TABLE "satis_irsaliyesi_logs" RENAME TO "sales_delivery_note_logs";
ALTER TABLE "siparis_hazirliklar" RENAME TO "order_pickings";
ALTER TABLE "satin_alma_siparisleri" RENAME TO "procurement_orders";
ALTER TABLE "satin_alma_siparis_kalemleri" RENAME TO "procurement_order_items";
ALTER TABLE "satin_alma_siparis_logs" RENAME TO "procurement_order_logs";
ALTER TABLE "satin_alma_irsaliyeleri" RENAME TO "purchase_delivery_notes";
ALTER TABLE "satin_alma_irsaliyesi_kalemleri" RENAME TO "purchase_delivery_note_items";
ALTER TABLE "satin_alma_irsaliyesi_logs" RENAME TO "purchase_delivery_note_logs";
ALTER TABLE "basit_siparisler" RENAME TO "simple_orders";
ALTER TABLE "araclar" RENAME TO "vehicle_catalog";
ALTER TABLE "siparis_kalemleri" RENAME TO "sales_order_items";
ALTER TABLE "cari_yetkililer" RENAME TO "account_contacts";
ALTER TABLE "cari_adresler" RENAME TO "account_addresses";
ALTER TABLE "cari_bankalar" RENAME TO "account_banks";
ALTER TABLE "banka_hesaplari" RENAME TO "bank_accounts";
ALTER TABLE "banka_hesap_hareketler" RENAME TO "bank_account_movements";
ALTER TABLE "stok_esdegers" RENAME TO "product_equivalents";
ALTER TABLE "esdeger_gruplar" RENAME TO "equivalency_groups";
ALTER TABLE "stok_hareketleri" RENAME TO "product_movements";
ALTER TABLE "price_cards" RENAME TO "price_cards";
ALTER TABLE "stok_cost_history" RENAME TO "stock_cost_history";
ALTER TABLE "purchase_orders" RENAME TO "purchase_orders";
ALTER TABLE "purchase_order_items" RENAME TO "purchase_order_items";
ALTER TABLE "stok_barcodlari" RENAME TO "product_barcodes";
ALTER TABLE "urun_barkodlari" RENAME TO "product_barcodes";

-- ============================================================
-- 3. SÜTUN ADI DEĞİŞİMLERİ
-- ============================================================

-- products (eski: stoklar)
ALTER TABLE "products" RENAME COLUMN "stokKodu" TO "code";
ALTER TABLE "products" RENAME COLUMN "stokAdi" TO "name";
ALTER TABLE "products" RENAME COLUMN "aciklama" TO "description";
ALTER TABLE "products" RENAME COLUMN "birim" TO "unit";
ALTER TABLE "products" RENAME COLUMN "alisFiyati" TO "purchase_price";
ALTER TABLE "products" RENAME COLUMN "satisFiyati" TO "sale_price";
ALTER TABLE "products" RENAME COLUMN "kdvOrani" TO "vat_rate";
ALTER TABLE "products" RENAME COLUMN "kritikStokMiktari" TO "critical_quantity";
ALTER TABLE "products" RENAME COLUMN "kategori" TO "category";
ALTER TABLE "products" RENAME COLUMN "anaKategori" TO "main_category";
ALTER TABLE "products" RENAME COLUMN "altKategori" TO "sub_category";
ALTER TABLE "products" RENAME COLUMN "marka" TO "brand";
ALTER TABLE "products" RENAME COLUMN "model" TO "model";
ALTER TABLE "products" RENAME COLUMN "oem" TO "oem";
ALTER TABLE "products" RENAME COLUMN "olcu" TO "size";
ALTER TABLE "products" RENAME COLUMN "raf" TO "shelf";
ALTER TABLE "products" RENAME COLUMN "barkod" TO "barcode";
ALTER TABLE "products" RENAME COLUMN "tedarikciKodu" TO "supplier_code";
ALTER TABLE "products" RENAME COLUMN "esdegerGrupId" TO "equivalency_group_id";
ALTER TABLE "products" RENAME COLUMN "aracMarka" TO "vehicle_brand";
ALTER TABLE "products" RENAME COLUMN "aracModel" TO "vehicle_model";
ALTER TABLE "products" RENAME COLUMN "aracMotorHacmi" TO "vehicle_engine_size";
ALTER TABLE "products" RENAME COLUMN "aracYakitTipi" TO "vehicle_fuel_type";
ALTER TABLE "products" RENAME COLUMN "isCategoryOnly" TO "is_category_only";
ALTER TABLE "products" RENAME COLUMN "isBrandOnly" TO "is_brand_only";
ALTER TABLE "products" RENAME COLUMN "agirlik" TO "weight";
ALTER TABLE "products" RENAME COLUMN "agirlikBirim" TO "weight_unit";
ALTER TABLE "products" RENAME COLUMN "boyutlar" TO "dimensions";
ALTER TABLE "products" RENAME COLUMN "menşeiUlus" TO "country_of_origin";
ALTER TABLE "products" RENAME COLUMN "garantiSuresi" TO "warranty_months";
ALTER TABLE "products" RENAME COLUMN "icNot" TO "internal_note";
ALTER TABLE "products" RENAME COLUMN "minSiparisAdedi" TO "min_order_qty";
ALTER TABLE "products" RENAME COLUMN "teslimSuresi" TO "lead_time_days";

-- accounts (eski: cariler)
ALTER TABLE "accounts" RENAME COLUMN "cariKodu" TO "code";
ALTER TABLE "accounts" RENAME COLUMN "unvan" TO "title";
ALTER TABLE "accounts" RENAME COLUMN "tip" TO "type";
ALTER TABLE "accounts" RENAME COLUMN "sirketTipi" TO "company_type";
ALTER TABLE "accounts" RENAME COLUMN "vergiNo" TO "tax_number";
ALTER TABLE "accounts" RENAME COLUMN "vergiDairesi" TO "tax_office";
ALTER TABLE "accounts" RENAME COLUMN "tcKimlikNo" TO "national_id";
ALTER TABLE "accounts" RENAME COLUMN "isimSoyisim" TO "full_name";
ALTER TABLE "accounts" RENAME COLUMN "telefon" TO "phone";
ALTER TABLE "accounts" RENAME COLUMN "email" TO "email";
ALTER TABLE "accounts" RENAME COLUMN "ulke" TO "country";
ALTER TABLE "accounts" RENAME COLUMN "il" TO "city";
ALTER TABLE "accounts" RENAME COLUMN "ilce" TO "district";
ALTER TABLE "accounts" RENAME COLUMN "adres" TO "address";
ALTER TABLE "accounts" RENAME COLUMN "yetkili" TO "contact_name";
ALTER TABLE "accounts" RENAME COLUMN "bakiye" TO "balance";
ALTER TABLE "accounts" RENAME COLUMN "vadeSuresi" TO "payment_term_days";
ALTER TABLE "accounts" RENAME COLUMN "aktif" TO "is_active";
ALTER TABLE "accounts" RENAME COLUMN "krediLimit" TO "credit_limit";
ALTER TABLE "accounts" RENAME COLUMN "krediDurum" TO "credit_status";
ALTER TABLE "accounts" RENAME COLUMN "teminatTutar" TO "collateral_amount";
ALTER TABLE "accounts" RENAME COLUMN "sektor" TO "sector";
ALTER TABLE "accounts" RENAME COLUMN "ozelKod1" TO "custom_code1";
ALTER TABLE "accounts" RENAME COLUMN "ozelKod2" TO "custom_code2";
ALTER TABLE "accounts" RENAME COLUMN "website" TO "website";
ALTER TABLE "accounts" RENAME COLUMN "faks" TO "fax";
ALTER TABLE "accounts" RENAME COLUMN "vadeGunleri" TO "due_days";
ALTER TABLE "accounts" RENAME COLUMN "paraBirimi" TO "currency";
ALTER TABLE "accounts" RENAME COLUMN "bankaBilgileri" TO "bank_info";
ALTER TABLE "accounts" RENAME COLUMN "fiyatListesiId" TO "price_list_id";

-- accounts (cari_yetkililer)
ALTER TABLE "account_contacts" RENAME COLUMN "isimSoyisim" TO "full_name";
ALTER TABLE "account_contacts" RENAME COLUMN "unvan" TO "title";
ALTER TABLE "account_contacts" RENAME COLUMN "telefon" TO "phone";
ALTER TABLE "account_contacts" RENAME COLUMN "email" TO "email";
ALTER TABLE "account_contacts" RENAME COLUMN "uzanti" TO "extension";
ALTER TABLE "account_contacts" RENAME COLUMN "varsayilan" TO "is_default";
ALTER TABLE "account_contacts" RENAME COLUMN "notlar" TO "notes";

-- accounts (cari_adresler)
ALTER TABLE "account_addresses" RENAME COLUMN "isimSoyisim" TO "full_name";
ALTER TABLE "account_addresses" RENAME COLUMN "unvan" TO "title";
ALTER TABLE "account_addresses" RENAME COLUMN "tip" TO "type";
ALTER TABLE "account_addresses" RENAME COLUMN "adres" TO "address";
ALTER TABLE "account_addresses" RENAME COLUMN "il" TO "city";
ALTER TABLE "account_addresses" RENAME COLUMN "ilce" TO "district";
ALTER TABLE "account_addresses" RENAME COLUMN "postaKodu" TO "postal_code";
ALTER TABLE "account_addresses" RENAME COLUMN "varsayilan" TO "is_default";

-- accounts (cari_bankalar)
ALTER TABLE "account_banks" RENAME COLUMN "bankaAdi" TO "bank_name";
ALTER TABLE "account_banks" RENAME COLUMN "subeAdi" TO "branch_name";
ALTER TABLE "account_banks" RENAME COLUMN "subeKodu" TO "branch_code";
ALTER TABLE "account_banks" RENAME COLUMN "hesapNo" TO "account_no";
ALTER TABLE "account_banks" RENAME COLUMN "iban" TO "iban";
ALTER TABLE "account_banks" RENAME COLUMN "paraBirimi" TO "currency";
ALTER TABLE "account_banks" RENAME COLUMN "notlar" TO "notes";

-- cashboxes (eski: kasalar)
ALTER TABLE "cashboxes" RENAME COLUMN "kasaKodu" TO "code";
ALTER TABLE "cashboxes" RENAME COLUMN "kasaAdi" TO "name";
ALTER TABLE "cashboxes" RENAME COLUMN "kasaTipi" TO "type";
ALTER TABLE "cashboxes" RENAME COLUMN "bakiye" TO "balance";
ALTER TABLE "cashboxes" RENAME COLUMN "aktif" TO "is_active";

-- invoices (eski: faturalar)
ALTER TABLE "invoices" RENAME COLUMN "faturaNo" TO "invoice_no";
ALTER TABLE "invoices" RENAME COLUMN "faturaTipi" TO "invoice_type";
ALTER TABLE "invoices" RENAME COLUMN "tarih" TO "date";
ALTER TABLE "invoices" RENAME COLUMN "vade" TO "due_date";
ALTER TABLE "invoices" RENAME COLUMN "iskonto" TO "discount";
ALTER TABLE "invoices" RENAME COLUMN "toplamTutar" TO "total_amount";
ALTER TABLE "invoices" RENAME COLUMN "kdvTutar" TO "vat_amount";
ALTER TABLE "invoices" RENAME COLUMN "genelToplam" TO "grand_total";
ALTER TABLE "invoices" RENAME COLUMN "aciklama" TO "notes";
ALTER TABLE "invoices" RENAME COLUMN "durum" TO "status";
ALTER TABLE "invoices" RENAME COLUMN "odenecekTutar" TO "payable_amount";
ALTER TABLE "invoices" RENAME COLUMN "odenenTutar" TO "paid_amount";
ALTER TABLE "invoices" RENAME COLUMN "siparisNo" TO "order_no";
ALTER TABLE "invoices" RENAME COLUMN "efaturaStatus" TO "einvoice_status";
ALTER TABLE "invoices" RENAME COLUMN "efaturaEttn" TO "einvoice_ettn";
ALTER TABLE "invoices" RENAME COLUMN "eSenaryo" TO "e_scenario";
ALTER TABLE "invoices" RENAME COLUMN "eFaturaTipi" TO "e_invoice_type";
ALTER TABLE "invoices" RENAME COLUMN "gibAlias" TO "gib_alias";
ALTER TABLE "invoices" RENAME COLUMN "teslimYontemi" TO "delivery_method";

-- invoice_items (eski: fatura_kalemleri)
ALTER TABLE "invoice_items" RENAME COLUMN "miktar" TO "quantity";
ALTER TABLE "invoice_items" RENAME COLUMN "birimFiyat" TO "unit_price";
ALTER TABLE "invoice_items" RENAME COLUMN "kdvOrani" TO "vat_rate";
ALTER TABLE "invoice_items" RENAME COLUMN "kdvTutar" TO "vat_amount";
ALTER TABLE "invoice_items" RENAME COLUMN "tutar" TO "amount";
ALTER TABLE "invoice_items" RENAME COLUMN "iskontoOran" TO "discount_rate";
ALTER TABLE "invoice_items" RENAME COLUMN "iskontoTutar" TO "discount_amount";
ALTER TABLE "invoice_items" RENAME COLUMN "tevkifatKodu" TO "withholding_code";
ALTER TABLE "invoice_items" RENAME COLUMN "tevkifatOran" TO "withholding_rate";
ALTER TABLE "invoice_items" RENAME COLUMN "stopajOrani" TO "sct_rate";
ALTER TABLE "invoice_items" RENAME COLUMN "stopajTutar" TO "sct_amount";
ALTER TABLE "invoice_items" RENAME COLUMN "kdvMuafiyetNedeni" TO "vat_exemption_reason";
ALTER TABLE "invoice_items" RENAME COLUMN "raf" TO "shelf";

-- collections (eski: tahsilatlar)
ALTER TABLE "collections" RENAME COLUMN "tip" TO "type";
ALTER TABLE "collections" RENAME COLUMN "tutar" TO "amount";
ALTER TABLE "collections" RENAME COLUMN "tarih" TO "date";
ALTER TABLE "collections" RENAME COLUMN "odemeTipi" TO "payment_type";
ALTER TABLE "collections" RENAME COLUMN "aciklama" TO "notes";

-- employees (eski: personeller)
ALTER TABLE "employees" RENAME COLUMN "personelKodu" TO "code";
ALTER TABLE "employees" RENAME COLUMN "tcKimlikNo" TO "identity_number";
ALTER TABLE "employees" RENAME COLUMN "ad" TO "first_name";
ALTER TABLE "employees" RENAME COLUMN "soyad" TO "last_name";
ALTER TABLE "employees" RENAME COLUMN "isimSoyisim" TO "full_name";
ALTER TABLE "employees" RENAME COLUMN "dogumTarihi" TO "birth_date";
ALTER TABLE "employees" RENAME COLUMN "cinsiyet" TO "gender";
ALTER TABLE "employees" RENAME COLUMN "medeniDurum" TO "marital_status";
ALTER TABLE "employees" RENAME COLUMN "telefon" TO "phone";
ALTER TABLE "employees" RENAME COLUMN "email" TO "email";
ALTER TABLE "employees" RENAME COLUMN "adres" TO "address";
ALTER TABLE "employees" RENAME COLUMN "il" TO "city";
ALTER TABLE "employees" RENAME COLUMN "ilce" TO "district";
ALTER TABLE "employees" RENAME COLUMN "pozisyon" TO "position";
ALTER TABLE "employees" RENAME COLUMN "departman" TO "department";
ALTER TABLE "employees" RENAME COLUMN "iseBaslamaTarihi" TO "start_date";
ALTER TABLE "employees" RENAME COLUMN "istenCikisTarihi" TO "end_date";
ALTER TABLE "employees" RENAME COLUMN "aktif" TO "is_active";
ALTER TABLE "employees" RENAME COLUMN "maas" TO "salary";
ALTER TABLE "employees" RENAME COLUMN "maasGunu" TO "salary_day";
ALTER TABLE "employees" RENAME COLUMN "sgkNo" TO "social_security_no";
ALTER TABLE "employees" RENAME COLUMN "ibanNo" TO "iban";
ALTER TABLE "employees" RENAME COLUMN "bakiye" TO "balance";

-- employee_payments (eski: personel_odemeler)
ALTER TABLE "employee_payments" RENAME COLUMN "tutar" TO "amount";
ALTER TABLE "employee_payments" RENAME COLUMN "tarih" TO "date";
ALTER TABLE "employee_payments" RENAME COLUMN "donem" TO "period";
ALTER TABLE "employee_payments" RENAME COLUMN "aciklama" TO "notes";

-- sales_orders (eski: siparisler)
ALTER TABLE "sales_orders" RENAME COLUMN "siparisNo" TO "order_no";
ALTER TABLE "sales_orders" RENAME COLUMN "siparisTipi" TO "order_type";
ALTER TABLE "sales_orders" RENAME COLUMN "tarih" TO "date";
ALTER TABLE "sales_orders" RENAME COLUMN "vade" TO "due_date";
ALTER TABLE "sales_orders" RENAME COLUMN "iskonto" TO "discount";
ALTER TABLE "sales_orders" RENAME COLUMN "toplamTutar" TO "total_amount";
ALTER TABLE "sales_orders" RENAME COLUMN "kdvTutar" TO "vat_amount";
ALTER TABLE "sales_orders" RENAME COLUMN "genelToplam" TO "grand_total";
ALTER TABLE "sales_orders" RENAME COLUMN "aciklama" TO "notes";
ALTER TABLE "sales_orders" RENAME COLUMN "durum" TO "status";
ALTER TABLE "sales_orders" RENAME COLUMN "faturaNo" TO "invoice_no";

-- sales_order_items (eski: siparis_kalemleri)
ALTER TABLE "sales_order_items" RENAME COLUMN "miktar" TO "quantity";
ALTER TABLE "sales_order_items" RENAME COLUMN "sevkEdilenMiktar" TO "delivered_quantity";
ALTER TABLE "sales_order_items" RENAME COLUMN "birimFiyat" TO "unit_price";
ALTER TABLE "sales_order_items" RENAME COLUMN "kdvOrani" TO "vat_rate";
ALTER TABLE "sales_order_items" RENAME COLUMN "kdvTutar" TO "vat_amount";
ALTER TABLE "sales_order_items" RENAME COLUMN "tutar" TO "amount";

-- quotes (eski: teklifler)
ALTER TABLE "quotes" RENAME COLUMN "teklifNo" TO "quote_no";
ALTER TABLE "quotes" RENAME COLUMN "teklifTipi" TO "quote_type";
ALTER TABLE "quotes" RENAME COLUMN "tarih" TO "date";
ALTER TABLE "quotes" RENAME COLUMN "gecerlilikTarihi" TO "valid_until";
ALTER TABLE "quotes" RENAME COLUMN "iskonto" TO "discount";
ALTER TABLE "quotes" RENAME COLUMN "toplamTutar" TO "total_amount";
ALTER TABLE "quotes" RENAME COLUMN "kdvTutar" TO "vat_amount";
ALTER TABLE "quotes" RENAME COLUMN "genelToplam" TO "grand_total";
ALTER TABLE "quotes" RENAME COLUMN "aciklama" TO "notes";
ALTER TABLE "quotes" RENAME COLUMN "durum" TO "status";
ALTER TABLE "quotes" RENAME COLUMN "siparisId" TO "order_id";

-- quote_items (eski: teklif_kalemleri)
ALTER TABLE "quote_items" RENAME COLUMN "miktar" TO "quantity";
ALTER TABLE "quote_items" RENAME COLUMN "birimFiyat" TO "unit_price";
ALTER TABLE "quote_items" RENAME COLUMN "kdvOrani" TO "vat_rate";
ALTER TABLE "quote_items" RENAME COLUMN "kdvTutar" TO "vat_amount";
ALTER TABLE "quote_items" RENAME COLUMN "tutar" TO "amount";
ALTER TABLE "quote_items" RENAME COLUMN "iskontoOran" TO "discount_rate";
ALTER TABLE "quote_items" RENAME COLUMN "iskontoTutar" TO "discount_amount";

-- stocktakes (eski: sayimlar)
ALTER TABLE "stocktakes" RENAME COLUMN "sayimNo" TO "stocktake_no";
ALTER TABLE "stocktakes" RENAME COLUMN "sayimTipi" TO "stocktake_type";
ALTER TABLE "stocktakes" RENAME COLUMN "tarih" TO "date";
ALTER TABLE "stocktakes" RENAME COLUMN "durum" TO "status";
ALTER TABLE "stocktakes" RENAME COLUMN "aciklama" TO "notes";
ALTER TABLE "stocktakes" RENAME COLUMN "onaylayanId" TO "approved_by_id";
ALTER TABLE "stocktakes" RENAME COLUMN "onayTarihi" TO "approval_date";

-- stocktake_items (eski: sayim_kalemleri)
ALTER TABLE "stocktake_items" RENAME COLUMN "sistemMiktari" TO "system_quantity";
ALTER TABLE "stocktake_items" RENAME COLUMN "sayilanMiktar" TO "counted_quantity";
ALTER TABLE "stocktake_items" RENAME COLUMN "farkMiktari" TO "difference";

-- warehouse (eski: depo)
ALTER TABLE "warehouse" RENAME COLUMN "depoAdi" TO "name";
ALTER TABLE "warehouse" RENAME COLUMN "adres" TO "address";
ALTER TABLE "warehouse" RENAME COLUMN "yetkili" TO "manager";
ALTER TABLE "warehouse" RENAME COLUMN "aktif" TO "active";

-- shelves (eski: raflar)
ALTER TABLE "shelves" RENAME COLUMN "rafKodu" TO "code";

-- product_shelves (eski: urun_raflar)
ALTER TABLE "product_shelves" RENAME COLUMN "miktar" TO "quantity";

-- expense_categories (eski: masraf_kategoriler)
ALTER TABLE "expense_categories" RENAME COLUMN "kategoriAdi" TO "name";
ALTER TABLE "expense_categories" RENAME COLUMN "aciklama" TO "notes";

-- expenses (eski: masraflar)
ALTER TABLE "expenses" RENAME COLUMN "aciklama" TO "notes";

-- bank_transfers (eski: banka_havaleler)
ALTER TABLE "bank_transfers" RENAME COLUMN "hareketTipi" TO "transfer_type";
ALTER TABLE "bank_transfers" RENAME COLUMN "tutar" TO "amount";
ALTER TABLE "bank_transfers" RENAME COLUMN "tarih" TO "date";
ALTER TABLE "bank_transfers" RENAME COLUMN "aciklama" TO "notes";
ALTER TABLE "bank_transfers" RENAME COLUMN "referansNo" TO "reference_no";
ALTER TABLE "bank_transfers" RENAME COLUMN "gonderen" TO "sender";
ALTER TABLE "bank_transfers" RENAME COLUMN "alici" TO "receiver";

-- deleted_bank_transfers (eski: deleted_banka_havaleler)
ALTER TABLE "deleted_bank_transfers" RENAME COLUMN "bankaHesabiAdi" TO "bank_account_name";
ALTER TABLE "deleted_bank_transfers" RENAME COLUMN "cariUnvan" TO "account_name";

-- bank_transfer_logs (eski: banka_havale_logs)
ALTER TABLE "bank_transfer_logs" RENAME COLUMN "bankaHavaleId" TO "bank_transfer_id";

-- checks_bills (eski: cek_senetler)
ALTER TABLE "checks_bills" RENAME COLUMN "tip" TO "type";
ALTER TABLE "checks_bills" RENAME COLUMN "portfoyTip" TO "portfolio_type";
ALTER TABLE "checks_bills" RENAME COLUMN "tutar" TO "amount";
ALTER TABLE "checks_bills" RENAME COLUMN "vade" TO "due_date";
ALTER TABLE "checks_bills" RENAME COLUMN "banka" TO "bank";
ALTER TABLE "checks_bills" RENAME COLUMN "sube" TO "branch";
ALTER TABLE "checks_bills" RENAME COLUMN "hesapNo" TO "account_no";
ALTER TABLE "checks_bills" RENAME COLUMN "cekNo" TO "check_no";
ALTER TABLE "checks_bills" RENAME COLUMN "seriNo" TO "serial_no";
ALTER TABLE "checks_bills" RENAME COLUMN "durum" TO "status";
ALTER TABLE "checks_bills" RENAME COLUMN "tahsilTarihi" TO "collection_date";
ALTER TABLE "checks_bills" RENAME COLUMN "tahsilKasaId" TO "collection_cashbox_id";
ALTER TABLE "checks_bills" RENAME COLUMN "ciroEdildi" TO "is_endorsed";
ALTER TABLE "checks_bills" RENAME COLUMN "ciroTarihi" TO "endorsement_date";
ALTER TABLE "checks_bills" RENAME COLUMN "ciroEdilen" TO "endorsed_to";
ALTER TABLE "checks_bills" RENAME COLUMN "aciklama" TO "notes";

-- deleted_checks_bills (eski: deleted_cek_senetler)
ALTER TABLE "deleted_checks_bills" RENAME COLUMN "cariUnvan" TO "account_name";

-- check_bill_logs (eski: cek_senet_logs)
ALTER TABLE "check_bill_logs" RENAME COLUMN "cekSenetId" TO "check_bill_id";

-- cashbox_movements (eski: kasa_hareketler)
ALTER TABLE "cashbox_movements" RENAME COLUMN "hareketTipi" TO "movement_type";
ALTER TABLE "cashbox_movements" RENAME COLUMN "tutar" TO "amount";
ALTER TABLE "cashbox_movements" RENAME COLUMN "komisyonTutari" TO "commission_amount";
ALTER TABLE "cashbox_movements" RENAME COLUMN "bsmvTutari" TO "bsmv_amount";
ALTER TABLE "cashbox_movements" RENAME COLUMN "netTutar" TO "net_amount";
ALTER TABLE "cashbox_movements" RENAME COLUMN "bakiye" TO "balance";
ALTER TABLE "cashbox_movements" RENAME COLUMN "belgeTipi" TO "document_type";
ALTER TABLE "cashbox_movements" RENAME COLUMN "belgeNo" TO "document_no";
ALTER TABLE "cashbox_movements" RENAME COLUMN "aciklama" TO "notes";
ALTER TABLE "cashbox_movements" RENAME COLUMN "transferEdildi" TO "is_transferred";
ALTER TABLE "cashbox_movements" RENAME COLUMN "transferTarihi" TO "transfer_date";

-- invoice_logs (eski: fatura_logs)
ALTER TABLE "invoice_logs" RENAME COLUMN "faturaId" TO "invoice_id";
ALTER TABLE "invoice_logs" RENAME COLUMN "actionType" TO "action_type";

-- invoice_collections (eski: fatura_tahsilatlar)
ALTER TABLE "invoice_collections" RENAME COLUMN "faturaId" TO "invoice_id";

-- einvoice_xml (eski: efatura_xml)
ALTER TABLE "einvoice_xml" RENAME COLUMN "faturaId" TO "invoice_id";

-- sales_delivery_notes (eski: satis_irsaliyeleri)
ALTER TABLE "sales_delivery_notes" RENAME COLUMN "irsaliyeNo" TO "delivery_note_no";
ALTER TABLE "sales_delivery_notes" RENAME COLUMN "irsaliyeTarihi" TO "date";
ALTER TABLE "sales_delivery_notes" RENAME COLUMN "kaynakTip" TO "source_type";
ALTER TABLE "sales_delivery_notes" RENAME COLUMN "kaynakId" TO "source_id";
ALTER TABLE "sales_delivery_notes" RENAME COLUMN "durum" TO "status";
ALTER TABLE "sales_delivery_notes" RENAME COLUMN "aciklama" TO "notes";

-- sales_delivery_note_items (eski: satis_irsaliyesi_kalemleri)
ALTER TABLE "sales_delivery_note_items" RENAME COLUMN "miktar" TO "quantity";
ALTER TABLE "sales_delivery_note_items" RENAME COLUMN "birimFiyat" TO "unit_price";
ALTER TABLE "sales_delivery_note_items" RENAME COLUMN "kdvOrani" TO "vat_rate";
ALTER TABLE "sales_delivery_note_items" RENAME COLUMN "kdvTutar" TO "vat_amount";
ALTER TABLE "sales_delivery_note_items" RENAME COLUMN "tutar" TO "amount";
ALTER TABLE "sales_delivery_note_items" RENAME COLUMN "faturalandimMiktar" TO "invoiced_quantity";

-- sales_delivery_note_logs (eski: satis_irsaliyesi_logs)
ALTER TABLE "sales_delivery_note_logs" RENAME COLUMN "irsaliyeId" TO "delivery_note_id";

-- order_pickings (eski: siparis_hazirliklar)
ALTER TABLE "order_pickings" RENAME COLUMN "hazirlayan" TO "picked_by";

-- procurement_orders (eski: satin_alma_siparisleri)
ALTER TABLE "procurement_orders" RENAME COLUMN "siparisNo" TO "order_no";
ALTER TABLE "procurement_orders" RENAME COLUMN "tarih" TO "date";
ALTER TABLE "procurement_orders" RENAME COLUMN "vade" TO "due_date";
ALTER TABLE "procurement_orders" RENAME COLUMN "iskonto" TO "discount";
ALTER TABLE "procurement_orders" RENAME COLUMN "toplamTutar" TO "total_amount";
ALTER TABLE "procurement_orders" RENAME COLUMN "kdvTutar" TO "vat_amount";
ALTER TABLE "procurement_orders" RENAME COLUMN "genelToplam" TO "grand_total";
ALTER TABLE "procurement_orders" RENAME COLUMN "aciklama" TO "notes";
ALTER TABLE "procurement_orders" RENAME COLUMN "durum" TO "status";
ALTER TABLE "procurement_orders" RENAME COLUMN "faturaNo" TO "invoice_no";

-- procurement_order_items (eski: satin_alma_siparis_kalemleri)
ALTER TABLE "procurement_order_items" RENAME COLUMN "miktar" TO "quantity";
ALTER TABLE "procurement_order_items" RENAME COLUMN "sevkEdilenMiktar" TO "delivered_quantity";
ALTER TABLE "procurement_order_items" RENAME COLUMN "birimFiyat" TO "unit_price";
ALTER TABLE "procurement_order_items" RENAME COLUMN "kdvOrani" TO "vat_rate";
ALTER TABLE "procurement_order_items" RENAME COLUMN "kdvTutar" TO "vat_amount";
ALTER TABLE "procurement_order_items" RENAME COLUMN "tutar" TO "amount";

-- procurement_order_logs (eski: satin_alma_siparis_logs)
ALTER TABLE "procurement_order_logs" RENAME COLUMN "satınAlmaSiparisId" TO "order_id";

-- purchase_delivery_notes (eski: satin_alma_irsaliyeleri)
ALTER TABLE "purchase_delivery_notes" RENAME COLUMN "irsaliyeNo" TO "delivery_note_no";
ALTER TABLE "purchase_delivery_notes" RENAME COLUMN "irsaliyeTarihi" TO "date";
ALTER TABLE "purchase_delivery_notes" RENAME COLUMN "kaynakTip" TO "source_type";
ALTER TABLE "purchase_delivery_notes" RENAME COLUMN "kaynakId" TO "source_id";
ALTER TABLE "purchase_delivery_notes" RENAME COLUMN "durum" TO "status";
ALTER TABLE "purchase_delivery_notes" RENAME COLUMN "aciklama" TO "notes";

-- purchase_delivery_note_items (eski: satin_alma_irsaliyesi_kalemleri)
ALTER TABLE "purchase_delivery_note_items" RENAME COLUMN "miktar" TO "quantity";
ALTER TABLE "purchase_delivery_note_items" RENAME COLUMN "birimFiyat" TO "unit_price";
ALTER TABLE "purchase_delivery_note_items" RENAME COLUMN "kdvOrani" TO "vat_rate";
ALTER TABLE "purchase_delivery_note_items" RENAME COLUMN "kdvTutar" TO "vat_amount";
ALTER TABLE "purchase_delivery_note_items" RENAME COLUMN "tutar" TO "total_amount";

-- purchase_delivery_note_logs (eski: satin_alma_irsaliyesi_logs)
ALTER TABLE "purchase_delivery_note_logs" RENAME COLUMN "irsaliyeId" TO "delivery_note_id";

-- simple_orders (eski: basit_siparisler)
ALTER TABLE "simple_orders" RENAME COLUMN "tedarikEdilenMiktar" TO "supplied_quantity";
ALTER TABLE "simple_orders" RENAME COLUMN "durum" TO "status";

-- vehicle_catalog (eski: araclar)
ALTER TABLE "vehicle_catalog" RENAME COLUMN "motorHacmi" TO "engine_volume";
ALTER TABLE "vehicle_catalog" RENAME COLUMN "yakitTipi" TO "fuel_type";

-- account_contacts (eski: cari_yetkililer)
-- Zaten yukarıda güncellendi

-- account_addresses (eski: cari_adresler)
-- Zaten yukarıda güncellendi

-- account_banks (eski: cari_bankalar)
-- Zaten yukarıda güncellendi

-- bank_accounts (eski: banka_hesaplari)
ALTER TABLE "bank_accounts" RENAME COLUMN "bankaAdi" TO "bank_name";
ALTER TABLE "bank_accounts" RENAME COLUMN "subeAdi" TO "branch_name";
ALTER TABLE "bank_accounts" RENAME COLUMN "subeKodu" TO "branch_code";
ALTER TABLE "bank_accounts" RENAME COLUMN "hesapNo" TO "account_no";
ALTER TABLE "bank_accounts" RENAME COLUMN "iban" TO "iban";
ALTER TABLE "bank_accounts" RENAME COLUMN "hesapTipi" TO "type";

-- bank_account_movements (eski: banka_hesap_hareketler)
ALTER TABLE "bank_account_movements" RENAME COLUMN "hareketTipi" TO "movement_type";
ALTER TABLE "bank_account_movements" RENAME COLUMN "hareketAltTip" TO "movement_sub_type";
ALTER TABLE "bank_account_movements" RENAME COLUMN "tutar" TO "amount";
ALTER TABLE "bank_account_movements" RENAME COLUMN "komisyonOran" TO "commission_rate";
ALTER TABLE "bank_account_movements" RENAME COLUMN "komisyonTutar" TO "commission_amount";
ALTER TABLE "bank_account_movements" RENAME COLUMN "netTutar" TO "net_amount";
ALTER TABLE "bank_account_movements" RENAME COLUMN "bakiye" TO "balance";
ALTER TABLE "bank_account_movements" RENAME COLUMN "aciklama" TO "notes";
ALTER TABLE "bank_account_movements" RENAME COLUMN "referansNo" TO "reference_no";

-- product_equivalents (eski: stok_esdegers)
-- Sütunlar zaten doğru (product1Id, product2Id)

-- equivalency_groups (eski: esdeger_gruplar)
-- Sütunlar zaten doğru (name, description)

-- product_movements (eski: stok_hareketleri)
-- Sütunlar zaten doğru (productId, movementType, quantity, unitPrice, notes)

-- price_cards (eski: price_cards)
-- Sütunlar zaten doğru (productId, type, price, effectiveFrom, effectiveTo, note)

-- stock_cost_history (eski: stok_cost_history)
-- Sütunlar zaten doğru (productId, cost, method, computedAt)

-- purchase_orders (eski: purchase_orders)
ALTER TABLE "purchase_orders" RENAME COLUMN "siparisNo" TO "order_no";
ALTER TABLE "purchase_orders" RENAME COLUMN "tedarikciId" TO "supplier_id";
ALTER TABLE "purchase_orders" RENAME COLUMN "siparisTarihi" TO "order_date";
ALTER TABLE "purchase_orders" RENAME COLUMN "beklenenTeslimatTarihi" TO "expected_delivery_date";

-- purchase_order_items (eski: purchase_order_items)
ALTER TABLE "purchase_order_items" RENAME COLUMN "siparisMiktari" TO "ordered_quantity";
ALTER TABLE "purchase_order_items" RENAME COLUMN "teslimAlinanMiktar" TO "received_quantity";

-- product_barcodes (eski: stok_barcodlari / urun_barkodlari)
-- Sütunlar zaten doğru (productId, barcode, symbology, isPrimary)

-- sales_order_logs (eski: siparis_logs)
ALTER TABLE "sales_order_logs" RENAME COLUMN "siparisId" TO "order_id";

-- quote_logs (eski: teklif_logs)
ALTER TABLE "quote_logs" RENAME COLUMN "teklifId" TO "quote_id";

-- ============================================================
-- 4. INDEX ADI DEĞİŞİMLERİ (Opsiyonel)
-- ============================================================

-- Prisma migration otomatik olarak index isimlerini güncelleyecek,
-- ancak bazı özel index'leri manuel olarak güncellememiz gerekebilir

-- ============================================================
-- MIGRATION TAMAMLANDI RAPORU
-- ============================================================

DO $$
DECLARE
    completed_count INTEGER := 0;
BEGIN
    -- Enum değişimleri
    SELECT 1 INTO completed_count;
    
    -- Tablo değişimleri
    SELECT COUNT(*) INTO completed_count FROM information_schema.tables WHERE table_schema = current_schema() AND table_name IN ('products', 'accounts', 'cashboxes', 'invoices', 'invoice_items', 'collections', 'employees', 'employee_payments', 'sales_orders', 'sales_order_items', 'quotes', 'quote_items', 'stocktakes', 'stocktake_items', 'warehouse', 'shelves', 'product_shelves', 'expense_categories', 'expenses', 'bank_transfers', 'deleted_bank_transfers', 'bank_transfer_logs', 'checks_bills', 'deleted_checks_bills', 'check_bill_logs', 'cashbox_movements', 'invoice_logs', 'invoice_collections', 'einvoice_xml', 'sales_delivery_notes', 'sales_delivery_note_items', 'sales_delivery_note_logs', 'order_pickings', 'procurement_orders', 'procurement_order_items', 'procurement_order_logs', 'purchase_delivery_notes', 'purchase_delivery_note_items', 'purchase_delivery_note_logs', 'simple_orders', 'vehicle_catalog');
    
    -- Sütun değişimleri
    -- Not: Sütun değişimleri yukarıda topluca yapıldı
    
    RAISE NOTICE 'Migration Stage 1 completed successfully: % table and column renames processed', completed_count;
END;
$$;

COMMIT;

-- ============================================================
-- SONRAKİ ADIMLAR
-- ============================================================
-- 1. Migration'ı çalıştırın: npx prisma migrate deploy
-- 2. Prisma Client'ı yeniden oluşturun: npx prisma generate
-- 3. Backend kodlarını güncelleyin (örnek: stokKodu → code, cariKodu → code)
-- 4. Frontend'i güncelleyin
-- 5. Test yapın ve doğrulayın
-- ============================================================