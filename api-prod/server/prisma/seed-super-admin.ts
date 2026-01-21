import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcrypt';
import { v4 as uuidv4 } from 'uuid';

const prisma = new PrismaClient();

async function main() {
    const email = 'info@azemyazilim.com';
    const password = '1212';
    const hashedPassword = await bcrypt.hash(password, 10);

    const userData = {
        email: email,
        username: 'azemyazilim',
        password: hashedPassword,
        fullName: 'Azem Yazılım Super Admin',
        firstName: 'Azem',
        lastName: 'Yazılım',
        role: 'SUPER_ADMIN' as any,
        status: 'ACTIVE' as any,
        isActive: true,
        tenantId: null as any,
        emailVerified: true,
        tokenVersion: 0,
    };

    const user = await prisma.user.upsert({
        where: {
            email_tenantId: {
                email: email,
                tenantId: null as any,
            },
        },
        update: {
            password: hashedPassword,
            role: 'SUPER_ADMIN' as any,
            status: 'ACTIVE' as any,
            isActive: true,
        },
        create: {
            ...userData,
            uuid: uuidv4(),
        },
    });

    console.log(`✅ Super Admin created/updated: ${user.email}`);
    console.log(`Password: ${password}`);
}

main()
    .catch((e) => {
        console.error('❌ Seeding error:', e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
