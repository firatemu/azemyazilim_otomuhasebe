import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
    const email = 'info@azemyazilim.com';
    const password = '$2b$10$wAaZDpA96a/jIAqUd10Ee.tN7edlLEtJ77YZgGSCi4XNjoVQnJU0.';

    const superAdmin = await prisma.user.findFirst({
        where: { role: 'SUPER_ADMIN' }
    });

    if (superAdmin) {
        await prisma.user.update({
            where: { id: superAdmin.id },
            data: {
                email: email,
                password: password
            }
        });
        console.log(`✅ Super Admin updated to: ${email}`);
    } else {
        console.error('❌ Super Admin not found!');
    }
}

main()
    .catch(e => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
