import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { TenantResolverService } from '../../common/services/tenant-resolver.service';
import { CreateSatisElemaniDto } from './dto/create-satis-elemani.dto';
import { UpdateSatisElemaniDto } from './dto/update-satis-elemani.dto';
import { buildTenantWhereClause } from '../../common/utils/staging.util';

@Injectable()
export class SatisElemaniService {
    constructor(
        private prisma: PrismaService,
        private tenantResolver: TenantResolverService,
    ) { }

    async create(createDto: CreateSatisElemaniDto, userId?: string) {
        const tenantId = await this.tenantResolver.resolveForCreate({ userId });

        return this.prisma.satisElemani.create({
            data: {
                ...createDto,
                tenantId,
            },
        });
    }

    async findAll() {
        const tenantId = await this.tenantResolver.resolveForQuery();
        return this.prisma.satisElemani.findMany({
            where: buildTenantWhereClause(tenantId ?? undefined),
            orderBy: { adSoyad: 'asc' },
        });
    }

    async findOne(id: string) {
        const item = await this.prisma.satisElemani.findUnique({
            where: { id },
        });
        if (!item) throw new NotFoundException('Satış elemanı bulunamadı');
        return item;
    }

    async update(id: string, updateDto: UpdateSatisElemaniDto) {
        await this.findOne(id);
        return this.prisma.satisElemani.update({
            where: { id },
            data: updateDto,
        });
    }

    async remove(id: string) {
        await this.findOne(id);
        return this.prisma.satisElemani.delete({
            where: { id },
        });
    }
}
