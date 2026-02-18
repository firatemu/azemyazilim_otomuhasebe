
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    try {
        // 1. Get AMR001
        const amr = await prisma.stok.findFirst({
            where: { stokKodu: 'AMR001' }
        });

        if (!amr) {
            console.log('AMR001 not found');
            return;
        }

        console.log('AMR001 Group ID:', amr.esdegerGrupId);

        // Inputs for eslestirUrunler
        const esUrunIds: string[] = [];
        const anaUrun = amr;

        // Logic from service (Simulated)
        const mevcutGrupIds = new Set<string>();
        if (anaUrun.esdegerGrupId) {
            mevcutGrupIds.add(anaUrun.esdegerGrupId);
        }

        // esUrunler loop skipped (empty)

        console.log('mevcutGrupIds size:', mevcutGrupIds.size);

        if (mevcutGrupIds.size === 0) {
            // Case: No existing group
            if (esUrunIds.length === 0) {
                console.log('LOGIC: Early exit triggered (No group -> No group)');
            } else {
                console.log('LOGIC: Create new group');
            }
        } else {
            // Case: Has existing group
            console.log('LOGIC: Using existing group');
        }

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
