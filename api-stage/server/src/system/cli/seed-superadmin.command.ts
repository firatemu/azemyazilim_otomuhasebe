import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { PrismaService } from '../../common/prisma.service';
import { Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UserRole } from '../../common/enums/user-role.enum';

async function bootstrap() {
    const logger = new Logger('SeedSuperAdmin');
    const app = await NestFactory.createApplicationContext(AppModule);
    const prisma = app.get(PrismaService); // RAW client (no extension applied yet)

    try {
        const args = process.argv.slice(2);
        const reset = args.includes('--reset');

        // 1. SAFETY CHECK
        if (process.env.NODE_ENV === 'production' && process.env.APP_ENV !== 'staging') {
            if (reset) {
                logger.error('🚨 CRITICAL SAFETY LOCK: Cannot reset database in PRODUCTION!');
                process.exit(1);
            }
        }

        // 2. Database Wipe (Optional)
        if (reset) {
            logger.warn('⚠️  RESETTING DATABASE (NUCLEAR WIPE)...');

            const tablenames = await prisma.$queryRaw<Array<{ tablename: string }>>`SELECT tablename FROM pg_tables WHERE schemaname='public'`;

            const tables = tablenames
                .map(({ tablename }) => tablename)
                .filter((name) => name !== '_prisma_migrations')
                .map((name) => `"public"."${name}"`)
                .join(', ');

            if (tables.length > 0) {
                try {
                    await prisma.$executeRawUnsafe(`TRUNCATE TABLE ${tables} CASCADE;`);
                    logger.log('✅ Database wiped successfully (TRUNCATE CASCADE).');
                } catch (error) {
                    logger.error(`Failed to truncate: ${error.message}`);
                    process.exit(1);
                }
            }
        }

        // 3. Create Default Tenant (Staging Host)
        logger.log('... Creating Default Tenant (Staging)');
        const defaultTenant = await prisma.tenant.upsert({
            where: { subdomain: 'staging' },
            update: {},
            create: {
                name: 'Azem Yazılım Staging',
                subdomain: 'staging',
                status: 'ACTIVE', // Using string literal which matches enum
                // type: 'CORPORATE' // Optional if default is CORPORATE
            },
        });
        logger.log(`✓ Default Tenant Created: ${defaultTenant.id}`);

        // 4. Create/Update SuperAdmin
        const email = 'info@azemyazilim.com';
        const password = '1212';
        const hashedPassword = await bcrypt.hash(password, 10);

        const existingSuperAdmin = await prisma.user.findFirst({
            where: { email },
        });

        if (existingSuperAdmin) {
            logger.log('⚠️  SuperAdmin already exists. Updating password and linking to tenant...');
            await prisma.user.update({
                where: { id: existingSuperAdmin.id },
                data: {
                    password: hashedPassword,
                    role: 'SUPER_ADMIN',
                    isActive: true,
                    tenantId: defaultTenant.id, // Linking to the new tenant
                    fullName: 'Azem Super Admin',
                },
            });
            logger.log(`✅ SuperAdmin Updated: ${existingSuperAdmin.id} (Linked to Tenant: ${defaultTenant.id})`);
        } else {
            const user = await prisma.user.create({
                data: {
                    email,
                    username: 'info', // Changed to 'info' to match email prefix or keep 'superadmin' but user snippet didn't specify. I'll use 'info' or keep 'superadmin'. User snippet creates "fullName: 'Azem Super Admin'". I will follow that.
                    fullName: 'Azem Super Admin',
                    password: hashedPassword,
                    role: 'SUPER_ADMIN',
                    isActive: true,
                    firstName: 'Azem',
                    lastName: 'Super Admin',
                    tenantId: defaultTenant.id, // Linked to the new tenant
                },
            });
            logger.log(`✅ SuperAdmin Created: ${user.id} (Email: ${email}, Tenant: ${defaultTenant.id})`);
        }

    } catch (error) {
        logger.error(`❌ Seeding failed: ${error.message}`, error.stack);
        process.exit(1);
    } finally {
        await app.close();
    }
}

bootstrap();
