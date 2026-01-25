/**
 * SystemParameter tablosuna STAGING_DEFAULT_TENANT_ID parametresini ekleme script'i
 */

import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';

// .env dosyasını yükle
dotenv.config();

const prisma = new PrismaClient();
const PARAM_KEY = 'STAGING_DEFAULT_TENANT_ID';
const DEFAULT_TENANT_ID = process.env.STAGING_DEFAULT_TENANT_ID || 'cmi5of04z0000ksb3g5eyu6ts';

async function addStagingDefaultTenantIdParam() {
  console.log('========================================');
  console.log('SystemParameter: STAGING_DEFAULT_TENANT_ID Ekleme');
  console.log('========================================\n');
  console.log(`🔑 Parametre Key: ${PARAM_KEY}`);
  console.log(`📝 Değer: ${DEFAULT_TENANT_ID}\n`);

  try {
    // Mevcut parametreyi kontrol et
    const existingParam = await prisma.systemParameter.findFirst({
      where: {
        key: PARAM_KEY,
        tenantId: null, // Global parametre
      },
    });

    if (existingParam) {
      console.log('✅ Parametre zaten mevcut, güncelleniyor...');
      const updated = await prisma.systemParameter.update({
        where: { id: existingParam.id },
        data: {
          value: DEFAULT_TENANT_ID,
          description: 'Staging ortamı için varsayılan tenant ID',
          category: 'SYSTEM',
        },
      });
      console.log(`   ✅ Parametre güncellendi: ${updated.key} = ${updated.value}`);
    } else {
      console.log('📝 Yeni parametre oluşturuluyor...');
      const created = await prisma.systemParameter.create({
        data: {
          key: PARAM_KEY,
          value: DEFAULT_TENANT_ID,
          description: 'Staging ortamı için varsayılan tenant ID',
          category: 'SYSTEM',
          tenantId: null, // Global parametre
        },
      });
      console.log(`   ✅ Parametre oluşturuldu: ${created.key} = ${created.value}`);
    }

    console.log('\n========================================');
    console.log('✅ İşlem başarıyla tamamlandı!');
    console.log('========================================');

  } catch (error: any) {
    console.error('\n❌ Hata oluştu:', error.message);
    if (error.code === 'P2002') {
      console.error('   Bu parametre zaten mevcut (unique constraint).');
    } else {
      console.error('   Detay:', error);
    }
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Script'i çalıştır
addStagingDefaultTenantIdParam()
  .then(() => {
    console.log('\n✅ Script başarıyla tamamlandı');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script başarısız:', error);
    process.exit(1);
  });
