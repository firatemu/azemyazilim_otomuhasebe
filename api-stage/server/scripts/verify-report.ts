import { NestFactory } from '@nestjs/core';
import { AppModule } from '../src/app.module';
import { RaporlamaService } from '../src/modules/raporlama/raporlama.service';
import { ClsService } from '../src/common/services/cls.service';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const service = app.get(RaporlamaService);

    // Set tenant context
    ClsService.setTenantId('cml9qv20d0001kszb2byc55g5');

    console.log('Fetching salesperson performance...');
    try {
        const result = await service.getSalespersonPerformance({
            preset: 'thisMonth'
        } as any);

        console.log('Result:', JSON.stringify(result, null, 2));
    } catch (error) {
        console.error('Error:', error);
    } finally {
        await app.close();
    }
}

bootstrap();
