import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedCariHesaplar() {
  console.log('👥 Örnek Cari Hesaplar Ekleniyor...\n');

  const cariler = [
    // Müşteriler
    {
      code: 'MUS001',
      title: 'Ahmet Yılmaz',
      type: 'CUSTOMER',
      companyType: 'INDIVIDUAL',
      taxNumber: '12345678901',
      taxOffice: 'İstanbul Vergi Dairesi',
      fullName: 'Ahmet Yılmaz',
      phone: '5551234567',
      email: 'ahmet.yilmaz@example.com',
      address: 'İstanbul, Türkiye',
      city: 'İstanbul',
      isActive: true,
    },
    {
      code: 'MUS002',
      title: 'Mehmet Demir',
      type: 'CUSTOMER',
      companyType: 'INDIVIDUAL',
      taxNumber: '98765432109',
      taxOffice: 'Ankara Vergi Dairesi',
      fullName: 'Mehmet Demir',
      phone: '5552345678',
      email: 'mehmet.demir@example.com',
      address: 'Ankara, Türkiye',
      city: 'Ankara',
      isActive: true,
    },
    {
      code: 'MUS003',
      title: 'Ayşe Kaya',
      type: 'CUSTOMER',
      companyType: 'INDIVIDUAL',
      taxNumber: '45678912301',
      taxOffice: 'İzmir Vergi Dairesi',
      fullName: 'Ayşe Kaya',
      phone: '55534567890',
      email: 'ayse.kaya@example.com',
      address: 'İzmir, Türkiye',
      city: 'İzmir',
      isActive: true,
    },
    {
      code: 'MUS004',
      title: 'Oto Tamir Hizmetleri A.Ş.',
      type: 'CUSTOMER',
      companyType: 'CORPORATE',
      taxNumber: '1234567890',
      taxOffice: 'İstanbul Vergi Dairesi',
      phone: '2124567890',
      email: 'info@ototamirhizmetleri.com',
      address: 'İstanbul, Türkiye',
      city: 'İstanbul',
      isActive: true,
      website: 'www.ototamirhizmetleri.com',
    },
    {
      code: 'MUS005',
      title: 'Yıldız Oto Yedek Parça Ltd. Şti.',
      type: 'CUSTOMER',
      companyType: 'CORPORATE',
      taxNumber: '9876543210',
      taxOffice: 'Bursa Vergi Dairesi',
      phone: '2241234567',
      email: 'satis@yildizotoyedek.com',
      address: 'Bursa, Türkiye',
      city: 'Bursa',
      isActive: true,
      website: 'www.yildizotoyedek.com',
    },

    // Tedarikçiler
    {
      code: 'TED001',
      title: 'Bosch Türkiye',
      type: 'SUPPLIER',
      companyType: 'CORPORATE',
      taxNumber: '1112223330',
      taxOffice: 'İstanbul Vergi Dairesi',
      phone: '2125555555',
      email: 'satis@bosch-turkey.com',
      address: 'İstanbul, Türkiye',
      city: 'İstanbul',
      isActive: true,
      website: 'www.bosch.com.tr',
    },
    {
      code: 'TED002',
      title: 'TRW Otomotiv',
      type: 'SUPPLIER',
      companyType: 'CORPORATE',
      taxNumber: '2223334440',
      taxOffice: 'Kocaeli Vergi Dairesi',
      phone: '2621234567',
      email: 'tedarik@trw-oto.com',
      address: 'Kocaeli, Türkiye',
      city: 'Kocaeli',
      isActive: true,
      website: 'www.trw.com',
    },
    {
      code: 'TED003',
      title: 'Mann Filter Türkiye',
      type: 'SUPPLIER',
      companyType: 'CORPORATE',
      taxNumber: '3334445550',
      taxOffice: 'Bursa Vergi Dairesi',
      phone: '2249876543',
      email: 'sales@mann-filter-tr.com',
      address: 'Bursa, Türkiye',
      city: 'Bursa',
      isActive: true,
      website: 'www.mann-filter.com',
    },
    {
      code: 'TED004',
      title: 'Valeo Türkiye',
      type: 'SUPPLIER',
      companyType: 'CORPORATE',
      taxNumber: '4445556660',
      taxOffice: 'Sakarya Vergi Dairesi',
      phone: '2641234567',
      email: 'info@valeo-turkey.com',
      address: 'Sakarya, Türkiye',
      city: 'Sakarya',
      isActive: true,
      website: 'www.valeo.com',
    },
    {
      code: 'TED005',
      title: 'NGK Türkiye',
      type: 'SUPPLIER',
      companyType: 'CORPORATE',
      taxNumber: '5556667770',
      taxOffice: 'Manisa Vergi Dairesi',
      phone: '2362345678',
      email: 'orders@ngk-turkey.com',
      address: 'Manisa, Türkiye',
      city: 'Manisa',
      isActive: true,
      website: 'www.ngk.com.tr',
    },
    {
      code: 'TED006',
      title: 'Brembo Türkiye',
      type: 'SUPPLIER',
      companyType: 'CORPORATE',
      taxNumber: '6667778880',
      taxOffice: 'İstanbul Vergi Dairesi',
      phone: '2123456789',
      email: 'turkey@brembo.com',
      address: 'İstanbul, Türkiye',
      city: 'İstanbul',
      isActive: true,
      website: 'www.brembo.com',
    },
    {
      code: 'TED007',
      title: 'Continental Türkiye',
      type: 'SUPPLIER',
      companyType: 'CORPORATE',
      taxNumber: '7778889990',
      taxOffice: 'Ankara Vergi Dairesi',
      phone: '3121234567',
      email: 'sales@continental-tr.com',
      address: 'Ankara, Türkiye',
      city: 'Ankara',
      isActive: true,
      website: 'www.continental.com',
    },
    {
      code: 'TED008',
      title: 'Sachs Türkiye',
      type: 'SUPPLIER',
      companyType: 'CORPORATE',
      taxNumber: '8889990000',
      taxOffice: 'Kocaeli Vergi Dairesi',
      phone: '2629876543',
      email: 'info@sachs-turkey.com',
      address: 'Kocaeli, Türkiye',
      city: 'Kocaeli',
      isActive: true,
      website: 'www.sachs.com',
    },
    {
      code: 'TED009',
      title: 'Denso Türkiye',
      type: 'SUPPLIER',
      companyType: 'CORPORATE',
      taxNumber: '9990001110',
      taxOffice: 'Bursa Vergi Dairesi',
      phone: '2243456789',
      email: 'orders@denso-turkey.com',
      address: 'Bursa, Türkiye',
      city: 'Bursa',
      isActive: true,
      website: 'www.denso.com.tr',
    },
    {
      code: 'TED010',
      title: 'Gates Türkiye',
      type: 'SUPPLIER',
      companyType: 'CORPORATE',
      taxNumber: '0001112220',
      taxOffice: 'İstanbul Vergi Dairesi',
      phone: '2161234567',
      email: 'sales@gates-turkey.com',
      address: 'İstanbul, Türkiye',
      city: 'İstanbul',
      isActive: true,
      website: 'www.gates.com',
    },
  ];

  let eklenenSayisi = 0;
  let hataSayisi = 0;

  for (const cari of cariler) {
    try {
      // Code benzersizliğini kontrol et
      const existingCode = await prisma.account.findFirst({
        where: { code: cari.code },
      });

      if (existingCode) {
        console.log(`  ⏭️  Cari kodu ${cari.code} zaten mevcut, atlanıyor: ${cari.title}`);
        continue;
      }

      await prisma.account.create({
        data: {
          ...cari,
          balance: 0,
        },
      });

      console.log(`  ✅ ${cari.code} - ${cari.title} (${cari.type})`);
      eklenenSayisi++;
    } catch (error: any) {
      console.error(`  ❌ ${cari.title} eklenirken hata:`, error.message);
      hataSayisi++;
    }
  }

  console.log(`\n✅ Cari hesap ekleme işlemi tamamlandı!`);
  console.log(`   👤 Müşteriler: 5 cari`);
  console.log(`   🏢 Tedarikçiler: 10 cari`);
  console.log(`   📊 Eklenen: ${eklenenSayisi} cari`);
  console.log(`   📊 Hata: ${hataSayisi} cari`);
  console.log(`   📊 Toplam: ${cariler.length} cari\n`);
}

seedCariHesaplar()
  .catch((e) => {
    console.error('❌ Seed hatası:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });