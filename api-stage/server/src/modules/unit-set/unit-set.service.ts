import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { TenantResolverService } from '../../common/services/tenant-resolver.service';
import { CreateUnitSetDto, UpdateUnitSetDto } from './dto/unit-set.dto';

@Injectable()
export class UnitSetService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly tenantResolver: TenantResolverService,
    ) { }

    private mapUnitSetToDto(unitSet: any) {
        const units = (unitSet.units || []).map((u: any) => ({
            id: u.id,
            name: u.name,
            code: u.code ?? undefined,
            conversionRate: u.conversionRate != null ? Number(u.conversionRate) : undefined,
            isBaseUnit: u.isBaseUnit ?? undefined,
            createdAt: u.createdAt,
            updatedAt: u.updatedAt,
        }));

        return {
            id: unitSet.id,
            tenantId: unitSet.tenantId,
            name: unitSet.name,
            description: unitSet.description ?? undefined,
            units,
            createdAt: unitSet.createdAt,
            updatedAt: unitSet.updatedAt,
        };
    }

    async findAll() {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const sets = await this.prisma.extended.unitSet.findMany({
            where: { tenantId: tenantId ?? undefined },
            include: { units: true },
            orderBy: { createdAt: 'desc' },
        });
        return sets.map((s) => this.mapUnitSetToDto(s));
    }

    async findOne(id: string) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const unitSet = await this.prisma.extended.unitSet.findFirst({
            where: { id, tenantId: tenantId ?? undefined },
            include: { units: true },
        });

        if (!unitSet) {
            throw new NotFoundException('Unit set not found');
        }

        return this.mapUnitSetToDto(unitSet);
    }

    async create(dto: CreateUnitSetDto) {
        const tenantId = await this.tenantResolver.resolveForCreate();
        if (!tenantId) { throw new NotFoundException('Tenant not found'); }
        const { units, ...rest } = dto;

        const created = await this.prisma.extended.unitSet.create({
            data: {
                name: rest.name,
                description: rest.description,
                tenantId: tenantId,
                units: {
                    create: (units || []).map((b) => ({
                        name: b.name,
                        code: b.code,
                        conversionRate: b.conversionRate ?? 1,
                        isBaseUnit: b.isBaseUnit ?? false,
                    })),
                },
            },
            include: { units: true },
        });
        return this.mapUnitSetToDto(created);
    }

    async update(id: string, dto: UpdateUnitSetDto) {
        const tenantId = await this.tenantResolver.resolveForCreate();
        const { units, ...rest } = dto;

        await this.findOne(id);

        return this.prisma.extended.$transaction(async (tx) => {
            if (units) {
                await tx.unit.deleteMany({ where: { unitSetId: id } });
            }

            const updated = await tx.unitSet.update({
                where: { id },
                data: {
                    name: rest.name,
                    description: rest.description,
                    units: units ? {
                        create: units.map((b) => ({
                            name: b.name,
                            code: b.code,
                            conversionRate: b.conversionRate ?? 1,
                            isBaseUnit: b.isBaseUnit ?? false,
                        })),
                    } : undefined,
                },
                include: { units: true },
            });
            return this.mapUnitSetToDto(updated);
        });
    }

    async remove(id: string) {
        const tenantId = await this.tenantResolver.resolveForCreate();

        await this.findOne(id);

        return this.prisma.extended.unitSet.delete({
            where: { id },
        });
    }
}
