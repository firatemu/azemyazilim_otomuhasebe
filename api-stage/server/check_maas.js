
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const yil = 2026;
        const ay = 2;
        console.log(`Checking MaasPlan for ${yil}/${ay}...`);

        // Simple count first
        const count = await prisma.maasPlani.count();
        console.log(`Total MaasPlan records: ${count}`);

        // Check specific query used in service
        const planlar = await prisma.maasPlani.findMany({
            where: {
                yil,
                ay,
                aktif: true,
                durum: {
                    in: ['ODENMEDI', 'KISMI_ODENDI'],
                },
                personel: {
                    aktif: true
                }
            },
            include: {
                personel: {
                    select: {
                        id: true,
                        ad: true,
                        soyad: true,
                        personelKodu: true,
                        departman: true,
                    },
                },
            },
            orderBy: {
                personel: {
                    ad: 'asc',
                },
            },
        });

        console.log(`Found ${planlar.length} plans for ${yil}/${ay}`);

        const toplam = planlar.reduce(
            (sum, plan) => sum + Number(plan.kalanTutar),
            0,
        );
        console.log(`Total remaining: ${toplam}`);

    } catch (e) {
        console.error('Error:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
