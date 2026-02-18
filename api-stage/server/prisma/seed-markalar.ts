import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedMarkalar() {
  console.log('🌱 Örnek Araç Yedek Parça Markaları Ekleniyor...\n');

  // Örnek araç yedek parça markaları
  const markalar = [
    'Bosch',
    'Valeo',
    'Brembo',
    'Continental',
    'Mahle',
    'Mann Filter',
    'NGK',
    'Denso',
    'Sachs',
    'TRW',
    'Delphi',
    'Febi Bilstein',
    'Meyle',
    'Lemförder',
    'SKF',
    'FAG',
    'Timken',
    'Gates',
    'Dayco',
    'INA',
    'Kale',
    'RCR',
    'Mobil',
    'Castrol',
    'Shell',
    'Total',
    'Elring',
    'Victor Reinz',
    'Corteco',
    'Hengst',
    'Osram',
    'Varta',
    'Nissens',
    'Walker',
    'Bosal',
  ];

  let eklenenSayisi = 0;
  let mevcutSayisi = 0;

  for (const markaAdi of markalar) {
    // Bu marka zaten var mı kontrol et
    const existingStok = await prisma.stok.findFirst({
      where: {
        marka: markaAdi,
      },
    });

    if (existingStok) {
      console.log(`  ⏭️  ${markaAdi} zaten mevcut, atlanıyor...`);
      mevcutSayisi++;
      continue;
    }

    // Marka tanımı için placeholder stok kaydı oluştur
    try {
      const timestamp = Date.now().toString().slice(-6);
      const stokKodu = `MRK-${markaAdi.substring(0, 3).toUpperCase()}-${timestamp}`;

      await prisma.stok.create({
        data: {
          stokKodu,
          stokAdi: `[Marka Tanımı] ${markaAdi}`,
          birim: 'Adet',
          alisFiyati: 0,
          satisFiyati: 0,
          marka: markaAdi,
          aciklama: 'Bu kayıt sadece marka tanımı için oluşturulmuştur. Gerçek bir stok kaydı değildir.',
        },
      });

      console.log(`  ✅ ${markaAdi} eklendi`);
      eklenenSayisi++;
    } catch (error: any) {
      // Eğer stok kodu zaten varsa, farklı bir kod dene
      if (error.code === 'P2002' && error.meta?.target?.includes('stokKodu')) {
        const timestamp = Date.now().toString();
        const stokKodu = `MRK-${markaAdi.substring(0, 3).toUpperCase()}-${timestamp}`;

        try {
          await prisma.stok.create({
            data: {
              stokKodu,
              stokAdi: `[Marka Tanımı] ${markaAdi}`,
              birim: 'Adet',
              alisFiyati: 0,
              satisFiyati: 0,
              marka: markaAdi,
              aciklama: 'Bu kayıt sadece marka tanımı için oluşturulmuştur. Gerçek bir stok kaydı değildir.',
            },
          });

          console.log(`  ✅ ${markaAdi} eklendi`);
          eklenenSayisi++;
        } catch (retryError: any) {
          console.error(`  ❌ ${markaAdi} eklenirken hata: ${retryError.message}`);
        }
      } else {
        console.error(`  ❌ ${markaAdi} eklenirken hata: ${error.message}`);
      }
    }
  }

  console.log(`\n✅ Marka ekleme işlemi tamamlandı!`);
  console.log(`   📊 Eklenen: ${eklenenSayisi} marka`);
  console.log(`   📊 Mevcut: ${mevcutSayisi} marka`);
  console.log(`   📊 Toplam: ${markalar.length} marka\n`);
}

seedMarkalar()
  .catch((e) => {
    console.error('❌ Seed hatası:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

