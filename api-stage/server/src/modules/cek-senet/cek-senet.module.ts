import { Module } from '@nestjs/common';
import { CekSenetService } from './cek-senet.service';
import { CekSenetController } from './cek-senet.controller';
import { BordroService } from './bordro.service';
import { BordroController } from './bordro.controller';
import { ReminderTaskService } from './reminder-task.service';
import { EmailService } from '../../common/services/email.service';
import { TenantContextModule } from '../../common/services/tenant-context.module';

@Module({
    imports: [TenantContextModule],
    controllers: [CekSenetController, BordroController],
    providers: [CekSenetService, BordroService, ReminderTaskService, EmailService],
    exports: [CekSenetService, BordroService],
})
export class CekSenetModule { }
