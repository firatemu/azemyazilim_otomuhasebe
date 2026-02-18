import { Module } from '@nestjs/common';
import { StokHareketService } from './stok-hareket.service';
import { StokHareketController } from './stok-hareket.controller';
import { PrismaModule } from '../../common/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [StokHareketController],
  providers: [StokHareketService],
  exports: [StokHareketService],
})
export class StokHareketModule {}
