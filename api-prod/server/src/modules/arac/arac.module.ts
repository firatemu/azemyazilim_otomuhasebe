import { Module } from '@nestjs/common';
import { AracService } from './arac.service';
import { AracController } from './arac.controller';
import { PrismaService } from '../../common/prisma.service';

@Module({
  controllers: [AracController],
  providers: [AracService, PrismaService],
  exports: [AracService],
})
export class AracModule {}
