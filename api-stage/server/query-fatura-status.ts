import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const fatura = await prisma.fatura.findFirst({
        where: { faturaNo: 'AF-2026-001' },
        select: {
            id: true,
            faturaNo: true,
            durum: true,
            faturaTipi: true,
            tenantId: true
        }
    });

    console.log('Invoice Details:', JSON.stringify(fatura, null, 2));

    if (fatura) {
        const param = await prisma.systemParameter.findFirst({
            where: {
                tenantId: fatura.tenantId,
                key: 'AUTO_COSTING_ON_PURCHASE_INVOICE'
            }
        });
        console.log('Parameter Value:', JSON.stringify(param, null, 2));
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
