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
    // Bu brand zaten var mı kontrol et
    const existingStok = await prisma.product.findFirst({
      where: {
        brand: markaAdi,
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
      const code = `MRK-${markaAdi.substring(0, 3).toUpperCase()}-${timestamp}`;

      await prisma.product.create({
        data: {
          code,
          name: `[Marka Tanımı] ${markaAdi}`,
          unit: 'Adet',
          purchasePrice: 0,
          salesPrice: 0,
          brand: markaAdi,
          description: 'Bu kayıt sadece brand tanımı için oluşturulmuştur. Gerçek bir stok kaydı değildir.',
        },
      });

      console.log(`  ✅ ${markaAdi} eklendi`);
      eklenenSayisi++;
    } catch (error: any) {
      // Eğer stok kodu zaten varsa, farklı bir kod dene
      if (error.code === 'P2002' && error.meta?.target?.includes('code')) {
        const timestamp = Date.now().toString();
        const code = `MRK-${markaAdi.substring(0, 3).toUpperCase()}-${timestamp}`;

        try {
          await prisma.product.create({
            data: {
              code,
              name: `[Marka Tanımı] ${markaAdi}`,
              unit: 'Adet',
              purchasePrice: 0,
              salesPrice: 0,
              brand: markaAdi,
              description: 'Bu kayıt sadece brand tanımı için oluşturulmuştur. Gerçek bir stok kaydı değildir.',
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
  console.log(`   📊 Eklenen: ${eklenenSayisi} brand`);
  console.log(`   📊 Mevcut: ${mevcutSayisi} brand`);
  console.log(`   📊 Toplam: ${markalar.length} brand\n`);
}

seedMarkalar()
  .catch((e) => {
    console.error('❌ Seed hatası:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

