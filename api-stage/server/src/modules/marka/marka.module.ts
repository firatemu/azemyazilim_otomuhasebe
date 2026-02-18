import { Module } from '@nestjs/common';
import { MarkaService } from './marka.service';
import { MarkaController } from './marka.controller';
import { PrismaService } from '../../common/prisma.service';

@Module({
  controllers: [MarkaController],
  providers: [MarkaService, PrismaService],
  exports: [MarkaService],
})
export class MarkaModule {}
