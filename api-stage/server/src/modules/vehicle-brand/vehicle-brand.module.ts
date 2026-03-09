import { PrismaModule } from '../../common/prisma.module';
import { Module } from '@nestjs/common';
import { VehicleBrandService } from './vehicle-brand.service';
import { VehicleBrandController } from './vehicle-brand.controller';
import { PrismaService } from '../../common/prisma.service';

@Module({
  imports: [PrismaModule],
  controllers: [VehicleBrandController],
  providers: [VehicleBrandService],
  exports: [VehicleBrandService],
})
export class VehicleBrandModule { }
