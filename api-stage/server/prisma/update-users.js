const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');

const prisma = new PrismaClient();

async function main() {
    const emailToDelete = 'admin@demo.otomuhasebe.com';

    console.log(`🗑️  Deleting user: ${emailToDelete}...`);
    const deleted = await prisma.user.deleteMany({
        where: { email: emailToDelete }
    });
    console.log(`✅ Deleted ${deleted.count} user(s).`);

    const newEmail = 'info@azemyazilim.com';
    const newPassword = '1212';
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    console.log(`✨ Upserting super admin: ${newEmail}...`);

    let user = await prisma.user.findFirst({
        where: { email: newEmail }
    });

    if (user) {
        user = await prisma.user.update({
            where: { id: user.id },
            data: {
                password: hashedPassword,
                role: 'SUPER_ADMIN',
                isActive: true,
            }
        });
        console.log(`✅ Updated existing user to super admin: ${newEmail}`);
    } else {
        user = await prisma.user.create({
            data: {
                email: newEmail,
                username: 'azemyazilim',
                password: hashedPassword,
                fullName: 'Azem Yazılım',
                firstName: 'Azem',
                lastName: 'Yazılım',
                role: 'SUPER_ADMIN',
                status: 'ACTIVE',
                isActive: true,
                tenantId: null
            }
        });
        console.log(`✨ Created new super admin: ${newEmail}`);
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
