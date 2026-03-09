import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const modules = [
    'users',
    'roles',
    'permissions',
    'invoices',
    'cari',
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

const MODULE_LABELS: Record<string, string> = {
    users: 'Kullanıcılar',
    roles: 'Roller & İzinler',
    permissions: 'Sistem İzinleri',
    invoices: 'Faturalar',
    cari: 'Cari Yönetimi',
    products: 'Stok Yönetimi',
    expenses: 'Masraf / Giderler',
    reports: 'Raporlama',
    settings: 'Ayarlar',
    work_orders: 'İş Emirleri',
    vehicles: 'Araçlar',
    technicians: 'Teknisyenler',
    procurement: 'Satın Alma',
    finance: 'Finans Yönetimi',
    collecting: 'Tahsilat',
    payments: 'Ödeme',
};

const ACTION_LABELS: Record<string, string> = {
    view: 'Görüntüleme',
    list: 'Listeleme',
    create: 'Yeni Kayıt',
    update: 'Düzenleme',
    delete: 'Silme',
    export: 'Dışa Aktar',
    import: 'İçe Aktar',
    approve: 'Onaylama',
    cancel: 'İptal Etme',
    print: 'Yazdırma',
};

interface PermData {
    module: string;
    action: string;
    description: string;
}

async function main() {
    console.log('🌱 Seeding permissions...');

    const permissions: PermData[] = [];
    for (const module of modules) {
        for (const action of actions) {
            permissions.push({
                module,
                action,
                description: `${MODULE_LABELS[module] || module} - ${ACTION_LABELS[action] || action}`,
            });
        }
    }

    let count = 0;
    for (const perm of permissions) {
        await prisma.permission.upsert({
            where: {
                module_action: {
                    module: perm.module,
                    action: perm.action,
                },
            },
            update: {
                description: perm.description,
            },
            create: {
                module: perm.module,
                action: perm.action,
                description: perm.description,
            },
        });
        count++;
    }

    console.log(`✅ Seeded ${count} permissions.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
