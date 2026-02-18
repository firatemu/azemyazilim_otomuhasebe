import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const stokId = '1db75733-34f3-4394-b13e-ca71597ea6bd'; // FREN BALATASI

    // Simulation of CostingService.calculateWeightedAverageCost logic
    // Fetch confirmed purchase lines
    const purchaseLines = await prisma.faturaKalemi.findMany({
        where: {
            stokId,
            fatura: {
                faturaTipi: 'ALIS',
                durum: 'ONAYLANDI',
                deletedAt: null,
            },
        },
        select: {
            miktar: true,
            birimFiyat: true,
            tutar: true,
            fatura: {
                select: {
                    tarih: true,
                    faturaNo: true,
                },
            },
        },
        orderBy: {
            fatura: {
                tarih: 'asc',
            },
        },
    });

    console.log('Found Purchase Lines:', JSON.stringify(purchaseLines, null, 2));

    if (purchaseLines.length > 0) {
        let qtyOnHand = 0;
        let averageCost = 0;

        for (const line of purchaseLines) {
            const qty = Number(line.miktar);
            const total = line.tutar ? Number(line.tutar) : Number(line.birimFiyat) * qty;
            const unitCost = total / qty;

            if (qtyOnHand <= 0) {
                averageCost = unitCost;
                qtyOnHand = qty;
            } else {
                const totalCost = averageCost * qtyOnHand + unitCost * qty;
                qtyOnHand += qty;
                averageCost = totalCost / qtyOnHand;
            }
        }

        console.log('Calculated Average Cost:', averageCost);
    } else {
        console.log('No purchase lines found.');
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
