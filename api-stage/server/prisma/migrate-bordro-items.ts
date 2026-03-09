import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    console.log('Starting BordroItem migration...');

    const cekSenetler = await prisma.cekSenet.findMany({
        where: {
            sonBordroId: { not: null },
        },
        select: {
            id: true,
            sonBordroId: true,
            tenantId: true,
        },
    });

    console.log(`Found ${cekSenetler.length} CekSenet records with sonBordroId.`);

    let createdCount = 0;
    for (const cek of cekSenetler) {
        if (!cek.sonBordroId) continue;

        const existing = await prisma.bordroItem.findFirst({
            where: {
                bordroId: cek.sonBordroId,
                cekSenetId: cek.id,
            },
        });

        if (!existing) {
            await prisma.bordroItem.create({
                data: {
                    bordroId: cek.sonBordroId,
                    cekSenetId: cek.id,
                    tenantId: cek.tenantId,
                },
            });
            createdCount++;
        }
    }

    console.log(`Migration completed. Created ${createdCount} BordroItem records.`);
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
