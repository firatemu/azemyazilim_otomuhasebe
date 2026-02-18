-- Staging Database Cleanup Script
-- Admin kullanıcısı: info@azemyazilim.com korunacak

BEGIN;

-- Admin kullanıcı ID'sini al
DO $$
DECLARE
    admin_user_id TEXT;
    admin_tenant_id TEXT;
BEGIN
    -- Admin kullanıcı ID'sini bul
    SELECT id INTO admin_user_id FROM users WHERE email = 'info@azemyazilim.com';
    SELECT "tenantId" INTO admin_tenant_id FROM users WHERE email = 'info@azemyazilim.com';
    
    IF admin_user_id IS NULL THEN
        RAISE EXCEPTION 'Admin kullanıcısı bulunamadı: info@azemyazilim.com';
    END IF;
    
    RAISE NOTICE 'Admin kullanıcı ID: %', admin_user_id;
    RAISE NOTICE 'Admin tenant ID: %', admin_tenant_id;
    
    -- Tüm tabloları temizle (foreign key constraint'leri nedeniyle doğru sırada)
    DELETE FROM "satın_alma_siparis_logs";
    DELETE FROM "satın_alma_siparis_kalemleri";
    DELETE FROM "satın_alma_siparisler";
    DELETE FROM "basit_siparisler";
    DELETE FROM "purchase_order_items";
    DELETE FROM "purchase_orders";
    DELETE FROM "fatura_tahsilatlar";
    DELETE FROM "tahsilatlar";
    DELETE FROM "fatura_kalemleri";
    DELETE FROM "fatura_logs";
    DELETE FROM "faturalar";
    DELETE FROM "siparis_kalemleri";
    DELETE FROM "siparis_hazirliklar";
    DELETE FROM "siparis_logs";
    DELETE FROM "siparisler";
    DELETE FROM "teklif_kalemleri";
    DELETE FROM "teklif_logs";
    DELETE FROM "teklifler";
    DELETE FROM "sayim_kalemleri";
    DELETE FROM "sayimlar";
    DELETE FROM "stock_moves";
    DELETE FROM "product_location_stocks";
    DELETE FROM "product_barcodes";
    DELETE FROM "locations";
    DELETE FROM "warehouses";
    DELETE FROM "urun_raflar";
    DELETE FROM "raflar";
    DELETE FROM "depolar";
    DELETE FROM "stok_hareketler";
    DELETE FROM "stok_esdegerler";
    DELETE FROM "esdeger_gruplar";
    DELETE FROM "stock_cost_histories";
    DELETE FROM "price_cards";
    DELETE FROM "stoklar";
    DELETE FROM "kasa_hareketler";
    DELETE FROM "firma_kredi_karti_hareketler";
    DELETE FROM "firma_kredi_kartlari";
    DELETE FROM "banka_hesap_hareketler";
    DELETE FROM "banka_hesaplari";
    DELETE FROM "kasalar";
    DELETE FROM "cari_hareketler";
    DELETE FROM "cariler";
    DELETE FROM "deleted_cek_senetler";
    DELETE FROM "cek_senet_logs";
    DELETE FROM "cek_senetler";
    DELETE FROM "deleted_banka_havaleler";
    DELETE FROM "banka_havale_logs";
    DELETE FROM "banka_havaleler";
    DELETE FROM "personel_odemeler";
    DELETE FROM "personeller";
    DELETE FROM "masraflar";
    DELETE FROM "masraf_kategoriler";
    DELETE FROM "araclar";
    DELETE FROM "code_templates";
    
    -- Payment ve subscription tabloları
    DELETE FROM "payments";
    DELETE FROM "subscriptions";
    DELETE FROM "sessions";
    DELETE FROM "audit_logs";
    
    -- Tenant settings
    DELETE FROM "tenant_settings";
    
    -- Tenant'ları temizle (admin tenant hariç)
    IF admin_tenant_id IS NOT NULL THEN
        DELETE FROM "tenants" WHERE id != admin_tenant_id;
    ELSE
        DELETE FROM "tenants";
    END IF;
    
    -- Son olarak kullanıcıları temizle (admin hariç)
    DELETE FROM "users" WHERE email != 'info@azemyazilim.com';
    
    RAISE NOTICE 'Tüm veriler temizlendi!';
    RAISE NOTICE 'Admin kullanıcı korundu: info@azemyazilim.com';
END $$;

COMMIT;

