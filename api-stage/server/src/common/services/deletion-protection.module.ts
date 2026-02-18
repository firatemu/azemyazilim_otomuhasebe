import { Module } from '@nestjs/common';
import { DeletionProtectionService } from './deletion-protection.service';

@Module({
    providers: [DeletionProtectionService],
    exports: [DeletionProtectionService],
})
export class DeletionProtectionModule { }
