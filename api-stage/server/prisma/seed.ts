import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('Seed işlemi başlıyor...');

  // 1. Plan Oluştur
  const limitJson = {
    maxUsers: 10,
    maxStorage: 1024,
  };

  const trialPlan = await prisma.plan.upsert({
    where: { slug: 'trial' },
    update: {},
    create: {
      name: 'Deneme Paketi',
      slug: 'trial',
      price: 0,
      description: '14 günlük ücretsiz deneme paketi',
      features: {},
      limits: limitJson,
      isActive: true,
    },
  });
  console.log('✓ Plan oluşturuldu/güncellendi');

  // 2. Tenant Oluştur
  const tenant = await prisma.tenant.upsert({
    where: { subdomain: 'demo' },
    update: {},
    create: {
      name: 'Demo Şirketi',
      subdomain: 'demo',
      status: 'ACTIVE',
      subscription: {
        create: {
          planId: trialPlan.id,
          status: 'ACTIVE',
          startDate: new Date(),
          endDate: new Date(new Date().setFullYear(new Date().getFullYear() + 1)),
        },
      },
    },
  });
  console.log('✓ Tenant oluşturuldu/güncellendi');

  // 3. Permissions Oluştur
  const modules = [
    'dashboard',
    'users',
    'roles',
    'permissions',
    'invoices',
    'cariye',
    'products',
    'expenses',
    'reports',
    'settings',
    'work_orders',
    'vehicles',
    'technicians',
    'procurement',
    'finance',
    'collecting',
    'payments',
    'cek_senet',
    'teklif',
    'siparis',
    'irsaliye',
    'kasa',
    'banka',
    'ik',
    'depo',
    'veri_aktarim',
  ];

  const actions = [
    'view',
    'list',
    'create',
    'update',
    'delete',
    'export',
    'import',
    'approve',
    'cancel',
    'print',
  ];

  console.log('... İzinler oluşturuluyor');
  const allPermissions: string[] = [];

  for (const module of modules) {
    for (const action of actions) {
      const perm = await prisma.permission.upsert({
        where: {
          module_action: {
            module,
            action,
          },
        },
        update: {},
        create: {
          module,
          action,
          description: `${module} module - ${action} action`,
        },
      });
      allPermissions.push(perm.id);
    }
  }
  console.log(`✓ ${allPermissions.length} izin oluşturuldu/güncellendi`);

  // 4. Admin Role Oluştur
  const adminRole = await prisma.role.upsert({
    where: {
      tenantId_name: {
        tenantId: tenant.id,
        name: 'Yönetici',
      },
    },
    update: {},
    create: {
      name: 'Yönetici',
      description: 'Tam yetkili sistem yöneticisi',
      isSystemRole: true,
      tenantId: tenant.id,
    },
  });
  console.log('✓ Yönetici rolü oluşturuldu');

  // 5. Role Permissions Ata (Tüm izinler)
  // Mevcut izinleri temizle ve yeniden ata
  // await prisma.rolePermission.deleteMany({ where: { roleId: adminRole.id } });

  const rolePermissionsData = allPermissions.map(permissionId => ({
    roleId: adminRole.id,
    permissionId,
  }));

  // Batch insert yerine loop ile upsert ya da createMany (conflict skip)
  // SQLite/Postgres farkı olmaması için createMany skipDuplicates kullanıyoruz
  await prisma.rolePermission.createMany({
    data: rolePermissionsData,
    skipDuplicates: true,
  });
  console.log('✓ Yönetici rolüne izinler atandı');

  // 6. Admin User Oluştur
  // Şifre: 1212
  const hash = await bcrypt.hash('1212', 10);

  const adminUser = await prisma.user.upsert({
    where: {
      email_tenantId: {
        email: 'info@azemyazilim.com',
        tenantId: tenant.id,
      },
    },
    update: {
      password: hash,
      tenantId: tenant.id,
      role: 'SUPER_ADMIN', // Legacy enum role kept for backward compat/bypass
      roleId: adminRole.id, // Link to new granular role
    },
    create: {
      email: 'info@azemyazilim.com',
      username: 'azem',
      password: hash,
      firstName: 'Azem',
      lastName: 'Yazılım',
      fullName: 'Azem Yazılım',
      phone: '5555555555',
      role: 'SUPER_ADMIN',
      roleId: adminRole.id,
      isActive: true,
      tenantId: tenant.id,
    },
  });
  console.log(`✓ Admin user oluşturuldu: info@azemyazilim.com / 1212`);

  console.log('✅ Seed işlemi tamamlandı!');
}

main()
  .catch((e) => {
    console.error('Seed hatası:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

