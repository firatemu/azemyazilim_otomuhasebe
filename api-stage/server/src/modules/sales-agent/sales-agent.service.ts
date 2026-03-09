import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { TenantResolverService } from '../../common/services/tenant-resolver.service';
import { CreateSalesAgentDto } from './dto/create-sales-agent.dto';
import { UpdateSalesAgentDto } from './dto/update-sales-agent.dto';
import { buildTenantWhereClause } from '../../common/utils/staging.util';

@Injectable()
export class SalesAgentService {
    constructor(
        private prisma: PrismaService,
        private tenantResolver: TenantResolverService,
    ) { }

    async create(createDto: CreateSalesAgentDto, userId?: string) {
        const tenantId = await this.tenantResolver.resolveForCreate({ userId });

        return this.prisma.extended.salesAgent.create({
            data: {
                fullName: createDto.fullName,
                phone: createDto.telefon,
                email: createDto.email,
                isActive: createDto.isActive ?? true,
                tenantId,
            },
        });
    }

    async findAll() {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const list = await this.prisma.extended.salesAgent.findMany({
            where: buildTenantWhereClause(tenantId ?? undefined),
            orderBy: { fullName: 'asc' },
        });
        return list.map((s) => ({
            id: s.id,
            fullName: s.fullName,
            telefon: s.phone ?? undefined,
            email: s.email ?? undefined,
            isActive: s.isActive,
            tenantId: s.tenantId ?? undefined,
            createdAt: s.createdAt,
            updatedAt: s.updatedAt,
        }));
    }

    async findOne(id: string) {
        const item = await this.prisma.extended.salesAgent.findUnique({
            where: { id },
        });
        if (!item) throw new NotFoundException('Sales agent not found');
        return {
            id: item.id,
            fullName: item.fullName,
            telefon: item.phone ?? undefined,
            email: item.email ?? undefined,
            isActive: item.isActive,
            tenantId: item.tenantId ?? undefined,
            createdAt: item.createdAt,
            updatedAt: item.updatedAt,
        };
    }

    async update(id: string, updateDto: UpdateSalesAgentDto) {
        await this.findOne(id);
        return this.prisma.extended.salesAgent.update({
            where: { id },
            data: {
                fullName: updateDto.fullName,
                phone: updateDto.telefon,
                email: updateDto.email,
                isActive: updateDto.isActive,
            },
        });
    }

    async remove(id: string) {
        await this.findOne(id);
        return this.prisma.extended.salesAgent.delete({
            where: { id },
        });
    }
}
