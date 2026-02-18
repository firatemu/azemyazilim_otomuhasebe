const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * Geçersiz tarih kontrolü yapan fonksiyon
 */
function isValidDate(dateValue) {
  if (!dateValue) return false;
  const date = dateValue instanceof Date ? dateValue : new Date(dateValue);
  return !isNaN(date.getTime());
}

/**
 * Tüm modellerdeki geçersiz tarihli kayıtları bul ve sil
 */
async function cleanInvalidDates() {
  console.log('🔍 Geçersiz tarihli kayıtlar taranıyor...\n');

  let totalDeleted = 0;

  try {
    // 1. Tahsilat tablosu - tarih alanı (DateTime tipinde)
    console.log('📊 Tahsilat tablosu kontrol ediliyor...');
    const tahsilatlar = await prisma.tahsilat.findMany();

    let tahsilatDeleted = 0;
    for (const tahsilat of tahsilatlar) {
      if (!isValidDate(tahsilat.tarih)) {
        await prisma.tahsilat.delete({ where: { id: tahsilat.id } });
        tahsilatDeleted++;
        console.log(`  ❌ Silindi: Tahsilat ID ${tahsilat.id}, tarih: ${tahsilat.tarih}`);
      }
    }
    console.log(`  ✅ ${tahsilatDeleted} geçersiz tahsilat kaydı silindi\n`);
    totalDeleted += tahsilatDeleted;

    // 2. Masraf tablosu - tarih alanı (DateTime tipinde)
    console.log('📊 Masraf tablosu kontrol ediliyor...');
    const masraflar = await prisma.masraf.findMany();

    let masrafDeleted = 0;
    for (const masraf of masraflar) {
      if (!isValidDate(masraf.tarih)) {
        await prisma.masraf.delete({ where: { id: masraf.id } });
        masrafDeleted++;
        console.log(`  ❌ Silindi: Masraf ID ${masraf.id}, tarih: ${masraf.tarih}`);
      }
    }
    console.log(`  ✅ ${masrafDeleted} geçersiz masraf kaydı silindi\n`);
    totalDeleted += masrafDeleted;

    // 3. Fatura tablosu - tarih ve vade alanları (DateTime tipinde)
    console.log('📊 Fatura tablosu kontrol ediliyor...');
    const faturalar = await prisma.fatura.findMany();

    let faturaDeleted = 0;
    for (const fatura of faturalar) {
      const hasInvalidTarih = fatura.tarih && !isValidDate(fatura.tarih);
      const hasInvalidVade = fatura.vade && !isValidDate(fatura.vade);
      
      if (hasInvalidTarih || hasInvalidVade) {
        await prisma.fatura.delete({ where: { id: fatura.id } });
        faturaDeleted++;
        console.log(`  ❌ Silindi: Fatura ID ${fatura.id}, tarih: ${fatura.tarih}, vade: ${fatura.vade}`);
      }
    }
    console.log(`  ✅ ${faturaDeleted} geçersiz fatura kaydı silindi\n`);
    totalDeleted += faturaDeleted;

    // 4. Teklif tablosu - tarih ve vade alanları (DateTime tipinde)
    console.log('📊 Teklif tablosu kontrol ediliyor...');
    const teklifler = await prisma.teklif.findMany();

    let teklifDeleted = 0;
    for (const teklif of teklifler) {
      const hasInvalidTarih = teklif.tarih && !isValidDate(teklif.tarih);
      const hasInvalidVade = teklif.vade && !isValidDate(teklif.vade);
      
      if (hasInvalidTarih || hasInvalidVade) {
        await prisma.teklif.delete({ where: { id: teklif.id } });
        teklifDeleted++;
        console.log(`  ❌ Silindi: Teklif ID ${teklif.id}, tarih: ${teklif.tarih}, vade: ${teklif.vade}`);
      }
    }
    console.log(`  ✅ ${teklifDeleted} geçersiz teklif kaydı silindi\n`);
    totalDeleted += teklifDeleted;

    // 5. Siparis tablosu - tarih ve vade alanları (DateTime tipinde)
    console.log('📊 Siparis tablosu kontrol ediliyor...');
    const siparisler = await prisma.siparis.findMany();

    let siparisDeleted = 0;
    for (const siparis of siparisler) {
      const hasInvalidTarih = siparis.tarih && !isValidDate(siparis.tarih);
      const hasInvalidVade = siparis.vade && !isValidDate(siparis.vade);
      
      if (hasInvalidTarih || hasInvalidVade) {
        await prisma.siparis.delete({ where: { id: siparis.id } });
        siparisDeleted++;
        console.log(`  ❌ Silindi: Siparis ID ${siparis.id}, tarih: ${siparis.tarih}, vade: ${siparis.vade}`);
      }
    }
    console.log(`  ✅ ${siparisDeleted} geçersiz siparis kaydı silindi\n`);
    totalDeleted += siparisDeleted;

    // 6. BankaHavale tablosu - tarih alanı (DateTime tipinde)
    console.log('📊 BankaHavale tablosu kontrol ediliyor...');
    const bankaHavaleler = await prisma.bankaHavale.findMany();

    let bankaHavaleDeleted = 0;
    for (const bankaHavale of bankaHavaleler) {
      if (!isValidDate(bankaHavale.tarih)) {
        await prisma.bankaHavale.delete({ where: { id: bankaHavale.id } });
        bankaHavaleDeleted++;
        console.log(`  ❌ Silindi: BankaHavale ID ${bankaHavale.id}, tarih: ${bankaHavale.tarih}`);
      }
    }
    console.log(`  ✅ ${bankaHavaleDeleted} geçersiz banka havale kaydı silindi\n`);
    totalDeleted += bankaHavaleDeleted;

    console.log('=' .repeat(50));
    console.log(`✅ Toplam ${totalDeleted} geçersiz tarihli kayıt silindi`);
    console.log('=' .repeat(50));

  } catch (error) {
    console.error('❌ Hata oluştu:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Script'i çalıştır
cleanInvalidDates()
  .then(() => {
    console.log('\n✅ İşlem tamamlandı');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ İşlem başarısız:', error);
    process.exit(1);
  });

