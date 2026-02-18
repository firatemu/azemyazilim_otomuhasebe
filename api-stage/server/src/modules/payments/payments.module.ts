import { Module } from '@nestjs/common';
import { PaymentsController } from './payments.controller';
import { PaymentsService } from './payments.service';
import { PrismaModule } from '../../common/prisma.module';
import { SubscriptionsModule } from '../subscriptions/subscriptions.module';
import { IyzicoService } from './iyzico/iyzico.service';

@Module({
  imports: [PrismaModule, SubscriptionsModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, IyzicoService],
  exports: [PaymentsService, IyzicoService],
})
export class PaymentsModule {}

