const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

async function main() {
    const targetEmail = 'info@azemyazilim.com';

    console.log(`🔍 Finding an active tenant...`);
    const tenant = await prisma.tenant.findFirst({
        where: { status: 'ACTIVE' },
        orderBy: { createdAt: 'asc' }
    });

    if (!tenant) {
        console.log(`❌ No active tenants found in the database.`);
        return;
    }

    console.log(`✅ Found active tenant: ${tenant.name} (${tenant.id})`);

    console.log(`✨ Updating user: ${targetEmail}...`);
    const user = await prisma.user.updateMany({
        where: { email: targetEmail },
        data: { tenantId: tenant.id }
    });

    if (user.count > 0) {
        console.log(`✅ Assigned tenant ID ${tenant.id} to user ${targetEmail}.`);
    } else {
        console.log(`❌ User ${targetEmail} not found.`);
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
