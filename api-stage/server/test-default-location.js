
const { NestFactory } = require('@nestjs/core');
const { AppModule } = require('./dist/app.module');
const { WarehouseService } = require('./dist/modules/warehouse/warehouse.service');
const { PrismaService } = require('./dist/common/prisma.service');

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule, {
        logger: ['error', 'warn'],
    });

    const warehouseService = app.get(WarehouseService);
    const prisma = app.get(PrismaService);

    try {
        // 1. Get the first active warehouse
        const warehouse = await prisma.warehouse.findFirst({
            where: { active: true },
        });

        if (!warehouse) {
            console.error('No active warehouse found!');
            return;
        }

        console.log(`Testing with Warehouse: ${warehouse.name} (${warehouse.code})`);

        // 2. Call getOrCreateDefaultLocation
        const location = await warehouseService.getOrCreateDefaultLocation(warehouse.id);

        console.log('Resulting Default Location:');
        console.log(`- ID: ${location.id}`);
        console.log(`- Code: ${location.code}`);
        console.log(`- Name: ${location.name}`);

        if (location.code === `GENEL-${warehouse.code}`) {
            console.log('✅ SUCCESS: Location code matches expected format.');
        } else {
            console.error('❌ FAILURE: Location code does NOT match expected format.');
        }

    } catch (error) {
        console.error('Error during test:', error);
    } finally {
        await app.close();
    }
}

bootstrap();
