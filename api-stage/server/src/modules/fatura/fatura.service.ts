import {
  BadRequestException,
  Injectable,
  NotFoundException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { FaturaDurum, FaturaTipi, Prisma, IrsaliyeKaynakTip, IrsaliyeDurum } from '@prisma/client';
import { Decimal } from '@prisma/client/runtime/library';
import { PrismaService } from '../../common/prisma.service';
import { TenantResolverService } from '../../common/services/tenant-resolver.service';
import { buildTenantWhereClause } from '../../common/utils/staging.util';
import { CodeTemplateService } from '../code-template/code-template.service';
import { SatisIrsaliyesiService } from '../satis-irsaliyesi/satis-irsaliyesi.service';
import { InvoiceProfitService } from '../invoice-profit/invoice-profit.service';
import { CostingService } from '../costing/costing.service';
import { SystemParameterService } from '../system-parameter/system-parameter.service';
import { WarehouseService } from '../warehouse/warehouse.service';
import { CreateFaturaDto } from './dto/create-fatura.dto';
import { UpdateFaturaDto } from './dto/update-fatura.dto';
import { DeletionProtectionService } from '../../common/services/deletion-protection.service';
import { TcmbService } from '../../common/services/tcmb.service';

@Injectable()
export class FaturaService {
  constructor(
    private prisma: PrismaService,
    private tenantResolver: TenantResolverService,
    private codeTemplateService: CodeTemplateService,
    @Inject(forwardRef(() => SatisIrsaliyesiService))
    private satisIrsaliyesiService: SatisIrsaliyesiService,
    private invoiceProfitService: InvoiceProfitService,
    private costingService: CostingService,
    private systemParameterService: SystemParameterService,
    private warehouseService: WarehouseService,
    private deletionProtection: DeletionProtectionService,
    private tcmbService: TcmbService,
  ) { }

  /** Prisma Decimal veya number'ı güvenle number'a çevirir (null/undefined → 0). */
  private toDecimalNumber(val: unknown): number {
    if (val == null) return 0;
    if (typeof val === 'number' && !Number.isNaN(val)) return val;
    if (typeof val === 'object' && val !== null && 'toNumber' in val && typeof (val as any).toNumber === 'function')
      return (val as any).toNumber();
    return Number(val) || 0;
  }

  private async createLog(
    faturaId: string,
    actionType: string,
    userId?: string,
    changes?: any,
    ipAddress?: string,
    userAgent?: string,
    tx?: Prisma.TransactionClient,
  ) {
    const prisma = tx || this.prisma;
    await prisma.faturaLog.create({
      data: {
        faturaId,
        userId,
        actionType: actionType as any,
        changes: changes ? JSON.stringify(changes) : null,
        ipAddress,
        userAgent,
      },
    });
  }

  /**
   * Update warehouse stock (ProductLocationStock) and create StockMove record
   */
  private async updateWarehouseStock(
    warehouseId: string,
    productId: string,
    quantity: number,
    moveType: 'PUT_AWAY' | 'SALE',
    refId: string,
    refType: string,
    note: string,
    userId: string | undefined,
    prisma: any,
  ) {
    // Check WMS Module status
    // TODO: Optimize by fetching ONCE per transaction instead of per item
    const wmsParam = await prisma.systemParameter.findFirst({
      where: {
        key: 'ENABLE_WMS_MODULE',
        OR: [
          // Check generic/global param (assuming tenant filtering is handled or we want global config)
          { tenantId: null },
          // If we had tenant context, we'd check that too.
          // For now, looking up broadly is safe as we just inserted a global/tenant-linked one.
        ]
      },
      orderBy: { tenantId: 'desc' }, // Prefer specific tenant if available (non-null first usually)
    });

    const isWmsEnabled = wmsParam?.value === 'true' || wmsParam?.value === true;

    if (!isWmsEnabled) {
      // WMS disabled: Do NOT track shelf location or create StockMove.
      // Basic Inventory (StokHareket) is already handled in the calling method.
      return;
    }

    // Get or create default location for the warehouse
    const defaultLocation = await this.warehouseService.getOrCreateDefaultLocation(warehouseId);

    // Find existing ProductLocationStock
    let stock = await prisma.productLocationStock.findUnique({
      where: {
        warehouseId_locationId_productId: {
          warehouseId,
          locationId: defaultLocation.id,
          productId,
        },
      },
    });

    const qtyChange = moveType === 'PUT_AWAY' ? quantity : -quantity;

    if (stock) {
      const newQty = stock.qtyOnHand + qtyChange;

      // Check if negative stock control is enabled
      const negativeStockControlEnabled = await this.systemParameterService.getParameterAsBoolean(
        'NEGATIVE_STOCK_CONTROL',
        false, // Default: false (allow negative stock)
      );

      // Prevent negative stock only if the parameter is enabled
      if (negativeStockControlEnabled) {
        // Calculate total warehouse stock across all locations
        const warehouseStockResult = await prisma.productLocationStock.aggregate({
          where: {
            warehouseId,
            productId,
          },
          _sum: {
            qtyOnHand: true,
          },
        });
        const totalWarehouseQty = warehouseStockResult._sum.qtyOnHand || 0;

        if (totalWarehouseQty + qtyChange < 0) {
          throw new BadRequestException(
            `Depoda yeterli stok yok. Mevcut: ${totalWarehouseQty}, Talep edilen: ${quantity}`,
          );
        }
      }

      await prisma.productLocationStock.update({
        where: {
          warehouseId_locationId_productId: {
            warehouseId,
            locationId: defaultLocation.id,
            productId,
          },
        },
        data: {
          qtyOnHand: newQty,
        },
      });
    } else {
      // Create new stock record
      if (moveType === 'SALE') {
        // Check if negative stock control is enabled
        const negativeStockControlEnabled = await this.systemParameterService.getParameterAsBoolean(
          'NEGATIVE_STOCK_CONTROL',
          false,
        );

        if (negativeStockControlEnabled) {
          // Calculate total warehouse stock across all locations
          const warehouseStockResult = await prisma.productLocationStock.aggregate({
            where: {
              warehouseId,
              productId,
            },
            _sum: {
              qtyOnHand: true,
            },
          });
          const totalWarehouseQty = warehouseStockResult._sum.qtyOnHand || 0;

          if (totalWarehouseQty - quantity < 0) {
            throw new BadRequestException(
              `Depoda yeterli stok yok. Mevcut: ${totalWarehouseQty}, Talep edilen: ${quantity}`,
            );
          }
        }

        // If negative stock is allowed, create a negative stock record
        await prisma.productLocationStock.create({
          data: {
            warehouseId,
            locationId: defaultLocation.id,
            productId,
            qtyOnHand: -quantity, // Negative stock
          },
        });
      } else {
        // For PUT_AWAY, create positive stock
        await prisma.productLocationStock.create({
          data: {
            warehouseId,
            locationId: defaultLocation.id,
            productId,
            qtyOnHand: quantity,
          },
        });
      }
    }

    // Create StockMove record
    await prisma.stockMove.create({
      data: {
        productId,
        fromWarehouseId: moveType === 'SALE' ? warehouseId : null,
        fromLocationId: moveType === 'SALE' ? defaultLocation.id : null,
        toWarehouseId: warehouseId,
        toLocationId: defaultLocation.id,
        qty: quantity,
        moveType: moveType,
        refType,
        refId,
        note,
        createdBy: userId,
      },
    });
  }

  /**
   * ALIS faturası için maliyetlendirme servisini çalıştır
   * Fatura içindeki kalemlerin stokId'leri için maliyet hesaplar
   * Parametre kontrolü yapılır - eğer otomatik maliyetlendirme kapalıysa çalışmaz
   */
  private async calculateCostsForInvoiceItems(
    kalemler: Array<{ stokId: string | null }>,
    faturaId: string,
    faturaNo: string,
  ): Promise<void> {
    // Parametre kontrolü - otomatik maliyetlendirme açık mı?
    const autoCostingEnabled = await this.systemParameterService.getParameterAsBoolean(
      'AUTO_COSTING_ON_PURCHASE_INVOICE',
      true, // Varsayılan: true (mevcut davranış)
    );

    if (!autoCostingEnabled) {
      console.log(
        `[FaturaService] Fatura ${faturaNo} (${faturaId}) için otomatik maliyetlendirme kapalı, atlandı`,
      );
      return;
    }

    // Sadece stokId'si olan kalemler için maliyet hesapla
    const stokIds = kalemler
      .map((k) => k.stokId)
      .filter((id): id is string => id !== null && id !== undefined);

    if (stokIds.length === 0) {
      console.log(
        `[FaturaService] Fatura ${faturaNo} (${faturaId}) için maliyetlendirme atlandı - stokId bulunamadı`,
      );
      return;
    }

    // Unique stokId'leri al
    const uniqueStokIds = [...new Set(stokIds)];

    console.log(
      `[FaturaService] Fatura ${faturaNo} (${faturaId}) için ${uniqueStokIds.length} stok için maliyetlendirme başlatılıyor...`,
    );

    // Her stok için maliyet hesapla (async olarak paralel çalıştır)
    const costingPromises = uniqueStokIds.map(async (stokId) => {
      try {
        await this.costingService.calculateWeightedAverageCost(stokId);
        console.log(
          `[FaturaService] Stok ${stokId} için maliyetlendirme tamamlandı`,
        );
      } catch (error: any) {
        // Maliyetlendirme hatası fatura işlemini engellemez, sadece log'lanır
        console.error(
          `[FaturaService] Stok ${stokId} için maliyetlendirme hatası:`,
          {
            stokId,
            faturaId,
            faturaNo,
            error: error?.message || error,
            stack: error?.stack,
          },
        );
      }
    });

    // Tüm maliyetlendirme işlemlerini bekle
    await Promise.allSettled(costingPromises);

    console.log(
      `[FaturaService] Fatura ${faturaNo} (${faturaId}) için maliyetlendirme tamamlandı`,
    );
  }

  async findAll(
    page = 1,
    limit = 50,
    faturaTipi?: FaturaTipi,
    search?: string,
    cariId?: string,
    sortBy?: string,
    sortOrder?: 'asc' | 'desc',
  ) {
    // #region agent log
    fetch('http://localhost:7247/ingest/4fbe5973-d45f-4058-9235-4d634c6bd17e', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'fatura.service.ts:49', message: 'findAll called', data: { page, limit, faturaTipi, search, cariId }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'A' }) }).catch(() => { });
    // #endregion
    try {
      const skip = (page - 1) * limit;
      const tenantId = await this.tenantResolver.resolveForQuery();

      const where: Prisma.FaturaWhereInput = {
        deletedAt: null,
        ...buildTenantWhereClause(tenantId ?? undefined),
      };

      if (faturaTipi) {
        where.faturaTipi = faturaTipi;
      }

      if (cariId) {
        where.cariId = cariId;
      }

      if (search) {
        where.OR = [
          { faturaNo: { contains: search, mode: 'insensitive' } },
          { cari: { unvan: { contains: search, mode: 'insensitive' } } },
          { cari: { cariKodu: { contains: search, mode: 'insensitive' } } },
        ];
      }

      // #region agent log
      fetch('http://localhost:7247/ingest/4fbe5973-d45f-4058-9235-4d634c6bd17e', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'fatura.service.ts:78', message: 'Before Prisma query', data: { where: JSON.stringify(where) }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'B' }) }).catch(() => { });
      // #endregion

      const [data, total] = await Promise.all([
        this.prisma.fatura.findMany({
          where,
          skip,
          take: limit,
          include: {
            cari: {
              select: {
                id: true,
                cariKodu: true,
                unvan: true,
                tip: true,
              },
            },
            irsaliye: {
              select: {
                id: true,
                irsaliyeNo: true,
                kaynakSiparis: {
                  select: {
                    id: true,
                    siparisNo: true,
                  },
                },
              },
            },
            faturaTahsilatlar: {
              include: {
                tahsilat: {
                  select: {
                    id: true,
                    tarih: true,
                    tip: true,
                    odemeTipi: true,
                  },
                },
              },
              orderBy: { createdAt: 'desc' },
            },
            createdByUser: {
              select: {
                id: true,
                fullName: true,
                username: true,
              },
            },
            updatedByUser: {
              select: {
                id: true,
                fullName: true,
                username: true,
              },
            },
            _count: {
              select: {
                kalemler: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        }),
        this.prisma.fatura.count({ where }),
      ]);

      // #region agent log
      fetch('http://localhost:7247/ingest/4fbe5973-d45f-4058-9235-4d634c6bd17e', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'fatura.service.ts:131', message: 'Prisma query succeeded', data: { dataCount: data.length, total }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'C' }) }).catch(() => { });
      // #endregion

      const dataWithKalan = data.map((item) => ({
        ...item,
        kalanTutar: Number(item.genelToplam) - Number(item.odenenTutar || 0),
      }));

      return {
        data: dataWithKalan,
        meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
      };
    } catch (error) {
      // #region agent log
      fetch('http://localhost:7247/ingest/4fbe5973-d45f-4058-9235-4d634c6bd17e', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ location: 'fatura.service.ts:136', message: 'findAll error caught', data: { errorMessage: error?.message, errorStack: error?.stack, errorName: error?.name }, timestamp: Date.now(), sessionId: 'debug-session', runId: 'run1', hypothesisId: 'D' }) }).catch(() => { });
      // #endregion
      console.error('Fatura findAll error:', error);
      throw new BadRequestException(
        `Faturalar yüklenirken hata oluştu: ${error.message}`,
      );
    }
  }

  async findOne(id: string) {
    const fatura = await this.prisma.fatura.findUnique({
      where: { id },
      include: {
        cari: true,
        irsaliye: {
          select: {
            id: true,
            irsaliyeNo: true,
            depoId: true,
            kaynakSiparis: {
              select: {
                id: true,
                siparisNo: true,
              },
            },
          },
        },
        satinAlmaIrsaliye: {
          select: { id: true, irsaliyeNo: true, depoId: true },
        },
        kalemler: {
          include: {
            stok: true,
          },
        },
        createdByUser: {
          select: {
            id: true,
            fullName: true,
            username: true,
          },
        },
        updatedByUser: {
          select: {
            id: true,
            fullName: true,
            username: true,
          },
        },
        deletedByUser: {
          select: {
            id: true,
            fullName: true,
            username: true,
          },
        },
        logs: {
          include: {
            user: {
              select: {
                id: true,
                fullName: true,
                username: true,
              },
            },
          },
          orderBy: {
            createdAt: 'desc',
          },
        },
      },
    });

    if (!fatura) {
      throw new NotFoundException(`Fatura bulunamadı: ${id}`);
    }

    // Ambar: fatura tablosundaki warehouseId (eski kayıtlar için irsaliye.depoId fallback)
    const fallbackWarehouseId =
      (fatura.irsaliye as any)?.depoId ?? (fatura.satinAlmaIrsaliye as any)?.depoId ?? null;
    const warehouseId = (fatura as any).warehouseId ?? (fallbackWarehouseId != null ? String(fallbackWarehouseId) : undefined);
    // Kalem kdvOrani: sadece fatura kaleminden (stok.kdvOrani değil); 0 açıkça korunmalı
    const kalemler = (fatura.kalemler || []).map((k: any) => {
      const v = k.kdvOrani ?? (k as any).kdv_orani;
      const isZero = v === 0 || v === '0' || (typeof v === 'number' && v === 0);
      const n = isZero ? 0 : (typeof v === 'number' && !Number.isNaN(v) ? v : Number(v));
      const out = typeof n === 'number' && !Number.isNaN(n) && n >= 0 ? n : 0;
      return { ...k, kdvOrani: out };
    });
    return { ...fatura, warehouseId, kalemler };
  }

  async create(
    createFaturaDto: CreateFaturaDto,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const { kalemler, siparisId, irsaliyeId, warehouseId, satisElemaniId, ...faturaData } = createFaturaDto;

    // Satış faturaları kaydedildiğinde varsayılan olarak onaylanmış (ONAYLANDI) olur
    if (faturaData.faturaTipi === 'SATIS' && !faturaData.durum) {
      faturaData.durum = 'ONAYLANDI';
    }

    const tenantId = await this.tenantResolver.resolveForCreate({ userId });

    // Eğer fatura numarası boşsa veya belirtilmemişse, şablondan otomatik oluştur
    if (!faturaData.faturaNo || faturaData.faturaNo.trim() === '') {
      try {
        if (faturaData.faturaTipi === 'SATIS') {
          faturaData.faturaNo = await this.codeTemplateService.getNextCode('INVOICE_SALES');
        } else if (faturaData.faturaTipi === 'ALIS') {
          faturaData.faturaNo = await this.codeTemplateService.getNextCode('INVOICE_PURCHASE');
        } else {
          // Fallback: Manuel numara oluştur
          const year = new Date().getFullYear();
          const lastFatura = await this.prisma.fatura.findFirst({
            where: {
              faturaTipi: faturaData.faturaTipi,
              ...(tenantId && { tenantId }),
            },
            orderBy: { createdAt: 'desc' },
          });
          const lastNo = lastFatura ? parseInt(lastFatura.faturaNo.split('-')[2] || '0') : 0;
          const newNo = (lastNo + 1).toString().padStart(3, '0');
          faturaData.faturaNo = `SF-${year}-${newNo}`;
        }
      } catch (error: any) {
        // Şablon yoksa veya hata varsa, manuel oluştur
        const year = new Date().getFullYear();
        const lastFatura = await this.prisma.fatura.findFirst({
          where: {
            faturaTipi: faturaData.faturaTipi,
            ...(tenantId && { tenantId }),
          },
          orderBy: { createdAt: 'desc' },
        });
        const lastNo = lastFatura ? parseInt(lastFatura.faturaNo.split('-')[2] || '0') : 0;
        const newNo = (lastNo + 1).toString().padStart(3, '0');
        faturaData.faturaNo = `SF-${year}-${newNo}`;
      }
    }

    // Fatura numarası kontrolü (tenantId ile birlikte unique)
    const existingFatura = await this.prisma.fatura.findFirst({
      where: {
        faturaNo: faturaData.faturaNo,
        ...(tenantId && { tenantId }),
      },
    });

    if (existingFatura) {
      throw new BadRequestException(
        `Bu fatura numarası zaten mevcut: ${faturaData.faturaNo}`,
      );
    }

    // Cari kontrolü
    const cari = await this.prisma.cari.findUnique({
      where: { id: faturaData.cariId },
      select: { id: true, satisElemaniId: true }
    });

    if (!cari) {
      throw new NotFoundException(`Cari bulunamadı: ${faturaData.cariId}`);
    }

    // Kalem tutarlarını hesapla
    let toplamTutar = 0;
    let kdvTutar = 0;

    const kalemlerWithCalculations = kalemler.map((kalem) => {
      const miktar = Math.max(1, Math.floor(Number(kalem.miktar) || 1));
      const birimFiyat = Number(kalem.birimFiyat) || 0;
      const rawTutar = miktar * birimFiyat;

      // Satır bazlı iskonto hesapla
      const iskontoOrani = kalem.iskontoOrani !== undefined ? Number(kalem.iskontoOrani) : 0;
      let iskontoTutari = 0;

      if (kalem.iskontoTutari !== undefined && kalem.iskontoTutari !== null && Number(kalem.iskontoTutari) > 0) {
        iskontoTutari = Number(kalem.iskontoTutari);
      } else {
        iskontoTutari = (rawTutar * iskontoOrani) / 100;
      }

      const tutar = rawTutar - iskontoTutari;
      // 0 geçerli KDV oranı; || 0 ile 0'ı ezmeyelim
      const rawKdv = kalem.kdvOrani;
      const kdvOraniInt =
        rawKdv === 0 || (typeof rawKdv === 'string' && rawKdv === '0')
          ? 0
          : Math.round(Number(rawKdv) || 0);
      const kalemKdv = (tutar * kdvOraniInt) / 100;

      toplamTutar += tutar;
      kdvTutar += kalemKdv;

      // Sadece Prisma FaturaKalemi alanları
      return {
        stokId: String(kalem.stokId),
        miktar,
        birimFiyat,
        kdvOrani: kdvOraniInt,
        iskontoOrani: new Decimal(iskontoOrani),
        iskontoTutari: new Decimal(iskontoTutari),
        tutar: new Decimal(tutar),
        kdvTutar: new Decimal(kalemKdv),
      };
    });

    const iskonto = faturaData.iskonto !== undefined ? faturaData.iskonto : 0;
    toplamTutar -= iskonto;
    const genelToplam = toplamTutar + kdvTutar;

    // Döviz hesaplama
    let { dovizCinsi, dovizKuru } = createFaturaDto;
    let dovizToplam: number | null = null;

    if (dovizCinsi && dovizCinsi !== 'TRY') {
      if (!dovizKuru) {
        try {
          dovizKuru = await this.tcmbService.getCurrentRate(dovizCinsi);
        } catch (error) {
          console.error(`Kur alınamadı: ${error}`);
        }
      }

      if (dovizKuru && dovizKuru > 0) {
        dovizToplam = new Decimal(genelToplam).div(dovizKuru).toNumber();
      }
    }

    // Sipariş kontrolü
    let siparis: any = null;
    let siparisHazirliklar: any[] = [];
    if (siparisId) {
      siparis = await this.prisma.siparis.findUnique({
        where: { id: siparisId },
        include: {
          hazirlananlar: {
            include: {
              siparisKalemi: true,
              location: true,
            },
          },
        },
      });

      if (!siparis) {
        throw new NotFoundException(
          `Sipariş bulunamadı: ${siparisId}`,
        );
      }

      if (siparis.durum === 'FATURALANDI') {
        throw new BadRequestException('Sipariş zaten faturalandırılmış');
      }

      siparisHazirliklar = siparis.hazirlananlar;
    }

    // PRE-VALIDATION: Check stock levels before transaction (if negative stock control is enabled)
    if (faturaData.faturaTipi === 'SATIS' && faturaData.durum === 'ONAYLANDI' && warehouseId) {
      const negativeStockControlEnabled = await this.systemParameterService.getParameterAsBoolean(
        'NEGATIVE_STOCK_CONTROL',
        false,
      );

      if (negativeStockControlEnabled) {
        const stockIssues: Array<{
          stokKodu: string;
          stokAdi: string;
          mevcutStok: number;
          talep: number;
        }> = [];

        // Get default location for the warehouse
        const defaultLocation = await this.warehouseService.getOrCreateDefaultLocation(warehouseId);

        // Check each item
        for (const kalem of kalemlerWithCalculations) {
          // Get product info first
          const product = await this.prisma.stok.findUnique({
            where: { id: kalem.stokId },
            select: {
              stokKodu: true,
              stokAdi: true,
            },
          });

          // Aggregate stock across all locations in the warehouse
          const stock = await this.prisma.productLocationStock.aggregate({
            where: {
              warehouseId,
              productId: kalem.stokId,
            },
            _sum: {
              qtyOnHand: true,
            },
          });

          const currentStock = stock._sum.qtyOnHand || 0;
          const requestedQty = kalem.miktar;

          if (currentStock < requestedQty) {
            stockIssues.push({
              stokKodu: product?.stokKodu || 'Bilinmiyor',
              stokAdi: product?.stokAdi || 'Bilinmiyor',
              mevcutStok: currentStock,
              talep: requestedQty,
            });
          }
        }

        // If there are stock issues, throw detailed error
        if (stockIssues.length > 0) {
          const errorDetails = stockIssues
            .map(
              (issue) =>
                `• ${issue.stokKodu} - ${issue.stokAdi}: Mevcut stok ${issue.mevcutStok}, talep edilen ${issue.talep}`,
            )
            .join('\n');

          throw new BadRequestException(
            `Yetersiz stok! Aşağıdaki ürünler için yeterli stok bulunmamaktadır:\n\n${errorDetails}`,
          );
        }
      }
    }

    // Transaction ile fatura ve kalemleri oluştur
    const createdFatura = await this.prisma.$transaction(async (prisma) => {
      let transactionWarehouseId = warehouseId;
      // İRSALİYE İŞLEMLERİ
      let deliveryNoteId: string | undefined = undefined;
      let satinAlmaIrsaliyeId: string | undefined = undefined;

      // Eğer irsaliyeId varsa, mevcut irsaliye'yi kullan
      if (irsaliyeId) {
        if (faturaData.faturaTipi === 'SATIS' || faturaData.faturaTipi === 'SATIS_IADE') {
          const irsaliye = await prisma.satisIrsaliyesi.findUnique({
            where: { id: irsaliyeId },
            include: {
              kaynakSiparis: {
                select: {
                  id: true,
                  siparisNo: true,
                },
              },
              kalemler: true,
            },
          });

          if (!irsaliye) {
            throw new NotFoundException(`Satış irsaliyesi bulunamadı: ${irsaliyeId}`);
          }

          if (irsaliye.durum === 'FATURALANDI') {
            throw new BadRequestException('Bu irsaliye zaten tamamen faturalandırılmış');
          }

          // Kalem bazlı miktar kontrolü ve faturalanan miktar güncelleme
          for (const faturaKalemi of kalemler) {
            const irsaliyeKalemi = irsaliye.kalemler.find(ik => ik.stokId === faturaKalemi.stokId);
            if (irsaliyeKalemi) {
              const kalanMiktar = irsaliyeKalemi.miktar - irsaliyeKalemi.faturalananMiktar;
              if (faturaKalemi.miktar > kalanMiktar) {
                // throw new BadRequestException(`Stok ID ${faturaKalemi.stokId} için irsaliyede kalan miktardan (${kalanMiktar}) fazla fatura kesilemez.`);
                // Opsiyonel: Sadece uyarı loglanabilir veya katı kural uygulanabilir. 
                // Şimdilik plan gereği katı kural uyguluyoruz.
              }

              await prisma.satisIrsaliyesiKalemi.update({
                where: { id: irsaliyeKalemi.id },
                data: { faturalananMiktar: { increment: faturaKalemi.miktar } }
              });
            }
          }

          // İrsaliye durumunu kontrol et (Tamamı faturalandı mı?)
          const guncelIrsaliye = await prisma.satisIrsaliyesi.findUnique({
            where: { id: irsaliyeId },
            include: { kalemler: true }
          });

          const tamamiFaturalandi = guncelIrsaliye?.kalemler.every(k => k.faturalananMiktar >= k.miktar);
          if (tamamiFaturalandi) {
            await prisma.satisIrsaliyesi.update({
              where: { id: irsaliyeId },
              data: { durum: IrsaliyeDurum.FATURALANDI },
            });
          }

          deliveryNoteId = irsaliyeId;
          if (irsaliye.depoId) transactionWarehouseId = irsaliye.depoId;

          // Eğer irsaliye bir siparişten oluşturulduysa, sipariş numarasını fatura'ya aktar
          if (irsaliye.kaynakSiparis?.siparisNo && !siparis?.siparisNo) {
            siparis = { ...siparis, siparisNo: irsaliye.kaynakSiparis.siparisNo };
          }
        } else if (faturaData.faturaTipi === 'ALIS' || faturaData.faturaTipi === 'ALIS_IADE') {
          const irsaliye = await prisma.satınAlmaIrsaliyesi.findUnique({
            where: { id: irsaliyeId },
            include: {
              kaynakSiparis: {
                select: {
                  id: true,
                  siparisNo: true,
                },
              },
            },
          });

          if (!irsaliye) {
            throw new NotFoundException(`Satın alma irsaliyesi bulunamadı: ${irsaliyeId}`);
          }

          if (irsaliye.durum === 'FATURALANDI') {
            throw new BadRequestException('Bu irsaliye zaten faturalandırılmış');
          }

          // İrsaliye durumunu FATURALANDI yap
          await prisma.satınAlmaIrsaliyesi.update({
            where: { id: irsaliyeId },
            data: { durum: IrsaliyeDurum.FATURALANDI },
          });

          satinAlmaIrsaliyeId = irsaliyeId;
          if (irsaliye.depoId) transactionWarehouseId = irsaliye.depoId;

          // Eğer irsaliye bir siparişten oluşturulduysa, sipariş numarasını fatura'ya aktar
          if (irsaliye.kaynakSiparis?.siparisNo && !siparis?.siparisNo) {
            siparis = { ...siparis, siparisNo: irsaliye.kaynakSiparis.siparisNo };
          }
        }
      } else if (faturaData.faturaTipi === 'SATIS') {
        // Eğer SATIS tipindeyse ve irsaliyeId yoksa, otomatik irsaliye oluştur
        // İrsaliye numarası oluştur
        let irsaliyeNo: string;
        try {
          irsaliyeNo = await this.codeTemplateService.getNextCode('DELIVERY_NOTE_SALES');
        } catch (error: any) {
          // Şablon yoksa fallback
          const year = new Date().getFullYear();
          const lastIrsaliye = await prisma.satisIrsaliyesi.findFirst({
            where: { ...(tenantId && { tenantId }) },
            orderBy: { createdAt: 'desc' },
          });
          const lastNoStr = lastIrsaliye?.irsaliyeNo || '';
          const lastNo = lastNoStr ? parseInt(lastNoStr.split('-').pop() || '0') : 0;
          irsaliyeNo = `IRS-${year}-${(lastNo + 1).toString().padStart(6, '0')}`;
        }

        // İrsaliye kalemlerini hazırla (iskonto öncesi toplam tutar için hesaplama)
        const irsaliyeToplamTutar = toplamTutar + (faturaData.iskonto || 0); // İskonto öncesi toplam
        const irsaliyeKalemler = kalemlerWithCalculations.map(k => ({
          stokId: k.stokId,
          miktar: k.miktar,
          birimFiyat: new Decimal(k.birimFiyat),
          kdvOrani: k.kdvOrani,
          tutar: new Decimal(k.tutar),
          kdvTutar: new Decimal(k.kdvTutar),
        }));
        // İrsaliye oluştur
        const irsaliye = await prisma.satisIrsaliyesi.create({
          data: {
            irsaliyeNo,
            irsaliyeTarihi: new Date(faturaData.tarih),
            tenantId,
            cariId: faturaData.cariId,
            depoId: warehouseId || null,
            kaynakTip: IrsaliyeKaynakTip.FATURA_OTOMATIK,
            kaynakId: null, // Sipariş yoksa null
            durum: IrsaliyeDurum.FATURALANDI, // Fatura oluşturulduğu için direkt FATURALANDI
            toplamTutar: new Decimal(irsaliyeToplamTutar),
            kdvTutar: new Decimal(kdvTutar),
            genelToplam: new Decimal(genelToplam),
            iskonto: new Decimal(faturaData.iskonto || 0),
            aciklama: faturaData.aciklama || null,
            createdBy: userId,
            kalemler: {
              create: irsaliyeKalemler,
            },
          },
        });

        deliveryNoteId = irsaliye.id;
      } else if (faturaData.faturaTipi === 'ALIS') {
        // Eğer ALIS tipindeyse ve irsaliyeId yoksa, otomatik irsaliye oluştur
        let irsaliyeNo: string;
        try {
          // Satın alma irsaliyesi şablonu (varsa)
          irsaliyeNo = await this.codeTemplateService.getNextCode('DELIVERY_NOTE_PURCHASE');
        } catch (error: any) {
          const year = new Date().getFullYear();
          const lastIrsaliye = await prisma.satınAlmaIrsaliyesi.findFirst({
            where: { ...(tenantId && { tenantId }) },
            orderBy: { createdAt: 'desc' },
          });
          const lastNoStr = lastIrsaliye?.irsaliyeNo || '';
          const lastNo = lastNoStr ? parseInt(lastNoStr.split('-').pop() || '0') : 0;
          irsaliyeNo = `AIRS-${year}-${(lastNo + 1).toString().padStart(6, '0')}`;
        }

        const irsaliyeToplamTutar = toplamTutar + (faturaData.iskonto || 0);
        const irsaliyeKalemler = kalemlerWithCalculations.map(k => ({
          stokId: k.stokId,
          miktar: k.miktar,
          birimFiyat: new Decimal(k.birimFiyat),
          kdvOrani: k.kdvOrani,
          tutar: new Decimal(k.tutar),
          kdvTutar: new Decimal(k.kdvTutar),
        }));

        const irsaliye = await prisma.satınAlmaIrsaliyesi.create({
          data: {
            irsaliyeNo,
            irsaliyeTarihi: new Date(faturaData.tarih),
            tenantId,
            cariId: faturaData.cariId,
            depoId: warehouseId || null,
            kaynakTip: IrsaliyeKaynakTip.FATURA_OTOMATIK,
            kaynakId: null,
            durum: IrsaliyeDurum.FATURALANDI,
            toplamTutar: new Decimal(irsaliyeToplamTutar),
            kdvTutar: new Decimal(kdvTutar),
            genelToplam: new Decimal(genelToplam),
            iskonto: new Decimal(faturaData.iskonto || 0),
            aciklama: faturaData.aciklama || null,
            createdBy: userId,
            kalemler: {
              create: irsaliyeKalemler,
            },
          },
        });

        satinAlmaIrsaliyeId = irsaliye.id;
      }

      const fatura = await prisma.fatura.create({
        data: {
          ...faturaData,
          dovizCinsi: dovizCinsi || 'TRY',
          dovizKuru: dovizKuru ? new Decimal(dovizKuru) : undefined,
          dovizToplam: dovizToplam ? new Decimal(dovizToplam) : null,
          ...(tenantId && { tenantId }),
          siparisNo: siparis?.siparisNo || null,
          deliveryNoteId: deliveryNoteId || null, // İrsaliye ID'sini bağla
          satinAlmaIrsaliyeId: satinAlmaIrsaliyeId || null,
          warehouseId: transactionWarehouseId || null, // Ambar bilgisi faturada da saklanır
          toplamTutar,
          kdvTutar,
          genelToplam,
          odenenTutar: 0, // FIFO: Başlangıçta ödenmemiş
          odenecekTutar: genelToplam, // FIFO: Tüm tutar ödenmeli
          createdBy: userId,
          satisElemaniId: satisElemaniId || null,
          kalemler: {
            create: kalemlerWithCalculations,
          },
        },
        include: {
          cari: true,
          kalemler: {
            include: {
              stok: true,
            },
          },
        },
      });

      // Eğer sipariş varsa ve geçerli bir ID'si varsa, siparişi faturalandı olarak işaretle
      if (siparis && siparis.id) {
        await prisma.siparis.update({
          where: { id: siparis.id },
          data: {
            durum: 'FATURALANDI',
            faturaNo: faturaData.faturaNo,
          },
        });
      }

      // Create movements using the refactored method
      await this.processInvoiceMovements(fatura, prisma, userId, transactionWarehouseId, siparisHazirliklar, tenantId);

      // Audit log oluştur (transaction içinde)
      await this.createLog(
        fatura.id,
        'CREATE',
        userId,
        { fatura: faturaData, kalemler: kalemlerWithCalculations },
        ipAddress,
        userAgent,
        prisma,
      );

      // Kar hesaplama (sadece SATIS faturaları için)
      if (faturaData.faturaTipi === 'SATIS') {
        try {
          await this.invoiceProfitService.calculateAndSaveProfit(
            fatura.id,
            userId,
            prisma, // Transaction içindeki prisma instance'ını geçir
          );
        } catch (error: any) {
          // Kar hesaplama hatası fatura oluşturmayı engellemez, sadece log'lanır
          console.error(
            `[FaturaService] Fatura ${fatura.id} (${fatura.faturaNo}) için kar hesaplama hatası:`,
            {
              faturaId: fatura.id,
              faturaNo: fatura.faturaNo,
              error: error?.message || error,
              stack: error?.stack,
              userId,
            },
          );
        }
      }

      return fatura;
    });

    // Maliyetlendirme (sadece ALIS faturaları için ve parametre açıksa) - TRANSACTION DIŞINDA
    if (faturaData.faturaTipi === 'ALIS') {
      try {
        const autoCostingEnabled = await this.systemParameterService.getParameterAsBoolean(
          'AUTO_COSTING_ON_PURCHASE_INVOICE',
          true,
        );

        if (autoCostingEnabled) {
          await this.calculateCostsForInvoiceItems(
            createdFatura.kalemler,
            createdFatura.id,
            createdFatura.faturaNo,
          );
        }
      } catch (error: any) {
        console.error(
          `[FaturaService] Fatura ${createdFatura.id} (${createdFatura.faturaNo}) için maliyetlendirme hatası:`,
          { error: error?.message || error },
        );
      }
    }

    return createdFatura;
  }

  async update(
    id: string,
    updateFaturaDto: UpdateFaturaDto,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const fatura = await this.findOne(id);

    // Eğer kalemler güncellenmiyorsa sadece fatura bilgilerini güncelle
    if (!updateFaturaDto.kalemler) {
      const { cariId, faturaNo, faturaTipi, kalemler, warehouseId, siparisId, irsaliyeId, satisElemaniId, ...updateData } =
        updateFaturaDto;

      // Fatura no değiştiriliyorsa benzersizlik kontrolü (mevcut kayıt hariç)
      if (faturaNo !== undefined && faturaNo.trim() !== '' && faturaNo !== fatura.faturaNo) {
        const tenantId = fatura.tenantId ?? undefined;
        const existing = await this.prisma.fatura.findFirst({
          where: {
            faturaNo: faturaNo.trim(),
            ...(tenantId && { tenantId }),
            id: { not: id },
          },
        });
        if (existing) {
          throw new BadRequestException(
            `Bu fatura numarası zaten mevcut: ${faturaNo}`,
          );
        }
      }

      const updated = await this.prisma.fatura.update({
        where: { id },
        data: {
          ...updateData,
          updatedBy: userId,
          satisElemaniId,
          ...(updateFaturaDto.warehouseId !== undefined && { warehouseId: updateFaturaDto.warehouseId || null }),
          ...(faturaNo !== undefined && faturaNo.trim() !== '' && { faturaNo: faturaNo.trim() }),
        },
        include: {
          cari: true,
          kalemler: {
            include: {
              stok: true,
            },
          },
        },
      });

      // Audit log
      await this.createLog(id, 'UPDATE', userId, updateData, ipAddress, userAgent);

      // Durum değişikliği ve hareketlerin işlenmesi
      if (updateFaturaDto.durum === 'ONAYLANDI' && fatura.durum !== 'ONAYLANDI') {
        const whId = updateFaturaDto.warehouseId ?? (updated as { warehouseId?: string | null }).warehouseId ?? (fatura as { warehouseId?: string | null }).warehouseId ?? undefined;
        await this.prisma.$transaction(async (tx) => {
          await this.processInvoiceMovements(updated, tx, userId, whId, [], updated.tenantId ?? fatura.tenantId);
        });
      }

      // Maliyetlendirme
      if (updated.faturaTipi === 'ALIS') {
        try {
          const autoCostingEnabled = await this.systemParameterService.getParameterAsBoolean('AUTO_COSTING_ON_PURCHASE_INVOICE', true);
          if (autoCostingEnabled) {
            await this.calculateCostsForInvoiceItems(updated.kalemler, updated.id, updated.faturaNo);
          }
        } catch (error: any) {
          console.error(`Maliyetlendirme hatası (update): ${error.message}`);
        }
      }

      return updated;
    }

    // Kalemler güncelleniyorsa yeniden hesaplama yap
    const { kalemler, warehouseId, siparisId, irsaliyeId, ...faturaData } = updateFaturaDto;

    // Fatura no değiştiriliyorsa benzersizlik kontrolü (kalemli güncelleme dalı)
    const newFaturaNo = faturaData.faturaNo != null && String(faturaData.faturaNo).trim() !== '' ? String(faturaData.faturaNo).trim() : null;
    if (newFaturaNo && newFaturaNo !== fatura.faturaNo) {
      const tenantId = fatura.tenantId ?? undefined;
      const existing = await this.prisma.fatura.findFirst({
        where: {
          faturaNo: newFaturaNo,
          ...(tenantId && { tenantId }),
          id: { not: id },
        },
      });
      if (existing) {
        throw new BadRequestException(
          `Bu fatura numarası zaten mevcut: ${newFaturaNo}`,
        );
      }
    }

    let toplamTutar = 0;
    let kdvTutar = 0;

    const kalemlerWithCalculations = kalemler.map((kalem) => {
      const miktar = Math.max(1, Math.floor(Number(kalem.miktar) || 1));
      const birimFiyat = Number(kalem.birimFiyat) || 0;
      const rawTutar = miktar * birimFiyat;

      // Satır bazlı iskonto hesapla
      const iskontoOrani = kalem.iskontoOrani !== undefined ? Number(kalem.iskontoOrani) : 0;
      let iskontoTutari = 0;

      if (kalem.iskontoTutari !== undefined && kalem.iskontoTutari !== null && Number(kalem.iskontoTutari) > 0) {
        iskontoTutari = Number(kalem.iskontoTutari);
      } else {
        iskontoTutari = (rawTutar * iskontoOrani) / 100;
      }

      const tutar = rawTutar - iskontoTutari;
      // 0 geçerli KDV oranı; || 0 ile 0'ı ezmeyelim
      const rawKdv = kalem.kdvOrani;
      const kdvOraniInt =
        rawKdv === 0 || (typeof rawKdv === 'string' && rawKdv === '0')
          ? 0
          : Math.round(Number(rawKdv) || 0);
      const kalemKdv = (tutar * kdvOraniInt) / 100;

      toplamTutar += tutar;
      kdvTutar += kalemKdv;

      // Sadece Prisma FaturaKalemi alanları; ek alanlar (örn. stok objesi) create'i bozmasın
      return {
        stokId: String(kalem.stokId),
        miktar,
        birimFiyat,
        kdvOrani: kdvOraniInt,
        iskontoOrani: new Decimal(iskontoOrani),
        iskontoTutari: new Decimal(iskontoTutari),
        tutar: new Decimal(tutar),
        kdvTutar: new Decimal(kalemKdv),
      };
    });

    const iskonto = faturaData.iskonto !== undefined ? faturaData.iskonto : fatura.iskonto.toNumber();
    toplamTutar -= iskonto;
    const genelToplam = toplamTutar + kdvTutar;

    // Döviz hesaplama (Update)
    let { dovizCinsi, dovizKuru } = updateFaturaDto;
    if (!dovizCinsi && fatura.dovizCinsi) dovizCinsi = fatura.dovizCinsi;

    let dovizToplam: number | null = null;

    if (dovizCinsi && dovizCinsi !== 'TRY') {
      // Eğer kur gönderilmemişse ve döviz cinsi değişmediyse eski kuru kullan, değiştiyse yeni kur çek
      if (!dovizKuru) {
        if (dovizCinsi === fatura.dovizCinsi && fatura.dovizKuru) {
          dovizKuru = fatura.dovizKuru.toNumber();
        } else {
          try {
            dovizKuru = await this.tcmbService.getCurrentRate(dovizCinsi);
          } catch (error) {
            console.error(`Kur alınamadı: ${error}`);
          }
        }
      }

      if (dovizKuru && dovizKuru > 0) {
        dovizToplam = new Decimal(genelToplam).div(dovizKuru).toNumber();
      }
    }

    const updatedFatura = await this.prisma.$transaction(
      async (prisma) => {
      // Onaylı faturada kalem/ambar güncellemesi: önce eski hareketleri geri al, sonra yeni kalemlerle yeniden uygula
      if (fatura.durum === 'ONAYLANDI') {
        await this.reverseInvoiceMovements(fatura, prisma, fatura.tenantId ?? undefined);
      }

      // Eski kalemleri sil
      await prisma.faturaKalemi.deleteMany({
        where: { faturaId: id },
      });

      // Faturayı güncelle ve yeni kalemleri ekle
      const updated = await prisma.fatura.update({
        where: { id },
        data: {
          ...faturaData,
          dovizCinsi: dovizCinsi || 'TRY',
          dovizKuru: dovizKuru ? new Decimal(dovizKuru) : new Decimal(1),
          dovizToplam: dovizToplam ? new Decimal(dovizToplam) : null,
          toplamTutar,
          kdvTutar,
          genelToplam,
          updatedBy: userId,
          ...(warehouseId !== undefined && { warehouseId: warehouseId || null }),
          kalemler: {
            create: kalemlerWithCalculations,
          },
        },
        include: {
          cari: true,
          kalemler: {
            include: {
              stok: true,
            },
          },
        },
      });

      // Audit log (transaction içinde)
      await this.createLog(
        id,
        'UPDATE',
        userId,
        { ...faturaData, kalemler: kalemlerWithCalculations },
        ipAddress,
        userAgent,
        prisma,
      );

      if (updated.faturaTipi === 'SATIS') {
        try {
          await this.invoiceProfitService.calculateAndSaveProfit(
            updated.id,
            userId,
            prisma,
          );
        } catch (error: any) {
          console.error(`Kar hesaplama hatası (update): ${error.message}`);
        }
      }

      // Hareketlerin işlenmesi: durum ONAYLANDI'ya geçiyorsa veya fatura zaten ONAYLANDI ise (düzenleme sonrası yeniden uygula)
      const shouldProcessMovements =
        (updateFaturaDto.durum === 'ONAYLANDI' && fatura.durum !== 'ONAYLANDI') ||
        fatura.durum === 'ONAYLANDI';
      if (shouldProcessMovements) {
        await this.processInvoiceMovements(
          updated,
          prisma,
          userId,
          warehouseId ?? (updated as { warehouseId?: string | null }).warehouseId ?? undefined,
          [],
          updated.tenantId ?? fatura.tenantId,
        );
      }

      return updated;
    },
    { timeout: 30000 }
    );

    // Maliyetlendirme (sadece ALIS faturaları için ve parametre açıksa) - TRANSACTION DIŞINDA
    if (fatura.faturaTipi === 'ALIS') {
      const shouldCalculateCosts =
        fatura.durum !== 'ONAYLANDI' || updateFaturaDto.kalemler || updateFaturaDto.durum;

      if (shouldCalculateCosts) {
        try {
          const autoCostingEnabled = await this.systemParameterService.getParameterAsBoolean(
            'AUTO_COSTING_ON_PURCHASE_INVOICE',
            true,
          );

          if (autoCostingEnabled) {
            await this.calculateCostsForInvoiceItems(
              updatedFatura.kalemler,
              updatedFatura.id,
              updatedFatura.faturaNo,
            );
          }
        } catch (error: any) {
          console.error(
            `[FaturaService] Fatura ${updatedFatura.id} (${updatedFatura.faturaNo}) için maliyetlendirme güncelleme hatası:`,
            { error: error?.message || error },
          );
        }
      }
    }

    return updatedFatura;
  }

  async remove(
    id: string,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const tenantId = await this.tenantResolver.resolveForQuery();
    if (!tenantId) throw new BadRequestException('Tenant ID bulunamadı.');

    const fatura = await this.findOne(id);

    // Merkezi koruma kontrolü
    await this.deletionProtection.checkFaturaDeletion(id, tenantId);

    // Soft delete: Fiziksel silme yerine işaretle
    const deletedFatura = await this.prisma.$transaction(async (prisma) => {
      // Cari hareket kaydını sil ve stok hareketlerini sil (eğer onaylanmışsa)
      if (fatura.durum === 'ONAYLANDI') {
        await prisma.cariHareket.deleteMany({
          where: {
            cariId: fatura.cariId,
            belgeTipi: 'FATURA',
            belgeNo: fatura.faturaNo,
          },
        });

        // Cari bakiyeyi geri al
        await prisma.cari.update({
          where: { id: fatura.cariId },
          data: {
            bakiye:
              fatura.faturaTipi === 'SATIS'
                ? { decrement: fatura.genelToplam }
                : { increment: fatura.genelToplam },
          },
        });

        // Faturaya ait malzeme (stok) hareketlerini sil (ters hareket oluşturmak yerine kayıtları kaldır)
        const kalemIds = fatura.kalemler?.map((k) => k.id) ?? [];
        if (kalemIds.length > 0) {
          await prisma.stokHareket.deleteMany({
            where: { faturaKalemiId: { in: kalemIds } },
          });
        }

        // Ambar stoklarını geri al (WMS açıksa)
        const rawWh = (fatura as any).warehouseId;
        const transactionWarehouseId = rawWh && String(rawWh).trim() ? String(rawWh).trim() : undefined;
        for (const kalem of fatura.kalemler ?? []) {
          if (!kalem.stokId) continue;
          const miktar = Number(kalem.miktar) || 0;
          if (miktar <= 0) continue;
          if (transactionWarehouseId) {
            await this.reverseWarehouseStockForInvoice(
              transactionWarehouseId,
              kalem.stokId,
              miktar,
              fatura.faturaTipi,
              prisma,
            );
          }
        }
        if (fatura.faturaTipi === 'SATIS' && fatura.deliveryNoteId && !transactionWarehouseId) {
          const satisIrsaliyesi = await prisma.satisIrsaliyesi.findUnique({
            where: { id: fatura.deliveryNoteId },
            select: { depoId: true },
          });
          if (satisIrsaliyesi?.depoId) {
            for (const kalem of fatura.kalemler ?? []) {
              if (!kalem.stokId) continue;
              const miktar = Number(kalem.miktar) || 0;
              if (miktar <= 0) continue;
              await this.reverseWarehouseStockForInvoice(
                satisIrsaliyesi.depoId,
                kalem.stokId,
                miktar,
                fatura.faturaTipi,
                prisma,
              );
            }
          }
        }
        if (fatura.faturaTipi === 'ALIS' && !transactionWarehouseId && fatura.satinAlmaIrsaliyeId) {
          const irsaliye = await prisma.satınAlmaIrsaliyesi.findUnique({
            where: { id: fatura.satinAlmaIrsaliyeId },
            select: { depoId: true },
          });
          if (irsaliye?.depoId) {
            for (const kalem of fatura.kalemler ?? []) {
              if (!kalem.stokId) continue;
              const miktar = Number(kalem.miktar) || 0;
              if (miktar <= 0) continue;
              await this.reverseWarehouseStockForInvoice(
                irsaliye.depoId,
                kalem.stokId,
                miktar,
                fatura.faturaTipi,
                prisma,
              );
            }
          }
        }
      }

      // Soft delete: deletedAt ve deletedBy ayarla
      const deleted = await prisma.fatura.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          deletedBy: userId,
        },
      });

      // Audit log (transaction içinde)
      await this.createLog(
        id,
        'DELETE',
        userId,
        { fatura },
        ipAddress,
        userAgent,
        prisma,
      );

      return deleted;
    });

    // Maliyetlendirme (sadece ALIS faturaları için ve parametre açıksa) - TRANSACTION DIŞINDA
    if (fatura.faturaTipi === 'ALIS') {
      try {
        const autoCostingEnabled = await this.systemParameterService.getParameterAsBoolean(
          'AUTO_COSTING_ON_PURCHASE_INVOICE',
          true,
        );

        if (autoCostingEnabled) {
          await this.calculateCostsForInvoiceItems(
            fatura.kalemler,
            fatura.id,
            fatura.faturaNo,
          );
        }
      } catch (error: any) {
        console.error(
          `[FaturaService] Fatura ${fatura.id} (${fatura.faturaNo}) için silme maliyetlendirme hatası:`,
          { error: error?.message || error },
        );
      }
    }

    return deletedFatura;
  }

  async findDeleted(
    page = 1,
    limit = 50,
    faturaTipi?: FaturaTipi,
    search?: string,
  ) {
    const skip = (page - 1) * limit;

    const where: Prisma.FaturaWhereInput = {
      deletedAt: { not: null }, // Sadece silinmiş kayıtlar
    };

    if (faturaTipi) {
      where.faturaTipi = faturaTipi;
    }

    if (search) {
      where.OR = [
        { faturaNo: { contains: search, mode: 'insensitive' } },
        { cari: { unvan: { contains: search, mode: 'insensitive' } } },
        { cari: { cariKodu: { contains: search, mode: 'insensitive' } } },
      ];
    }

    const [data, total] = await Promise.all([
      this.prisma.fatura.findMany({
        where,
        skip,
        take: limit,
        include: {
          cari: true,
          deletedByUser: {
            select: {
              id: true,
              fullName: true,
              username: true,
            },
          },
          _count: {
            select: {
              kalemler: true,
            },
          },
        },
        orderBy: { deletedAt: 'desc' },
      }),
      this.prisma.fatura.count({ where }),
    ]);

    return {
      data: data.map((item) => ({
        ...item,
        kalanTutar: Number(item.genelToplam) - Number(item.odenenTutar || 0),
      })),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  async restore(
    id: string,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const fatura = await this.prisma.fatura.findUnique({
      where: { id },
      include: {
        cari: true,
        kalemler: true,
      },
    });

    if (!fatura) {
      throw new NotFoundException(`Fatura bulunamadı: ${id}`);
    }

    if (!fatura.deletedAt) {
      throw new BadRequestException(
        'Bu fatura silinmemiş, geri yükleme yapılamaz.',
      );
    }

    return this.prisma.$transaction(async (prisma) => {
      // Faturayı geri yükle
      const restored = await prisma.fatura.update({
        where: { id },
        data: {
          deletedAt: null,
          deletedBy: null,
          updatedBy: userId,
        },
        include: {
          cari: true,
          kalemler: {
            include: {
              stok: true,
            },
          },
        },
      });

      // Eğer durum ONAYLANDI ise, stok ve cari işlemlerini tekrar yap
      if (fatura.durum === 'ONAYLANDI') {
        // Cari hareket kaydı oluştur
        const cariBakiye = this.toDecimalNumber(fatura.cari?.bakiye);
        const gt = this.toDecimalNumber(fatura.genelToplam);
        await prisma.cariHareket.create({
          data: {
            cariId: fatura.cariId,
            tip: fatura.faturaTipi === 'SATIS' ? 'BORC' : 'ALACAK',
            tutar: gt,
            bakiye: fatura.faturaTipi === 'SATIS' ? cariBakiye + gt : cariBakiye - gt,
            belgeTipi: 'FATURA',
            belgeNo: fatura.faturaNo,
            tarih: fatura.tarih,
            aciklama: `${fatura.faturaTipi === 'SATIS' ? 'Satış' : 'Alış'} Faturası: ${fatura.faturaNo} (Geri Yüklendi)`,
          },
        });

        // Cari bakiyeyi güncelle
        await prisma.cari.update({
          where: { id: fatura.cariId },
          data: {
            bakiye:
              fatura.faturaTipi === 'SATIS'
                ? { increment: fatura.genelToplam }
                : { decrement: fatura.genelToplam },
          },
        });

        // Stok hareketlerini yeniden oluştur - fatura kalemi ile ilişkilendir
        if (fatura.faturaTipi === 'SATIS') {
          for (const kalem of fatura.kalemler) {
            await prisma.stokHareket.create({
              data: {
                stokId: kalem.stokId,
                hareketTipi: 'SATIS',
                miktar: kalem.miktar,
                birimFiyat: kalem.birimFiyat,
                aciklama: `Satış Faturası: ${fatura.faturaNo} (Geri Yüklendi)`,
                faturaKalemiId: kalem.id,
              },
            });
          }
        } else if (fatura.faturaTipi === 'ALIS') {
          for (const kalem of fatura.kalemler) {
            await prisma.stokHareket.create({
              data: {
                stokId: kalem.stokId,
                hareketTipi: 'GIRIS',
                miktar: kalem.miktar,
                birimFiyat: kalem.birimFiyat,
                aciklama: `Alış Faturası: ${fatura.faturaNo} (Geri Yüklendi)`,
                faturaKalemiId: kalem.id,
              },
            });
          }
        }
      }

      // Audit log (transaction içinde)
      await this.createLog(
        id,
        'RESTORE',
        userId,
        { fatura },
        ipAddress,
        userAgent,
        prisma,
      );

      return restored;
    });
  }

  async iptalEt(
    id: string,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
    irsaliyeIptal?: boolean,
  ) {
    const fatura = await this.findOne(id);

    // ⚠️ GÜVENLIK KONTROLLERI

    // 1. Zaten iptal edilmiş mi?
    if (fatura.durum === 'IPTAL') {
      throw new BadRequestException('Bu fatura zaten iptal edilmiş.');
    }

    // 2. ONAYLANDI veya ACIK (beklemede) faturalar iptal edilebilir.
    // ACIK ise hareketler zaten uygulanmamış (veya ONAYLANDI→ACIK ile geri alınmış), stok/cari tekrar işlenmez.
    if (fatura.durum !== 'ONAYLANDI' && fatura.durum !== 'ACIK') {
      throw new BadRequestException(
        'Sadece ONAYLANDI veya ACIK (beklemede) durumundaki faturalar iptal edilebilir.',
      );
    }

    // 3. Ödeme yapılmış faturalar iptal edilemez!
    const odenenTutar = Number(fatura.odenenTutar || 0);
    if (odenenTutar > 0.01) {
      throw new BadRequestException(
        `Bu faturaya ₺${odenenTutar.toFixed(2)} ödeme yapılmış. ` +
        'Ödemeli faturalar iptal edilemez. Önce ödemeleri iptal edin.',
      );
    }

    return this.prisma.$transaction(async (prisma) => {
      // Sadece ONAYLANDI faturalarda cari/stok hareketleri uygulanmıştır.
      // SATIS/ALIS iptal: Sadece cari geri alınır, stok hareketi oluşturulmaz (fatura durumu iptal olduğu için stok hesaplamasında dikkate alınmaz).
      // SATIS_IADE/ALIS_IADE: Hem cari hem stok geri alınır.
      if (fatura.durum === 'ONAYLANDI') {
        if (fatura.faturaTipi === 'SATIS' || fatura.faturaTipi === 'ALIS') {
          await this.reverseCariOnlyForInvoice(fatura, prisma);
        } else {
          await this.reverseInvoiceMovements(fatura, prisma, fatura.tenantId ?? undefined, true);
        }
      }

      // Fatura durumunu IPTAL yap
      const iptaldiFatura = await prisma.fatura.update({
        where: { id },
        data: { durum: 'IPTAL' },
        include: {
          cari: true,
          kalemler: {
            include: {
              stok: true,
            },
          },
        },
      });

      // İptal hareket kaydı (sadece ONAYLANDI'dan iptal edildiyse - cari bakiyeyi göstermek için)
      if (fatura.durum === 'ONAYLANDI') {
        const cariGuncel = await prisma.cari.findUnique({
          where: { id: fatura.cariId },
          select: { bakiye: true },
        });
        if (cariGuncel) {
          await prisma.cariHareket.create({
            data: {
              cariId: fatura.cariId,
              tip: fatura.faturaTipi === 'SATIS' ? 'ALACAK' : 'BORC',
              tutar: this.toDecimalNumber(fatura.genelToplam),
              bakiye: this.toDecimalNumber(cariGuncel.bakiye),
              belgeTipi: 'DUZELTME',
              belgeNo: `${fatura.faturaNo}-IPTAL`,
              tarih: new Date(),
              aciklama: `Fatura İptali: ${fatura.faturaNo}`,
            },
          });
        }
      }

      // Eğer irsaliyeIptal true ise ve faturaya bağlı irsaliye varsa
      // SATIS/ALIS iptal: Stok hareketi oluşturulmaz (fatura iptal = stok hesaplamasında dikkate alınmaz)
      if (irsaliyeIptal && fatura.deliveryNoteId) {
        const irsaliye = await prisma.satisIrsaliyesi.findUnique({
          where: { id: fatura.deliveryNoteId },
        });
        if (irsaliye && irsaliye.durum === 'FATURALANDI') {
          await prisma.satisIrsaliyesi.update({
            where: { id: irsaliye.id },
            data: { durum: IrsaliyeDurum.FATURALANMADI },
          });
        }
      }
      if (irsaliyeIptal && fatura.satinAlmaIrsaliyeId) {
        const irsaliye = await prisma.satınAlmaIrsaliyesi.findUnique({
          where: { id: fatura.satinAlmaIrsaliyeId },
        });
        if (irsaliye && irsaliye.durum === 'FATURALANDI') {
          await prisma.satınAlmaIrsaliyesi.update({
            where: { id: irsaliye.id },
            data: { durum: IrsaliyeDurum.FATURALANMADI },
          });
        }
      }

      // Audit log (transaction içinde)
      await this.createLog(
        id,
        'IPTAL',
        userId,
        { eskiDurum: fatura.durum, yeniDurum: 'IPTAL', irsaliyeIptal },
        ipAddress,
        userAgent,
        prisma,
      );

      return iptaldiFatura;
    });
  }

  async changeDurum(
    id: string,
    yeniDurum: FaturaDurum,
    userId?: string,
    ipAddress?: string,
    userAgent?: string,
  ) {
    const fatura = await this.findOne(id);
    const eskiDurum = fatura.durum;

    if (eskiDurum === yeniDurum) {
      throw new BadRequestException('Fatura zaten bu durumda.');
    }

    return this.prisma.$transaction(async (prisma) => {
      // Eski durum ONAYLANDI ise: SATIS/ALIS için sadece cari geri alınır; SATIS_IADE/ALIS_IADE için cari+stok geri alınır
      if (eskiDurum === 'ONAYLANDI') {
        if (fatura.faturaTipi === 'SATIS' || fatura.faturaTipi === 'ALIS') {
          await this.reverseCariOnlyForInvoice(fatura, prisma);
        } else {
          await this.reverseInvoiceMovements(fatura, prisma, fatura.tenantId ?? undefined);
        }
      }

      // Yeni durum ONAYLANDI ise: cari hareket oluşturulur, stok eksilir (SATIS) veya stoğa eklenir (ALIS)
      if (yeniDurum === 'ONAYLANDI') {
        if (fatura.faturaTipi === 'SATIS') {
          try {
            await this.invoiceProfitService.recalculateProfit(id, userId);
          } catch (error) {
            console.error('Kar hesaplama hatası:', error);
          }
        }
        const whId = (fatura as any).warehouseId ?? undefined;
        await this.processInvoiceMovements(
          fatura,
          prisma,
          userId,
          whId,
          [],
          fatura.tenantId ?? undefined,
        );
      }

      // Yeni durum IPTAL ise, iptal işlemlerini yap
      if (yeniDurum === 'IPTAL') {
        // Eğer eski durum ONAYLANDI değilse, sadece durumu değiştir
        // ONAYLANDI ise yukarıda zaten geri alındı

        // İptal hareket kaydı oluştur (sadece ONAYLANDI'dan geliyorsa)
        if (eskiDurum === 'ONAYLANDI') {
          const cari = await prisma.cari.findUnique({
            where: { id: fatura.cariId },
          });

          if (cari) {
            await prisma.cariHareket.create({
              data: {
                cariId: fatura.cariId,
                tip: fatura.faturaTipi === 'SATIS' ? 'ALACAK' : 'BORC',
                tutar: this.toDecimalNumber(fatura.genelToplam),
                bakiye: this.toDecimalNumber(cari.bakiye),
                belgeTipi: 'DUZELTME',
                belgeNo: `${fatura.faturaNo}-IPTAL`,
                tarih: new Date(),
                aciklama: `Fatura İptali: ${fatura.faturaNo}`,
              },
            });
          }
        }
      }

      // Fatura durumunu güncelle
      const updated = await prisma.fatura.update({
        where: { id },
        data: {
          durum: yeniDurum,
          updatedBy: userId,
        },
        include: {
          cari: true,
          kalemler: {
            include: {
              stok: true,
            },
          },
        },
      });

      // Audit log (transaction içinde)
      await this.createLog(
        id,
        'DURUM_DEGISIKLIK',
        userId,
        { eskiDurum, yeniDurum },
        ipAddress,
        userAgent,
        prisma,
      );

      return updated;
    });
  }

  async getVadeAnaliz(cariId?: string) {
    // Sadece ONAYLANDI ve KAPALI olmayan (ödenmemiş/kısmen ödenmiş) faturaları al
    const where: Prisma.FaturaWhereInput = {
      deletedAt: null,
      durum: 'ONAYLANDI', // Sadece onaylanmış faturalar
      odenecekTutar: {
        gt: 0.01, // Kalan borcu olanlar
      },
    };

    if (cariId) {
      where.cariId = cariId;
    }

    const faturalar = await this.prisma.fatura.findMany({
      where,
      include: {
        cari: {
          select: {
            id: true,
            cariKodu: true,
            unvan: true,
            tip: true,
          },
        },
      },
      orderBy: [
        { vade: 'asc' }, // En eski vade önce
        { tarih: 'asc' },
      ],
    });

    // Bugünün tarihini al (saat bilgisi olmadan)
    const bugun = new Date();
    bugun.setHours(0, 0, 0, 0);

    // Faturalar için vade analizi
    const analiz = faturalar.map((fatura) => {
      const vade = fatura.vade ? new Date(fatura.vade) : new Date(fatura.tarih);
      vade.setHours(0, 0, 0, 0);

      const kalanGun = Math.ceil(
        (vade.getTime() - bugun.getTime()) / (1000 * 60 * 60 * 24),
      );

      let vadeDurumu: 'GECMIS' | 'BUGUN' | 'YAKLASAN' | 'NORMAL';
      if (kalanGun < 0) {
        vadeDurumu = 'GECMIS'; // Vadesi geçmiş
      } else if (kalanGun === 0) {
        vadeDurumu = 'BUGUN'; // Bugün vade
      } else if (kalanGun <= 7) {
        vadeDurumu = 'YAKLASAN'; // 7 gün içinde
      } else {
        vadeDurumu = 'NORMAL'; // Normal
      }

      return {
        id: fatura.id,
        faturaNo: fatura.faturaNo,
        faturaTipi: fatura.faturaTipi,
        cari: fatura.cari,
        tarih: fatura.tarih,
        vade: fatura.vade,
        genelToplam: fatura.genelToplam,
        odenenTutar: fatura.odenenTutar,
        odenecekTutar: fatura.odenecekTutar,
        kalanGun,
        vadeDurumu,
        gecenGun: kalanGun < 0 ? Math.abs(kalanGun) : 0, // Kaç gün geçti
      };
    });

    // Özet istatistikler
    const ozet = {
      toplam: analiz.length,
      toplamTutar: analiz.reduce((sum, f) => sum + Number(f.genelToplam), 0),
      toplamKalanTutar: analiz.reduce(
        (sum, f) => sum + Number(f.odenecekTutar),
        0,
      ),

      vadesiGecenler: {
        adet: analiz.filter((f) => f.vadeDurumu === 'GECMIS').length,
        tutar: analiz
          .filter((f) => f.vadeDurumu === 'GECMIS')
          .reduce((sum, f) => sum + Number(f.odenecekTutar), 0),
      },

      bugunVadenler: {
        adet: analiz.filter((f) => f.vadeDurumu === 'BUGUN').length,
        tutar: analiz
          .filter((f) => f.vadeDurumu === 'BUGUN')
          .reduce((sum, f) => sum + Number(f.odenecekTutar), 0),
      },

      yaklaşanlar: {
        adet: analiz.filter((f) => f.vadeDurumu === 'YAKLASAN').length,
        tutar: analiz
          .filter((f) => f.vadeDurumu === 'YAKLASAN')
          .reduce((sum, f) => sum + Number(f.odenecekTutar), 0),
      },

      normalFaturalar: {
        adet: analiz.filter((f) => f.vadeDurumu === 'NORMAL').length,
        tutar: analiz
          .filter((f) => f.vadeDurumu === 'NORMAL')
          .reduce((sum, f) => sum + Number(f.odenecekTutar), 0),
      },
    };

    // Cari bazlı özet (cariId yoksa)
    const cariOzet = cariId ? null : await this.getCariBazliVadeOzet(analiz);

    return {
      ozet,
      cariOzet,
      faturalar: analiz,
    };
  }

  private async getCariBazliVadeOzet(analiz: any[]) {
    // Cari bazında grupla
    const cariMap = new Map<string, any>();

    analiz.forEach((fatura) => {
      const cariId = fatura.cari.id;
      if (!cariMap.has(cariId)) {
        cariMap.set(cariId, {
          cari: fatura.cari,
          toplamFatura: 0,
          toplamKalan: 0,
          vadesiGecen: 0,
          vadesiGecenTutar: 0,
        });
      }

      const cariData = cariMap.get(cariId);
      cariData.toplamFatura += 1;
      cariData.toplamKalan += Number(fatura.odenecekTutar);

      if (fatura.vadeDurumu === 'GECMIS') {
        cariData.vadesiGecen += 1;
        cariData.vadesiGecenTutar += Number(fatura.odenecekTutar);
      }
    });

    // Map'i array'e çevir ve vadesi geçenleri başa al
    return Array.from(cariMap.values()).sort(
      (a, b) => b.vadesiGecenTutar - a.vadesiGecenTutar,
    );
  }

  /**
   * Malzeme Hazırlama Fişi - Depo görevlileri için
   * Fatura kalemlerindeki ürünlerin hangi rafta olduğunu gösterir
   */
  async getMalzemeHazirlamaFisi(faturaId: string) {
    // Faturayı ve kalemlerini getir
    const fatura = await this.prisma.fatura.findUnique({
      where: { id: faturaId },
      include: {
        cari: {
          select: {
            id: true,
            cariKodu: true,
            unvan: true,
            telefon: true,
            adres: true,
          },
        },
        kalemler: {
          include: {
            stok: {
              select: {
                id: true,
                stokKodu: true,
                stokAdi: true,
                birim: true,
                raf: true, // Eski raf sistemi
                barkod: true,
                marka: true,
                model: true,
              },
            },
          },
          orderBy: {
            stok: {
              stokKodu: 'asc',
            },
          },
        },
      },
    });

    if (!fatura) {
      throw new NotFoundException('Fatura bulunamadı');
    }

    // Her ürün için raf lokasyonlarını getir (yeni sistem)
    const kalemlerWithRaf = await Promise.all(
      fatura.kalemler.map(async (kalem) => {
        // ProductLocationStock'tan raf bilgilerini al
        const rafBilgileri = await this.prisma.productLocationStock.findMany({
          where: {
            productId: kalem.stokId,
            qtyOnHand: {
              gt: 0, // Sadece stokta olan raflar
            },
          },
          include: {
            location: {
              select: {
                id: true,
                code: true,
                barcode: true,
                name: true,
                layer: true,
                corridor: true,
                side: true,
                section: true,
                level: true,
              },
            },
            warehouse: {
              select: {
                id: true,
                code: true,
                name: true,
              },
            },
          },
          orderBy: [
            { qtyOnHand: 'desc' }, // En çok stok olan rafları önce göster
            { location: { code: 'asc' } },
          ],
        });

        return {
          stokId: kalem.stokId,
          stokKodu: kalem.stok.stokKodu,
          stokAdi: kalem.stok.stokAdi,
          birim: kalem.stok.birim,
          barkod: kalem.stok.barkod,
          marka: kalem.stok.marka,
          model: kalem.stok.model,
          istenenMiktar: kalem.miktar,
          birimFiyat: kalem.birimFiyat,
          kdvOrani: kalem.kdvOrani,
          // Raf bilgileri
          eskiRaf: kalem.stok.raf, // Eski sistemdeki raf
          raflar: rafBilgileri.map((raf) => ({
            depoKodu: raf.warehouse.code,
            depoAdi: raf.warehouse.name,
            rafKodu: raf.location.code,
            rafBarkod: raf.location.barcode,
            rafAciklama: raf.location.name,
            kat: raf.location.layer,
            koridor: raf.location.corridor,
            taraf: raf.location.side,
            bolum: raf.location.section,
            seviye: raf.location.level,
            mevcutMiktar: raf.qtyOnHand,
          })),
          toplamMevcutMiktar: rafBilgileri.reduce(
            (sum, raf) => sum + raf.qtyOnHand,
            0,
          ),
          toplamRafSayisi: rafBilgileri.length,
        };
      }),
    );

    return {
      fatura: {
        id: fatura.id,
        faturaNo: fatura.faturaNo,
        faturaTipi: fatura.faturaTipi,
        tarih: fatura.tarih,
        vade: fatura.vade,
        durum: fatura.durum,
        toplamTutar: fatura.toplamTutar,
        kdvTutar: fatura.kdvTutar,
        genelToplam: fatura.genelToplam,
        aciklama: fatura.aciklama,
      },
      cari: fatura.cari,
      kalemler: kalemlerWithRaf,
      hazirlamaBilgisi: {
        toplamKalemSayisi: kalemlerWithRaf.length,
        toplamUrunAdedi: kalemlerWithRaf.reduce(
          (sum, k) => sum + k.istenenMiktar,
          0,
        ),
        eksikUrunler: kalemlerWithRaf.filter(
          (k) => k.toplamMevcutMiktar < k.istenenMiktar,
        ),
        tamUrunler: kalemlerWithRaf.filter(
          (k) => k.toplamMevcutMiktar >= k.istenenMiktar,
        ),
      },
      olusturmaTarihi: new Date(),
    };
  }

  /**
   * E-Fatura gönder - Hızlı Teknoloji API'sine fatura gönderir
   */
  async sendEInvoice(
    faturaId: string,
    hizliService: any, // HizliService instance
    userId?: string,
  ) {
    // Fatura verisini getir
    const fatura = await this.findOne(faturaId);

    if (!fatura) {
      throw new NotFoundException(`Fatura bulunamadı: ${faturaId}`);
    }

    if (fatura.faturaTipi !== 'SATIS') {
      throw new BadRequestException('Sadece satış faturaları E-fatura olarak gönderilebilir');
    }

    if (fatura.durum === 'IPTAL') {
      throw new BadRequestException('İptal edilmiş faturalar E-fatura olarak gönderilemez');
    }

    // Cari bilgilerini kontrol et
    if (!fatura.cari.vergiNo && !fatura.cari.tcKimlikNo) {
      throw new BadRequestException('Cari bilgilerinde VKN veya TC Kimlik No bulunamadı');
    }

    const customerIdentifier = fatura.cari.vergiNo || fatura.cari.tcKimlikNo;

    try {
      // 1. Alıcı URN bilgisini al (GetGibUserList)
      let destinationUrn = '';
      try {
        const gibUserList = await hizliService.getGibUserList(1, 'PK', customerIdentifier);

        // REST API response formatı kontrolü
        if (gibUserList?.IsSucceeded && gibUserList?.gibUserLists && Array.isArray(gibUserList.gibUserLists) && gibUserList.gibUserLists.length > 0) {
          destinationUrn = gibUserList.gibUserLists[0].Alias || '';
          console.log(`✅ Alıcı URN bulundu: ${destinationUrn} (Identifier: ${customerIdentifier})`);
        } else if (gibUserList?.IsSucceeded === false) {
          // API başarısız döndü ama exception fırlatmadı
          throw new BadRequestException(`Alıcı URN bilgisi alınamadı: ${gibUserList?.Message || 'GIB kullanıcı listesi boş veya bulunamadı'}`);
        } else {
          // IsSucceeded undefined veya gibUserLists boş
          throw new BadRequestException(`Alıcı URN bilgisi bulunamadı. GIB kullanıcı listesi boş (Identifier: ${customerIdentifier})`);
        }
      } catch (error: any) {
        // URN alınamazsa hata fırlat
        const errorMessage = error.message || error.response?.data?.message || 'Bilinmeyen hata';
        throw new BadRequestException(`Alıcı URN bilgisi alınamadı: ${errorMessage}`);
      }

      // 2. Fatura verisini Hızlı Teknoloji formatına çevir
      const invoiceModel = this.mapFaturaToInvoiceModel(fatura, destinationUrn);

      // 3. InputInvoiceModel oluştur
      const inputInvoice = {
        AppType: 1, // 1: E-Fatura, 2: E-Arşiv, 3: E-İrsaliye
        SourceUrn: process.env.HIZLI_GB_URN || 'urn:mail:defaultgb@hizlibilisimteknolojileri.net',
        DestinationIdentifier: customerIdentifier,
        DestinationUrn: destinationUrn,
        IsDraft: false,
        IsDraftSend: false,
        IsPreview: false,
        LocalId: null,
        UpdateDocument: false,
        InvoiceModel: invoiceModel,
      };

      // 4. SendInvoiceModel ile gönder
      const result = await hizliService.sendInvoiceModel([inputInvoice]);

      // 5. Sonucu kontrol et ve veritabanına kaydet
      if (result && result.length > 0 && result[0].IsSucceeded) {
        // Başarılı - E-fatura durumunu güncelle
        await this.prisma.fatura.update({
          where: { id: faturaId },
          data: {
            efaturaStatus: 'SENT',
            efaturaEttn: result[0].UUID || null,
            updatedBy: userId,
          },
        });

        // Log kaydı oluştur
        await this.createLog(
          faturaId,
          'EFATURA_GONDERILDI',
          userId,
          {
            ettn: result[0].UUID,
            message: result[0].Message,
          },
        );

        return {
          success: true,
          message: result[0].Message || 'E-fatura başarıyla gönderildi',
          ettn: result[0].UUID,
          data: result[0],
        };
      } else {
        // Başarısız
        const errorMessage = result && result.length > 0 ? result[0].Message : 'Bilinmeyen hata';

        await this.prisma.fatura.update({
          where: { id: faturaId },
          data: {
            efaturaStatus: 'ERROR',
            updatedBy: userId,
          },
        });

        await this.createLog(
          faturaId,
          'EFATURA_GONDERIM_HATASI',
          userId,
          {
            error: errorMessage,
          },
        );

        throw new BadRequestException(`E-fatura gönderilemedi: ${errorMessage}`);
      }
    } catch (error) {
      // Hata durumunda status'u güncelle
      await this.prisma.fatura.update({
        where: { id: faturaId },
        data: {
          efaturaStatus: 'ERROR',
          updatedBy: userId,
        },
      });

      await this.createLog(
        faturaId,
        'EFATURA_GONDERIM_HATASI',
        userId,
        {
          error: error.message,
        },
      );

      throw error;
    }
  }

  /**
   * Fatura verisini Hızlı Teknoloji InvoiceModel formatına çevirir
   */
  private mapFaturaToInvoiceModel(fatura: any, destinationUrn: string) {
    const issueDate = new Date(fatura.tarih);
    const issueDateStr = issueDate.toISOString().split('T')[0]; // YYYY-MM-DD
    const issueTimeStr = issueDate.toTimeString().split(' ')[0]; // HH:mm:ss

    // UUID oluştur (eğer yoksa)
    const uuid = fatura.efaturaEttn || this.generateUUID();

    // Invoice Lines (Kalemler)
    const invoiceLines = fatura.kalemler.map((kalem: any, index: number) => {
      const birimFiyat = Number(kalem.birimFiyat);
      const miktar = Number(kalem.miktar);
      const tutar = birimFiyat * miktar;
      const kdvOrani = Number(kalem.kdvOrani || 0);
      const kdvTutar = (tutar * kdvOrani) / 100;

      // Birim kodunu çevir (C62 = Adet)
      const birimKodu = this.mapBirimToUnitCode(kalem.stok?.birim || 'ADET');

      return {
        ID: index + 1,
        Item_Name: kalem.stok?.stokAdi || 'Mal/Hizmet',
        Quantity_Amount: miktar,
        Quantity_Unit_User: birimKodu,
        Price_Amount: birimFiyat,
        Price_Total: tutar,
        Allowance_Percent: 0,
        Allowance_Amount: 0,
        Allowance_Reason: null,
        Item_ID_Buyer: null,
        Item_ID_Seller: kalem.stok?.stokKodu || null,
        Item_Description: kalem.stok?.aciklama || null,
        Item_Brand: kalem.stok?.marka || null,
        Item_Model: kalem.stok?.model || null,
        Item_Classification: null,
        LineNote: null,
        LineCurrencyCode: null,
        Manufacturers_ItemIdentification: null,
        exportLine: null,
        lineTaxes: [
          {
            Tax_Code: '0015', // KDV kodu
            Tax_Name: 'KDV',
            Tax_Base: tutar,
            Tax_Perc: kdvOrani,
            Tax_Amnt: kdvTutar,
            Tax_Exem: '',
            Tax_Exem_Code: '',
          },
        ],
      };
    });

    // Customer (Alıcı) bilgileri
    const customer = {
      IdentificationID: fatura.cari.vergiNo || fatura.cari.tcKimlikNo || '',
      PartyName: fatura.cari.unvan || '',
      TaxSchemeName: fatura.cari.vergiDairesi || '',
      CountryName: fatura.cari.ulke || 'TÜRKİYE',
      CityName: fatura.cari.il || '',
      CitySubdivisionName: fatura.cari.ilce || '',
      StreetName: fatura.cari.adres || '',
      PostalZone: null,
      ElectronicMail: fatura.cari.email || null,
      Telephone: fatura.cari.telefon || null,
      Telefax: null,
      WebsiteURI: null,
      Person_FirstName: fatura.cari.sirketTipi === 'SAHIS' ? (fatura.cari.isimSoyisim?.split(' ')[0] || '') : '',
      Person_FamilyName: fatura.cari.sirketTipi === 'SAHIS' ? (fatura.cari.isimSoyisim?.split(' ').slice(1).join(' ') || '') : '',
      customerIdentificationsOther: [],
    };

    // Invoice Header
    const invoiceHeader = {
      UUID: uuid,
      Invoice_ID: fatura.faturaNo,
      ProfileID: 'TICARIFATURA', // TICARIFATURA, TEMELFATURA, EARSIVFATURA
      InvoiceTypeCode: 'SATIS',
      IssueDate: issueDateStr,
      IssueTime: issueTimeStr,
      DocumentCurrencyCode: 'TRY',
      CalculationRate: 1,
      XSLT_Adi: 'general', // general.xslt dosyası
      XSLT_Doc: null,
      LineExtensionAmount: Number(fatura.toplamTutar),
      AllowanceTotalAmount: Number(fatura.iskonto || 0),
      TaxInclusiveAmount: Number(fatura.toplamTutar) + Number(fatura.kdvTutar),
      PayableAmount: Number(fatura.genelToplam),
      Note: fatura.aciklama || '',
      Notes: fatura.aciklama ? [{ Note: fatura.aciklama }] : [],
      OrderReferenceId: fatura.siparisNo || null,
      OrderReferenceDate: fatura.siparisNo ? issueDateStr : null,
      IsInternetSale: false,
      IsInternet_PaymentMeansCode: null,
      IsInternet_PaymentDueDate: null,
      IsInternet_InstructionNote: null,
      IsInternet_WebsiteURI: null,
      IsInternet_Delivery_TcknVkn: null,
      IsInternet_Delivery_PartyName: null,
      IsInternet_Delivery_FirstName: null,
      IsInternet_Delivery_FamilyName: null,
      IsInternet_ActualDespatchDate: null,
      Sgk_AccountingCost: null,
      Sgk_Period_StartDate: null,
      Sgk_Period_EndDate: null,
      Sgk_Mukellef_Kodu: null,
      Sgk_Mukellef_Adi: null,
      Sgk_DosyaNo: null,
    };

    // Payment Means (Ödeme bilgileri)
    const paymentMeans = fatura.vade
      ? [
        {
          PaymentMeansCode: 'ZZZ', // Diğer
          InstructionNote: '-',
          PaymentChannelCode: '',
          PaymentDueDate: new Date(fatura.vade).toISOString(),
          PayeeFinancialAccount: null,
          PayeeFinancialCurrencyCode: 'TRY',
        },
      ]
      : [];

    return {
      invoiceheader: invoiceHeader,
      customer: customer,
      invoiceLines: invoiceLines,
      paymentMeans: paymentMeans,
      supplier: null, // Satıcı bilgileri sistemden alınacak (opsiyonel)
      supplierAgent: null,
      customerAgent: null,
      additionalDocumentReferences: [],
      despatchs: [],
    };
  }

  /**
   * Birim kodunu Hızlı Teknoloji unit code'una çevirir
   */
  private mapBirimToUnitCode(birim: string): string {
    const birimMap: Record<string, string> = {
      ADET: 'C62',
      KG: 'KGM',
      TON: 'TNE',
      LITRE: 'LTR',
      METRE: 'MTR',
      M2: 'MTK',
      M3: 'MTQ',
      PAKET: 'PK',
      KUTU: 'CT',
      PALET: 'PF',
    };

    return birimMap[birim.toUpperCase()] || 'C62'; // Varsayılan: Adet
  }

  /**
   * UUID oluşturur
   */
  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  }

  /**
   * Satış faturası istatistikleri (Summary Cards)
   */
  async getSalesStats(faturaTipi?: FaturaTipi) {
    const tenantId = await this.tenantResolver.resolveForQuery();
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const baseWhere: Prisma.FaturaWhereInput = {
      deletedAt: null,
      ...buildTenantWhereClause(tenantId ?? undefined),
      ...(faturaTipi && { faturaTipi }),
    };

    // Sadece onaylanmış faturalar (ACIK/IPTAL hariç)
    const onayliDurumlar: FaturaDurum[] = ['ONAYLANDI', 'KISMEN_ODENDI', 'KAPALI'];

    // Bu ayki toplam satış (sadece onaylanmış)
    const monthlyStats = await this.prisma.fatura.aggregate({
      where: {
        ...baseWhere,
        tarih: { gte: startOfMonth },
        durum: { in: onayliDurumlar },
      },
      _sum: { genelToplam: true },
      _count: true,
    });

    // Tahsilat bekleyen (sadece onaylanmış: ONAYLANDI, KISMEN_ODENDI - KAPALI ödenmiş sayılır)
    const pendingStats = await this.prisma.fatura.aggregate({
      where: {
        ...baseWhere,
        durum: { in: ['ONAYLANDI' as FaturaDurum, 'KISMEN_ODENDI' as FaturaDurum] },
      },
      _sum: { genelToplam: true },
      _count: true,
    });

    // Vadesi geçmiş (sadece onaylanmış, vade < now, KAPALI hariç)
    const overdueStats = await this.prisma.fatura.aggregate({
      where: {
        ...baseWhere,
        vade: { lt: now },
        durum: { in: ['ONAYLANDI' as FaturaDurum, 'KISMEN_ODENDI' as FaturaDurum] },
      },
      _sum: { genelToplam: true },
      _count: true,
    });

    return {
      aylikSatis: {
        tutar: monthlyStats._sum.genelToplam || 0,
        adet: monthlyStats._count || 0,
      },
      tahsilatBekleyen: {
        tutar: pendingStats._sum.genelToplam || 0,
        adet: pendingStats._count || 0,
      },
      vadesiGecmis: {
        tutar: overdueStats._sum.genelToplam || 0,
        adet: overdueStats._count || 0,
      },
    };
  }

  /**
   * TCMB döviz kurunu getirir
   */
  async getExchangeRate(currency: string): Promise<number> {
    return this.tcmbService.getCurrentRate(currency);
  }

  /**
   * Müşteri bazlı fiyat geçmişi
   */
  async getPriceHistory(cariId: string, stokId: string) {
    const tenantId = await this.tenantResolver.resolveForQuery();

    const kalemler = await this.prisma.faturaKalemi.findMany({
      where: {
        stokId,
        fatura: {
          cariId,
          faturaTipi: 'SATIS',
          deletedAt: null,
          ...buildTenantWhereClause(tenantId ?? undefined),
        },
      },
      include: {
        fatura: {
          select: {
            faturaNo: true,
            tarih: true,
          },
        },
      },
      orderBy: {
        fatura: { tarih: 'desc' },
      },
      take: 10,
    });

    return kalemler.map((k) => ({
      faturaNo: k.fatura.faturaNo,
      tarih: k.fatura.tarih,
      birimFiyat: k.birimFiyat,
      miktar: k.miktar,
      tutar: k.tutar,
    }));
  }

  /**
   * Toplu durum güncelleme
   */
  async bulkUpdateDurum(ids: string[], durum: FaturaDurum, userId?: string) {
    const results: Array<{ id: string; success: boolean; message?: string }> = [];

    for (const id of ids) {
      try {
        await this.prisma.fatura.update({
          where: { id },
          data: {
            durum,
            updatedBy: userId,
          },
        });
        // Log the action
        await this.prisma.faturaLog.create({
          data: {
            faturaId: id,
            userId,
            actionType: 'DURUM_DEGISIKLIK',
            changes: JSON.stringify({ durum }),
          },
        });
        results.push({ id, success: true });
      } catch (error: any) {
        results.push({ id, success: false, message: error.message });
      }
    }

    return {
      total: ids.length,
      successful: results.filter((r) => r.success).length,
      failed: results.filter((r) => !r.success).length,
      results,
    };
  }

  /**
   * Gelişmiş filtreleme ile fatura listesi
   */
  async findAllAdvanced(
    page = 1,
    limit = 50,
    faturaTipi?: FaturaTipi,
    search?: string,
    cariId?: string,
    sortBy?: string,
    sortOrder?: 'asc' | 'desc',
    startDate?: string,
    endDate?: string,
    durum?: string,
    satisElemaniId?: string,
  ) {
    const skip = (page - 1) * limit;
    const tenantId = await this.tenantResolver.resolveForQuery();

    const where: Prisma.FaturaWhereInput = {
      deletedAt: null,
      ...buildTenantWhereClause(tenantId ?? undefined),
    };

    if (faturaTipi) where.faturaTipi = faturaTipi;
    if (cariId) where.cariId = cariId;
    if (satisElemaniId) where.satisElemaniId = satisElemaniId;

    // Tarih aralığı filtresi
    if (startDate || endDate) {
      where.tarih = {};
      if (startDate) (where.tarih as any).gte = new Date(startDate);
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23, 59, 59, 999);
        (where.tarih as any).lte = end;
      }
    }

    // Durum filtresi (virgülle ayrılmış: ACIK,ONAYLANDI)
    if (durum) {
      const durumlar = durum.split(',').map((d) => d.trim()) as FaturaDurum[];
      where.durum = { in: durumlar };
    }

    if (search) {
      where.OR = [
        { faturaNo: { contains: search, mode: 'insensitive' } },
        { cari: { unvan: { contains: search, mode: 'insensitive' } } },
        { cari: { cariKodu: { contains: search, mode: 'insensitive' } } },
      ];
    }

    // Sıralama (varsayılan: en son eklenen kayıt en üstte = createdAt azalan)
    let orderBy: any = { createdAt: 'desc' };
    if (sortBy) {
      if (sortBy === 'cari') {
        orderBy = { cari: { unvan: sortOrder || 'asc' } };
      } else {
        orderBy = { [sortBy]: sortOrder || 'desc' };
      }
    }

    const [data, total] = await Promise.all([
      this.prisma.fatura.findMany({
        where,
        skip,
        take: limit,
        include: {
          cari: {
            select: {
              id: true,
              cariKodu: true,
              unvan: true,
              tip: true,
            },
          },
          irsaliye: {
            select: {
              id: true,
              irsaliyeNo: true,
              kaynakSiparis: {
                select: { id: true, siparisNo: true },
              },
            },
          },
          faturaTahsilatlar: {
            include: {
              tahsilat: {
                select: {
                  id: true,
                  tarih: true,
                  tip: true,
                  odemeTipi: true,
                },
              },
            },
            orderBy: { createdAt: 'desc' },
          },
          createdByUser: {
            select: { id: true, fullName: true, username: true },
          },
          updatedByUser: {
            select: { id: true, fullName: true, username: true },
          },
          satisElemani: {
            select: { id: true, adSoyad: true },
          },
          _count: {
            select: { kalemler: true },
          },
        },
        orderBy,
      }),
      this.prisma.fatura.count({ where }),
    ]);

    return {
      data: data.map((item) => ({
        ...item,
        kalanTutar: Number(item.genelToplam) - Number(item.odenenTutar || 0),
      })),
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  /**
   * Birden fazla faturayı ID ile getir (toplu yazdırma)
   */
  async findManyByIds(ids: string[]) {
    return this.prisma.fatura.findMany({
      where: {
        id: { in: ids },
        deletedAt: null,
      },
      include: {
        cari: true,
        kalemler: { include: { stok: true } },
        createdByUser: {
          select: { id: true, fullName: true, username: true },
        },
      },
    });
  }

  /**
   * Reverse warehouse stock for a single product (used when reversing an approved invoice)
   */
  private async reverseWarehouseStockForInvoice(
    warehouseId: string,
    productId: string,
    quantity: number,
    faturaTipi: string,
    prisma: any,
  ) {
    const wmsParam = await prisma.systemParameter.findFirst({
      where: { key: 'ENABLE_WMS_MODULE', OR: [{ tenantId: null }] },
      orderBy: { tenantId: 'desc' },
    });
    if (wmsParam?.value !== 'true' && wmsParam?.value !== true) return;

    const defaultLocation = await this.warehouseService.getOrCreateDefaultLocation(warehouseId);
    const stock = await prisma.productLocationStock.findUnique({
      where: {
        warehouseId_locationId_productId: {
          warehouseId,
          locationId: defaultLocation.id,
          productId,
        },
      },
    });
    if (!stock) return;

    // SATIS had SALE (decrement) -> reverse = increment. ALIS had PUT_AWAY (increment) -> reverse = decrement.
    const qtyChange =
      faturaTipi === 'SATIS' || faturaTipi === 'ALIS_IADE' ? quantity : -quantity;
    await prisma.productLocationStock.update({
      where: { id: stock.id },
      data: { qtyOnHand: { increment: qtyChange } },
    });
  }

  /**
   * SATIS/ALIS iptal için sadece cari geri alır (stok hareketi oluşturmaz).
   * Stok hesaplaması iptal faturaları dikkate almadığı için ek kayıt gerekmez.
   */
  private async reverseCariOnlyForInvoice(fatura: any, prisma: any) {
    const genelToplam = Number(fatura.genelToplam);
    await prisma.cariHareket.deleteMany({
      where: {
        cariId: fatura.cariId,
        belgeTipi: 'FATURA',
        belgeNo: fatura.faturaNo,
      },
    });
    const bakiyeUpdate =
      fatura.faturaTipi === 'SATIS' || fatura.faturaTipi === 'ALIS_IADE'
        ? { decrement: genelToplam }
        : { increment: genelToplam };
    await prisma.cari.update({
      where: { id: fatura.cariId },
      data: { bakiye: bakiyeUpdate },
    });
  }

  /**
   * Reverse cari and stok movements for an already-approved invoice (used before re-applying on edit or on iptal)
   * @param useIptalTipi - true: hareketlerde IPTAL_GIRIS/IPTAL_CIKIS kullan (iptal için); false: IADE/CIKIS kullan (durum değişikliği için)
   */
  private async reverseInvoiceMovements(
    fatura: any,
    prisma: any,
    tenantId?: string | null,
    useIptalTipi = false,
  ) {
    if (!fatura.kalemler?.length) return;

    // Mükerrer stok girişi önleme: Bu fatura için iptal hareketleri zaten varsa işlem yapma
    if (useIptalTipi) {
      const gecerliKalemSayisi = fatura.kalemler.filter(
        (k: any) => k.stokId && (Number(k.miktar) || 0) > 0,
      ).length;
      if (gecerliKalemSayisi > 0) {
        const mevcutIptalSayisi = await prisma.stokHareket.count({
          where: {
            aciklama: `Fatura İptali: ${fatura.faturaNo}`,
            hareketTipi: { in: ['IPTAL_GIRIS', 'IPTAL_CIKIS'] },
          },
        });
        if (mevcutIptalSayisi >= gecerliKalemSayisi) {
          return; // İptal hareketleri zaten oluşturulmuş, mükerrer işlem yapma
        }
      }
    }

    const genelToplam = Number(fatura.genelToplam);
    const rawWh = (fatura as any).warehouseId;
    const transactionWarehouseId = rawWh && String(rawWh).trim() ? String(rawWh).trim() : undefined;

    // 1. Delete cari hareket for this invoice
    await prisma.cariHareket.deleteMany({
      where: {
        cariId: fatura.cariId,
        belgeTipi: 'FATURA',
        belgeNo: fatura.faturaNo,
      },
    });

    // 2. Reverse cari balance
    const bakiyeUpdate =
      fatura.faturaTipi === 'SATIS' || fatura.faturaTipi === 'ALIS_IADE'
        ? { decrement: genelToplam }
        : { increment: genelToplam };
    await prisma.cari.update({
      where: { id: fatura.cariId },
      data: { bakiye: bakiyeUpdate },
    });

    const effectiveTenantId = tenantId ?? fatura.tenantId ?? undefined;
    const aciklama = useIptalTipi
      ? `Fatura İptali: ${fatura.faturaNo}`
      : `Fatura düzenleme (geri alım): ${fatura.faturaNo}`;

    // 3. Create reversing StokHareket for each kalem (iptal ise IPTAL_GIRIS/IPTAL_CIKIS, değilse IADE/CIKIS)
    for (const kalem of fatura.kalemler) {
      if (!kalem.stokId) continue;
      const miktar = Number(kalem.miktar) || 0;
      if (miktar <= 0) continue;
      const birimFiyat =
        typeof kalem.birimFiyat === 'object' && kalem.birimFiyat != null && 'toNumber' in kalem.birimFiyat
          ? (kalem.birimFiyat as any).toNumber()
          : Number(kalem.birimFiyat);

      let reverseTip: 'GIRIS' | 'CIKIS' | 'IADE' | 'IPTAL_GIRIS' | 'IPTAL_CIKIS';
      if (useIptalTipi) {
        if (fatura.faturaTipi === 'SATIS') reverseTip = 'IPTAL_GIRIS';
        else if (fatura.faturaTipi === 'ALIS') reverseTip = 'IPTAL_CIKIS';
        else if (fatura.faturaTipi === 'SATIS_IADE') reverseTip = 'IPTAL_CIKIS';
        else reverseTip = 'IPTAL_GIRIS'; // ALIS_IADE
      } else {
        if (fatura.faturaTipi === 'SATIS') reverseTip = 'IADE';
        else if (fatura.faturaTipi === 'ALIS') reverseTip = 'CIKIS';
        else if (fatura.faturaTipi === 'SATIS_IADE') reverseTip = 'CIKIS';
        else reverseTip = 'GIRIS'; // ALIS_IADE
      }

      await prisma.stokHareket.create({
        data: {
          stokId: kalem.stokId,
          hareketTipi: reverseTip,
          miktar,
          birimFiyat,
          aciklama,
          warehouseId: transactionWarehouseId ?? null,
          ...(effectiveTenantId && { tenantId: effectiveTenantId }),
        },
      });

      // 4. Reverse warehouse stock when WMS enabled
      if (transactionWarehouseId) {
        await this.reverseWarehouseStockForInvoice(
          transactionWarehouseId,
          kalem.stokId,
          miktar,
          fatura.faturaTipi,
          prisma,
        );
      }
    }

    // SATIS with deliveryNoteId may have used irsaliye depoId
    if (fatura.faturaTipi === 'SATIS' && fatura.deliveryNoteId && !transactionWarehouseId) {
      const satisIrsaliyesi = await prisma.satisIrsaliyesi.findUnique({
        where: { id: fatura.deliveryNoteId },
        select: { depoId: true },
      });
      if (satisIrsaliyesi?.depoId) {
        for (const kalem of fatura.kalemler) {
          if (!kalem.stokId) continue;
          const miktar = Number(kalem.miktar) || 0;
          if (miktar <= 0) continue;
          await this.reverseWarehouseStockForInvoice(
            satisIrsaliyesi.depoId,
            kalem.stokId,
            miktar,
            fatura.faturaTipi,
            prisma,
          );
        }
      }
    }

    // ALIS may use depoId from satinAlmaIrsaliye
    if (fatura.faturaTipi === 'ALIS' && !transactionWarehouseId && fatura.satinAlmaIrsaliyeId) {
      const irsaliye = await prisma.satınAlmaIrsaliyesi.findUnique({
        where: { id: fatura.satinAlmaIrsaliyeId },
        select: { depoId: true },
      });
      if (irsaliye?.depoId) {
        for (const kalem of fatura.kalemler) {
          if (!kalem.stokId) continue;
          const miktar = Number(kalem.miktar) || 0;
          if (miktar <= 0) continue;
          await this.reverseWarehouseStockForInvoice(
            irsaliye.depoId,
            kalem.stokId,
            miktar,
            fatura.faturaTipi,
            prisma,
          );
        }
      }
    }
  }

  /**
   * Process and create Cari and Stok movements for an approved invoice
   */
  private async processInvoiceMovements(
    fatura: any,
    prisma: any,
    userId?: string,
    warehouseId?: string,
    siparisHazirliklar: any[] = [],
    tenantId?: string | null,
  ) {
    console.log('[processInvoiceMovements] Başladı:', {
      faturaId: fatura.id,
      faturaNo: fatura.faturaNo,
      faturaTipi: fatura.faturaTipi,
      kalemlerCount: fatura.kalemler?.length ?? 0,
      kalemlerSample: fatura.kalemler?.slice(0, 2)?.map((k: any) => ({ id: k.id, stokId: k.stokId, miktar: k.miktar })),
      warehouseId,
      tenantId,
      faturaTenantId: fatura.tenantId,
    });

    const currentCari = await prisma.cari.findUnique({
      where: { id: fatura.cariId },
      select: { bakiye: true },
    });

    if (!currentCari) throw new NotFoundException('Cari bulunamadı');

    const genelToplam = Number(fatura.genelToplam);
    const mevcutBakiye = Number(currentCari.bakiye ?? 0);
    let cariHareketTipi: 'BORC' | 'ALACAK';
    let cariBakiyeDegisimi: number;
    let aciklama: string;
    let bakiyeUpdate: { increment?: number; decrement?: number };

    if (fatura.faturaTipi === 'SATIS') {
      cariHareketTipi = 'BORC';
      cariBakiyeDegisimi = mevcutBakiye + genelToplam;
      aciklama = `Satış Faturası: ${fatura.faturaNo}`;
      bakiyeUpdate = { increment: genelToplam };
    } else if (fatura.faturaTipi === 'SATIS_IADE') {
      cariHareketTipi = 'ALACAK';
      cariBakiyeDegisimi = mevcutBakiye - genelToplam;
      aciklama = `Satış İade Faturası: ${fatura.faturaNo}`;
      bakiyeUpdate = { decrement: genelToplam };
    } else if (fatura.faturaTipi === 'ALIS') {
      cariHareketTipi = 'ALACAK';
      cariBakiyeDegisimi = mevcutBakiye - genelToplam;
      aciklama = `Alış Faturası: ${fatura.faturaNo}`;
      bakiyeUpdate = { decrement: genelToplam };
    } else {
      // ALIS_IADE
      cariHareketTipi = 'BORC';
      cariBakiyeDegisimi = mevcutBakiye + genelToplam;
      aciklama = `Alış İade Faturası: ${fatura.faturaNo}`;
      bakiyeUpdate = { increment: genelToplam };
    }

    const effectiveTenantId = tenantId ?? fatura.tenantId ?? undefined;

    // 1. Create Cari Movement
    await prisma.cariHareket.create({
      data: {
        cariId: fatura.cariId,
        tip: cariHareketTipi,
        tutar: genelToplam,
        bakiye: cariBakiyeDegisimi,
        belgeTipi: 'FATURA',
        belgeNo: fatura.faturaNo,
        tarih: new Date(fatura.tarih),
        aciklama,
        ...(effectiveTenantId && { tenantId: effectiveTenantId }),
      },
    });

    // 2. Update Cari Balance
    await prisma.cari.update({
      where: { id: fatura.cariId },
      data: { bakiye: bakiyeUpdate },
    });

    // 3. Create Stock Movements (warehouseId from param or fatura; normalize empty string to undefined)
    const rawWh = warehouseId ?? (fatura as any).warehouseId;
    const transactionWarehouseId = rawWh && String(rawWh).trim() ? String(rawWh).trim() : undefined;

    if (fatura.faturaTipi === 'SATIS') {
      if (siparisHazirliklar.length > 0) {
        for (const hazirlik of siparisHazirliklar) {
          const locationStock = await prisma.productLocationStock.findFirst({
            where: {
              productId: hazirlik.siparisKalemi.stokId,
              locationId: hazirlik.locationId,
            },
          });

          if (locationStock) {
            await prisma.productLocationStock.update({
              where: { id: locationStock.id },
              data: { qtyOnHand: { decrement: hazirlik.miktar } },
            });
          }

          await prisma.stockMove.create({
            data: {
              productId: hazirlik.siparisKalemi.stokId,
              fromWarehouseId: locationStock?.warehouseId,
              fromLocationId: hazirlik.locationId,
              toWarehouseId: locationStock!.warehouseId,
              toLocationId: hazirlik.locationId,
              qty: hazirlik.miktar,
              moveType: 'SALE',
              refType: 'Fatura',
              refId: fatura.id,
              note: aciklama,
              createdBy: userId,
            },
          });
        }
      }

      const kalemlerSatis = Array.isArray(fatura.kalemler) ? fatura.kalemler : [];
      console.log('[processInvoiceMovements] SATIS - Kalem sayısı:', kalemlerSatis.length, 'warehouseId:', transactionWarehouseId, 'tenantId:', effectiveTenantId);
      for (const kalem of kalemlerSatis) {
        if (!kalem.stokId) {
          console.error('[processInvoiceMovements] SATIS - stokId eksik, kalem atlanıyor:', kalem);
          continue;
        }
        console.log('[processInvoiceMovements] SATIS - StokHareket oluşturuluyor:', { stokId: kalem.stokId, miktar: kalem.miktar, faturaKalemiId: kalem.id });
        const createdStokHareket = await prisma.stokHareket.create({
          data: {
            stokId: kalem.stokId,
            hareketTipi: 'SATIS',
            miktar: kalem.miktar,
            birimFiyat: typeof kalem.birimFiyat === 'object' && kalem.birimFiyat != null && 'toNumber' in kalem.birimFiyat ? (kalem.birimFiyat as any).toNumber() : Number(kalem.birimFiyat),
            aciklama,
            warehouseId: transactionWarehouseId,
            faturaKalemiId: kalem.id,
            ...(effectiveTenantId && { tenantId: effectiveTenantId }),
          },
        });
        console.log('[processInvoiceMovements] SATIS - StokHareket oluşturuldu:', createdStokHareket.id);
      }

      if (siparisHazirliklar.length === 0 && fatura.deliveryNoteId) {
        const satisIrsaliyesi = await prisma.satisIrsaliyesi.findUnique({
          where: { id: fatura.deliveryNoteId },
          select: { depoId: true },
        });

        if (satisIrsaliyesi?.depoId) {
          for (const kalem of kalemlerSatis) {
            await this.updateWarehouseStock(
              satisIrsaliyesi.depoId,
              kalem.stokId,
              kalem.miktar,
              'SALE',
              fatura.id,
              'Fatura',
              aciklama,
              userId,
              prisma,
            );
          }
        }
      }
    } else if (fatura.faturaTipi === 'SATIS_IADE') {
      const kalemler = Array.isArray(fatura.kalemler) ? fatura.kalemler : [];
      console.log('[processInvoiceMovements] SATIS_IADE - Kalem sayısı:', kalemler.length, 'warehouseId:', transactionWarehouseId, 'tenantId:', effectiveTenantId);
      for (const kalem of kalemler) {
        if (!kalem.stokId) {
          console.error('[processInvoiceMovements] SATIS_IADE - stokId eksik, kalem atlanıyor:', kalem);
          continue;
        }
        if (!kalem.miktar || kalem.miktar <= 0) {
          console.error('[processInvoiceMovements] SATIS_IADE - miktar geçersiz, kalem atlanıyor:', { stokId: kalem.stokId, miktar: kalem.miktar });
          continue;
        }
        const birimFiyat = typeof kalem.birimFiyat === 'object' && kalem.birimFiyat != null && 'toNumber' in kalem.birimFiyat ? (kalem.birimFiyat as any).toNumber() : Number(kalem.birimFiyat);
        console.log('[processInvoiceMovements] SATIS_IADE - StokHareket oluşturuluyor:', { stokId: kalem.stokId, miktar: kalem.miktar, faturaKalemiId: kalem.id });
        const createdStokHareket = await prisma.stokHareket.create({
          data: {
            stokId: kalem.stokId,
            hareketTipi: 'GIRIS',
            miktar: kalem.miktar,
            birimFiyat,
            aciklama,
            warehouseId: transactionWarehouseId,
            faturaKalemiId: kalem.id,
            ...(effectiveTenantId && { tenantId: effectiveTenantId }),
          },
        });
        console.log('[processInvoiceMovements] SATIS_IADE - StokHareket oluşturuldu:', createdStokHareket.id);

        if (transactionWarehouseId) {
          await this.updateWarehouseStock(
            transactionWarehouseId,
            kalem.stokId,
            kalem.miktar,
            'PUT_AWAY',
            fatura.id,
            'Fatura',
            aciklama,
            userId,
            prisma,
          );
        }
      }
    } else if (fatura.faturaTipi === 'ALIS') {
      const kalemlerAlis = Array.isArray(fatura.kalemler) ? fatura.kalemler : [];
      console.log('[processInvoiceMovements] ALIS - Kalem sayısı:', kalemlerAlis.length, 'warehouseId:', transactionWarehouseId, 'tenantId:', effectiveTenantId);
      for (const kalem of kalemlerAlis) {
        if (!kalem.stokId) {
          console.error('[processInvoiceMovements] ALIS - stokId eksik, kalem atlanıyor:', kalem);
          continue;
        }
        const birimFiyatAlis = typeof kalem.birimFiyat === 'object' && kalem.birimFiyat != null && 'toNumber' in kalem.birimFiyat ? (kalem.birimFiyat as any).toNumber() : Number(kalem.birimFiyat);
        console.log('[processInvoiceMovements] ALIS - StokHareket oluşturuluyor:', { stokId: kalem.stokId, miktar: kalem.miktar, faturaKalemiId: kalem.id });
        const createdStokHareket = await prisma.stokHareket.create({
          data: {
            stokId: kalem.stokId,
            hareketTipi: 'GIRIS',
            miktar: kalem.miktar,
            birimFiyat: birimFiyatAlis,
            aciklama,
            warehouseId: transactionWarehouseId,
            faturaKalemiId: kalem.id,
            ...(effectiveTenantId && { tenantId: effectiveTenantId }),
          },
        });
        console.log('[processInvoiceMovements] ALIS - StokHareket oluşturuldu:', createdStokHareket.id);
      }

      const depoId =
        transactionWarehouseId ||
        (fatura.satinAlmaIrsaliyeId
          ? (
            await prisma.satınAlmaIrsaliyesi.findUnique({
              where: { id: fatura.satinAlmaIrsaliyeId },
              select: { depoId: true },
            })
          )?.depoId
          : null);

      if (depoId) {
        for (const kalem of kalemlerAlis) {
          await this.updateWarehouseStock(
            depoId,
            kalem.stokId,
            kalem.miktar,
            'PUT_AWAY',
            fatura.id,
            'Fatura',
            aciklama,
            userId,
            prisma,
          );
        }
      }
    } else if (fatura.faturaTipi === 'ALIS_IADE') {
      const kalemlerAlisIade = Array.isArray(fatura.kalemler) ? fatura.kalemler : [];
      for (const kalem of kalemlerAlisIade) {
        if (!kalem.stokId) continue;
        const miktarNum = Number(kalem.miktar);
        if (!Number.isFinite(miktarNum) || miktarNum <= 0) continue;
        const birimFiyatAlisIade = typeof kalem.birimFiyat === 'object' && kalem.birimFiyat != null && 'toNumber' in kalem.birimFiyat ? (kalem.birimFiyat as any).toNumber() : Number(kalem.birimFiyat);
        await prisma.stokHareket.create({
          data: {
            stokId: kalem.stokId,
            hareketTipi: 'CIKIS',
            miktar: miktarNum,
            birimFiyat: birimFiyatAlisIade,
            aciklama,
            warehouseId: transactionWarehouseId || null,
            faturaKalemiId: kalem.id,
            ...(effectiveTenantId && { tenantId: effectiveTenantId }),
          },
        });

        if (transactionWarehouseId) {
          await this.updateWarehouseStock(
            transactionWarehouseId,
            kalem.stokId,
            miktarNum,
            'SALE',
            fatura.id,
            'Fatura',
            aciklama,
            userId,
            prisma,
          );
        }
      }
    }
  }
}
