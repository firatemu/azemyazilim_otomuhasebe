import { PrismaClient, ModuleType } from '@prisma/client';

const prisma = new PrismaClient();

async function seedCodeTemplates() {
  console.log('🌱 Seeding Code Templates...');

  const templates = [
    {
      module: ModuleType.WAREHOUSE,
      name: 'Depo Kodu',
      prefix: 'D',
      digitCount: 3,
      currentValue: 0,
    },
    {
      module: ModuleType.CASHBOX,
      name: 'Kasa Kodu',
      prefix: 'K',
      digitCount: 3,
      currentValue: 0,
    },
    {
      module: ModuleType.PERSONNEL,
      name: 'Personel Kodu',
      prefix: 'P',
      digitCount: 4,
      currentValue: 0,
    },
    {
      module: ModuleType.PRODUCT,
      name: 'Ürün Kodu',
      prefix: 'ST',
      digitCount: 4,
      currentValue: 0,
    },
    {
      module: ModuleType.CUSTOMER,
      name: 'Cari Kodu',
      prefix: 'C',
      digitCount: 4,
      currentValue: 0,
    },
    {
      module: ModuleType.INVOICE_SALES,
      name: 'Satış Faturası No',
      prefix: 'SF',
      digitCount: 5,
      currentValue: 0,
    },
    {
      module: ModuleType.INVOICE_PURCHASE,
      name: 'Alış Faturası No',
      prefix: 'AF',
      digitCount: 5,
      currentValue: 0,
    },
    {
      module: ModuleType.ORDER_SALES,
      name: 'Satış Siparişi No',
      prefix: 'SS',
      digitCount: 5,
      currentValue: 0,
    },
    {
      module: ModuleType.ORDER_PURCHASE,
      name: 'Satın Alma Siparişi No',
      prefix: 'SA',
      digitCount: 5,
      currentValue: 0,
    },
    {
      module: ModuleType.INVENTORY_COUNT,
      name: 'Sayım No',
      prefix: 'SY',
      digitCount: 5,
      currentValue: 0,
    },
    {
      module: ModuleType.TEKLIF,
      name: 'Teklif No',
      prefix: 'TK',
      digitCount: 5,
      currentValue: 0,
    },
  ];

  for (const template of templates) {
    const existing = await prisma.codeTemplate.findUnique({
      where: { module: template.module },
    });

    if (existing) {
      console.log(`  ⏭️  ${template.name} zaten mevcut, atlanıyor...`);
      continue;
    }

    await prisma.codeTemplate.create({
      data: template,
    });

    console.log(`  ✅ ${template.name} eklendi: ${template.prefix}${String(1).padStart(template.digitCount, '0')}`);
  }

  console.log('✅ Code Templates seeding tamamlandı!\n');
}

seedCodeTemplates()
  .catch((e) => {
    console.error('❌ Seed hatası:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

