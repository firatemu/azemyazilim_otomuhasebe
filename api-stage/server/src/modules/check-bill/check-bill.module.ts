import { Module } from '@nestjs/common';
import { CheckBillService } from './check-bill.service';
import { CheckBillController } from './check-bill.controller';
import { CheckBillJournalService } from './check-bill-journal.service';
import { CheckBillJournalController } from './check-bill-journal.controller';
import { ReminderTaskService } from './reminder-task.service';
import { TenantContextModule } from '../../common/services/tenant-context.module';

@Module({
    imports: [TenantContextModule],
    controllers: [CheckBillController, CheckBillJournalController],
    providers: [CheckBillService, CheckBillJournalService, ReminderTaskService],
    exports: [CheckBillService, CheckBillJournalService],
})
export class CheckBillModule { }