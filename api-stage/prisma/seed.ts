import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seed işlemi başlıyor...');

  // Örnek stok verileri
  const stoklar = [
    {
      stokKodu: 'BRK001',
      stokAdi: 'Fren Balatası Ön Takım',
      birim: 'Takım',
      alisFiyati: 120.00,
      satisFiyati: 180.00,
      anaKategori: 'Fren Sistemleri',
      altKategori: 'Fren Balatası',
      marka: 'Kale',
      oem: 'KLB-236002',
      olcu: '12x1.5',
      kategori: 'Fren Sistemleri',
    },
    {
      stokKodu: 'BRK002',
      stokAdi: 'Fren Diski Ön',
      birim: 'Adet',
      alisFiyati: 250.00,
      satisFiyati: 380.00,
      anaKategori: 'Fren Sistemleri',
      altKategori: 'Fren Diski',
      marka: 'Brembo',
      oem: '09.9772.11',
      olcu: '280x22mm',
      kategori: 'Fren Sistemleri',
    },
    {
      stokKodu: 'FLT001',
      stokAdi: 'Yağ Filtresi',
      birim: 'Adet',
      alisFiyati: 35.00,
      satisFiyati: 65.00,
      anaKategori: 'Motor Parçaları',
      altKategori: 'Filtre',
      marka: 'Mann Filter',
      oem: 'W 712/75',
      kategori: 'Motor Parçaları',
    },
    {
      stokKodu: 'OIL001',
      stokAdi: 'Motor Yağı 5W-30',
      birim: 'Litre',
      alisFiyati: 85.00,
      satisFiyati: 135.00,
      anaKategori: 'Motor Parçaları',
      altKategori: 'Yağlar',
      marka: 'Mobil',
      olcu: '5W-30',
      kategori: 'Motor Parçaları',
    },
    {
      stokKodu: 'AMR001',
      stokAdi: 'Amortisör Ön Sağ',
      birim: 'Adet',
      alisFiyati: 450.00,
      satisFiyati: 680.00,
      anaKategori: 'Süspansiyon',
      altKategori: 'Amortisör',
      marka: 'Sachs',
      oem: '313-267',
      kategori: 'Süspansiyon',
    },
  ];

  for (const stok of stoklar) {
    // Seed script için tenantId olmadan çalışır, findFirst kullan
    const existing = await prisma.stok.findFirst({
      where: { stokKodu: stok.stokKodu },
    });
    
    if (existing) {
      await prisma.stok.update({
        where: { id: existing.id },
        data: stok,
      });
    } else {
      await prisma.stok.create({
        data: stok,
      });
    }
    console.log(`✓ ${stok.stokKodu} - ${stok.stokAdi}`);
  }

  // Örnek cari verileri
  const cariler = [
    {
      cariKodu: 'CARI001',
      unvan: 'ABC Otomotiv San. ve Tic. Ltd. Şti.',
      tip: 'MUSTERI' as const,
      vergiNo: '1234567890',
      vergiDairesi: 'Kağıthane',
      telefon: '+90 212 555 0101',
      email: 'info@abcotomotiv.com',
      adres: 'İstanbul, Kağıthane',
      yetkili: 'Ahmet Yılmaz',
    },
    {
      cariKodu: 'CARI002',
      unvan: 'DEF Yedek Parça A.Ş.',
      tip: 'TEDARIKCI' as const,
      vergiNo: '9876543210',
      vergiDairesi: 'Beşiktaş',
      telefon: '+90 212 555 0202',
      email: 'satis@defyedekparca.com',
      adres: 'İstanbul, Beşiktaş',
      yetkili: 'Mehmet Demir',
    },
    {
      cariKodu: 'CARI003',
      unvan: 'GHI Servis ve Ticaret',
      tip: 'HER_IKISI' as const,
      vergiNo: '5647382910',
      vergiDairesi: 'Kadıköy',
      telefon: '+90 216 555 0303',
      email: 'iletisim@ghiservis.com',
      adres: 'İstanbul, Kadıköy',
      yetkili: 'Selin Kara',
    },
    {
      cariKodu: 'CARI004',
      unvan: 'JKL Otomotiv',
      tip: 'MUSTERI' as const,
      telefon: '+90 312 555 0404',
      email: 'info@jkloto.com',
      adres: 'Ankara, Çankaya',
      yetkili: 'Burak Şen',
    },
    {
      cariKodu: 'CARI005',
      unvan: 'MNO Dış Ticaret Ltd.',
      tip: 'TEDARIKCI' as const,
      telefon: '+90 232 555 0505',
      email: 'export@mnodisticaret.com',
      adres: 'İzmir, Konak',
      yetkili: 'Elif Aydın',
    },
    {
      cariKodu: 'CARI006',
      unvan: 'PQR Parça ve Servis',
      tip: 'HER_IKISI' as const,
      telefon: '+90 224 555 0606',
      email: 'destek@pqrparca.com',
      adres: 'Bursa, Nilüfer',
      yetkili: 'Can Gür',
    },
  ];

  for (const cari of cariler) {
    // Seed script için tenantId olmadan çalışır, findFirst kullan
    const existing = await prisma.cari.findFirst({
      where: { cariKodu: cari.cariKodu },
    });
    
    if (existing) {
      await prisma.cari.update({
        where: { id: existing.id },
        data: cari,
      });
    } else {
      await prisma.cari.create({
        data: cari,
      });
    }
    console.log(`✓ ${cari.cariKodu} - ${cari.unvan}`);
  }

  console.log('✅ Seed işlemi tamamlandı!');
}

main()
  .catch((e) => {
    console.error('Seed hatası:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

