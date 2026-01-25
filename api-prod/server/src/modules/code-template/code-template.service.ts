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
import { ModuleType } from '@prisma/client';

const DEFAULT_TEMPLATES: Partial<Record<ModuleType, { name: string; prefix: string; digitCount: number }>> = {
  [ModuleType.WAREHOUSE]: { name: 'Depo Kodu', prefix: 'D', digitCount: 3 },
  [ModuleType.WAREHOUSE_TRANSFER]: { name: 'Transfer Fiş No', prefix: 'TF', digitCount: 5 },
  [ModuleType.CASHBOX]: { name: 'Kasa Kodu', prefix: 'K', digitCount: 3 },
  [ModuleType.PERSONNEL]: { name: 'Personel Kodu', prefix: 'P', digitCount: 4 },
  [ModuleType.PRODUCT]: { name: 'Ürün Kodu', prefix: 'ST', digitCount: 4 },
  [ModuleType.CUSTOMER]: { name: 'Cari Kodu', prefix: 'C', digitCount: 4 },
  [ModuleType.INVOICE_SALES]: { name: 'Satış Faturası No', prefix: 'SF', digitCount: 5 },
  [ModuleType.INVOICE_PURCHASE]: { name: 'Alış Faturası No', prefix: 'AF', digitCount: 5 },
  [ModuleType.ORDER_SALES]: { name: 'Satış Siparişi No', prefix: 'SS', digitCount: 5 },
  [ModuleType.ORDER_PURCHASE]: { name: 'Satın Alma Siparişi No', prefix: 'SA', digitCount: 5 },
  [ModuleType.INVENTORY_COUNT]: { name: 'Sayım No', prefix: 'SY', digitCount: 5 },
  [ModuleType.TEKLIF]: { name: 'Teklif No', prefix: 'TK', digitCount: 5 },
  [ModuleType.DELIVERY_NOTE_SALES]: { name: 'Satış İrsaliyesi No', prefix: 'Sİ', digitCount: 5 },
  [ModuleType.DELIVERY_NOTE_PURCHASE]: { name: 'Alış İrsaliyesi No', prefix: 'Aİ', digitCount: 5 },
};

@Injectable()
export class CodeTemplateService {
  constructor(
    private prisma: PrismaService,
    private tenantResolver: TenantResolverService,
  ) {}

  async create(createDto: CreateCodeTemplateDto) {
    // Check if template already exists for this module
    const existing = await this.prisma.codeTemplate.findFirst({
      where: { module: createDto.module },
    });

    if (existing) {
      throw new ConflictException(
        `Bu modül için zaten bir şablon mevcut: ${createDto.module}`,
      );
    }

    return this.prisma.codeTemplate.create({
      data: {
        module: createDto.module,
        name: createDto.name,
        prefix: createDto.prefix,
        digitCount: createDto.digitCount,
        currentValue: createDto.currentValue || 0,
        includeYear: createDto.includeYear !== undefined ? createDto.includeYear : false,
        isActive: createDto.isActive !== undefined ? createDto.isActive : true,
      },
    });
  }

  async findAll() {
    return this.prisma.codeTemplate.findMany({
      orderBy: { module: 'asc' },
    });
  }

  async findOne(id: string) {
    const template = await this.prisma.codeTemplate.findUnique({
      where: { id },
    });

    if (!template) {
      throw new NotFoundException(`Şablon bulunamadı: ${id}`);
    }

    return template;
  }

  async findByModule(module: ModuleType) {
    const template = await this.prisma.codeTemplate.findUnique({
      where: { module },
    });

    if (!template) {
      throw new NotFoundException(`Bu modül için şablon bulunamadı: ${module}`);
    }

    return template;
  }

  async update(id: string, updateDto: UpdateCodeTemplateDto) {
    await this.findOne(id); // Check if exists

    return this.prisma.codeTemplate.update({
      where: { id },
      data: updateDto,
    });
  }

  async remove(id: string) {
    await this.findOne(id); // Check if exists

    return this.prisma.codeTemplate.delete({
      where: { id },
    });
  }

