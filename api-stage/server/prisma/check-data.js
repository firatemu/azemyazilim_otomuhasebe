const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    const models = [
        'user',
        'tenant',
        'cari',
        'arac',
        'fatura',
        'stokKarti',
        'kategori',
        'marka',
        'cekSenet',
        'bordro'
    ];

    console.log('--- Veritabanı Kayıt Sayıları ---');
    for (const model of models) {
        if (prisma[model]) {
            try {
                const count = await prisma[model].count();
                console.log(`${model}: ${count} kayıt`);
            } catch (e) {
                console.log(`${model}: Sorgulanamadı (${e.message})`);
            }
        } else {
            console.log(`${model}: Model bulunamadı`);
        }
    }
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
