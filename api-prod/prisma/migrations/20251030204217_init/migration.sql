-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'USER', 'MANAGER');

-- CreateEnum
CREATE TYPE "HareketTipi" AS ENUM ('GIRIS', 'CIKIS', 'SATIS', 'IADE', 'SAYIM');

-- CreateEnum
CREATE TYPE "CariTip" AS ENUM ('MUSTERI', 'TEDARIKCI', 'HER_IKISI');

-- CreateEnum
CREATE TYPE "BorcAlacak" AS ENUM ('BORC', 'ALACAK');

-- CreateEnum
CREATE TYPE "FaturaTipi" AS ENUM ('ALIS', 'SATIS');

-- CreateEnum
CREATE TYPE "FaturaDurum" AS ENUM ('ACIK', 'KAPALI', 'KISMEN_ODENDI');

-- CreateEnum
CREATE TYPE "TahsilatTip" AS ENUM ('TAHSILAT', 'ODEME');

-- CreateEnum
CREATE TYPE "OdemeTipi" AS ENUM ('NAKIT', 'KREDI_KARTI', 'BANKA_HAVALESI', 'CEK', 'SENET');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "refreshToken" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stoklar" (
    "id" TEXT NOT NULL,
    "stokKodu" TEXT NOT NULL,
    "stokAdi" TEXT NOT NULL,
    "aciklama" TEXT,
    "birim" TEXT NOT NULL,
    "alisFiyati" DECIMAL(10,2) NOT NULL,
    "satisFiyati" DECIMAL(10,2) NOT NULL,
    "kdvOrani" INTEGER NOT NULL DEFAULT 20,
    "kritikStokMiktari" INTEGER NOT NULL DEFAULT 0,
    "kategori" TEXT,
    "marka" TEXT,
    "model" TEXT,
    "raf" TEXT,
    "barkod" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "stoklar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stok_esdegers" (
    "id" TEXT NOT NULL,
    "stok1Id" TEXT NOT NULL,
    "stok2Id" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stok_esdegers_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "stok_hareketleri" (
    "id" TEXT NOT NULL,
    "stokId" TEXT NOT NULL,
    "hareketTipi" "HareketTipi" NOT NULL,
    "miktar" INTEGER NOT NULL,
    "birimFiyat" DECIMAL(10,2) NOT NULL,
    "aciklama" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "stok_hareketleri_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cariler" (
    "id" TEXT NOT NULL,
    "cariKodu" TEXT NOT NULL,
    "unvan" TEXT NOT NULL,
    "tip" "CariTip" NOT NULL,
    "vergiNo" TEXT,
    "vergiDairesi" TEXT,
    "telefon" TEXT,
    "email" TEXT,
    "adres" TEXT,
    "yetkili" TEXT,
    "bakiye" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cariler_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cari_hareketler" (
    "id" TEXT NOT NULL,
    "cariId" TEXT NOT NULL,
    "tip" "BorcAlacak" NOT NULL,
    "tutar" DECIMAL(12,2) NOT NULL,
    "aciklama" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "cari_hareketler_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "faturalar" (
    "id" TEXT NOT NULL,
    "faturaNo" TEXT NOT NULL,
    "faturaTipi" "FaturaTipi" NOT NULL,
    "cariId" TEXT NOT NULL,
    "tarih" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "vade" TIMESTAMP(3),
    "iskonto" DECIMAL(10,2) NOT NULL DEFAULT 0,
    "toplamTutar" DECIMAL(12,2) NOT NULL,
    "kdvTutar" DECIMAL(12,2) NOT NULL,
    "genelToplam" DECIMAL(12,2) NOT NULL,
    "aciklama" TEXT,
    "durum" "FaturaDurum" NOT NULL DEFAULT 'ACIK',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "faturalar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "fatura_kalemleri" (
    "id" TEXT NOT NULL,
    "faturaId" TEXT NOT NULL,
    "stokId" TEXT NOT NULL,
    "miktar" INTEGER NOT NULL,
    "birimFiyat" DECIMAL(10,2) NOT NULL,
    "kdvOrani" INTEGER NOT NULL,
    "kdvTutar" DECIMAL(10,2) NOT NULL,
    "tutar" DECIMAL(10,2) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "fatura_kalemleri_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tahsilatlar" (
    "id" TEXT NOT NULL,
    "cariId" TEXT NOT NULL,
    "faturaId" TEXT,
    "tip" "TahsilatTip" NOT NULL,
    "tutar" DECIMAL(12,2) NOT NULL,
    "tarih" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "odemeTipi" "OdemeTipi" NOT NULL,
    "kasaId" TEXT,
    "aciklama" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tahsilatlar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kasalar" (
    "id" TEXT NOT NULL,
    "kasaAdi" TEXT NOT NULL,
    "bakiye" DECIMAL(12,2) NOT NULL DEFAULT 0,
    "dovizCinsi" TEXT NOT NULL DEFAULT 'TRY',
    "aciklama" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "kasalar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "kasa_hareketler" (
    "id" TEXT NOT NULL,
    "kasaId" TEXT NOT NULL,
    "tip" "BorcAlacak" NOT NULL,
    "tutar" DECIMAL(12,2) NOT NULL,
    "aciklama" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "kasa_hareketler_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "depolar" (
    "id" TEXT NOT NULL,
    "depoAdi" TEXT NOT NULL,
    "adres" TEXT,
    "yetkili" TEXT,
    "telefon" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "depolar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "raflar" (
    "id" TEXT NOT NULL,
    "depoId" TEXT NOT NULL,
    "rafKodu" TEXT NOT NULL,
    "aciklama" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "raflar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "urun_raflar" (
    "id" TEXT NOT NULL,
    "stokId" TEXT NOT NULL,
    "rafId" TEXT NOT NULL,
    "miktar" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "urun_raflar_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "masraf_kategoriler" (
    "id" TEXT NOT NULL,
    "kategoriAdi" TEXT NOT NULL,
    "aciklama" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "masraf_kategoriler_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "masraflar" (
    "id" TEXT NOT NULL,
    "kategoriId" TEXT NOT NULL,
    "aciklama" TEXT NOT NULL,
    "tutar" DECIMAL(10,2) NOT NULL,
    "tarih" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "odemeTipi" "OdemeTipi" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "masraflar_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "stoklar_stokKodu_key" ON "stoklar"("stokKodu");

-- CreateIndex
CREATE UNIQUE INDEX "stoklar_barkod_key" ON "stoklar"("barkod");

-- CreateIndex
CREATE UNIQUE INDEX "stok_esdegers_stok1Id_stok2Id_key" ON "stok_esdegers"("stok1Id", "stok2Id");

-- CreateIndex
CREATE UNIQUE INDEX "cariler_cariKodu_key" ON "cariler"("cariKodu");

-- CreateIndex
CREATE UNIQUE INDEX "faturalar_faturaNo_key" ON "faturalar"("faturaNo");

-- CreateIndex
CREATE UNIQUE INDEX "kasalar_kasaAdi_key" ON "kasalar"("kasaAdi");

-- CreateIndex
CREATE UNIQUE INDEX "depolar_depoAdi_key" ON "depolar"("depoAdi");

-- CreateIndex
CREATE UNIQUE INDEX "raflar_depoId_rafKodu_key" ON "raflar"("depoId", "rafKodu");

-- CreateIndex
CREATE UNIQUE INDEX "urun_raflar_stokId_rafId_key" ON "urun_raflar"("stokId", "rafId");

-- CreateIndex
CREATE UNIQUE INDEX "masraf_kategoriler_kategoriAdi_key" ON "masraf_kategoriler"("kategoriAdi");

-- AddForeignKey
ALTER TABLE "stok_esdegers" ADD CONSTRAINT "stok_esdegers_stok1Id_fkey" FOREIGN KEY ("stok1Id") REFERENCES "stoklar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stok_esdegers" ADD CONSTRAINT "stok_esdegers_stok2Id_fkey" FOREIGN KEY ("stok2Id") REFERENCES "stoklar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "stok_hareketleri" ADD CONSTRAINT "stok_hareketleri_stokId_fkey" FOREIGN KEY ("stokId") REFERENCES "stoklar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cari_hareketler" ADD CONSTRAINT "cari_hareketler_cariId_fkey" FOREIGN KEY ("cariId") REFERENCES "cariler"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "faturalar" ADD CONSTRAINT "faturalar_cariId_fkey" FOREIGN KEY ("cariId") REFERENCES "cariler"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fatura_kalemleri" ADD CONSTRAINT "fatura_kalemleri_faturaId_fkey" FOREIGN KEY ("faturaId") REFERENCES "faturalar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "fatura_kalemleri" ADD CONSTRAINT "fatura_kalemleri_stokId_fkey" FOREIGN KEY ("stokId") REFERENCES "stoklar"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tahsilatlar" ADD CONSTRAINT "tahsilatlar_cariId_fkey" FOREIGN KEY ("cariId") REFERENCES "cariler"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tahsilatlar" ADD CONSTRAINT "tahsilatlar_faturaId_fkey" FOREIGN KEY ("faturaId") REFERENCES "faturalar"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tahsilatlar" ADD CONSTRAINT "tahsilatlar_kasaId_fkey" FOREIGN KEY ("kasaId") REFERENCES "kasalar"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "kasa_hareketler" ADD CONSTRAINT "kasa_hareketler_kasaId_fkey" FOREIGN KEY ("kasaId") REFERENCES "kasalar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "raflar" ADD CONSTRAINT "raflar_depoId_fkey" FOREIGN KEY ("depoId") REFERENCES "depolar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "urun_raflar" ADD CONSTRAINT "urun_raflar_stokId_fkey" FOREIGN KEY ("stokId") REFERENCES "stoklar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "urun_raflar" ADD CONSTRAINT "urun_raflar_rafId_fkey" FOREIGN KEY ("rafId") REFERENCES "raflar"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "masraflar" ADD CONSTRAINT "masraflar_kategoriId_fkey" FOREIGN KEY ("kategoriId") REFERENCES "masraf_kategoriler"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
