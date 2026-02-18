const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function cleanupAllData() {
  try {
    console.log('🧹 TÜM VERİTABANI TEMİZLİĞİ BAŞLIYOR...\n');
    console.log('⚠️  UYARI: Bu işlem geri alınamaz!\n');

    let totalDeleted = 0;
    const results = {};

    // ============= 1. LOG VE AUDIT KAYITLARI =============
    console.log('📋 1. Log ve Audit Kayıtları Temizleniyor...');
    console.log('   └─ Fatura logları siliniyor...');
    results.faturaLogs = await prisma.faturaLog.deleteMany({});
    console.log(`      ✓ ${results.faturaLogs.count} fatura log kaydı silindi`);

    console.log('   └─ Sipariş logları siliniyor...');
    results.siparisLogs = await prisma.siparisLog.deleteMany({});
    console.log(`      ✓ ${results.siparisLogs.count} sipariş log kaydı silindi`);

    console.log('   └─ Teklif logları siliniyor...');
    results.teklifLogs = await prisma.teklifLog.deleteMany({});
    console.log(`      ✓ ${results.teklifLogs.count} teklif log kaydı silindi`);

    console.log('   └─ Banka havale logları siliniyor...');
    results.bankaHavaleLogs = await prisma.bankaHavaleLog.deleteMany({});
    console.log(`      ✓ ${results.bankaHavaleLogs.count} banka havale log kaydı silindi`);

    console.log('   └─ Çek/Senet logları siliniyor...');
    results.cekSenetLogs = await prisma.cekSenetLog.deleteMany({});
    console.log(`      ✓ ${results.cekSenetLogs.count} çek/senet log kaydı silindi`);

    console.log('   └─ Silinen banka havale kayıtları siliniyor...');
    results.deletedBankaHavaleler = await prisma.deletedBankaHavale.deleteMany({});
    console.log(`      ✓ ${results.deletedBankaHavaleler.count} silinen banka havale kaydı silindi`);

    console.log('   └─ Silinen çek/senet kayıtları siliniyor...');
    results.deletedCekSenetler = await prisma.deletedCekSenet.deleteMany({});
    console.log(`      ✓ ${results.deletedCekSenetler.count} silinen çek/senet kaydı silindi`);

    // ============= 2. TAHSİLAT VE ÖDEMELER =============
    console.log('\n💵 2. Tahsilat ve Ödemeler Temizleniyor...');
    console.log('   └─ Fatura-Tahsilat ilişkileri siliniyor...');
    results.faturaTahsilatlar = await prisma.faturaTahsilat.deleteMany({});
    console.log(`      ✓ ${results.faturaTahsilatlar.count} fatura-tahsilat kaydı silindi`);

    console.log('   └─ Tahsilatlar siliniyor...');
    results.tahsilatlar = await prisma.tahsilat.deleteMany({});
    console.log(`      ✓ ${results.tahsilatlar.count} tahsilat kaydı silindi`);

    // ============= 3. FATURALAR (SATIŞ VE SATIN ALMA) =============
    console.log('\n🧾 3. Faturalar Temizleniyor...');
    console.log('   └─ Fatura kalemleri siliniyor...');
    results.faturaKalemleri = await prisma.faturaKalemi.deleteMany({});
    console.log(`      ✓ ${results.faturaKalemleri.count} fatura kalemi silindi`);

    console.log('   └─ Faturalar siliniyor...');
    results.faturalar = await prisma.fatura.deleteMany({});
    console.log(`      ✓ ${results.faturalar.count} fatura silindi`);

    // ============= 4. SİPARİŞLER (SATIŞ VE SATIN ALMA) =============
    console.log('\n📦 4. Siparişler Temizleniyor...');
    console.log('   └─ Sipariş hazırlıkları siliniyor...');
    results.siparisHazirliklar = await prisma.siparisHazirlik.deleteMany({});
    console.log(`      ✓ ${results.siparisHazirliklar.count} sipariş hazırlık kaydı silindi`);

    console.log('   └─ Sipariş kalemleri siliniyor...');
    results.siparisKalemleri = await prisma.siparisKalemi.deleteMany({});
    console.log(`      ✓ ${results.siparisKalemleri.count} sipariş kalemi silindi`);

    console.log('   └─ Siparişler siliniyor...');
    results.siparisler = await prisma.siparis.deleteMany({});
    console.log(`      ✓ ${results.siparisler.count} sipariş silindi`);

    // ============= 5. TEKLİFLER =============
    console.log('\n📄 5. Teklifler Temizleniyor...');
    console.log('   └─ Teklif kalemleri siliniyor...');
    results.teklifKalemleri = await prisma.teklifKalemi.deleteMany({});
    console.log(`      ✓ ${results.teklifKalemleri.count} teklif kalemi silindi`);

    console.log('   └─ Teklifler siliniyor...');
    results.teklifler = await prisma.teklif.deleteMany({});
    console.log(`      ✓ ${results.teklifler.count} teklif silindi`);

    // ============= 6. ÇEK VE SENETLER =============
    console.log('\n💳 6. Çek ve Senetler Temizleniyor...');
    console.log('   └─ Çek/Senet kayıtları siliniyor...');
    results.cekSenetler = await prisma.cekSenet.deleteMany({});
    console.log(`      ✓ ${results.cekSenetler.count} çek/senet kaydı silindi`);

    // ============= 7. BANKA İŞLEMLERİ =============
    console.log('\n🏦 7. Banka İşlemleri Temizleniyor...');
    console.log('   └─ Banka havaleleri siliniyor...');
    results.bankaHavaleler = await prisma.bankaHavale.deleteMany({});
    console.log(`      ✓ ${results.bankaHavaleler.count} banka havale kaydı silindi`);

    console.log('   └─ Banka hesap hareketleri siliniyor...');
    results.bankaHesapHareketler = await prisma.bankaHesapHareket.deleteMany({});
    console.log(`      ✓ ${results.bankaHesapHareketler.count} banka hesap hareket kaydı silindi`);

    console.log('   └─ Banka hesapları siliniyor...');
    results.bankaHesaplari = await prisma.bankaHesabi.deleteMany({});
    console.log(`      ✓ ${results.bankaHesaplari.count} banka hesabı silindi`);

    // ============= 8. KASALAR =============
    console.log('\n💰 8. Kasalar Temizleniyor...');
    console.log('   └─ Firma kredi kartı hareketleri siliniyor...');
    results.firmaKartHareketler = await prisma.firmaKrediKartiHareket.deleteMany({});
    console.log(`      ✓ ${results.firmaKartHareketler.count} firma kredi kartı hareket kaydı silindi`);

    console.log('   └─ Firma kredi kartları siliniyor...');
    results.firmaKartlari = await prisma.firmaKrediKarti.deleteMany({});
    console.log(`      ✓ ${results.firmaKartlari.count} firma kredi kartı silindi`);

    console.log('   └─ Kasa hareketleri siliniyor...');
    results.kasaHareketler = await prisma.kasaHareket.deleteMany({});
    console.log(`      ✓ ${results.kasaHareketler.count} kasa hareket kaydı silindi`);

    console.log('   └─ Kasalar siliniyor...');
    results.kasalar = await prisma.kasa.deleteMany({});
    console.log(`      ✓ ${results.kasalar.count} kasa kaydı silindi`);

    // ============= 9. DEPOLAR =============
    console.log('\n🏭 9. Depolar Temizleniyor...');
    console.log('   └─ Stok hareketleri (stock_moves) siliniyor...');
    results.stockMoves = await prisma.stockMove.deleteMany({});
    console.log(`      ✓ ${results.stockMoves.count} stok hareket kaydı silindi`);

    console.log('   └─ Ürün lokasyon stokları siliniyor...');
    results.productLocationStocks = await prisma.productLocationStock.deleteMany({});
    console.log(`      ✓ ${results.productLocationStocks.count} ürün lokasyon stok kaydı silindi`);

    console.log('   └─ Lokasyonlar (raflar) siliniyor...');
    results.locations = await prisma.location.deleteMany({});
    console.log(`      ✓ ${results.locations.count} lokasyon kaydı silindi`);

    console.log('   └─ Depolar (warehouses) siliniyor...');
    results.warehouses = await prisma.warehouse.deleteMany({});
    console.log(`      ✓ ${results.warehouses.count} depo kaydı silindi`);

    console.log('   └─ Ürün rafları (eski sistem) siliniyor...');
    results.urunRaflar = await prisma.urunRaf.deleteMany({});
    console.log(`      ✓ ${results.urunRaflar.count} ürün raf kaydı silindi`);

    console.log('   └─ Raflar (eski sistem) siliniyor...');
    results.raflar = await prisma.raf.deleteMany({});
    console.log(`      ✓ ${results.raflar.count} raf kaydı silindi`);

    console.log('   └─ Depolar (eski sistem) siliniyor...');
    results.depolar = await prisma.depo.deleteMany({});
    console.log(`      ✓ ${results.depolar.count} depo kaydı silindi`);

    // ============= 10. SAYIM KAYITLARI =============
    console.log('\n📊 10. Sayım Kayıtları Temizleniyor...');
    console.log('   └─ Sayım kalemleri siliniyor...');
    results.sayimKalemleri = await prisma.sayimKalemi.deleteMany({});
    console.log(`      ✓ ${results.sayimKalemleri.count} sayım kalemi silindi`);

    console.log('   └─ Sayımlar siliniyor...');
    results.sayimlar = await prisma.sayim.deleteMany({});
    console.log(`      ✓ ${results.sayimlar.count} sayım kaydı silindi`);

    // ============= 11. MALZEMELER (STOKLAR) =============
    console.log('\n📦 11. Malzemeler (Stoklar) Temizleniyor...');
    console.log('   └─ Stok maliyet geçmişi siliniyor...');
    results.stockCostHistory = await prisma.stockCostHistory.deleteMany({});
    console.log(`      ✓ ${results.stockCostHistory.count} stok maliyet geçmişi kaydı silindi`);

    console.log('   └─ Fiyat kartları siliniyor...');
    results.priceCards = await prisma.priceCard.deleteMany({});
    console.log(`      ✓ ${results.priceCards.count} fiyat kartı kaydı silindi`);

    console.log('   └─ Ürün barkodları siliniyor...');
    results.productBarcodes = await prisma.productBarcode.deleteMany({});
    console.log(`      ✓ ${results.productBarcodes.count} ürün barkod kaydı silindi`);

    console.log('   └─ Stok hareketleri siliniyor...');
    results.stokHareketleri = await prisma.stokHareket.deleteMany({});
    console.log(`      ✓ ${results.stokHareketleri.count} stok hareket kaydı silindi`);

    console.log('   └─ Stok eşdeğerleri siliniyor...');
    results.stokEsdegerleri = await prisma.stokEsdeger.deleteMany({});
    console.log(`      ✓ ${results.stokEsdegerleri.count} stok eşdeğer kaydı silindi`);

    console.log('   └─ Stoklar siliniyor...');
    results.stoklar = await prisma.stok.deleteMany({});
    console.log(`      ✓ ${results.stoklar.count} stok kaydı silindi`);

    console.log('   └─ Eşdeğer gruplar siliniyor...');
    results.esdegerGruplar = await prisma.esdegerGrup.deleteMany({});
    console.log(`      ✓ ${results.esdegerGruplar.count} eşdeğer grup kaydı silindi`);

    // ============= 12. CARİ HESAPLAR =============
    console.log('\n👤 12. Cari Hesaplar Temizleniyor...');
    console.log('   └─ Cari hareketler siliniyor...');
    results.cariHareketler = await prisma.cariHareket.deleteMany({});
    console.log(`      ✓ ${results.cariHareketler.count} cari hareket kaydı silindi`);

    console.log('   └─ Cariler siliniyor...');
    results.cariler = await prisma.cari.deleteMany({});
    console.log(`      ✓ ${results.cariler.count} cari kaydı silindi`);

    // ============= 13. İNSAN KAYNAKLARI =============
    console.log('\n👥 13. İnsan Kaynakları Temizleniyor...');
    console.log('   └─ Personel ödemeleri siliniyor...');
    results.personelOdemeler = await prisma.personelOdeme.deleteMany({});
    console.log(`      ✓ ${results.personelOdemeler.count} personel ödeme kaydı silindi`);

    console.log('   └─ Personeller siliniyor...');
    results.personeller = await prisma.personel.deleteMany({});
    console.log(`      ✓ ${results.personeller.count} personel kaydı silindi`);

    // ============= ÖZET =============
    console.log('\n' + '='.repeat(60));
    console.log('✅ TÜM VERİTABANI TEMİZLİĞİ TAMAMLANDI!');
    console.log('='.repeat(60));
    console.log('\n📊 SİLİNEN KAYIT ÖZETİ:\n');

    const summary = [
      { name: 'Fatura Logları', count: results.faturaLogs.count },
      { name: 'Sipariş Logları', count: results.siparisLogs.count },
      { name: 'Teklif Logları', count: results.teklifLogs.count },
      { name: 'Banka Havale Logları', count: results.bankaHavaleLogs.count },
      { name: 'Çek/Senet Logları', count: results.cekSenetLogs.count },
      { name: 'Silinen Banka Havaleleri', count: results.deletedBankaHavaleler.count },
      { name: 'Silinen Çek/Senetler', count: results.deletedCekSenetler.count },
      { name: 'Fatura-Tahsilat İlişkileri', count: results.faturaTahsilatlar.count },
      { name: 'Tahsilatlar', count: results.tahsilatlar.count },
      { name: 'Fatura Kalemleri', count: results.faturaKalemleri.count },
      { name: 'Faturalar', count: results.faturalar.count },
      { name: 'Sipariş Hazırlıkları', count: results.siparisHazirliklar.count },
      { name: 'Sipariş Kalemleri', count: results.siparisKalemleri.count },
      { name: 'Siparişler', count: results.siparisler.count },
      { name: 'Teklif Kalemleri', count: results.teklifKalemleri.count },
      { name: 'Teklifler', count: results.teklifler.count },
      { name: 'Çek/Senetler', count: results.cekSenetler.count },
      { name: 'Banka Havaleleri', count: results.bankaHavaleler.count },
      { name: 'Banka Hesap Hareketleri', count: results.bankaHesapHareketler.count },
      { name: 'Banka Hesapları', count: results.bankaHesaplari.count },
      { name: 'Firma Kredi Kartı Hareketleri', count: results.firmaKartHareketler.count },
      { name: 'Firma Kredi Kartları', count: results.firmaKartlari.count },
      { name: 'Kasa Hareketleri', count: results.kasaHareketler.count },
      { name: 'Kasalar', count: results.kasalar.count },
      { name: 'Stok Hareketleri (Stock Moves)', count: results.stockMoves.count },
      { name: 'Ürün Lokasyon Stokları', count: results.productLocationStocks.count },
      { name: 'Lokasyonlar', count: results.locations.count },
      { name: 'Depolar (Warehouses)', count: results.warehouses.count },
      { name: 'Ürün Rafları (Eski)', count: results.urunRaflar.count },
      { name: 'Raflar (Eski)', count: results.raflar.count },
      { name: 'Depolar (Eski)', count: results.depolar.count },
      { name: 'Sayım Kalemleri', count: results.sayimKalemleri.count },
      { name: 'Sayımlar', count: results.sayimlar.count },
      { name: 'Stok Maliyet Geçmişi', count: results.stockCostHistory.count },
      { name: 'Fiyat Kartları', count: results.priceCards.count },
      { name: 'Ürün Barkodları', count: results.productBarcodes.count },
      { name: 'Stok Hareketleri', count: results.stokHareketleri.count },
      { name: 'Stok Eşdeğerleri', count: results.stokEsdegerleri.count },
      { name: 'Stoklar', count: results.stoklar.count },
      { name: 'Eşdeğer Gruplar', count: results.esdegerGruplar.count },
      { name: 'Cari Hareketler', count: results.cariHareketler.count },
      { name: 'Cariler', count: results.cariler.count },
      { name: 'Personel Ödemeleri', count: results.personelOdemeler.count },
      { name: 'Personeller', count: results.personeller.count },
    ];

    summary.forEach(item => {
      if (item.count > 0) {
        console.log(`   ✓ ${item.name}: ${item.count.toLocaleString('tr-TR')} kayıt`);
        totalDeleted += item.count;
      }
    });

    console.log('\n' + '='.repeat(60));
    console.log(`📈 TOPLAM: ${totalDeleted.toLocaleString('tr-TR')} kayıt silindi`);
    console.log('='.repeat(60));

    console.log('\n🎉 Veritabanı başarıyla temizlendi!');
    console.log('💡 Backend\'i yeniden başlatabilirsiniz.');

  } catch (error) {
    console.error('\n❌ HATA:', error);
    console.error('\n🔍 Hata Detayı:', error.message);
    if (error.stack) {
      console.error('\n📋 Stack Trace:');
      console.error(error.stack);
    }
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Script'i çalıştır
cleanupAllData()
  .then(() => {
    console.log('\n✅ İşlem başarıyla tamamlandı!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script hatası:', error);
    process.exit(1);
  });

