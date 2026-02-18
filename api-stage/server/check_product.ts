
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const id = '4c9ea5e0-b292-4d7a-840c-e63e00ef0411';
    try {
        const p = await prisma.stok.findUnique({
            where: { id },
            include: { esdegerGrup: true }
        });
        console.log('Product:', p);

        if (p?.esdegerGrupId) {
            const groupMembers = await prisma.stok.findMany({
                where: { esdegerGrupId: p.esdegerGrupId }
            });
            console.log('Group Members:', groupMembers.map(m => ({ id: m.id, code: m.stokKodu })));
        }
    } catch (e) {
        console.error(e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
