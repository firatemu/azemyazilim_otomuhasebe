import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedMalzemeler() {
  console.log('🌱 Örnek Araç Yedek Parça Malzemeleri Ekleniyor...\n');

  // Kategoriler ve markalar eşleştirmesi ile örnek malzemeler
  const malzemeler = [
    // Fren Sistemleri
    {
      stokAdi: 'Fren Balatası Ön Takım',
      birim: 'Takım',
      alisFiyati: 120.00,
      satisFiyati: 180.00,
      anaKategori: 'Fren Sistemleri',
      altKategori: 'Fren Balatası',
      marka: 'Bosch',
      oem: '0 986 479 782',
      olcu: '12x1.5',
      barkod: '8690123456789',
    },
    {
      stokAdi: 'Fren Balatası Arka Takım',
      birim: 'Takım',
      alisFiyati: 95.00,
      satisFiyati: 145.00,
      anaKategori: 'Fren Sistemleri',
      altKategori: 'Fren Balatası',
      marka: 'Valeo',
      oem: 'V5578',
      olcu: '10x1.2',
      barkod: '8690123456790',
    },
    {
      stokAdi: 'Fren Diski Ön',
      birim: 'Adet',
      alisFiyati: 250.00,
      satisFiyati: 380.00,
      anaKategori: 'Fren Sistemleri',
      altKategori: 'Fren Diski',
      marka: 'Brembo',
      oem: '09.9772.11',
      olcu: '280x22mm',
      barkod: '8690123456791',
    },
    {
      stokAdi: 'Fren Diski Arka',
      birim: 'Adet',
      alisFiyati: 180.00,
      satisFiyati: 280.00,
      anaKategori: 'Fren Sistemleri',
      altKategori: 'Fren Diski',
      marka: 'Brembo',
      oem: '09.9772.12',
      olcu: '260x10mm',
      barkod: '8690123456792',
    },
    {
      stokAdi: 'Fren Hortumu Ön',
      birim: 'Adet',
      alisFiyati: 45.00,
      satisFiyati: 75.00,
      anaKategori: 'Fren Sistemleri',
      altKategori: 'Fren Hortumu',
      marka: 'TRW',
      oem: 'PFG446',
      barkod: '8690123456793',
    },
    {
      stokAdi: 'Fren Kaliperi Ön Sağ',
      birim: 'Adet',
      alisFiyati: 320.00,
      satisFiyati: 480.00,
      anaKategori: 'Fren Sistemleri',
      altKategori: 'Fren Kaliperi',
      marka: 'Continental',
      oem: 'ATE 13.0460-7513.2',
      barkod: '8690123456794',
    },

    // Motor Parçaları
    {
      stokAdi: 'Motor Yağı 5W-30',
      birim: 'Litre',
      alisFiyati: 85.00,
      satisFiyati: 135.00,
      anaKategori: 'Motor Parçaları',
      altKategori: 'Motor Yağı',
      marka: 'Mobil',
      olcu: '5W-30',
      barkod: '8690123456795',
    },
    {
      stokAdi: 'Motor Yağı 10W-40',
      birim: 'Litre',
      alisFiyati: 75.00,
      satisFiyati: 120.00,
      anaKategori: 'Motor Parçaları',
      altKategori: 'Motor Yağı',
      marka: 'Castrol',
      olcu: '10W-40',
      barkod: '8690123456796',
    },
    {
      stokAdi: 'Yağ Filtresi',
      birim: 'Adet',
      alisFiyati: 35.00,
      satisFiyati: 65.00,
      anaKategori: 'Motor Parçaları',
      altKategori: 'Yağ Filtresi',
      marka: 'Mann Filter',
      oem: 'W 712/75',
      barkod: '8690123456797',
    },
    {
      stokAdi: 'Hava Filtresi',
      birim: 'Adet',
      alisFiyati: 42.00,
      satisFiyati: 78.00,
      anaKategori: 'Motor Parçaları',
      altKategori: 'Hava Filtresi',
      marka: 'Mann Filter',
      oem: 'C 27 038',
      barkod: '8690123456798',
    },
    {
      stokAdi: 'Yakıt Filtresi',
      birim: 'Adet',
      alisFiyati: 55.00,
      satisFiyati: 95.00,
      anaKategori: 'Motor Parçaları',
      altKategori: 'Yakıt Filtresi',
      marka: 'Mann Filter',
      oem: 'WK 712/11',
      barkod: '8690123456799',
    },
    {
      stokAdi: 'Buji',
      birim: 'Adet',
      alisFiyati: 28.00,
      satisFiyati: 52.00,
      anaKategori: 'Motor Parçaları',
      altKategori: 'Buji',
      marka: 'NGK',
      oem: 'BKR6E',
      olcu: '14mm',
      barkod: '8690123456800',
    },
    {
      stokAdi: 'Buji',
      birim: 'Adet',
      alisFiyati: 32.00,
      satisFiyati: 58.00,
      anaKategori: 'Motor Parçaları',
      altKategori: 'Buji',
      marka: 'Denso',
      oem: 'IK20',
      olcu: '14mm',
      barkod: '8690123456801',
    },
    {
      stokAdi: 'Termostat',
      birim: 'Adet',
      alisFiyati: 68.00,
      satisFiyati: 110.00,
      anaKategori: 'Motor Parçaları',
      altKategori: 'Termostat',
      marka: 'Mahle',
      oem: 'TH 102 87',
      barkod: '8690123456802',
    },

    // Süspansiyon
    {
      stokAdi: 'Amortisör Ön Sağ',
      birim: 'Adet',
      alisFiyati: 450.00,
      satisFiyati: 680.00,
      anaKategori: 'Süspansiyon',
      altKategori: 'Amortisör',
      marka: 'Sachs',
      oem: '313-267',
      barkod: '8690123456803',
    },
    {
      stokAdi: 'Amortisör Ön Sol',
      birim: 'Adet',
      alisFiyati: 450.00,
      satisFiyati: 680.00,
      anaKategori: 'Süspansiyon',
      altKategori: 'Amortisör',
      marka: 'Sachs',
      oem: '313-268',
      barkod: '8690123456804',
    },
    {
      stokAdi: 'Amortisör Arka Sağ',
      birim: 'Adet',
      alisFiyati: 380.00,
      satisFiyati: 580.00,
      anaKategori: 'Süspansiyon',
      altKategori: 'Amortisör',
      marka: 'Sachs',
      oem: '313-269',
      barkod: '8690123456805',
    },
    {
      stokAdi: 'Yay Ön',
      birim: 'Adet',
      alisFiyati: 220.00,
      satisFiyati: 350.00,
      anaKategori: 'Süspansiyon',
      altKategori: 'Yay',
      marka: 'Febi Bilstein',
      oem: '28755',
      barkod: '8690123456806',
    },
    {
      stokAdi: 'Rot Başı',
      birim: 'Adet',
      alisFiyati: 95.00,
      satisFiyati: 155.00,
      anaKategori: 'Süspansiyon',
      altKategori: 'Rot Başı',
      marka: 'Lemförder',
      oem: '36673 01',
      barkod: '8690123456807',
    },
    {
      stokAdi: 'Rotil',
      birim: 'Adet',
      alisFiyati: 78.00,
      satisFiyati: 125.00,
      anaKategori: 'Süspansiyon',
      altKategori: 'Rotil',
      marka: 'Meyle',
      oem: 'ME-83384',
      barkod: '8690123456808',
    },

    // Aydınlatma
    {
      stokAdi: 'Far Ampulü H7',
      birim: 'Adet',
      alisFiyati: 25.00,
      satisFiyati: 45.00,
      anaKategori: 'Aydınlatma',
      altKategori: 'Far Ampulü',
      marka: 'Osram',
      oem: 'H7 12V 55W',
      olcu: 'H7',
      barkod: '8690123456809',
    },
    {
      stokAdi: 'Stop Ampulü',
      birim: 'Adet',
      alisFiyati: 8.00,
      satisFiyati: 18.00,
      anaKategori: 'Aydınlatma',
      altKategori: 'Stop Ampulü',
      marka: 'Osram',
      oem: 'P21/5W',
      barkod: '8690123456810',
    },
    {
      stokAdi: 'Sinyal Ampulü',
      birim: 'Adet',
      alisFiyati: 6.00,
      satisFiyati: 15.00,
      anaKategori: 'Aydınlatma',
      altKategori: 'Sinyal Ampulü',
      marka: 'Osram',
      oem: 'PY21W',
      barkod: '8690123456811',
    },

    // Elektrik Sistemleri
    {
      stokAdi: 'Akü 60Ah',
      birim: 'Adet',
      alisFiyati: 580.00,
      satisFiyati: 850.00,
      anaKategori: 'Elektrik Sistemleri',
      altKategori: 'Akü',
      marka: 'Varta',
      oem: 'E11',
      olcu: '60Ah',
      barkod: '8690123456812',
    },
    {
      stokAdi: 'Alternatör',
      birim: 'Adet',
      alisFiyati: 1250.00,
      satisFiyati: 1850.00,
      anaKategori: 'Elektrik Sistemleri',
      altKategori: 'Alternatör',
      marka: 'Bosch',
      oem: '0 120 487 035',
      barkod: '8690123456813',
    },
    {
      stokAdi: 'Marş Motoru',
      birim: 'Adet',
      alisFiyati: 980.00,
      satisFiyati: 1450.00,
      anaKategori: 'Elektrik Sistemleri',
      altKategori: 'Marş Motoru',
      marka: 'Bosch',
      oem: '0 001 357 034',
      barkod: '8690123456814',
    },
    {
      stokAdi: 'Buji Kablosu Set',
      birim: 'Takım',
      alisFiyati: 125.00,
      satisFiyati: 220.00,
      anaKategori: 'Elektrik Sistemleri',
      altKategori: 'Buji Kablosu',
      marka: 'NGK',
      oem: 'RC-ZE76',
      barkod: '8690123456815',
    },

    // Soğutma Sistemi
    {
      stokAdi: 'Radyatör',
      birim: 'Adet',
      alisFiyati: 680.00,
      satisFiyati: 1050.00,
      anaKategori: 'Soğutma Sistemi',
      altKategori: 'Radyatör',
      marka: 'Nissens',
      oem: '67002A',
      barkod: '8690123456816',
    },
    {
      stokAdi: 'Su Pompası',
      birim: 'Adet',
      alisFiyati: 280.00,
      satisFiyati: 450.00,
      anaKategori: 'Soğutma Sistemi',
      altKategori: 'Su Pompası',
      marka: 'Gates',
      oem: '42268',
      barkod: '8690123456817',
    },
    {
      stokAdi: 'Soğutma Suyu',
      birim: 'Litre',
      alisFiyati: 35.00,
      satisFiyati: 65.00,
      anaKategori: 'Soğutma Sistemi',
      altKategori: 'Soğutma Suyu',
      marka: 'Shell',
      olcu: '5L',
      barkod: '8690123456818',
    },
    {
      stokAdi: 'Fan',
      birim: 'Adet',
      alisFiyati: 320.00,
      satisFiyati: 520.00,
      anaKategori: 'Soğutma Sistemi',
      altKategori: 'Fan',
      marka: 'Valeo',
      oem: '7901',
      barkod: '8690123456819',
    },

    // Yakıt Sistemi
    {
      stokAdi: 'Yakıt Pompası',
      birim: 'Adet',
      alisFiyati: 580.00,
      satisFiyati: 920.00,
      anaKategori: 'Yakıt Sistemi',
      altKategori: 'Yakıt Pompası',
      marka: 'Bosch',
      oem: '0 580 464 024',
      barkod: '8690123456820',
    },
    {
      stokAdi: 'Enjektör',
      birim: 'Adet',
      alisFiyati: 420.00,
      satisFiyati: 680.00,
      anaKategori: 'Yakıt Sistemi',
      altKategori: 'Enjektör',
      marka: 'Bosch',
      oem: '0 280 158 148',
      barkod: '8690123456821',
    },

    // Egzoz Sistemi
    {
      stokAdi: 'Egzoz Borusu',
      birim: 'Adet',
      alisFiyati: 450.00,
      satisFiyati: 720.00,
      anaKategori: 'Egzoz Sistemi',
      altKategori: 'Egzoz Borusu',
      marka: 'Walker',
      oem: '21261',
      barkod: '8690123456822',
    },
    {
      stokAdi: 'Katalizör',
      birim: 'Adet',
      alisFiyati: 1850.00,
      satisFiyati: 2800.00,
      anaKategori: 'Egzoz Sistemi',
      altKategori: 'Katalizör',
      marka: 'Bosal',
      oem: '099-691',
      barkod: '8690123456823',
    },

    // Rulman ve Yataklar
    {
      stokAdi: 'Rulman Ön',
      birim: 'Adet',
      alisFiyati: 125.00,
      satisFiyati: 210.00,
      anaKategori: 'Rulman ve Yataklar',
      altKategori: 'Rulman',
      marka: 'SKF',
      oem: 'VKBA 3543',
      barkod: '8690123456824',
    },
    {
      stokAdi: 'Rulman Arka',
      birim: 'Adet',
      alisFiyati: 95.00,
      satisFiyati: 165.00,
      anaKategori: 'Rulman ve Yataklar',
      altKategori: 'Rulman',
      marka: 'FAG',
      oem: '562052',
      barkod: '8690123456825',
    },
    {
      stokAdi: 'Conta Seti',
      birim: 'Takım',
      alisFiyati: 85.00,
      satisFiyati: 145.00,
      anaKategori: 'Rulman ve Yataklar',
      altKategori: 'Conta',
      marka: 'Elring',
      oem: '220.850',
      barkod: '8690123456826',
    },

    // Kayış ve Kasnaklar
    {
      stokAdi: 'V Kayışı',
      birim: 'Adet',
      alisFiyati: 45.00,
      satisFiyati: 85.00,
      anaKategori: 'Kayış ve Kasnaklar',
      altKategori: 'V Kayışı',
      marka: 'Gates',
      oem: '6PK1193',
      olcu: '6PK 1193',
      barkod: '8690123456827',
    },
    {
      stokAdi: 'Zamanlama Kayışı',
      birim: 'Adet',
      alisFiyati: 125.00,
      satisFiyati: 220.00,
      anaKategori: 'Kayış ve Kasnaklar',
      altKategori: 'Zamanlama Kayışı',
      marka: 'Gates',
      oem: '5516XS',
      barkod: '8690123456828',
    },
    {
      stokAdi: 'Kasnak',
      birim: 'Adet',
      alisFiyati: 180.00,
      satisFiyati: 320.00,
      anaKategori: 'Kayış ve Kasnaklar',
      altKategori: 'Kasnak',
      marka: 'INA',
      oem: '531 0107 10',
      barkod: '8690123456829',
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
      const stokKodu = `ST${String(stokKoduCounter).padStart(4, '0')}`;
      stokKoduCounter++;

      // Barkod benzersizliğini kontrol et
      if (malzeme.barkod) {
        const existingBarkod = await prisma.stok.findFirst({
          where: { barkod: malzeme.barkod },
        });

        if (existingBarkod) {
          console.log(`  ⏭️  Barkod ${malzeme.barkod} zaten mevcut, atlanıyor: ${malzeme.stokAdi}`);
          continue;
        }
      }

      // Stok kodunu kontrol et
      const existingStok = await prisma.stok.findFirst({
        where: { stokKodu },
      });

      if (existingStok) {
        // Stok kodu zaten varsa, farklı bir kod oluştur
        const timestamp = Date.now().toString().slice(-4);
        const newStokKodu = `ST${timestamp}${String(stokKoduCounter).padStart(3, '0')}`;
        stokKoduCounter++;

        await prisma.stok.create({
          data: {
            ...malzeme,
            stokKodu: newStokKodu,
            kdvOrani: 20,
            kritikStokMiktari: 0,
          },
        });

        console.log(`  ✅ ${newStokKodu} - ${malzeme.stokAdi} (${malzeme.marka})`);
        eklenenSayisi++;
      } else {
        await prisma.stok.create({
          data: {
            ...malzeme,
            stokKodu,
            kdvOrani: 20,
            kritikStokMiktari: 0,
          },
        });

        console.log(`  ✅ ${stokKodu} - ${malzeme.stokAdi} (${malzeme.marka})`);
        eklenenSayisi++;
      }
    } catch (error: any) {
      console.error(`  ❌ ${malzeme.stokAdi} eklenirken hata:`, error.message);
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

