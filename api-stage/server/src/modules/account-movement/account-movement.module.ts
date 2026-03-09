import { Module } from '@nestjs/common';
import { AccountMovementController } from './account-movement.controller';
import { AccountMovementService } from './account-movement.service';
import { PrismaModule } from '../../common/prisma.module';

@Module({
    imports: [PrismaModule],
    controllers: [AccountMovementController],
    providers: [AccountMovementService],
    exports: [AccountMovementService],
})
export class AccountMovementModule { }
