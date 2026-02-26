-- Add IPTAL_GIRIS and IPTAL_CIKIS to HareketTipi enum (fatura iptal stok hareketleri)
ALTER TYPE "HareketTipi" ADD VALUE 'IPTAL_GIRIS';
ALTER TYPE "HareketTipi" ADD VALUE 'IPTAL_CIKIS';
