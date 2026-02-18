import { Module } from '@nestjs/common';
import { CariHareketController } from './cari-hareket.controller';
import { CariHareketService } from './cari-hareket.service';
import { PrismaModule } from '../../common/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [CariHareketController],
  providers: [CariHareketService],
  exports: [CariHareketService],
})
export class CariHareketModule {}
