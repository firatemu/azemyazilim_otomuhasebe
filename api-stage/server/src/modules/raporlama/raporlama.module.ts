import { Module } from '@nestjs/common';
import { RaporlamaController } from './raporlama.controller';
import { RaporlamaService } from './raporlama.service';
import { PrismaModule } from '../../common/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [RaporlamaController],
  providers: [RaporlamaService],
})
export class RaporlamaModule {}
