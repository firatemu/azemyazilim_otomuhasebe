
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const stokKodu = 'ST0002';
    console.log(`Searching for Stok: ${stokKodu}`);

    const stok = await prisma.stok.findFirst({
        where: { stokKodu: stokKodu },
    });

    if (!stok) {
        console.log('Stok not found!');
        return;
    }

    console.log('Stok Found:', JSON.stringify(stok, null, 2));

    console.log(`Searching for StokHareket for StokId: ${stok.id}`);
    const hareketler = await prisma.stokHareket.findMany({
        where: { stokId: stok.id },
    });
    console.log(`Found ${hareketler.length} stok hareketleri:`, JSON.stringify(hareketler, null, 2));

    console.log(`Searching for FaturaKalemi for StokId: ${stok.id}`);
    const faturaKalemleri = await prisma.faturaKalemi.findMany({
        where: { stokId: stok.id },
        include: {
            fatura: true
        }
    });

    console.log(`Found ${faturaKalemleri.length} fatura kalemleri`);
    faturaKalemleri.forEach(k => {
        console.log(`- Fatura: ${k.fatura.faturaNo}, Tipi: ${k.fatura.faturaTipi}, Durum: ${k.fatura.durum}, Tarih: ${k.fatura.createdAt}`);
    });
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
