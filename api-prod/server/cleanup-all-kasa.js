const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanupAllKasaData() {
  try {
    console.log('🧹 Tüm Kasa, Havale, Çek/Senet verileri temizleniyor...\n');

    // 1. Bağımlı hareketleri sil
    console.log('📋 1/11 - Tahsilat kayıtları siliniyor...');
    const tahsilatCount = await prisma.tahsilat.deleteMany({});
    console.log(`   ✓ ${tahsilatCount.count} tahsilat kaydı silindi`);

    console.log('📋 2/11 - Banka havale kayıtları siliniyor...');
    const havaleCount = await prisma.bankaHavale.deleteMany({});
    console.log(`   ✓ ${havaleCount.count} banka havale kaydı silindi`);

    console.log('📋 3/11 - Çek/Senet kayıtları siliniyor...');
    const cekSenetCount = await prisma.cekSenet.deleteMany({});
    console.log(`   ✓ ${cekSenetCount.count} çek/senet kaydı silindi`);

    console.log('📋 4/11 - Personel ödeme kayıtları siliniyor...');
    const personelOdemeCount = await prisma.personelOdeme.deleteMany({});
    console.log(`   ✓ ${personelOdemeCount.count} personel ödeme kaydı silindi`);

    console.log('📋 5/11 - Kasa hareket kayıtları siliniyor...');
    const kasaHareketCount = await prisma.kasaHareket.deleteMany({});
    console.log(`   ✓ ${kasaHareketCount.count} kasa hareket kaydı silindi`);

    console.log('📋 6/11 - Banka hesap hareket kayıtları siliniyor...');
    const bankaHesapHareketCount = await prisma.bankaHesapHareket.deleteMany({});
    console.log(`   ✓ ${bankaHesapHareketCount.count} banka hesap hareket kaydı silindi`);

    console.log('📋 7/11 - Firma kredi kartı hareket kayıtları siliniyor...');
    const firmaKartHareketCount = await prisma.firmaKrediKartiHareket.deleteMany({});
    console.log(`   ✓ ${firmaKartHareketCount.count} firma kredi kartı hareket kaydı silindi`);

    // 2. Alt kasa kayıtlarını sil
    console.log('📋 8/11 - Banka hesapları siliniyor...');
    const bankaHesapCount = await prisma.bankaHesabi.deleteMany({});
    console.log(`   ✓ ${bankaHesapCount.count} banka hesabı silindi`);

    console.log('📋 9/11 - Firma kredi kartları siliniyor...');
    const firmaKartCount = await prisma.firmaKrediKarti.deleteMany({});
    console.log(`   ✓ ${firmaKartCount.count} firma kredi kartı silindi`);

    // 3. Ana kasa kayıtlarını sil
    console.log('📋 10/11 - Kasa kayıtları siliniyor...');
    const kasaCount = await prisma.kasa.deleteMany({});
    console.log(`   ✓ ${kasaCount.count} kasa kaydı silindi`);

    // 4. Cari bakiyelerini sıfırla (isteğe bağlı)
    console.log('📋 11/11 - Cari hareketleri temizleniyor...');
    const cariHareketCount = await prisma.cariHareket.deleteMany({});
    console.log(`   ✓ ${cariHareketCount.count} cari hareket kaydı silindi`);

    // Cari bakiyelerini sıfırla
    await prisma.cari.updateMany({
      data: {
        bakiye: 0,
      },
    });
    console.log('   ✓ Tüm cari bakiyeleri sıfırlandı');

    console.log('\n✅ Tüm veriler başarıyla temizlendi!');
    console.log('\n📊 Özet:');
    console.log(`   - ${kasaCount.count} kasa`);
    console.log(`   - ${bankaHesapCount.count} banka hesabı`);
    console.log(`   - ${firmaKartCount.count} firma kredi kartı`);
    console.log(`   - ${kasaHareketCount.count} kasa hareketi`);
    console.log(`   - ${bankaHesapHareketCount.count} banka hesap hareketi`);
    console.log(`   - ${firmaKartHareketCount.count} firma kredi kartı hareketi`);
    console.log(`   - ${tahsilatCount.count} tahsilat`);
    console.log(`   - ${havaleCount.count} banka havalesi`);
    console.log(`   - ${cekSenetCount.count} çek/senet`);
    console.log(`   - ${personelOdemeCount.count} personel ödemesi`);
    console.log(`   - ${cariHareketCount.count} cari hareket`);

  } catch (error) {
    console.error('\n❌ Veri temizleme hatası:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

cleanupAllKasaData()
  .then(() => {
    console.log('\n🎉 İşlem tamamlandı. Backend\'i yeniden başlatabilirsiniz.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Script hatası:', error);
    process.exit(1);
  });

