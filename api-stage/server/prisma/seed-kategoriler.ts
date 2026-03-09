import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedKategoriler() {
  console.log('🌱 Örnek Araç Yedek Parça Kategorileri Ekleniyor...\n');

  // Örnek araç yedek parça kategorileri
  // Format: { anaKategori: string, altKategoriler: string[] }
  const kategoriler = [
    {
      anaKategori: 'Fren Sistemleri',
      altKategoriler: ['Fren Balatası', 'Fren Diski', 'Fren Hortumu', 'Fren Pabucu', 'Fren Kaliperi'],
    },
    {
      anaKategori: 'Motor Parçaları',
      altKategoriler: ['Motor Yağı', 'Yağ Filtresi', 'Hava Filtresi', 'Yakıt Filtresi', 'Buji', 'Termostat'],
    },
    {
      anaKategori: 'Süspansiyon',
      altKategoriler: ['Amortisör', 'Yay', 'Rot Başı', 'Rotil', 'Viraj Stabilizatörü'],
    },
    {
      anaKategori: 'Aydınlatma',
      altKategoriler: ['Far Ampulü', 'Stop Ampulü', 'Sinyal Ampulü', 'Fren Lambası'],
    },
    {
      anaKategori: 'Elektrik Sistemleri',
      altKategoriler: ['Akü', 'Alternatör', 'Marş Motoru', 'Buji Kablosu', 'Sigorta'],
    },
    {
      anaKategori: 'Soğutma Sistemi',
      altKategoriler: ['Radyatör', 'Su Pompası', 'Termostat', 'Soğutma Suyu', 'Fan'],
    },
    {
      anaKategori: 'Yakıt Sistemi',
      altKategoriler: ['Yakıt Pompası', 'Yakıt Filtresi', 'Enjektör', 'Karbüratör'],
    },
    {
      anaKategori: 'Egzoz Sistemi',
      altKategoriler: ['Egzoz Borusu', 'Katalizör', 'Muffler', 'Egzoz Manifold'],
    },
    {
      anaKategori: 'Rulman ve Yataklar',
      altKategoriler: ['Rulman', 'Yatak', 'Conta'],
    },
    {
      anaKategori: 'Kayış ve Kasnaklar',
      altKategoriler: ['V Kayışı', 'Zamanlama Kayışı', 'Kasnak', 'Gergi Kasnağı'],
    },
  ];

  let eklenenAnaKategoriSayisi = 0;
  let eklenenAltKategoriSayisi = 0;
  let mevcutAnaKategoriSayisi = 0;

  for (const kategori of kategoriler) {
    // Ana kategori zaten var mı kontrol et
    const existingAnaKategori = await prisma.product.findFirst({
      where: {
        anaKategori: kategori.anaKategori,
      },
    });

    if (existingAnaKategori) {
      console.log(`  ⏭️  ${kategori.anaKategori} zaten mevcut, atlanıyor...`);
      mevcutAnaKategoriSayisi++;
      continue;
    }

    // Ana kategori placeholder kaydı oluştur
    try {
      const timestamp = Date.now().toString().slice(-6);
      const code = `KAT-${kategori.anaKategori.substring(0, 3).toUpperCase()}-${timestamp}`;

      await prisma.product.create({
        data: {
          code,
          name: `[Ana Kategori Tanımı] ${kategori.anaKategori}`,
          unit: 'Adet',
          purchasePrice: 0,
          salesPrice: 0,
          anaKategori: kategori.anaKategori,
          altKategori: null,
          description: 'Bu kayıt sadece ana kategori tanımı için oluşturulmuştur. Gerçek bir stok kaydı değildir.',
        },
      });

      console.log(`  ✅ Ana kategori "${kategori.anaKategori}" eklendi`);
      eklenenAnaKategoriSayisi++;

      // Alt kategorileri ekle
      for (const altKategori of kategori.altKategoriler) {
        try {
          const altKategoriTimestamp = Date.now().toString().slice(-6);
          const altKategoriStokKodu = `KAT-${kategori.anaKategori.substring(0, 3).toUpperCase()}-${altKategori.substring(0, 3).toUpperCase()}-${altKategoriTimestamp}`;

          // Alt kategori zaten var mı kontrol et
          const existingAltKategori = await prisma.product.findFirst({
            where: {
              anaKategori: kategori.anaKategori,
              altKategori: altKategori,
            },
          });

          if (existingAltKategori) {
            console.log(`    ⏭️  Alt kategori "${altKategori}" zaten mevcut, atlanıyor...`);
            continue;
          }

          await prisma.product.create({
            data: {
              code: altKategoriStokKodu,
              name: `[Kategori Tanımı] ${kategori.anaKategori} - ${altKategori}`,
              unit: 'Adet',
              purchasePrice: 0,
              salesPrice: 0,
              anaKategori: kategori.anaKategori,
              altKategori: altKategori,
              description: 'Bu kayıt sadece kategori tanımı için oluşturulmuştur. Gerçek bir stok kaydı değildir.',
            },
          });

          console.log(`    ✅ Alt kategori "${altKategori}" eklendi`);
          eklenenAltKategoriSayisi++;
        } catch (error: any) {
          if (error.code === 'P2002' && error.meta?.target?.includes('code')) {
            // Stok kodu zaten varsa, farklı bir kod dene
            const altKategoriTimestamp = Date.now().toString();
            const altKategoriStokKodu = `KAT-${kategori.anaKategori.substring(0, 3).toUpperCase()}-${altKategori.substring(0, 3).toUpperCase()}-${altKategoriTimestamp}`;

            try {
              await prisma.product.create({
                data: {
                  code: altKategoriStokKodu,
                  name: `[Kategori Tanımı] ${kategori.anaKategori} - ${altKategori}`,
                  unit: 'Adet',
                  purchasePrice: 0,
                  salesPrice: 0,
                  anaKategori: kategori.anaKategori,
                  altKategori: altKategori,
                  description: 'Bu kayıt sadece kategori tanımı için oluşturulmuştur. Gerçek bir stok kaydı değildir.',
                },
              });

              console.log(`    ✅ Alt kategori "${altKategori}" eklendi`);
              eklenenAltKategoriSayisi++;
            } catch (retryError: any) {
              console.error(`    ❌ Alt kategori "${altKategori}" eklenirken hata: ${retryError.message}`);
            }
          } else {
            console.error(`    ❌ Alt kategori "${altKategori}" eklenirken hata: ${error.message}`);
          }
        }
      }
    } catch (error: any) {
      if (error.code === 'P2002' && error.meta?.target?.includes('code')) {
        // Stok kodu zaten varsa, farklı bir kod dene
        const timestamp = Date.now().toString();
        const code = `KAT-${kategori.anaKategori.substring(0, 3).toUpperCase()}-${timestamp}`;

        try {
          await prisma.product.create({
            data: {
              code,
              name: `[Ana Kategori Tanımı] ${kategori.anaKategori}`,
              unit: 'Adet',
              purchasePrice: 0,
              salesPrice: 0,
              anaKategori: kategori.anaKategori,
              altKategori: null,
              description: 'Bu kayıt sadece ana kategori tanımı için oluşturulmuştur. Gerçek bir stok kaydı değildir.',
            },
          });

          console.log(`  ✅ Ana kategori "${kategori.anaKategori}" eklendi`);
          eklenenAnaKategoriSayisi++;

          // Alt kategorileri ekle
          for (const altKategori of kategori.altKategoriler) {
            try {
              const altKategoriTimestamp = Date.now().toString();
              const altKategoriStokKodu = `KAT-${kategori.anaKategori.substring(0, 3).toUpperCase()}-${altKategori.substring(0, 3).toUpperCase()}-${altKategoriTimestamp}`;

              const existingAltKategori = await prisma.product.findFirst({
                where: {
                  anaKategori: kategori.anaKategori,
                  altKategori: altKategori,
                },
              });

              if (existingAltKategori) {
                continue;
              }

              await prisma.product.create({
                data: {
                  code: altKategoriStokKodu,
                  name: `[Kategori Tanımı] ${kategori.anaKategori} - ${altKategori}`,
                  unit: 'Adet',
                  purchasePrice: 0,
                  salesPrice: 0,
                  anaKategori: kategori.anaKategori,
                  altKategori: altKategori,
                  description: 'Bu kayıt sadece kategori tanımı için oluşturulmuştur. Gerçek bir stok kaydı değildir.',
                },
              });

              console.log(`    ✅ Alt kategori "${altKategori}" eklendi`);
              eklenenAltKategoriSayisi++;
            } catch (altError: any) {
              console.error(`    ❌ Alt kategori "${altKategori}" eklenirken hata: ${altError.message}`);
            }
          }
        } catch (retryError: any) {
          console.error(`  ❌ Ana kategori "${kategori.anaKategori}" eklenirken hata: ${retryError.message}`);
        }
      } else {
        console.error(`  ❌ Ana kategori "${kategori.anaKategori}" eklenirken hata: ${error.message}`);
      }
    }
  }

  console.log(`\n✅ Kategori ekleme işlemi tamamlandı!`);
  console.log(`   📊 Eklenen Ana Kategori: ${eklenenAnaKategoriSayisi}`);
  console.log(`   📊 Eklenen Alt Kategori: ${eklenenAltKategoriSayisi}`);
  console.log(`   📊 Mevcut Ana Kategori: ${mevcutAnaKategoriSayisi}`);
  console.log(`   📊 Toplam Ana Kategori: ${kategoriler.length}\n`);
}

seedKategoriler()
  .catch((e) => {
    console.error('❌ Seed hatası:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

