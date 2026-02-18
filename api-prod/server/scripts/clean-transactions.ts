import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function cleanTransactions() {
  console.log('🧹 İşlem kayıtları temizleniyor...\n');

  try {
    await prisma.$transaction(async (tx) => {
      // 1. Fatura Logları
      console.log('📋 Fatura logları siliniyor...');
      const faturaLogs = await tx.faturaLog.deleteMany({});
      console.log(`   ✓ ${faturaLogs.count} fatura log kaydı silindi`);

      // 2. Fatura Tahsilatlar (FIFO ara tablosu)
      console.log('💰 Fatura-Tahsilat ilişkileri siliniyor...');
      const faturaTahsilatlar = await tx.faturaTahsilat.deleteMany({});
      console.log(`   ✓ ${faturaTahsilatlar.count} fatura-tahsilat kaydı silindi`);

      // 3. Tahsilatlar
      console.log('💵 Tahsilatlar siliniyor...');
      const tahsilatlar = await tx.tahsilat.deleteMany({});
      console.log(`   ✓ ${tahsilatlar.count} tahsilat kaydı silindi`);

      // 4. Fatura Kalemleri
      console.log('📦 Fatura kalemleri siliniyor...');
      const faturaKalemleri = await tx.faturaKalemi.deleteMany({});
      console.log(`   ✓ ${faturaKalemleri.count} fatura kalemi silindi`);

      // 5. Faturalar
      console.log('🧾 Faturalar siliniyor...');
      const faturalar = await tx.fatura.deleteMany({});
      console.log(`   ✓ ${faturalar.count} fatura silindi`);

      // 6. Çek/Senet
      console.log('📄 Çek ve Senet kayıtları siliniyor...');
      const cekSenet = await tx.cekSenet.deleteMany({});
      console.log(`   ✓ ${cekSenet.count} çek/senet kaydı silindi`);

      // 7. Banka Havaleleri
      console.log('🏦 Banka havaleleri siliniyor...');
      const bankaHavale = await tx.bankaHavale.deleteMany({});
      console.log(`   ✓ ${bankaHavale.count} banka havale kaydı silindi`);

      // 8. Kasa Hareketleri
      console.log('💼 Kasa hareketleri siliniyor...');
      const kasaHareketler = await tx.kasaHareket.deleteMany({});
      console.log(`   ✓ ${kasaHareketler.count} kasa hareket kaydı silindi`);

      // 9. Cari Hareketler
      console.log('👥 Cari hareketler siliniyor...');
      const cariHareketler = await tx.cariHareket.deleteMany({});
      console.log(`   ✓ ${cariHareketler.count} cari hareket kaydı silindi`);

      // 10. Stok Hareketleri
      console.log('📊 Stok hareketleri siliniyor...');
      const stokHareketler = await tx.stokHareket.deleteMany({});
      console.log(`   ✓ ${stokHareketler.count} stok hareket kaydı silindi`);

      // 11. Masraflar
      console.log('💸 Masraflar siliniyor...');
      const masraflar = await tx.masraf.deleteMany({});
      console.log(`   ✓ ${masraflar.count} masraf kaydı silindi`);

      // 12. Depo İşlemleri (Put-away, Transfer)
      console.log('🏭 Depo işlemleri siliniyor...');
      const depoIslemleri = await tx.stockMove.deleteMany({});
      console.log(`   ✓ ${depoIslemleri.count} depo işlemi silindi`);

      // 13. Kasa Bakiyelerini Sıfırla
      console.log('💰 Kasa bakiyeleri sıfırlanıyor...');
      const kasalar = await tx.kasa.updateMany({
        data: { bakiye: 0 },
      });
      console.log(`   ✓ ${kasalar.count} kasa bakiyesi sıfırlandı`);

      // 14. Cari Bakiyelerini Sıfırla
      console.log('👤 Cari bakiyeleri sıfırlanıyor...');
      const cariler = await tx.cari.updateMany({
        data: { bakiye: 0 },
      });
      console.log(`   ✓ ${cariler.count} cari bakiyesi sıfırlandı`);

      console.log('\n✅ Tüm işlem kayıtları başarıyla temizlendi!\n');
      console.log('📌 KALAN KAYITLAR:');
      console.log('   ✓ Cari Hesaplar (bakiyeler sıfırlandı)');
      console.log('   ✓ Stoklar/Malzemeler');
      console.log('   ✓ Kasalar (bakiyeler sıfırlandı)');
      console.log('   ✓ Kategoriler');
      console.log('   ✓ Markalar');
      console.log('   ✓ Birim Setleri');
      console.log('   ✓ Depolar');
      console.log('   ✓ Raflar');
      console.log('   ✓ Kullanıcılar');
    });

    console.log('\n🎉 Veritabanı temizleme işlemi tamamlandı!');
  } catch (error) {
    console.error('❌ Hata:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

cleanTransactions()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });

