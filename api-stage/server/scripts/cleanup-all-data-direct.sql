-- Staging Database Cleanup - Direct SQL
-- Admin kullanıcısı: info@azemyazilim.com korunacak

-- Admin kullanıcı ID'sini bul
DO $$
DECLARE
    admin_user_id TEXT;
    admin_tenant_id TEXT;
BEGIN
    SELECT id INTO admin_user_id FROM users WHERE email = 'info@azemyazilim.com';
    SELECT "tenantId" INTO admin_tenant_id FROM users WHERE email = 'info@azemyazilim.com';
    
    IF admin_user_id IS NULL THEN
        RAISE EXCEPTION 'Admin kullanıcısı bulunamadı';
    END IF;
    
    -- Tüm tabloları temizle
    DELETE FROM "SatınAlmaSiparisLog";
    DELETE FROM "SatınAlmaSiparisKalemi";
    DELETE FROM "SatınAlmaSiparisi";
    DELETE FROM "BasitSiparis";
    DELETE FROM "PurchaseOrderItem";
    DELETE FROM "PurchaseOrder";
    DELETE FROM "FaturaTahsilat";
    DELETE FROM "Tahsilat";
    DELETE FROM "FaturaKalemi";
    DELETE FROM "FaturaLog";
    DELETE FROM "Fatura";
    DELETE FROM "SiparisKalemi";
    DELETE FROM "SiparisHazirlik";
    DELETE FROM "SiparisLog";
    DELETE FROM "Siparis";
    DELETE FROM "TeklifKalemi";
    DELETE FROM "TeklifLog";
    DELETE FROM "Teklif";
    DELETE FROM "SayimKalemi";
    DELETE FROM "Sayim";
    DELETE FROM "StockMove";
    DELETE FROM "ProductLocationStock";
    DELETE FROM "ProductBarcode";
    DELETE FROM "Location";
    DELETE FROM "Warehouse";
    DELETE FROM "UrunRaf";
    DELETE FROM "Raf";
    DELETE FROM "Depo";
    DELETE FROM "StokHareket";
    DELETE FROM "StokEsdeger";
    DELETE FROM "EsdegerGrup";
    DELETE FROM "StockCostHistory";
    DELETE FROM "PriceCard";
    DELETE FROM "Stok";
    DELETE FROM "KasaHareket";
    DELETE FROM "FirmaKrediKartiHareket";
    DELETE FROM "FirmaKrediKarti";
    DELETE FROM "BankaHesapHareket";
    DELETE FROM "BankaHesabi";
    DELETE FROM "Kasa";
    DELETE FROM "CariHareket";
    DELETE FROM "Cari";
    DELETE FROM "DeletedCekSenet";
    DELETE FROM "CekSenetLog";
    DELETE FROM "CekSenet";
    DELETE FROM "DeletedBankaHavale";
    DELETE FROM "BankaHavaleLog";
    DELETE FROM "BankaHavale";
    DELETE FROM "PersonelOdeme";
    DELETE FROM "Personel";
    DELETE FROM "Masraf";
    DELETE FROM "MasrafKategori";
    DELETE FROM "Arac";
    DELETE FROM "CodeTemplate";
    DELETE FROM "Payment";
    DELETE FROM "Subscription";
    DELETE FROM "Session";
    DELETE FROM "AuditLog";
    DELETE FROM "TenantSettings";
    
    -- Tenant'ları temizle (admin tenant hariç)
    IF admin_tenant_id IS NOT NULL THEN
        DELETE FROM "Tenant" WHERE id != admin_tenant_id;
    ELSE
        DELETE FROM "Tenant";
    END IF;
    
    -- Kullanıcıları temizle (admin hariç)
    DELETE FROM "User" WHERE email != 'info@azemyazilim.com';
    
    RAISE NOTICE 'Temizlik tamamlandı!';
END $$;

