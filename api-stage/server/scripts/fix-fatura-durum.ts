import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixFaturaDurum() {
  console.log('🔧 Fatura durumları düzeltiliyor...\n');

  const faturalar = await prisma.fatura.findMany({
    where: { deletedAt: null },
  });

  let fixedCount = 0;

  for (const fatura of faturalar) {
    const odenen = Number(fatura.odenenTutar || 0);
    const genelToplam = Number(fatura.genelToplam);
    const kalan = genelToplam - odenen;

    let dogruDurum = fatura.durum;

    // Durum belirleme
    if (kalan <= 0.01 && odenen > 0) {
      dogruDurum = 'KAPALI';
    } else if (odenen > 0 && kalan > 0) {
      dogruDurum = 'KISMEN_ODENDI';
    } else if (odenen === 0) {
      // Hiç ödeme yoksa mevcut durumu koru (ACIK veya ONAYLANDI)
      if (fatura.durum === 'KAPALI' || fatura.durum === 'KISMEN_ODENDI') {
        dogruDurum = 'ONAYLANDI'; // Reset to ONAYLANDI
      }
    }

    if (dogruDurum !== fatura.durum) {
      await prisma.fatura.update({
        where: { id: fatura.id },
        data: { durum: dogruDurum },
      });
      
      console.log(`✓ ${fatura.faturaNo}: ${fatura.durum} → ${dogruDurum}`);
      console.log(`   (Ödenen: ₺${odenen.toFixed(2)}, Kalan: ₺${kalan.toFixed(2)})`);
      fixedCount++;
    }
  }

  console.log(`\n✅ ${fixedCount} fatura durumu düzeltildi!`);

  await prisma.$disconnect();
}

fixFaturaDurum();
