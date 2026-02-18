import { PrismaClient } from '@prisma/client';
import * as dotenv from 'dotenv';
dotenv.config();

const prisma = new PrismaClient();

async function main() {
    const id = 'c26f8644-0492-43a3-bb10-acc482ac8267';
    const tenantId = 'cml9qv20d0001kszb2byc55g5';

    console.log(`Querying bank ${id} for tenant ${tenantId}...`);

    try {
        const banka = await prisma.banka.findFirst({
            where: { id, tenantId },
            include: {
                hesaplar: {
                    orderBy: { createdAt: 'desc' },
                    include: {
                        krediler: {
                            include: {
                                planlar: true
                            }
                        }
                    }
                },
            },
        });
        console.log('Success:', JSON.stringify(banka, null, 2));
    } catch (error) {
        console.error('Error Details:');
        console.error(error);
    } finally {
        await prisma.$disconnect();
    }
}

main();
