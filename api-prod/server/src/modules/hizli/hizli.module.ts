import { Module } from '@nestjs/common';
import { HizliController } from './hizli.controller';
import { HizliService } from './hizli.service';

@Module({
  controllers: [HizliController],
  providers: [HizliService],
  exports: [HizliService],
})
export class HizliModule {}

