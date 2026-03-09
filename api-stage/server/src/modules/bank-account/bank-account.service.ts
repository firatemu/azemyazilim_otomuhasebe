import {
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateBankAccountDto } from './dto/create-bank-account.dto';
import { UpdateBankAccountDto } from './dto/update-bank-account.dto';
import { TenantContextService } from '../../common/services/tenant-context.service';
import { BankAccountType } from '@prisma/client';

@Injectable()
export class BankAccountService {
  constructor(
    private prisma: PrismaService,
    private tenantContext: TenantContextService,
  ) { }

  async create(createDto: CreateBankAccountDto) {
    return this.prisma.extended.bankAccount.create({
      data: {
        bankId: createDto.bankId,
        code: createDto.code || `ACC-${Date.now()}`,
        name: createDto.name,
        accountNo: createDto.accountNo,
        iban: createDto.iban,
        type: createDto.type,
        isActive: createDto.isActive ?? true,
      },
    });
  }

  async findAll(bankId?: string, type?: string) {
    const tenantId = this.tenantContext.getTenantId();

    return this.prisma.extended.bankAccount.findMany({
      where: {
        bank: {
          tenantId: tenantId,
        },
        bankId: bankId,
        type: type as BankAccountType,
        isActive: true,
      },
      include: {
        bank: true,
      },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    const tenantId = this.tenantContext.getTenantId();
    const hesap = await this.prisma.extended.bankAccount.findFirst({
      where: {
        id,
        bank: {
          tenantId: tenantId,
        },
      },
      include: {
        bank: true,
      },
    });

    if (!hesap) {
      throw new NotFoundException('Bank account not found');
    }

    return hesap;
  }

  async update(id: string, updateDto: UpdateBankAccountDto) {
    await this.findOne(id);

    return this.prisma.extended.bankAccount.update({
      where: { id },
      data: {
        name: updateDto.name,
        accountNo: updateDto.accountNo,
        iban: updateDto.iban,
        isActive: updateDto.isActive,
      },
    });
  }

  async remove(id: string) {
    await this.findOne(id);

    return this.prisma.extended.bankAccount.update({
      where: { id },
      data: { isActive: false },
    });
  }
}
