import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import * as dotenv from 'dotenv';

dotenv.config();

// Ensure DATABASE_URL is set
if (!process.env.DATABASE_URL) {
  process.env.DATABASE_URL = 'postgresql://postgres:IKYYJ1R8fUZ3PItqxf6qel12VNbLYiOe@localhost:5432/otomuhasebe_stage';
}

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});

async function main() {
  console.log('🌱 Seeding SaaS data...');

  // 1. Planlar oluştur
  const plans = [
    {
      name: 'Trial',
      slug: 'trial',
      description: '14 gün ücretsiz deneme',
      price: 0.0,
      currency: 'TRY',
      billingPeriod: 'MONTHLY',
      trialDays: 14,
      baseUserLimit: 1,
      isBasePlan: true,
      features: {
        maxUsers: 1,
        maxInvoices: 50,
        support: 'email',
      },
      limits: {
        maxUsers: 1,
        maxInvoices: 50,
        storage: '500MB',
      },
      isActive: true,
      isPopular: false,
    },
    {
      name: 'Basic',
      slug: 'basic',
      description: 'Temel özellikler, küçük işletmeler için - 1 kullanıcı, 1 yıl',
      price: 2870.0,
      currency: 'TRY',
      billingPeriod: 'YEARLY',
      trialDays: 0,
      baseUserLimit: 1,
      isBasePlan: true,
      features: {
        maxUsers: 1,
        maxInvoices: 100,
        support: 'email',
      },
      limits: {
        maxUsers: 1,
        maxInvoices: 100,
        storage: '1GB',
      },
      isActive: true,
      isPopular: false,
    },
    {
      name: 'Professional',
      slug: 'professional',
      description: 'Gelişmiş özellikler, orta ölçekli işletmeler için - 1 kullanıcı, 1 yıl',
      price: 5750.0,
      currency: 'TRY',
      billingPeriod: 'YEARLY',
      trialDays: 0,
      baseUserLimit: 1,
      isBasePlan: true,
      features: {
        maxUsers: 1,
        maxInvoices: 1000,
        support: 'priority',
        advancedReports: true,
      },
      limits: {
        maxUsers: 1,
        maxInvoices: 1000,
        storage: '10GB',
      },
      isActive: true,
      isPopular: true,
    },
    {
      name: 'Enterprise',
      slug: 'enterprise',
      description: 'Tüm özellikler, büyük işletmeler için - 1 kullanıcı, 1 yıl',
      price: 0.0, // Özel fiyat
      currency: 'TRY',
      billingPeriod: 'YEARLY',
      trialDays: 0,
      baseUserLimit: 1,
      isBasePlan: true,
      features: {
        maxUsers: 1,
        maxInvoices: -1, // Unlimited
        support: 'dedicated',
        advancedReports: true,
        apiAccess: true,
        customIntegration: true,
      },
      limits: {
        maxUsers: 1,
        maxInvoices: -1,
        storage: 'unlimited',
      },
      isActive: true,
      isPopular: false,
    },
  ];

  for (const planData of plans) {
    const plan = await prisma.plan.upsert({
      where: { slug: planData.slug },
      update: {
        name: planData.name,
        description: planData.description,
        price: planData.price,
        currency: planData.currency,
        billingPeriod: planData.billingPeriod as any,
        trialDays: planData.trialDays,
        baseUserLimit: planData.baseUserLimit,
        isBasePlan: planData.isBasePlan,
        features: planData.features as any,
        limits: planData.limits as any,
        isActive: planData.isActive,
        isPopular: planData.isPopular,
      },
      create: {
        name: planData.name,
        slug: planData.slug,
        description: planData.description,
        price: planData.price,
        currency: planData.currency,
        billingPeriod: planData.billingPeriod as any,
        trialDays: planData.trialDays,
        baseUserLimit: planData.baseUserLimit,
        isBasePlan: planData.isBasePlan,
        features: planData.features as any,
        limits: planData.limits as any,
        isActive: planData.isActive,
        isPopular: planData.isPopular,
      },
    });
    console.log(`✅ Plan created/updated: ${plan.name}`);
  }

  // 2. Modüller oluştur (Ek Kullanıcı, Depo Modülü, vb.)
  const modules = [
    {
      name: 'Ek Kullanıcı',
      slug: 'additional-user',
      description: 'Ek kullanıcı lisansı - Her ek kullanıcı için yıllık',
      price: 1435.0, // 1 kullanıcı için yıllık fiyat
      currency: 'TRY',
      isActive: true,
    },
    {
      name: 'Depo Yönetimi Modülü',
      slug: 'warehouse-module',
      description: 'Gelişmiş depo yönetimi özellikleri',
      price: 2870.0,
      currency: 'TRY',
      isActive: true,
    },
    {
      name: 'Gelişmiş Raporlama Modülü',
      slug: 'advanced-reporting',
      description: 'Gelişmiş raporlama ve analiz özellikleri',
      price: 1435.0,
      currency: 'TRY',
      isActive: true,
    },
  ];

  for (const moduleData of modules) {
    const module = await prisma.module.upsert({
      where: { slug: moduleData.slug },
      update: {
        name: moduleData.name,
        description: moduleData.description,
        price: moduleData.price,
        currency: moduleData.currency,
        isActive: moduleData.isActive,
      },
      create: {
        name: moduleData.name,
        slug: moduleData.slug,
        description: moduleData.description,
        price: moduleData.price,
        currency: moduleData.currency,
        isActive: moduleData.isActive,
      },
    });
    console.log(`✅ Module created/updated: ${module.name}`);
  }

  // 3. Demo Tenant oluştur
  const demoTenant = await prisma.tenant.upsert({
    where: { subdomain: 'demo' },
    update: {},
    create: {
      name: 'Demo Şirket',
      subdomain: 'demo',
      domain: 'demo.otomuhasebe.com',
      status: 'TRIAL',
      settings: {
        create: {
          companyName: 'Demo Şirket A.Ş.',
          taxNumber: '1234567890',
          address: 'İstanbul, Türkiye',
          timezone: 'Europe/Istanbul',
          locale: 'tr-TR',
          currency: 'TRY',
        },
      },
    },
  });
  console.log(`✅ Demo tenant created: ${demoTenant.name}`);

  // 3. Demo Tenant için Professional plan subscription
  const professionalPlan = await prisma.plan.findUnique({
    where: { slug: 'professional' },
  });

  if (professionalPlan) {
    const trialEnd = new Date();
    trialEnd.setDate(trialEnd.getDate() + 14);

    const subscription = await prisma.subscription.upsert({
      where: { tenantId: demoTenant.id },
      update: {},
      create: {
        tenantId: demoTenant.id,
        planId: professionalPlan.id,
        status: 'TRIAL',
        startDate: new Date(),
        endDate: trialEnd,
        trialEndsAt: trialEnd,
        autoRenew: true,
      },
    });
    console.log(`✅ Subscription created for demo tenant`);
  }

  // 4. Demo Admin User oluştur
  const hashedPassword = await bcrypt.hash('Admin123!', 10);
  const existingDemoAdmin = await prisma.user.findFirst({
    where: { email: 'admin@demo.otomuhasebe.com' },
  });
  
  const demoAdmin = existingDemoAdmin || await prisma.user.create({
    data: {
      email: 'admin@demo.otomuhasebe.com',
      username: 'demo-admin',
      password: hashedPassword,
      fullName: 'Demo Admin',
      firstName: 'Demo',
      lastName: 'Admin',
      role: 'TENANT_ADMIN',
      status: 'ACTIVE',
      isActive: true,
      tenantId: demoTenant.id,
    },
  });
  console.log(`✅ Demo admin user created: ${demoAdmin.email}`);

  // 5. Super Admin User (tenant olmadan)
  const existingSuperAdmin = await prisma.user.findFirst({
    where: { email: 'superadmin@otomuhasebe.com' },
  });
  
  const superAdmin = existingSuperAdmin || await prisma.user.create({
    data: {
      email: 'superadmin@otomuhasebe.com',
      username: 'superadmin',
      password: hashedPassword,
      fullName: 'Super Admin',
      firstName: 'Super',
      lastName: 'Admin',
      role: 'SUPER_ADMIN',
      status: 'ACTIVE',
      isActive: true,
      tenantId: null,
    },
  });
  console.log(`✅ Super admin user created: ${superAdmin.email}`);

  console.log('🎉 Seeding completed!');
  console.log('');
  console.log('📝 Demo Login Bilgileri:');
  console.log('   Email: admin@demo.otomuhasebe.com');
  console.log('   Username: demo-admin');
  console.log('   Password: Admin123!');
  console.log('');
  console.log('📝 Super Admin Bilgileri:');
  console.log('   Email: superadmin@otomuhasebe.com');
  console.log('   Username: superadmin');
  console.log('   Password: Admin123!');
}

main()
  .catch((e) => {
    console.error('❌ Seeding error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

