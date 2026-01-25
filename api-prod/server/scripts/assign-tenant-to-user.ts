/**
 * Staging ortamında info@azemyazilim.com kullanıcısına tenant ID atama script'i
 */

import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';
import { v4 as uuidv4 } from 'uuid';

// .env dosyasını yükle
dotenv.config();

const prisma = new PrismaClient();
const ADMIN_EMAIL = 'info@azemyazilim.com';

/**
 * Staging default tenant ID'yi veritabanından al
 */
async function getStagingDefaultTenantId(): Promise<string> {
  try {
    // Veritabanından oku
    const parameter = await prisma.systemParameter.findFirst({
      where: {
        key: 'STAGING_DEFAULT_TENANT_ID',
        tenantId: null, // Global parametre
      },
    });

    if (parameter && typeof parameter.value === 'string') {
      return parameter.value;
    }
  } catch (error) {
    console.warn('⚠️  SystemParameter okuma hatası, fallback kullanılıyor:', error);
  }

  // Fallback: .env dosyasından oku
  return process.env.STAGING_DEFAULT_TENANT_ID || 'cmi5of04z0000ksb3g5eyu6ts';
}

async function assignTenantToUser() {
  console.log('========================================');
  console.log('Staging Kullanıcı Tenant ID Atama');
  console.log('========================================\n');
  console.log(`📧 Kullanıcı: ${ADMIN_EMAIL}`);
  
  const DEFAULT_TENANT_ID = await getStagingDefaultTenantId();
  console.log(`🏢 Tenant ID: ${DEFAULT_TENANT_ID}\n`);

  try {
    // 1. Tenant kontrolü ve oluşturma
    console.log('1️⃣  Tenant kontrolü yapılıyor...');
    let tenant = await prisma.tenant.findUnique({
      where: { id: DEFAULT_TENANT_ID },
    });

    if (!tenant) {
      console.log('   📝 Tenant bulunamadı, oluşturuluyor...');
      tenant = await prisma.tenant.create({
        data: {
          id: DEFAULT_TENANT_ID,
          uuid: uuidv4(),
          name: 'Staging Default Tenant',
          status: 'TRIAL',
        },
      });
      console.log(`   ✅ Tenant oluşturuldu: ${tenant.name} (ID: ${tenant.id})`);
    } else {
      console.log(`   ✅ Mevcut tenant bulundu: ${tenant.name} (ID: ${tenant.id})`);
    }

    // 2. Kullanıcı kontrolü ve oluşturma
    console.log('\n2️⃣  Kullanıcı kontrolü yapılıyor...');
    let user = await prisma.user.findFirst({
      where: {
        OR: [
          { email: ADMIN_EMAIL },
          { username: ADMIN_EMAIL.split('@')[0] },
        ],
      },
    });

    if (!user) {
      console.log('   📝 Kullanıcı bulunamadı, oluşturuluyor...');
      const password = '1212';
      const hashedPassword = await bcrypt.hash(password, 10);

      user = await prisma.user.create({
        data: {
          email: ADMIN_EMAIL,
          username: ADMIN_EMAIL.split('@')[0],
          password: hashedPassword,
          fullName: 'Admin & Developer',
          role: 'SUPER_ADMIN',
          status: 'ACTIVE',
          isActive: true,
          emailVerified: true,
          tenantId: DEFAULT_TENANT_ID,
        },
      });
      console.log(`   ✅ Kullanıcı oluşturuldu: ${user.email} (ID: ${user.id})`);
      console.log(`   ✅ Tenant ID atandı: ${user.tenantId}`);
    } else {
      console.log(`   ✅ Mevcut kullanıcı bulundu: ${user.email} (ID: ${user.id})`);
      
      // 3. Tenant ID atama/güncelleme
      if (user.tenantId !== DEFAULT_TENANT_ID) {
        console.log(`   📝 Tenant ID güncelleniyor: ${user.tenantId || 'null'} -> ${DEFAULT_TENANT_ID}`);
        user = await prisma.user.update({
          where: { id: user.id },
          data: {
            tenantId: DEFAULT_TENANT_ID,
          },
        });
        console.log(`   ✅ Tenant ID güncellendi: ${user.tenantId}`);
      } else {
        console.log(`   ✅ Tenant ID zaten doğru: ${user.tenantId}`);
      }
    }

    console.log('\n========================================');
    console.log('✅ İşlem başarıyla tamamlandı!');
    console.log('========================================');
    console.log(`📧 Kullanıcı: ${user.email}`);
    console.log(`🏢 Tenant ID: ${user.tenantId}`);
    console.log(`👤 Rol: ${user.role}`);
    console.log(`📊 Durum: ${user.status}`);

  } catch (error: any) {
    console.error('\n❌ Hata oluştu:', error.message);
    if (error.code === 'P2002') {
      console.error('   Bu email veya kullanıcı adı zaten kullanılıyor.');
    } else {
      console.error('   Detay:', error);
    }
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Script'i çalıştır
assignTenantToUser()
  .then(() => {
    console.log('\n✅ Script başarıyla tamamlandı');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n❌ Script başarısız:', error);
    process.exit(1);
  });
