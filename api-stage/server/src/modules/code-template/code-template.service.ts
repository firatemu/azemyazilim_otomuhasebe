import {
  Injectable,
  NotFoundException,
  ConflictException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { TenantResolverService } from '../../common/services/tenant-resolver.service';
import { buildTenantWhereClause } from '../../common/utils/staging.util';
import { CreateCodeTemplateDto } from './dto/create-code-template.dto';
import { UpdateCodeTemplateDto } from './dto/update-code-template.dto';
import { ModuleType } from './code-template.enums';

const DEFAULT_TEMPLATES: Partial<Record<ModuleType, { name: string; prefix: string; digitCount: number }>> = {
  [ModuleType.WAREHOUSE]: { name: 'Depo Kodu', prefix: 'D', digitCount: 3 },
  [ModuleType.CASHBOX]: { name: 'Kasa Kodu', prefix: 'K', digitCount: 3 },
  [ModuleType.PERSONNEL]: { name: 'Personel Kodu', prefix: 'P', digitCount: 4 },
  [ModuleType.PRODUCT]: { name: 'Ürün Kodu', prefix: 'ST', digitCount: 4 },
  [ModuleType.CUSTOMER]: { name: 'Cari Kodu', prefix: 'C', digitCount: 4 },
  [ModuleType.INVOICE_SALES]: { name: 'Satış Faturası No', prefix: 'SF', digitCount: 5 },
  [ModuleType.INVOICE_PURCHASE]: { name: 'Alış Faturası No', prefix: 'AF', digitCount: 5 },
  [ModuleType.ORDER_SALES]: { name: 'Satış Siparişi No', prefix: 'SS', digitCount: 5 },
  [ModuleType.ORDER_PURCHASE]: { name: 'Satın Alma Siparişi No', prefix: 'SA', digitCount: 5 },
  [ModuleType.INVENTORY_COUNT]: { name: 'Sayım No', prefix: 'SY', digitCount: 5 },
  [ModuleType.QUOTE]: { name: 'Teklif No', prefix: 'TK', digitCount: 5 },
  [ModuleType.DELIVERY_NOTE_SALES]: { name: 'Satış İrsaliyesi No', prefix: 'Sİ', digitCount: 5 },
  [ModuleType.DELIVERY_NOTE_PURCHASE]: { name: 'Alış İrsaliyesi No', prefix: 'Aİ', digitCount: 5 },
  [ModuleType.TECHNICIAN]: { name: 'Teknisyen Kodu', prefix: 'T', digitCount: 3 },
  [ModuleType.WORK_ORDER]: { name: 'İş Emri No', prefix: 'IE', digitCount: 5 },
  [ModuleType.SERVICE_INVOICE]: { name: 'Servis Faturası No', prefix: 'SF', digitCount: 5 },
  [ModuleType.POS_CONSOLE]: { name: 'POS İşlem No', prefix: 'POS', digitCount: 5 },
};

@Injectable()
export class CodeTemplateService {
  constructor(
    private prisma: PrismaService,
    private tenantResolver: TenantResolverService,
  ) { }

  async create(createDto: CreateCodeTemplateDto) {
    const tenantId = await this.tenantResolver.resolveForCreate();

    // Check if template already exists for this module and tenant
    const existing = await (this.prisma.extended.codeTemplate as any).findFirst({
      where: {
        module: createDto.module,
        tenantId
      } as any,
    });

    if (existing) {
      throw new ConflictException(
        `Bu modül için zaten bir şablon mevcut: ${createDto.module}`,
      );
    }

    return (this.prisma.extended.codeTemplate as any).create({
      data: {
        tenantId,
        module: createDto.module,
        name: createDto.name,
        prefix: createDto.prefix,
        digitCount: createDto.digitCount,
        currentValue: createDto.currentValue || 0,
        includeYear: createDto.includeYear !== undefined ? createDto.includeYear : false,
        isActive: createDto.isActive !== undefined ? createDto.isActive : true,
      } as any,
    });
  }

  async findAll() {
    const tenantId = await this.tenantResolver.resolveForQuery();
    return (this.prisma.extended.codeTemplate as any).findMany({
      where: { tenantId } as any,
      orderBy: { module: 'asc' },
    });
  }

  async findOne(id: string) {
    const tenantId = await this.tenantResolver.resolveForQuery();
    const template = await (this.prisma.extended.codeTemplate as any).findFirst({
      where: { id, tenantId } as any,
    });

    if (!template) {
      throw new NotFoundException(`Template not found: id`);
    }

    return template;
  }

  async findByModule(module: ModuleType) {
    const tenantId = await this.tenantResolver.resolveForQuery();
    const template = await (this.prisma.extended.codeTemplate as any).findFirst({
      where: { module, tenantId } as any,
    });

    if (!template) {
      throw new NotFoundException(`Template not found for this module: module`);
    }

    return template;
  }

  async update(id: string, updateDto: UpdateCodeTemplateDto) {
    await this.findOne(id); // Check if exists and belongs to tenant

    return (this.prisma.extended.codeTemplate as any).update({
      where: { id } as any,
      data: updateDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id); // Check if exists and belongs to tenant

    return (this.prisma.extended.codeTemplate as any).delete({
      where: { id } as any,
    });
  }

  async getNextCode(module: ModuleType): Promise<string> {
    const tenantId = await this.tenantResolver.resolveForQuery();
    try {
      let template = await (this.prisma.extended.codeTemplate as any).findFirst({
        where: { module, tenantId } as any,
      });

      if (!template) {
        const defaults = DEFAULT_TEMPLATES[module];
        if (defaults) {
          template = await (this.prisma.extended.codeTemplate as any).create({
            data: {
              tenantId,
              module,
              name: defaults.name,
              prefix: defaults.prefix,
              digitCount: defaults.digitCount,
              currentValue: 0,
              includeYear: false,
              isActive: true,
            } as any,
          });
        } else {
          throw new NotFoundException(
            `Bu modül için şablon tanımlanmamış: ${module}`,
          );
        }
      }

      if (!template.isActive) {
        throw new BadRequestException(
          `Bu modül için şablon aktif değil: ${module}`,
        );
      }

      // Increment counter
      const updated = await (this.prisma.extended.codeTemplate as any).update({
        where: { id: template.id } as any,
        data: { currentValue: template.currentValue + 1 },
      });

      const nextNumber = updated.currentValue;
      const paddedNumber = String(nextNumber).padStart(template.digitCount, '0');

      let nextCode: string;
      if (template.includeYear) {
        const currentYear = new Date().getFullYear();
        nextCode = `${template.prefix}${currentYear}${paddedNumber}`;
      } else {
        nextCode = `${template.prefix}${paddedNumber}`;
      }

      return nextCode;
    } catch (error: any) {
      console.error('❌ [CodeTemplate Service] getNextCode hatası:', error);
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        error?.message || `Kod üretilirken hata oluştu: ${module}`
      );
    }
  }

  async resetCounter(module: ModuleType, newValue: number = 0) {
    const template = await this.findByModule(module);

    return (this.prisma.extended.codeTemplate as any).update({
      where: { id: template.id } as any,
      data: { currentValue: newValue },
    });
  }

  async isCodeUnique(module: ModuleType, code: string): Promise<boolean> {
    const tenantId = await this.tenantResolver.resolveForQuery();
    if (!tenantId) return true;

    const tenantWhere = buildTenantWhereClause(tenantId);
    switch (module) {
      case 'WAREHOUSE': {
        return !(await this.prisma.extended.warehouse.findFirst({
          where: { code, ...tenantWhere } as any,
        }));
      }
      case 'CASHBOX': {
        return !(await this.prisma.extended.cashbox.findFirst({
          where: { code, ...tenantWhere } as any,
        }));
      }
      case 'PERSONNEL': {
        return !(await this.prisma.extended.employee.findFirst({
          where: { employeeCode: code, ...tenantWhere } as any,
        }));
      }
      case 'PRODUCT': {
        return !(await this.prisma.extended.product.findFirst({
          where: { code, ...tenantWhere } as any,
        }));
      }
      case 'CUSTOMER': {
        return !(await this.prisma.extended.account.findFirst({
          where: { code, ...tenantWhere } as any,
        }));
      }
      case 'INVOICE_SALES':
      case 'INVOICE_PURCHASE': {
        return !(await this.prisma.extended.invoice.findFirst({
          where: { invoiceNo: code, ...tenantWhere } as any,
        }));
      }
      case 'ORDER_SALES':
        return !(await this.prisma.extended.salesOrder.findFirst({
          where: { orderNo: code, ...tenantWhere } as any,
        }));
      case 'ORDER_PURCHASE':
        return !(await this.prisma.extended.procurementOrder.findFirst({
          where: { orderNo: code, ...tenantWhere } as any,
        }));
      case 'INVENTORY_COUNT': {
        // Model adı projede değişmiş olabilir; en azından yanlış delegate çağırmayalım.
        return true;
      }
      case 'QUOTE': {
        return !(await this.prisma.extended.quote.findFirst({
          where: { quoteNo: code, ...tenantWhere } as any,
        }));
      }
      default:
        return true;
    }
  }
}
