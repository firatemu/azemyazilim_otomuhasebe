import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function checkFaturaStatus() {
  const faturalar = await prisma.fatura.findMany({
    where: { deletedAt: null },
    include: {
      faturaTahsilatlar: {
        include: {
          tahsilat: {
            select: {
              id: true,
              tutar: true,
              tip: true,
            }
          }
        }
      }
    },
    orderBy: { faturaNo: 'asc' }
  });

  console.log('\n📊 FATURA DURUM RAPORU\n');
  console.log('='.repeat(100));

  for (const fatura of faturalar) {
    const toplamOdenen = fatura.faturaTahsilatlar.reduce((sum, ft) => sum + Number(ft.tutar), 0);
    const genelToplam = Number(fatura.genelToplam);
    const kalan = genelToplam - toplamOdenen;

    console.log(`\n📋 ${fatura.faturaNo} (${fatura.faturaTipi})`);
    console.log(`   Genel Toplam: ₺${genelToplam.toFixed(2)}`);
    console.log(`   Ödenen (Hesaplanan): ₺${toplamOdenen.toFixed(2)}`);
    console.log(`   Ödenen (DB): ₺${Number(fatura.odenenTutar || 0).toFixed(2)}`);
    console.log(`   Kalan (Hesaplanan): ₺${kalan.toFixed(2)}`);
    console.log(`   Kalan (DB): ₺${Number(fatura.odenecekTutar || 0).toFixed(2)}`);
    console.log(`   Durum: ${fatura.durum}`);
    
    if (fatura.faturaTahsilatlar.length > 0) {
      console.log(`   Tahsilatlar:`);
      fatura.faturaTahsilatlar.forEach(ft => {
        console.log(`      - ₺${Number(ft.tutar).toFixed(2)} (${ft.tahsilat.tip})`);
      });
    } else {
      console.log(`   Tahsilatlar: Yok`);
    }

    // Uyarılar
    if (toplamOdenen !== Number(fatura.odenenTutar || 0)) {
      console.log(`   ⚠️ UYARI: odenenTutar tutarsız!`);
    }
    if (Math.abs(kalan - Number(fatura.odenecekTutar || 0)) > 0.01) {
      console.log(`   ⚠️ UYARI: odenecekTutar tutarsız!`);
    }
  }

  console.log('\n' + '='.repeat(100) + '\n');

  await prisma.$disconnect();
}

checkFaturaStatus();
