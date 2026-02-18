import { Module } from '@nestjs/common';
import { LicensesController } from './licenses.controller';
import { LicensesService } from './licenses.service';
import { PrismaModule } from '../../common/prisma.module';
import { LicenseModule } from '../../common/services/license.module';
import { InvitationService } from '../../common/services/invitation.service';
import { EmailService } from '../../common/services/email.service';

@Module({
  imports: [PrismaModule, LicenseModule],
  controllers: [LicensesController],
  providers: [LicensesService, InvitationService, EmailService],
  exports: [LicensesService],
})
export class LicensesModule {}


