import { Module } from '@nestjs/common';
import { DepoService } from './depo.service';
import { DepoController } from './depo.controller';

@Module({
  controllers: [DepoController],
  providers: [DepoService],
})
export class DepoModule {}
