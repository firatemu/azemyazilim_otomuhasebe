import { Module } from '@nestjs/common';
import { PostalCodeController } from './postal-code.controller';
import { PostalCodeService } from './postal-code.service';
import { PrismaModule } from '../../common/prisma.module';

@Module({
  controllers: [PostalCodeController],
  providers: [PostalCodeService],
  imports: [PrismaModule],
  exports: [PostalCodeService],
})
export class PostalCodeModule {
    constructor() {
      console.log('🚀 [PostalCodeModule] initialized');
    }
}
