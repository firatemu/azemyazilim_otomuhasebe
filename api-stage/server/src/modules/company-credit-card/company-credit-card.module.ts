import { PrismaModule } from '../../common/prisma.module';
import { Module } from '@nestjs/common';
import { CompanyCreditCardService } from './company-credit-card.service';
import { CompanyCreditCardController } from './company-credit-card.controller';
import { PrismaService } from '../../common/prisma.service';

@Module({
  imports: [PrismaModule],
  controllers: [CompanyCreditCardController],
  providers: [CompanyCreditCardService],
  exports: [CompanyCreditCardService],
})
export class CompanyCreditCardModule {}
