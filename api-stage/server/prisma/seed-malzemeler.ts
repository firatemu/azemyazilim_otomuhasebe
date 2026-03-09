import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedMalzemeler() {
  console.log('🌱 Örnek Araç Yedek Parça Malzemeleri Ekleniyor...\n');

  // Kategoriler ve markalar eşleştirmesi ile örnek malzemeler
  const malzemeler = [
    // Fren Sistemleri
    {
      name: 'Fren Balatası Ön Takım',
      unit: 'Takım',
      purchasePrice: 120.00,
      salePrice: 180.00,
      mainCategory: 'Fren Sistemleri',
      subCategory: 'Fren Balatası',
      brand: 'Bosch',
      oem: '0 986 479 782',
      size: '12x1.5',
      barcode: '8690123456789',
    },
    {
      name: 'Fren Balatası Arka Takım',
      unit: 'Takım',
      purchasePrice: 95.00,
      salePrice: 145.00,
      mainCategory: 'Fren Sistemleri',
      subCategory: 'Fren Balatası',
      brand: 'Valeo',
      oem: 'V5578',
      size: '10x1.2',
      barcode: '8690123456790',
    },
    {
      name: 'Fren Diski Ön',
      unit: 'Adet',
      purchasePrice: 250.00,
      salePrice: 380.00,
      mainCategory: 'Fren Sistemleri',
      subCategory: 'Fren Diski',
      brand: 'Brembo',
      oem: '09.9772.11',
      size: '280x22mm',
      barcode: '8690123456791',
    },
    {
      name: 'Fren Diski Arka',
      unit: 'Adet',
      purchasePrice: 180.00,
      salePrice: 280.00,
      mainCategory: 'Fren Sistemleri',
      subCategory: 'Fren Diski',
      brand: 'Brembo',
      oem: '09.9772.12',
      size: '260x10mm',
      barcode: '8690123456792',
    },
    {
      name: 'Fren Hortumu Ön',
      unit: 'Adet',
      purchasePrice: 45.00,
      salePrice: 75.00,
      mainCategory: 'Fren Sistemleri',
      subCategory: 'Fren Hortumu',
      brand: 'TRW',
      oem: 'PFG446',
      barcode: '8690123456793',
    },
    {
      name: 'Fren Kaliperi Ön Sağ',
      unit: 'Adet',
      purchasePrice: 320.00,
      salePrice: 480.00,
      mainCategory: 'Fren Sistemleri',
      subCategory: 'Fren Kaliperi',
      brand: 'Continental',
      oem: 'ATE 13.0460-7513.2',
      barcode: '8690123456794',
    },

    // Motor Parçaları
    {
      name: 'Motor Yağı 5W-30',
      unit: 'Litre',
      purchasePrice: 85.00,
      salePrice: 135.00,
      mainCategory: 'Motor Parçaları',
      subCategory: 'Motor Yağı',
      brand: 'Mobil',
      size: '5W-30',
      barcode: '8690123456795',
    },
    {
      name: 'Motor Yağı 10W-40',
      unit: 'Litre',
      purchasePrice: 75.00,
      salePrice: 120.00,
      mainCategory: 'Motor Parçaları',
      subCategory: 'Motor Yağı',
      brand: 'Castrol',
      size: '10W-40',
      barcode: '8690123456796',
    },
    {
      name: 'Yağ Filtresi',
      unit: 'Adet',
      purchasePrice: 35.00,
      salePrice: 65.00,
      mainCategory: 'Motor Parçaları',
      subCategory: 'Yağ Filtresi',
      brand: 'Mann Filter',
      oem: 'W 712/75',
      barcode: '8690123456797',
    },
    {
      name: 'Hava Filtresi',
      unit: 'Adet',
      purchasePrice: 42.00,
      salePrice: 78.00,
      mainCategory: 'Motor Parçaları',
      subCategory: 'Hava Filtresi',
      brand: 'Mann Filter',
      oem: 'C 27 038',
      barcode: '8690123456798',
    },
    {
      name: 'Yakıt Filtresi',
      unit: 'Adet',
      purchasePrice: 55.00,
      salePrice: 95.00,
      mainCategory: 'Motor Parçaları',
      subCategory: 'Yakıt Filtresi',
      brand: 'Mann Filter',
      oem: 'WK 712/11',
      barcode: '8690123456799',
    },
    {
      name: 'Buji',
      unit: 'Adet',
      purchasePrice: 28.00,
      salePrice: 52.00,
      mainCategory: 'Motor Parçaları',
      subCategory: 'Buji',
      brand: 'NGK',
      oem: 'BKR6E',
      size: '14mm',
      barcode: '8690123456800',
    },
    {
      name: 'Buji',
      unit: 'Adet',
      purchasePrice: 32.00,
      salePrice: 58.00,
      mainCategory: 'Motor Parçaları',
      subCategory: 'Buji',
      brand: 'Denso',
      oem: 'IK20',
      size: '14mm',
      barcode: '8690123456801',
    },
    {
      name: 'Termostat',
      unit: 'Adet',
      purchasePrice: 68.00,
      salePrice: 110.00,
      mainCategory: 'Motor Parçaları',
      subCategory: 'Termostat',
      brand: 'Mahle',
      oem: 'TH 102 87',
      barcode: '8690123456802',
    },

    // Süspansiyon
    {
      name: 'Amortisör Ön Sağ',
      unit: 'Adet',
      purchasePrice: 450.00,
      salePrice: 680.00,
      mainCategory: 'Süspansiyon',
      subCategory: 'Amortisör',
      brand: 'Sachs',
      oem: '313-267',
      barcode: '8690123456803',
    },
    {
      name: 'Amortisör Ön Sol',
      unit: 'Adet',
      purchasePrice: 450.00,
      salePrice: 680.00,
      mainCategory: 'Süspansiyon',
      subCategory: 'Amortisör',
      brand: 'Sachs',
      oem: '313-268',
      barcode: '8690123456804',
    },
    {
      name: 'Amortisör Arka Sağ',
      unit: 'Adet',
      purchasePrice: 380.00,
      salePrice: 580.00,
      mainCategory: 'Süspansiyon',
      subCategory: 'Amortisör',
      brand: 'Sachs',
      oem: '313-269',
      barcode: '8690123456805',
    },
    {
      name: 'Yay Ön',
      unit: 'Adet',
      purchasePrice: 220.00,
      salePrice: 350.00,
      mainCategory: 'Süspansiyon',
      subCategory: 'Yay',
      brand: 'Febi Bilstein',
      oem: '28755',
      barcode: '8690123456806',
    },
    {
      name: 'Rot Başı',
      unit: 'Adet',
      purchasePrice: 95.00,
      salePrice: 155.00,
      mainCategory: 'Süspansiyon',
      subCategory: 'Rot Başı',
      brand: 'Lemförder',
      oem: '36673 01',
      barcode: '8690123456807',
    },
    {
      name: 'Rotil',
      unit: 'Adet',
      purchasePrice: 78.00,
      salePrice: 125.00,
      mainCategory: 'Süspansiyon',
      subCategory: 'Rotil',
      brand: 'Meyle',
      oem: 'ME-83384',
      barcode: '8690123456808',
    },

    // Aydınlatma
    {
      name: 'Far Ampulü H7',
      unit: 'Adet',
      purchasePrice: 25.00,
      salePrice: 45.00,
      mainCategory: 'Aydınlatma',
      subCategory: 'Far Ampulü',
      brand: 'Osram',
      oem: 'H7 12V 55W',
      size: 'H7',
      barcode: '8690123456809',
    },
    {
      name: 'Stop Ampulü',
      unit: 'Adet',
      purchasePrice: 8.00,
      salePrice: 18.00,
      mainCategory: 'Aydınlatma',
      subCategory: 'Stop Ampulü',
      brand: 'Osram',
      oem: 'P21/5W',
      barcode: '8690123456810',
    },
    {
      name: 'Sinyal Ampulü',
      unit: 'Adet',
      purchasePrice: 6.00,
      salePrice: 15.00,
      mainCategory: 'Aydınlatma',
      subCategory: 'Sinyal Ampulü',
      brand: 'Osram',
      oem: 'PY21W',
      barcode: '8690123456811',
    },

    // Elektrik Sistemleri
    {
      name: 'Akü 60Ah',
      unit: 'Adet',
      purchasePrice: 580.00,
      salePrice: 850.00,
      mainCategory: 'Elektrik Sistemleri',
      subCategory: 'Akü',
      brand: 'Varta',
      oem: 'E11',
      size: '60Ah',
      barcode: '8690123456812',
    },
    {
      name: 'Alternatör',
      unit: 'Adet',
      purchasePrice: 1250.00,
      salePrice: 1850.00,
      mainCategory: 'Elektrik Sistemleri',
      subCategory: 'Alternatör',
      brand: 'Bosch',
      oem: '0 120 487 035',
      barcode: '8690123456813',
    },
    {
      name: 'Marş Motoru',
      unit: 'Adet',
      purchasePrice: 980.00,
      salePrice: 1450.00,
      mainCategory: 'Elektrik Sistemleri',
      subCategory: 'Marş Motoru',
      brand: 'Bosch',
      oem: '0 001 357 034',
      barcode: '8690123456814',
    },
    {
      name: 'Buji Kablosu Set',
      unit: 'Takım',
      purchasePrice: 125.00,
      salePrice: 220.00,
      mainCategory: 'Elektrik Sistemleri',
      subCategory: 'Buji Kablosu',
      brand: 'NGK',
      oem: 'RC-ZE76',
      barcode: '8690123456815',
    },

    // Soğutma Sistemi
    {
      name: 'Radyatör',
      unit: 'Adet',
      purchasePrice: 680.00,
      salePrice: 1050.00,
      mainCategory: 'Soğutma Sistemi',
      subCategory: 'Radyatör',
      brand: 'Nissens',
      oem: '67002A',
      barcode: '8690123456816',
    },
    {
      name: 'Su Pompası',
      unit: 'Adet',
      purchasePrice: 280.00,
      salePrice: 450.00,
      mainCategory: 'Soğutma Sistemi',
      subCategory: 'Su Pompası',
      brand: 'Gates',
      oem: '42268',
      barcode: '8690123456817',
    },
    {
      name: 'Soğutma Suyu',
      unit: 'Litre',
      purchasePrice: 35.00,
      salePrice: 65.00,
      mainCategory: 'Soğutma Sistemi',
      subCategory: 'Soğutma Suyu',
      brand: 'Shell',
      size: '5L',
      barcode: '8690123456818',
    },
    {
      name: 'Fan',
      unit: 'Adet',
      purchasePrice: 320.00,
      salePrice: 520.00,
      mainCategory: 'Soğutma Sistemi',
      subCategory: 'Fan',
      brand: 'Valeo',
      oem: '7901',
      barcode: '8690123456819',
    },

    // Yakıt Sistemi
    {
      name: 'Yakıt Pompası',
      unit: 'Adet',
      purchasePrice: 580.00,
      salePrice: 920.00,
      mainCategory: 'Yakıt Sistemi',
      subCategory: 'Yakıt Pompası',
      brand: 'Bosch',
      oem: '0 580 464 024',
      barcode: '8690123456820',
    },
    {
      name: 'Enjektör',
      unit: 'Adet',
      purchasePrice: 420.00,
      salePrice: 680.00,
      mainCategory: 'Yakıt Sistemi',
      subCategory: 'Enjektör',
      brand: 'Bosch',
      oem: '0 280 158 148',
      barcode: '8690123456821',
    },

    // Egzoz Sistemi
    {
      name: 'Egzoz Borusu',
      unit: 'Adet',
      purchasePrice: 450.00,
      salePrice: 720.00,
      mainCategory: 'Egzoz Sistemi',
      subCategory: 'Egzoz Borusu',
      brand: 'Walker',
      oem: '21261',
      barcode: '8690123456822',
    },
    {
      name: 'Katalizör',
      unit: 'Adet',
      purchasePrice: 1850.00,
      salePrice: 2800.00,
      mainCategory: 'Egzoz Sistemi',
      subCategory: 'Katalizör',
      brand: 'Bosal',
      oem: '099-691',
      barcode: '8690123456823',
    },

    // Rulman ve Yataklar
    {
      name: 'Rulman Ön',
      unit: 'Adet',
      purchasePrice: 125.00,
      salePrice: 210.00,
      mainCategory: 'Rulman ve Yataklar',
      subCategory: 'Rulman',
      brand: 'SKF',
      oem: 'VKBA 3543',
      barcode: '8690123456824',
    },
    {
      name: 'Rulman Arka',
      unit: 'Adet',
      purchasePrice: 95.00,
      salePrice: 165.00,
      mainCategory: 'Rulman ve Yataklar',
      subCategory: 'Rulman',
      brand: 'FAG',
      oem: '562052',
      barcode: '8690123456825',
    },
    {
      name: 'Conta Seti',
      unit: 'Takım',
      purchasePrice: 85.00,
      salePrice: 145.00,
      mainCategory: 'Rulman ve Yataklar',
      subCategory: 'Conta',
      brand: 'Elring',
      oem: '220.850',
      barcode: '8690123456826',
    },

    // Kayış ve Kasnaklar
    {
      name: 'V Kayışı',
      unit: 'Adet',
      purchasePrice: 45.00,
      salePrice: 85.00,
      mainCategory: 'Kayış ve Kasnaklar',
      subCategory: 'V Kayışı',
      brand: 'Gates',
      oem: '6PK1193',
      size: '6PK 1193',
      barcode: '8690123456827',
    },
    {
      name: 'Zamanlama Kayışı',
      unit: 'Adet',
      purchasePrice: 125.00,
      salePrice: 220.00,
      mainCategory: 'Kayış ve Kasnaklar',
      subCategory: 'Zamanlama Kayışı',
      brand: 'Gates',
      oem: '5516XS',
      barcode: '8690123456828',
    },
    {
      name: 'Kasnak',
      unit: 'Adet',
      purchasePrice: 180.00,
      salePrice: 320.00,
      mainCategory: 'Kayış ve Kasnaklar',
      subCategory: 'Kasnak',
      brand: 'INA',
      oem: '531 0107 10',
      barcode: '8690123456829',
    },
  ];

  let eklenenSayisi = 0;
  let hataSayisi = 0;

  // CodeTemplateService'den stok kodu almak için basit bir fonksiyon
  // Not: Gerçek uygulamada CodeTemplateService kullanılmalı
  let stokKoduCounter = 1;

  for (const malzeme of malzemeler) {
    try {
      // Stok kodu oluştur (ST0001, ST0002, ...)
      const code = `ST${String(stokKoduCounter).padStart(4, '0')}`;
      stokKoduCounter++;

      // Barkod benzersizliğini kontrol et
      if (malzeme.barcode) {
        const existingBarkod = await prisma.product.findFirst({
          where: { barcode: malzeme.barcode },
        });

        if (existingBarkod) {
          console.log(`  ⏭️  Barkod ${malzeme.barcode} zaten mevcut, atlanıyor: ${malzeme.name}`);
          continue;
        }
      }

      // Stok kodunu kontrol et
      const existingStok = await prisma.product.findFirst({
        where: { code },
      });

      if (existingStok) {
        // Stok kodu zaten varsa, farklı bir kod oluştur
        const timestamp = Date.now().toString().slice(-4);
        const newStokKodu = `ST${timestamp}${String(stokKoduCounter).padStart(3, '0')}`;
        stokKoduCounter++;

        await prisma.product.create({
          data: {
            ...malzeme,
            code: newStokKodu,
            vatRate: 20,
            criticalQty: 0,
          },
        });

        console.log(`  ✅ ${newStokKodu} - ${malzeme.name} (${malzeme.brand})`);
        eklenenSayisi++;
      } else {
        await prisma.product.create({
          data: {
            ...malzeme,
            code,
            vatRate: 20,
            criticalQty: 0,
          },
        });

        console.log(`  ✅ ${code} - ${malzeme.name} (${malzeme.brand})`);
        eklenenSayisi++;
      }
    } catch (error: any) {
      console.error(`  ❌ ${malzeme.name} eklenirken hata:`, error.message);
      hataSayisi++;
    }
  }

  console.log(`\n✅ Malzeme ekleme işlemi tamamlandı!`);
  console.log(`   📊 Eklenen: ${eklenenSayisi} malzeme`);
  console.log(`   📊 Hata: ${hataSayisi} malzeme`);
  console.log(`   📊 Toplam: ${malzemeler.length} malzeme\n`);
}

seedMalzemeler()
  .catch((e) => {
    console.error('❌ Seed hatası:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });