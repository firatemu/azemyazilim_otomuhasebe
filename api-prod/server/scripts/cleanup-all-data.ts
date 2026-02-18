import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const ADMIN_EMAIL = 'info@azemyazilim.com';

async function cleanupAllData() {
  console.log('🧹 STAGING: Tüm veriler temizleniyor...');
  console.log(`✅ Admin kullanıcısı korunacak: ${ADMIN_EMAIL}\n`);

  try {
    // 1. Admin kullanıcısını bul ve bilgilerini sakla
    const adminUser = await prisma.user.findFirst({
      where: { email: ADMIN_EMAIL },
    });

    if (!adminUser) {
      console.error(`❌ Admin kullanıcısı bulunamadı: ${ADMIN_EMAIL}`);
      process.exit(1);
    }

    console.log(`✅ Admin kullanıcısı bulundu: ${adminUser.email} (ID: ${adminUser.id})`);

    // 2. Admin kullanıcısının tenant ID'sini sakla (varsa)
    const adminTenantId = adminUser.tenantId;
    console.log(`📝 Admin tenant ID: ${adminTenantId || 'Yok'}\n`);

    // 3. Tüm tabloları temizle
    console.log('🗑️  Tablolar temizleniyor...\n');

    // Önce ilişkili tabloları temizle
    await prisma.satınAlmaSiparisLog.deleteMany({});
    await prisma.satınAlmaSiparisKalemi.deleteMany({});
    await prisma.satınAlmaSiparisi.deleteMany({});
    await prisma.basitSiparis.deleteMany({});
    await prisma.purchaseOrderItem.deleteMany({});
    await prisma.purchaseOrder.deleteMany({});
    await prisma.faturaTahsilat.deleteMany({});
    await prisma.tahsilat.deleteMany({});
    await prisma.faturaKalemi.deleteMany({});
    await prisma.faturaLog.deleteMany({});
    await prisma.fatura.deleteMany({});
    await prisma.siparisKalemi.deleteMany({});
    await prisma.siparisHazirlik.deleteMany({});
    await prisma.siparisLog.deleteMany({});
    await prisma.siparis.deleteMany({});
    await prisma.teklifKalemi.deleteMany({});
    await prisma.teklifLog.deleteMany({});
    await prisma.teklif.deleteMany({});
    await prisma.sayimKalemi.deleteMany({});
    await prisma.sayim.deleteMany({});
    await prisma.stockMove.deleteMany({});
    await prisma.productLocationStock.deleteMany({});
    await prisma.productBarcode.deleteMany({});
    await prisma.location.deleteMany({});
    await prisma.warehouse.deleteMany({});
    await prisma.urunRaf.deleteMany({});
    await prisma.raf.deleteMany({});
    await prisma.depo.deleteMany({});
    await prisma.stokHareket.deleteMany({});
    await prisma.stokEsdeger.deleteMany({});
    await prisma.esdegerGrup.deleteMany({});
    await prisma.stockCostHistory.deleteMany({});
    await prisma.priceCard.deleteMany({});
    await prisma.stok.deleteMany({});
    await prisma.kasaHareket.deleteMany({});
    await prisma.firmaKrediKartiHareket.deleteMany({});
    await prisma.firmaKrediKarti.deleteMany({});
    await prisma.bankaHesapHareket.deleteMany({});
    await prisma.bankaHesabi.deleteMany({});
    await prisma.kasa.deleteMany({});
    await prisma.cariHareket.deleteMany({});
    await prisma.cari.deleteMany({});
    await prisma.deletedCekSenet.deleteMany({});
    await prisma.cekSenetLog.deleteMany({});
    await prisma.cekSenet.deleteMany({});
    await prisma.deletedBankaHavale.deleteMany({});
    await prisma.bankaHavaleLog.deleteMany({});
    await prisma.bankaHavale.deleteMany({});
    await prisma.personelOdeme.deleteMany({});
    await prisma.personel.deleteMany({});
    await prisma.masraf.deleteMany({});
    await prisma.masrafKategori.deleteMany({});
    await prisma.arac.deleteMany({});
    await prisma.codeTemplate.deleteMany({});
    
    // Payment ve subscription tabloları
    await prisma.payment.deleteMany({});
    await prisma.subscription.deleteMany({});
    await prisma.session.deleteMany({});
    await prisma.auditLog.deleteMany({});
    
    // Tenant settings
    await prisma.tenantSettings.deleteMany({});
    
    // Tenant'ları temizle (admin tenant'ı hariç)
    if (adminTenantId) {
      await prisma.tenant.deleteMany({
        where: {
          id: { not: adminTenantId },
        },
      });
    } else {
      await prisma.tenant.deleteMany({});
    }
    
    // Son olarak kullanıcıları temizle (admin hariç)
    await prisma.user.deleteMany({
      where: {
        email: { not: ADMIN_EMAIL },
      },
    });

    console.log('\n✅ STAGING: Tüm veriler başarıyla temizlendi!');
    console.log(`✅ Admin kullanıcısı korundu: ${ADMIN_EMAIL}`);
    
  } catch (error) {
    console.error('❌ Hata oluştu:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

cleanupAllData()
  .then(() => {
    console.log('\n🎉 STAGING: Temizlik işlemi tamamlandı!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ STAGING: Temizlik işlemi başarısız:', error);
    process.exit(1);
  });

