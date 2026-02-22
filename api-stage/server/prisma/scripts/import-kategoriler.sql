-- Kategori tanımları import (Yedek Parça tenant) - sadeceKategoriTanimi stok kayıtları
BEGIN;
INSERT INTO stoklar (id, "stokKodu", "tenantId", "stokAdi", aciklama, birim, "alisFiyati", "satisFiyati", "kdvOrani", "kritikStokMiktari", "anaKategori", "altKategori", "sadeceKategoriTanimi", "createdAt", "updatedAt")
VALUES
  (gen_random_uuid()::text, 'KAT-IMP-000001', 'clxyedekparca00001', '[Ana Kategori Tanımı] ALT TAKIM', 'Import: kategori tanımı. Gerçek stok kaydı değildir.', 'Adet', 0, 0, 20, 0, 'ALT TAKIM', NULL, true, now(), now()),
  (gen_random_uuid()::text, 'KAT-IMP-000002', 'clxyedekparca00001', '[Ana Kategori Tanımı] ELEKTRİK GRUBU', 'Import: kategori tanımı. Gerçek stok kaydı değildir.', 'Adet', 0, 0, 20, 0, 'ELEKTRİK GRUBU', NULL, true, now(), now()),
  (gen_random_uuid()::text, 'KAT-IMP-000003', 'clxyedekparca00001', '[Kategori Tanımı] FİLTRE - HAVA FİLTRESİ', 'Import: kategori tanımı. Gerçek stok kaydı değildir.', 'Adet', 0, 0, 20, 0, 'FİLTRE', 'HAVA FİLTRESİ', true, now(), now()),
  (gen_random_uuid()::text, 'KAT-IMP-000004', 'clxyedekparca00001', '[Kategori Tanımı] FİLTRE - POLEN FİLTRESİ', 'Import: kategori tanımı. Gerçek stok kaydı değildir.', 'Adet', 0, 0, 20, 0, 'FİLTRE', 'POLEN FİLTRESİ', true, now(), now()),
  (gen_random_uuid()::text, 'KAT-IMP-000005', 'clxyedekparca00001', '[Kategori Tanımı] FİLTRE - YAĞ FİLTRESİ', 'Import: kategori tanımı. Gerçek stok kaydı değildir.', 'Adet', 0, 0, 20, 0, 'FİLTRE', 'YAĞ FİLTRESİ', true, now(), now()),
  (gen_random_uuid()::text, 'KAT-IMP-000006', 'clxyedekparca00001', '[Kategori Tanımı] FİLTRE - YAKIT FİLTRESİ', 'Import: kategori tanımı. Gerçek stok kaydı değildir.', 'Adet', 0, 0, 20, 0, 'FİLTRE', 'YAKIT FİLTRESİ', true, now(), now()),
  (gen_random_uuid()::text, 'KAT-IMP-000007', 'clxyedekparca00001', '[Ana Kategori Tanımı] FİLTRE', 'Import: kategori tanımı. Gerçek stok kaydı değildir.', 'Adet', 0, 0, 20, 0, 'FİLTRE', NULL, true, now(), now()),
  (gen_random_uuid()::text, 'KAT-IMP-000008', 'clxyedekparca00001', '[Ana Kategori Tanımı] FREN GRUBU', 'Import: kategori tanımı. Gerçek stok kaydı değildir.', 'Adet', 0, 0, 20, 0, 'FREN GRUBU', NULL, true, now(), now()),
  (gen_random_uuid()::text, 'KAT-IMP-000009', 'clxyedekparca00001', '[Ana Kategori Tanımı] KAYIŞ GRUBU', 'Import: kategori tanımı. Gerçek stok kaydı değildir.', 'Adet', 0, 0, 20, 0, 'KAYIŞ GRUBU', NULL, true, now(), now()),
  (gen_random_uuid()::text, 'KAT-IMP-000010', 'clxyedekparca00001', '[Ana Kategori Tanımı] MOTOR GRUBU', 'Import: kategori tanımı. Gerçek stok kaydı değildir.', 'Adet', 0, 0, 20, 0, 'MOTOR GRUBU', NULL, true, now(), now()),
  (gen_random_uuid()::text, 'KAT-IMP-000011', 'clxyedekparca00001', '[Ana Kategori Tanımı] ŞANZIMAN GRUBU', 'Import: kategori tanımı. Gerçek stok kaydı değildir.', 'Adet', 0, 0, 20, 0, 'ŞANZIMAN GRUBU', NULL, true, now(), now()),
  (gen_random_uuid()::text, 'KAT-IMP-000012', 'clxyedekparca00001', '[Ana Kategori Tanımı] SİLECEK GRUBU', 'Import: kategori tanımı. Gerçek stok kaydı değildir.', 'Adet', 0, 0, 20, 0, 'SİLECEK GRUBU', NULL, true, now(), now()),
  (gen_random_uuid()::text, 'KAT-IMP-000013', 'clxyedekparca00001', '[Ana Kategori Tanımı] SIVI GRUBU', 'Import: kategori tanımı. Gerçek stok kaydı değildir.', 'Adet', 0, 0, 20, 0, 'SIVI GRUBU', NULL, true, now(), now()),
  (gen_random_uuid()::text, 'KAT-IMP-000014', 'clxyedekparca00001', '[Ana Kategori Tanımı] YAĞ GRUBU', 'Import: kategori tanımı. Gerçek stok kaydı değildir.', 'Adet', 0, 0, 20, 0, 'YAĞ GRUBU', NULL, true, now(), now())
ON CONFLICT ("stokKodu", "tenantId") DO UPDATE SET "stokAdi" = EXCLUDED."stokAdi", "anaKategori" = EXCLUDED."anaKategori", "altKategori" = EXCLUDED."altKategori", "sadeceKategoriTanimi" = true, "updatedAt" = now();
COMMIT;
