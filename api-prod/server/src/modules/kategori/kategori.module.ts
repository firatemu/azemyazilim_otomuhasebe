import { Module } from '@nestjs/common';
import { KategoriService } from './kategori.service';
import { KategoriController } from './kategori.controller';
import { PrismaService } from '../../common/prisma.service';

@Module({
  controllers: [KategoriController],
  providers: [KategoriService, PrismaService],
  exports: [KategoriService],
})
export class KategoriModule {}
