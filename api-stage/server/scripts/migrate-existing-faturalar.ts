import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function migrateExistingFaturalar() {
  console.log('🔄 Mevcut faturalar FIFO için güncelleniyor...\n');

  try {
    // Tüm faturaları al
    const faturalar = await prisma.fatura.findMany({
      where: {
        deletedAt: null,
      },
      include: {
        faturaTahsilatlar: true,
      },
    });

    console.log(`📊 Toplam ${faturalar.length} fatura bulundu\n`);

    let updatedCount = 0;

    for (const fatura of faturalar) {
      // Toplam ödenen tutarı hesapla (FaturaTahsilat kayıtlarından)
      const toplamOdenen = fatura.faturaTahsilatlar.reduce(
        (sum, ft) => sum + Number(ft.tutar),
        0
      );

      const genelToplam = Number(fatura.genelToplam);
      const kalanTutar = genelToplam - toplamOdenen;

      // Durum belirle
      let yeniDurum = fatura.durum;
      if (kalanTutar <= 0.01 && toplamOdenen > 0) {
        yeniDurum = 'KAPALI';
      } else if (toplamOdenen > 0 && kalanTutar > 0) {
        yeniDurum = 'KISMEN_ODENDI';
      } else if (toplamOdenen === 0) {
        yeniDurum = fatura.durum; // Mevcut durumu koru (ACIK veya ONAYLANDI)
      }

      // Faturayı güncelle
      await prisma.fatura.update({
        where: { id: fatura.id },
        data: {
          odenenTutar: toplamOdenen,
          odenecekTutar: kalanTutar,
          durum: yeniDurum,
        },
      });

      console.log(`✓ ${fatura.faturaNo}: odenen=₺${toplamOdenen.toFixed(2)}, kalan=₺${kalanTutar.toFixed(2)}, durum=${yeniDurum}`);
      updatedCount++;
    }

    console.log(`\n✅ ${updatedCount} fatura başarıyla güncellendi!`);
    console.log('\n📋 Özet:');
    
    const summary = await prisma.fatura.groupBy({
      by: ['durum'],
      _count: true,
      where: { deletedAt: null },
    });

    summary.forEach(s => {
      console.log(`   ${s.durum}: ${s._count} fatura`);
    });

  } catch (error) {
    console.error('❌ Hata:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

migrateExistingFaturalar()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });

