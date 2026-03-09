import { Module, forwardRef } from '@nestjs/common';
import { SalaryPlanService } from './salary-plan.service';
import { SalaryPlanController } from './salary-plan.controller';
import { EmployeeModule } from '../employee/employee.module';
import { TenantContextModule } from '../../common/services/tenant-context.module';

@Module({
    imports: [forwardRef(() => EmployeeModule), TenantContextModule],
    controllers: [SalaryPlanController],
    providers: [SalaryPlanService],
    exports: [SalaryPlanService],
})
export class SalaryPlanModule { }
