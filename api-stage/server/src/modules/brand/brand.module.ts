import { PrismaModule } from '../../common/prisma.module';
import { Module } from '@nestjs/common';
import { BrandService } from './brand.service';
import { BrandController } from './brand.controller';
import { PrismaService } from '../../common/prisma.service';

@Module({
  imports: [PrismaModule],
    controllers: [BrandController],
    providers: [BrandService],
    exports: [BrandService],
})
export class BrandModule { }