  /**
   * Verilen modül için bir sonraki kodu üretir ve sayacı artırır
   * Örnek: module=WAREHOUSE, prefix="D", digitCount=3, currentValue=5 → "D006"
   * Şablon yoksa varsayılan oluşturulur (seed çalışmamış ortamlar için).
   */
  async getNextCode(module: ModuleType): Promise<string> {
    try {
      let template = await this.prisma.codeTemplate.findUnique({
        where: { module },
      });

      if (!template) {
        const defaults = DEFAULT_TEMPLATES[module];
        if (defaults) {
          template = await this.prisma.codeTemplate.create({
            data: {
              module,
              name: defaults.name,
              prefix: defaults.prefix,
              digitCount: defaults.digitCount,
              currentValue: 0,
              includeYear: false,
              isActive: true,
            },
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

      // Sayacı artır (transaction ile)
      const updated = await this.prisma.codeTemplate.update({
        where: { id: template.id },
        data: { currentValue: template.currentValue + 1 },
      });

      // Kodu oluştur
      const nextNumber = updated.currentValue;
      const paddedNumber = String(nextNumber).padStart(template.digitCount, '0');

      let nextCode: string;
      if (template.includeYear) {
        // Format: PREFIX + YIL + PADDED_NUMBER
        // Örnek: AZM2025000000001
        const currentYear = new Date().getFullYear();
        nextCode = `${template.prefix}${currentYear}${paddedNumber}`;
      } else {
        // Format: PREFIX + PADDED_NUMBER (eski format)
        // Örnek: D001, K002
        nextCode = `${template.prefix}${paddedNumber}`;
      }

      return nextCode;
    } catch (error: any) {
      console.error('❌ [CodeTemplate Service] getNextCode hatası:', error);
      console.error('❌ [CodeTemplate Service] Hata detayları:', {
        message: error?.message,
        code: error?.code,
        module,
        stack: error?.stack,
      });
      // Eğer NotFoundException veya BadRequestException ise olduğu gibi fırlat
      if (error instanceof NotFoundException || error instanceof BadRequestException) {
        throw error;
      }
      throw new BadRequestException(
        error?.message || `Kod üretilirken hata oluştu: ${module}`
      );
    }
  }

  /**
   * Verilen modül için sayacı sıfırlar (veya belirtilen değere ayarlar)
   */
  async resetCounter(module: ModuleType, newValue: number = 0) {
    const template = await this.findByModule(module);

    return this.prisma.codeTemplate.update({
      where: { id: template.id },
      data: { currentValue: newValue },
    });
  }

  /**
   * Kod var mı kontrol eder (herhangi bir modül için)
   * Örneğin warehouse create'te kullanıcı kod girerse, önce bu metotla kontrol edilir
   */
  async isCodeUnique(module: ModuleType, code: string): Promise<boolean> {
    const tenantId = await this.tenantResolver.resolveForQuery();
    if (!tenantId) return true;

    const tenantWhere = buildTenantWhereClause(tenantId);
    switch (module) {
      case 'WAREHOUSE': {
        const w = await this.prisma.warehouse.findFirst({
          where: { code, ...tenantWhere },
        });
        return !w;
      }
      case 'CASHBOX': {
        const k = await this.prisma.kasa.findFirst({
          where: { kasaKodu: code, ...tenantWhere },
        });
        return !k;
      }
      case 'PERSONNEL': {
        const p = await this.prisma.personel.findFirst({
          where: { personelKodu: code, ...tenantWhere },
        });
        return !p;
      }
      case 'PRODUCT': {
        const s = await this.prisma.stok.findFirst({
          where: { stokKodu: code, ...tenantWhere },
        });
        return !s;
      }
      case 'CUSTOMER': {
        const c = await this.prisma.cari.findFirst({
          where: { cariKodu: code, ...tenantWhere },
        });
        return !c;
      }
      case 'INVOICE_SALES':
      case 'INVOICE_PURCHASE': {
        const i = await this.prisma.fatura.findFirst({
          where: { faturaNo: code, ...tenantWhere },
        });
        return !i;
      }
      case 'ORDER_SALES':
      case 'ORDER_PURCHASE': {
        const o = await this.prisma.siparis.findFirst({
          where: { siparisNo: code, ...tenantWhere },
        });
        return !o;
      }
      case 'INVENTORY_COUNT': {
        const sy = await this.prisma.sayim.findFirst({
          where: { sayimNo: code, ...tenantWhere },
        });
        return !sy;
      }
      case 'TEKLIF': {
        const t = await this.prisma.teklif.findFirst({
          where: { teklifNo: code, ...tenantWhere },
        });
        return !t;
      }
      default:
        return true;
    }
  }
}
