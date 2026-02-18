import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const stokId = '1db75733-34f3-4394-b13e-ca71597ea6bd'; // FREN BALATASI

    // Logic from CostingService.calculateWeightedAverageCost
    const stok = await prisma.stok.findUnique({
        where: { id: stokId },
        select: { id: true, marka: true, anaKategori: true, altKategori: true }
    });

    if (!stok) {
        console.error('Stok not found');
        return;
    }

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
                select: { tarih: true },
            },
        },
        orderBy: {
            fatura: { tarih: 'asc' },
        },
    });

    console.log(`Found ${purchaseLines.length} purchase lines.`);

    let averageCost = 0;
    if (purchaseLines.length > 0) {
        let qtyOnHand = 0;
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
    }

    console.log('Final Calculated Cost:', averageCost);

    // Update StockCostHistory
    await prisma.stockCostHistory.create({
        data: {
            stokId,
            cost: averageCost,
            method: 'WEIGHTED_AVERAGE',
            marka: stok.marka,
            anaKategori: stok.anaKategori,
            altKategori: stok.altKategori,
            note: 'Manual fix after race condition resolution'
        }
    });

    console.log('StockCostHistory updated.');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
