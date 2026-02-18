import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function applyFIFOToExistingTahsilatlar() {
  console.log('🔄 Mevcut tahsilatlar için FIFO uygulanıyor...\n');

  try {
    // Tüm tahsilatları al (tarih sırasına göre)
    const tahsilatlar = await prisma.tahsilat.findMany({
      orderBy: [
        { tarih: 'asc' },
        { createdAt: 'asc' },
      ],
    });

    console.log(`📊 Toplam ${tahsilatlar.length} tahsilat bulundu\n`);

    for (const tahsilat of tahsilatlar) {
      console.log(`\n💰 İşleniyor: ${tahsilat.id} - ₺${tahsilat.tutar} (${tahsilat.tip})`);
      
      await prisma.$transaction(async (tx) => {
        // FIFO mantığını uygula
        await applyFIFO(
          tx,
          tahsilat.id,
          tahsilat.cariId,
          tahsilat.tip,
          Number(tahsilat.tutar)
        );
      });
    }

    console.log('\n✅ Tüm tahsilatlar için FIFO uygulandı!');
    
    // Özet rapor
    const faturaOzet = await prisma.fatura.groupBy({
      by: ['durum'],
      _count: true,
      where: { deletedAt: null },
    });

    console.log('\n📋 Fatura Durum Özeti:');
    faturaOzet.forEach(s => {
      console.log(`   ${s.durum}: ${s._count} fatura`);
    });

  } catch (error) {
    console.error('❌ Hata:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// FIFO mantığı (tahsilat.service.ts'den kopyalandı)
async function applyFIFO(
  tx: any,
  tahsilatId: string,
  cariId: string,
  tip: any,
  tutar: number,
) {
  // FIFO sadece tahsilat ve ödeme için geçerli
  const faturaTipi = tip === 'TAHSILAT' ? 'SATIS' : 'ALIS';

  // 1. Carinin açık faturalarını al (FIFO: En eski önce)
  const acikFaturalar = await tx.fatura.findMany({
    where: {
      cariId,
      faturaTipi: {
        in: [faturaTipi, `${faturaTipi}_IADE`],
      },
      durum: {
        in: ['ACIK', 'KISMEN_ODENDI', 'ONAYLANDI'], // ONAYLANDI da dahil
      },
      deletedAt: null,
    },
    orderBy: [
      { tarih: 'asc' },
      { createdAt: 'asc' },
    ],
  });

  if (acikFaturalar.length === 0) {
    console.log(`   ℹ️ ${cariId} için açık fatura bulunamadı`);
    return;
  }

  console.log(`   📋 ${acikFaturalar.length} açık fatura bulundu`);

  // 2. Tahsilat tutarını FIFO mantığıyla faturalara dağıt
  let kalanTutar = tutar;

  for (const fatura of acikFaturalar) {
    if (kalanTutar <= 0) break;

    // Faturanın kalan tutarını hesapla
    const faturaGenelToplam = Number(fatura.genelToplam);
    const faturaOdenenTutar = Number(fatura.odenenTutar) || 0;
    const faturaKalanTutar = faturaGenelToplam - faturaOdenenTutar;

    if (faturaKalanTutar <= 0) continue;

    // Bu faturaya ne kadar ödenecek?
    const odenecekTutar = Math.min(kalanTutar, faturaKalanTutar);

    // Önceden kayıt var mı kontrol et
    const mevcutKayit = await tx.faturaTahsilat.findFirst({
      where: {
        faturaId: fatura.id,
        tahsilatId: tahsilatId,
      },
    });

    if (mevcutKayit) {
      console.log(`   ⏭️  ${fatura.faturaNo} için kayıt zaten var, atlanıyor`);
      continue;
    }

    // 3. FaturaTahsilat kaydı oluştur
    await tx.faturaTahsilat.create({
      data: {
        faturaId: fatura.id,
        tahsilatId: tahsilatId,
        tutar: odenecekTutar,
      },
    });

    // 4. Fatura odenen tutarını güncelle
    const yeniOdenenTutar = faturaOdenenTutar + odenecekTutar;
    const yeniKalanTutar = faturaGenelToplam - yeniOdenenTutar;

    // 5. Fatura durumunu güncelle
    let yeniDurum = fatura.durum;
    if (yeniKalanTutar <= 0.01) {
      yeniDurum = 'KAPALI';
    } else if (yeniOdenenTutar > 0) {
      yeniDurum = 'KISMEN_ODENDI';
    }

    await tx.fatura.update({
      where: { id: fatura.id },
      data: {
        odenenTutar: yeniOdenenTutar,
        odenecekTutar: yeniKalanTutar,
        durum: yeniDurum,
      },
    });

    console.log(`   ✓ ${fatura.faturaNo}: ₺${odenecekTutar.toFixed(2)} ödendi → ${yeniDurum}`);

    // Kalan tutarı azalt
    kalanTutar -= odenecekTutar;
  }
}

applyFIFOToExistingTahsilatlar()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  });

