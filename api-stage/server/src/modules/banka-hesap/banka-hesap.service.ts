import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateBankaHesapDto } from './dto/create-banka-hesap.dto';
import { UpdateBankaHesapDto } from './dto/update-banka-hesap.dto';
import { TenantContextService } from '../../common/services/tenant-context.service';
import { BankaHesapTipi } from '@prisma/client';

@Injectable()
export class BankaHesapService {
  constructor(
    private prisma: PrismaService,
    private tenantContext: TenantContextService,
  ) { }

  async create(createDto: CreateBankaHesapDto) {
    // Note: createDto.kasaId should be bankaId in the new schema
    return this.prisma.bankaHesabi.create({
      data: {
        bankaId: createDto.kasaId,
        hesapKodu: createDto.hesapKodu || `ACC-${Date.now()}`,
        hesapAdi: createDto.hesapAdi,
        hesapNo: createDto.hesapNo,
        iban: createDto.iban,
        hesapTipi: createDto.hesapTipi,
        aktif: createDto.aktif ?? true,
      },
    });
  }

  async findAll(kasaId?: string, hesapTipi?: string) {
    const tenantId = this.tenantContext.getTenantId();

    return this.prisma.bankaHesabi.findMany({
      where: {
        banka: {
          tenantId: tenantId,
        },
        bankaId: kasaId,
        hesapTipi: hesapTipi as BankaHesapTipi,
        aktif: true,
      },
      include: {
        banka: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const tenantId = this.tenantContext.getTenantId();
    const hesap = await this.prisma.bankaHesabi.findFirst({
      where: {
        id,
        banka: {
          tenantId: tenantId,
        },
      },
      include: {
        banka: true,
      },
    });

    if (!hesap) {
      throw new NotFoundException('Banka hesabı bulunamadı');
    }

    return hesap;
  }

  async update(id: string, updateDto: UpdateBankaHesapDto) {
    await this.findOne(id); // Ensure exists and belongs to tenant

    return this.prisma.bankaHesabi.update({
      where: { id },
      data: {
        hesapAdi: updateDto.hesapAdi,
        hesapNo: updateDto.hesapNo,
        iban: updateDto.iban,
        aktif: updateDto.aktif,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id); // Ensure exists and belongs to tenant

    return this.prisma.bankaHesabi.update({
      where: { id },
      data: { aktif: false },
    });
  }
}

