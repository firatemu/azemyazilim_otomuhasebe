
import { PrismaClient } from '@prisma/client';

async function check() {
    const prisma = new PrismaClient();
    try {
        const params = await prisma.systemParameter.findMany({
            where: { key: 'NEGATIVE_BANK_BALANCE_CONTROL' }
        });
        console.log('Parameters found:', JSON.stringify(params, null, 2));

        // Check if any tenant has it set to false
        const falseParams = params.filter(p => p.value === false || p.value === 'false');
        console.log('Parameters with false value:', JSON.stringify(falseParams, null, 2));

    } catch (error) {
        console.error('Error:', error);
    } finally {
        await prisma.$disconnect();
    }
}

check();
