import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { PrismaService } from '../../common/prisma.service';
import { TenantContextService } from '../../common/services/tenant-context.service';
import { Logger } from '@nestjs/common';
import * as bcrypt from 'bcrypt';

async function bootstrap() {
    const logger = new Logger('Seeder');
    const app = await NestFactory.createApplicationContext(AppModule);

    const prisma = app.get(PrismaService);
    const tenantContext = app.get(TenantContextService);

    // Parse args
    const args = process.argv.slice(2);
    const nameArg = args.find(a => a.startsWith('--name='));
    const emailArg = args.find(a => a.startsWith('--email='));

    if (!nameArg || !emailArg) {
        logger.error('Usage: npm run seed:tenant -- --name="Company Name" --email="admin@company.com"');
        await app.close();
        process.exit(1);
    }

    const name = nameArg.split('=')[1];
    const email = emailArg.split('=')[1];

    logger.log(`🌱 Seeding Tenant: ${name} (${email})`);

    try {
        // Run as System to bypass tenant guards during creation
        await tenantContext.runAsSystem(async () => {

            // 1. Create Tenant
            const tenant = await prisma.tenant.create({
                data: {
                    name,
                    subdomain: name.toLowerCase().replace(/[^a-z0-9]/g, '-'), // Better slugify
                    status: 'ACTIVE',
                },
            });
            logger.log(`✅ Tenant Created: ${tenant.id}`);

            // 2. Create Admin User
            const password = await bcrypt.hash('123456', 10);
            const user = await prisma.user.create({
                data: {
                    tenantId: tenant.id,
                    email,
                    username: email,
                    fullName: 'Admin User',
                    password,
                    role: 'ADMIN',
                    isActive: true,
                    isVerified: true,
                } as any,
            });
            logger.log(`✅ Admin User Created: ${user.id} (Pass: 123456)`);

            // 3. Create Default Warehouse
            await prisma.warehouse.create({
                data: {
                    tenantId: tenant.id,
                    code: 'WH001',
                    name: 'Merkez Depo',
                    isDefault: true,
                    address: 'Merkez',
                },
            });
            logger.log(`✅ Default Warehouse Created`);

            // 4. Create Code Templates
            const templates = [
                { module: 'INVOICE', prefix: 'FAT', digitCount: 6 },
                { module: 'CUSTOMER', prefix: 'CUSTOMER', digitCount: 5 },
                { module: 'STOCK', prefix: 'STK', digitCount: 5 },
            ];

            for (const t of templates) {
                await prisma.codeTemplate.create({
                    data: {
                        tenantId: tenant.id,
                        module: t.module as any,
                        name: `${t.module} Şablon`,
                        prefix: t.prefix,
                        digitCount: t.digitCount,
                        currentValue: 0,
                        includeYear: true,
                        isActive: true,
                    } as any,
                });
            }
            logger.log(`✅ Code Templates Created`);

        });

        logger.log('🎉 Seeding Completed Successfully!');
    } catch (error) {
        logger.error('❌ Seeding Failed:', error);
    } finally {
        await app.close();
    }
}

bootstrap();
