import { Module } from '@nestjs/common';
import { CekSenetService } from './cek-senet.service';
import { CekSenetController } from './cek-senet.controller';
import { BordroService } from './bordro.service';
import { BordroController } from './bordro.controller';
import { PrismaService } from '../../common/prisma.service';
import { ReminderTaskService } from './reminder-task.service';
import { EmailService } from '../../common/services/email.service';

@Module({
    controllers: [CekSenetController, BordroController],
    providers: [CekSenetService, BordroService, PrismaService, ReminderTaskService, EmailService],
    exports: [CekSenetService, BordroService],
})
export class CekSenetModule { }
