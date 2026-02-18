
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
    const email = 'info@azemyazilim.com';
    console.log(`Updating role for user: ${email}`);

    try {
        const user = await prisma.user.findFirst({
            where: { email: email },
        });

        if (!user) {
            console.log('User not found!');
            return;
        }

        const updatedUser = await prisma.user.update({
            where: { id: user.id },
            data: {
                role: 'SUPER_ADMIN',
            },
        });

        console.log(`User ${updatedUser.email} role updated to: ${updatedUser.role}`);
    } catch (e) {
        console.error('Error updating user role:', e);
    } finally {
        await prisma.$disconnect();
    }
}

main();
