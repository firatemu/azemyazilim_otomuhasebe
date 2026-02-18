import { Module } from '@nestjs/common';
import { TechnicalDiagnosisService } from './services/technical-diagnosis.service';
import { SolutionPackageService } from './services/solution-package.service';
import { ManagerApprovalService } from './services/manager-approval.service';
import { ServiceWorkflowController } from './service-workflow.controller';
import { PrismaModule } from '../../common/prisma.module';
import { TenantContextModule } from '../../common/services/tenant-context.module';

@Module({
  imports: [PrismaModule, TenantContextModule],
  controllers: [ServiceWorkflowController],
  providers: [
    TechnicalDiagnosisService,
    SolutionPackageService,
    ManagerApprovalService,
  ],
  exports: [
    TechnicalDiagnosisService,
    SolutionPackageService,
    ManagerApprovalService,
  ],
})
export class ServiceWorkflowModule {}

