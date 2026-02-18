import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixOnayandiDurum() {
  console.log('🔧 ONAYLANDI durumları düzeltiliyor...\n');

  // KISMEN_ODENDI olan ama aslında ONAYLANDI olması gereken faturaları bul
  const faturalar = await prisma.fatura.findMany({
    where: {
      durum: 'KISMEN_ODENDI',
      deletedAt: null,
    },
  });

  console.log(`📊 ${faturalar.length} KISMEN_ODENDI fatura bulundu\n`);

  let fixedCount = 0;

  for (const fatura of faturalar) {
    const odenen = Number(fatura.odenenTutar || 0);
    const kalan = Number(fatura.odenecekTutar || 0);
    const genelToplam = Number(fatura.genelToplam);

    // Eğer kısmen ödenmişse ama hala açıksa, ONAYLANDI yap
    // (Çünkü ONAYLANDI = stok ve cari hareketi yapılmış demek)
    if (odenen > 0 && kalan > 0.01) {
      await prisma.fatura.update({
        where: { id: fatura.id },
        data: { durum: 'ONAYLANDI' },
      });
      
      console.log(`✓ ${fatura.faturaNo}: KISMEN_ODENDI → ONAYLANDI`);
      console.log(`   (Ödenen: ₺${odenen.toFixed(2)}, Kalan: ₺${kalan.toFixed(2)})`);
      fixedCount++;
    }
  }

  console.log(`\n✅ ${fixedCount} fatura durumu ONAYLANDI'ya çevrildi!`);

  await prisma.$disconnect();
}

fixOnayandiDurum();
