import { Module } from '@nestjs/common';
import { MasrafService } from './masraf.service';
import { MasrafController } from './masraf.controller';

@Module({
  controllers: [MasrafController],
  providers: [MasrafService],
})
export class MasrafModule {}
