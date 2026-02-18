import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const fatura = await prisma.fatura.findFirst({
        where: { faturaNo: 'AF-2026-001' },
        include: {
            kalemler: {
                include: {
                    stok: true
                }
            }
        }
    });

    console.log(JSON.stringify(fatura, null, 2));
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
