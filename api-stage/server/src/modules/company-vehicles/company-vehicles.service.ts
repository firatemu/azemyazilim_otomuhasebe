import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateCompanyVehicleDto } from './dto/create-company-vehicle.dto';
import { UpdateCompanyVehicleDto } from './dto/update-company-vehicle.dto';
import { TenantResolverService } from '../../common/services/tenant-resolver.service';

@Injectable()
export class CompanyVehiclesService {
    constructor(
        private readonly prisma: PrismaService,
        private readonly tenantResolver: TenantResolverService,
    ) { }

    async create(createDto: CreateCompanyVehicleDto) {
        const tenantId = await this.tenantResolver.resolveForCreate();
        const { registrationDate, ...rest } = createDto;

        return this.prisma.extended.extended.companyVehicle.create({
            data: {
                ...rest,
                registrationDate: registrationDate ? new Date(registrationDate) : undefined,
                tenantId,
            },
        });
    }

    async findAll() {
        const tenantId = await this.tenantResolver.resolveForQuery();
        return this.prisma.extended.extended.companyVehicle.findMany({
            where: { tenantId, deletedAt: null },
            include: {
                assignedEmployee: {
                    select: {
                        id: true,
                        firstName: true,
                        lastName: true
                    }
                },
                expenses: {
                    orderBy: { date: 'desc' },
                },
            },
        });
    }

    async findOne(id: string) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const vehicle = await this.prisma.extended.extended.companyVehicle.findFirst({
            where: { id, tenantId, deletedAt: null },
            include: {
                assignedEmployee: true,
                expenses: {
                    orderBy: { date: 'desc' },
                },
            },
        });

        if (!vehicle) {
            throw new NotFoundException(`Arac id ${id} ile bulunamadi`);
        }

        return vehicle;
    }

    async update(id: string, updateDto: UpdateCompanyVehicleDto) {
        await this.findOne(id); // Ensure it exists and belongs to the tenant

        const { registrationDate, ...rest } = updateDto;

        return this.prisma.extended.extended.companyVehicle.update({
            where: { id },
            data: {
                ...rest,
                registrationDate: registrationDate ? new Date(registrationDate) : undefined,
            },
        });
    }

    async remove(id: string) {
        await this.findOne(id);

        return this.prisma.extended.extended.companyVehicle.update({
            where: { id },
            data: { deletedAt: new Date() }
        });
    }
}
