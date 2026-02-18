
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    try {
        const yil = 2026;
        const ay = 2;
        const tenantId = 'test-tenant'; // Mock tenant ID

        console.log(`Checking MaasPlan for ${yil}/${ay} with complex filter...`);

        // Simulate buildTenantWhereClause result for staging
        const tenantClause = {
            OR: [
                { tenantId },
                { tenantId: null },
            ],
        };

        const planlar = await prisma.maasPlani.findMany({
            where: {
                yil,
                ay,
                aktif: true,
                durum: {
                    in: ['ODENMEDI', 'KISMI_ODENDI'],
                },
                personel: {
                    ...tenantClause,
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

        console.log(`Found ${planlar.length} plans (Complex query success)`);

    } catch (e) {
        console.error('Error executing query:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
