import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateVehicleExpenseDto } from './dto/create-vehicle-expense.dto';
import { UpdateVehicleExpenseDto } from './dto/update-vehicle-expense.dto';
import { TenantResolverService } from '../../common/services/tenant-resolver.service';

@Injectable()
export class VehicleExpensesService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly tenantResolver: TenantResolverService,
    ) { }

    async create(createDto: CreateVehicleExpenseDto) {
        const tenantId = await this.tenantResolver.resolveForCreate();

        // Check if vehicle exists and belongs to tenant
        const vehicle = await this.prisma.extended.extended.companyVehicle.findFirst({
            where: { id: createDto.vehicleId, tenantId },
        });

        if (!vehicle) {
            throw new NotFoundException(`Arac id ${createDto.vehicleId} ile bulunamadi`);
        }

        const { date, ...rest } = createDto;

        return this.prisma.extended.extended.vehicleExpense.create({
            data: {
                ...rest,
                date: date ? new Date(date) : new Date(),
                tenantId,
            },
        });
    }

    async findAll() {
        const tenantId = await this.tenantResolver.resolveForQuery();
        return this.prisma.extended.extended.vehicleExpense.findMany({
            where: { tenantId, deletedAt: null },
            include: {
                vehicle: true,
            },
            orderBy: {
                date: 'desc',
            },
        });
    }

    async findByVehicle(vehicleId: string) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        return this.prisma.extended.extended.vehicleExpense.findMany({
            where: { vehicleId, tenantId, deletedAt: null },
            orderBy: {
                date: 'desc',
            },
        });
    }

    async findOne(id: string) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const expense = await this.prisma.extended.extended.vehicleExpense.findFirst({
            where: { id, tenantId, deletedAt: null },
            include: {
                vehicle: true,
            },
        });

        if (!expense) {
            throw new NotFoundException(`Masraf id ${id} ile bulunamadi`);
        }

        return expense;
    }

    async update(id: string, updateDto: UpdateVehicleExpenseDto) {
        await this.findOne(id); // Ensure it exists and belongs to tenant

        const { date, ...rest } = updateDto;

        return this.prisma.extended.extended.vehicleExpense.update({
            where: { id },
            data: {
                ...rest,
                date: date ? new Date(date) : undefined,
            },
        });
    }

    async remove(id: string) {
        await this.findOne(id);

        return this.prisma.extended.extended.vehicleExpense.update({
            where: { id },
            data: { deletedAt: new Date() }
        });
    }
}
