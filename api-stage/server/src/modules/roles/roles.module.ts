import { Module } from '@nestjs/common';
import { RolesService } from './roles.service';
import { RolesController } from './roles.controller';
import { PrismaModule } from '../../common/prisma.module';
import { PermissionsModule } from '../permissions/permissions.module'; // Ensure availability

@Module({
    imports: [PrismaModule, PermissionsModule],
    controllers: [RolesController],
    providers: [RolesService],
})
export class RolesModule { }
