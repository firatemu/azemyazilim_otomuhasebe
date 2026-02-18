
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const tahsilat = await prisma.tahsilat.findFirst({
        orderBy: { createdAt: 'desc' },
    });
    console.log(tahsilat ? tahsilat.id : 'NO_TAHSILAT_FOUND');
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
