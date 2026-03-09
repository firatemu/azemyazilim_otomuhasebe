import {
  Injectable,
  NotFoundException,
  BadRequestException,
  Inject,
  forwardRef,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { TenantResolverService } from '../../common/services/tenant-resolver.service';
import { buildTenantWhereClause } from '../../common/utils/staging.util';
import { CreateProductDto, UpdateProductDto } from './dto';
import { CodeTemplateService } from '../code-template/code-template.service';
import { ModuleType } from '../code-template/code-template.enums';
import { DeletionProtectionService } from '../../common/services/deletion-protection.service';
import { MovementType } from '@prisma/client';

@Injectable()
export class ProductService {
  constructor(
    private prisma: PrismaService,
    private tenantResolver: TenantResolverService,
    @Inject(forwardRef(() => CodeTemplateService))
    private codeTemplateService: CodeTemplateService,
    private deletionProtection: DeletionProtectionService,
  ) { }

  async create(dto: CreateProductDto) {
    const tenantId = await this.tenantResolver.resolveForCreate({ allowNull: true });

    // Eğer code girilmemişse otomatik üret
    let code = dto.code;
    if (!code) {
      try {
        code = await this.codeTemplateService.getNextCode(ModuleType.PRODUCT);
      } catch (error) {
        // Şablon yoksa veya isActive değilse, kullanıcı elle girmeli
        throw new Error(
          'Stok kodu girilmeli veya otomatik kod şablonu tanımlanmalı',
        );
      }
    }

    const finalTenantId = (dto as any).tenantId ?? tenantId ?? undefined;
    const existingWhere: any = { code: code };
    if (finalTenantId) existingWhere.tenantId = finalTenantId;
    const existing = await this.prisma.extended.extended.product.findFirst({
      where: existingWhere,
    });
    if (existing) {
      throw new BadRequestException('Bu product kodu zaten kullanılıyor');
    }

    try {
      const createData = {
        code: code,
        ...(finalTenantId != null && { tenantId: finalTenantId }),
        name: dto.name,
        description: dto.description ?? undefined,
        unit: dto.unit,
        unitId: dto.unitId ?? undefined,
        purchasePrice: dto.purchasePrice,
        salePrice: dto.salePrice,
        vatRate: dto.vatRate ?? 20,
        category: dto.category ?? undefined,
        mainCategory: dto.mainCategory ?? undefined,
        subCategory: dto.subCategory ?? undefined,
        brand: dto.brand ?? undefined,
        model: dto.model ?? undefined,
        oem: dto.oem ?? undefined,
        size: dto.size ?? undefined,
        shelf: dto.shelf ?? undefined,
        barcode: dto.barcode ?? undefined,
        supplierCode: dto.supplierCode ?? undefined,
        vehicleBrand: dto.vehicleBrand ?? undefined,
        vehicleModel: dto.vehicleModel ?? undefined,
        vehicleEngineSize: dto.vehicleEngineSize ?? undefined,
        vehicleFuelType: dto.vehicleFuelType ?? undefined,
        weight: dto.weight != null ? dto.weight : undefined,
        weightUnit: dto.weightUnit ?? undefined,
        dimensions: dto.dimensions ?? undefined,
        countryOfOrigin: dto.countryOfOrigin ?? undefined,
        warrantyMonths: dto.warrantyMonths != null ? dto.warrantyMonths : undefined,
        internalNote: dto.internalNote ?? undefined,
        minOrderQty: dto.minOrderQty != null ? dto.minOrderQty : undefined,
        leadTimeDays: dto.leadTimeDays != null ? dto.leadTimeDays : undefined,
      };
      const createdStok = await this.prisma.extended.product.create({
        data: createData,
      });

      return createdStok;
    } catch (error: any) {
      if (error?.code === 'P2002') {
        const field = error?.meta?.target?.[0] || 'alan';
        throw new BadRequestException(`${field} zaten kullanılıyor`);
      }
      throw new BadRequestException(
        error?.message || 'Stok kaydedilirken hata oluştu',
      );
    }
  }

  async findAll(page = 1, limit = 50, search?: string, isActive?: boolean) {
    const tenantId = await this.tenantResolver.resolveForQuery();
    const skip = (page - 1) * limit;
    const where: any = {
      ...buildTenantWhereClause(tenantId ?? undefined),
      // Kategori/marka tanımı placeholder'ları malzeme listesinde gösterme
      isCategoryOnly: { not: true },
      isBrandOnly: { not: true },
    };
    // Not: Product modelinde isActive alanı yok, isActive parametresi geçici olarak yoksayılıyor
    // İleride isActive alanı eklenebilir
    if (search) {
      where.OR = [
        { code: { contains: search, mode: 'insensitive' as const } },
        { name: { contains: search, mode: 'insensitive' as const } },
        { barcode: { contains: search, mode: 'insensitive' as const } },
        { oem: { contains: search, mode: 'insensitive' as const } },
      ];
    }

    try {
      const [initialData, total] = await Promise.all([
        this.prisma.extended.product.findMany({
          where,
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            productLocationStocks: {
              take: 1,
              include: {
                location: true,
              },
            },
            unitRef: true,
          },
        }),
        this.prisma.extended.product.count({ where }),
      ]);


      // Eşdeğer ürünleri getir
      const esdegerGrupIds = initialData
        .map((s) => s.equivalencyGroupId)
        .filter((id) => id !== null) as string[];

      let esdegerUrunlerMap = new Map<string, any[]>();

      if (esdegerGrupIds.length > 0) {
        console.log('🔍 [findAll] Found groups:', esdegerGrupIds);
        const esdegerUrunler = await this.prisma.extended.product.findMany({
          where: {
            equivalencyGroupId: { in: esdegerGrupIds },
            isCategoryOnly: { not: true },
            isBrandOnly: { not: true },
          },
          select: {
            id: true,
            code: true,
            name: true,
            equivalencyGroupId: true,
            oem: true,
            brand: true,
          },
        });
        console.log('✅ [findAll] Fetched related products count:', esdegerUrunler.length);

        esdegerUrunler.forEach((u) => {
          if (u.equivalencyGroupId) {
            if (!esdegerUrunlerMap.has(u.equivalencyGroupId)) {
              esdegerUrunlerMap.set(u.equivalencyGroupId, []);
            }
            esdegerUrunlerMap.get(u.equivalencyGroupId)?.push(u);
          }
        });
      } else {
        console.log('ℹ️ [findAll] No groups found in current page data');
      }

      // Eğer raf field'ı boşsa, productLocationStocks'ten al ve quantity hesapla
      const dataWithDetails = await Promise.all(
        initialData.map(async (product) => {
          // Stok hareketlerinden toplam quantityı hesapla (iptal faturalara ait hareketler hariç - sadece onaylı faturalar dikkate alınır)
          const productHareketler = await this.prisma.extended.productMovement.findMany({
            where: { productId: product.id },
            include: { invoiceItem: { include: { invoice: { select: { status: true } } } } },
          });

          let quantity = 0;
          productHareketler.forEach((hareket) => {
            if ((hareket as any).invoiceItem?.invoice?.status === 'CANCELLED') return;
            if (
              hareket.movementType === MovementType.ENTRY ||
              hareket.movementType === MovementType.COUNT_SURPLUS ||
              hareket.movementType === MovementType.RETURN ||
              hareket.movementType === MovementType.CANCELLATION_ENTRY
            ) {
              quantity += hareket.quantity;
            } else if (
              hareket.movementType === MovementType.EXIT ||
              hareket.movementType === MovementType.SALE ||
              hareket.movementType === MovementType.COUNT_SHORTAGE ||
              hareket.movementType === MovementType.CANCELLATION_EXIT
            ) {
              quantity -= hareket.quantity;
            }
          });

          // Eşleşik ürünleri hazırla
          const esdegerGrupId = product.equivalencyGroupId;
          let eslesikUrunler: string[] = [];
          let eslesikUrunDetaylari: any[] = [];

          if (esdegerGrupId && esdegerUrunlerMap.has(esdegerGrupId)) {
            const grupUrunleri = esdegerUrunlerMap.get(esdegerGrupId) || [];
            // Kendisi hariç diğerleri
            const digerleri = grupUrunleri.filter(u => u.id !== product.id);
            eslesikUrunler = digerleri.map(u => u.id);
            eslesikUrunDetaylari = digerleri;
          }

          // Son satınalma fiyatını bul
          const lastPurchase = await this.prisma.extended.invoiceItem.findFirst({
            where: {
              productId: product.id,
              invoice: {
                invoiceType: 'PURCHASE',
                tenantId: product.tenantId,
              },
            },
            orderBy: { createdAt: 'desc' },
            select: {
              unitPrice: true,
              quantity: true,
              amount: true,
            },
          });

          const sonAlisFiyati = lastPurchase
            ? Number(lastPurchase.amount) / lastPurchase.quantity
            : Number(product.purchasePrice);

          const rafValue = product.shelf ?? (product.productLocationStocks?.[0]?.location?.code ?? null);
          return {
            ...product,
            code: product.code,
            name: product.name,
            birim: product.unit,
            marka: product.brand ?? undefined,
            raf: rafValue,
            alisFiyati: Number(product.purchasePrice),
            satisFiyati: Number(product.salePrice),
            aracBilgisi: [product.vehicleBrand, product.vehicleModel, product.vehicleEngineSize, product.vehicleFuelType].filter(Boolean).join(' / ') || undefined,
            quantity,
            eslesikUrunler,
            eslesikUrunDetaylari,
            sonAlisFiyati,
          };
        }),
      );

      return {
        data: dataWithDetails,
        meta: {
          total,
          page,
          limit,
          totalPages: Math.ceil(total / limit),
        },
      };
    } catch (error: any) {
      console.error('❌ [Stok Service] findAll hatası:', error);
      console.error('❌ [Stok Service] Hata detayları:', {
        message: error?.message,
        code: error?.code,
        meta: error?.meta,
        stack: error?.stack,
      });
      throw new BadRequestException(
        error?.message || 'Stok verileri alınırken hata oluştu'
      );
    }
  }

  async findOne(id: string) {
    const product = await this.prisma.extended.product.findUnique({
      where: { id },
      include: {
        productMovements: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        shelves: {
          include: {
            shelf: {
              include: {
                warehouse: true,
              },
            },
          },
        },
        unitRef: true,
      },
    });

    if (!product) {
      throw new NotFoundException('Stock not found');
    }

    // Kategori/marka tanımı placeholder'ları malzeme kartı olarak açılmasın
    if (product.isCategoryOnly === true || product.isBrandOnly === true) {
      throw new NotFoundException('Bu kayıt sadece kategori veya marka tanımı içindir; malzeme kartı olarak açılamaz.');
    }

    const [productLocationStocks, girisAggregate, cikisAggregate] =
      await Promise.all([
        this.prisma.extended.productLocationStock.findMany({
          where: { productId: id },
          include: {
            warehouse: true,
            location: {
              include: {
                warehouse: true,
              },
            },
          },
          orderBy: [
            {
              warehouse: {
                code: 'asc',
              },
            },
            {
              location: {
                code: 'asc',
              },
            },
          ],
        }),
        this.prisma.extended.productMovement.aggregate({
          where: {
            productId: id,
            movementType: {
              in: [
                MovementType.ENTRY,
                MovementType.RETURN,
                MovementType.COUNT_SURPLUS,
              ],
            },
          },
          _sum: { quantity: true },
        }),
        this.prisma.extended.productMovement.aggregate({
          where: {
            productId: id,
            movementType: {
              in: [
                MovementType.EXIT,
                MovementType.SALE,
                MovementType.COUNT_SHORTAGE,
              ],
            },
          },
          _sum: { quantity: true },
        }),
      ]);

    const productLocationStockTotal = productLocationStocks.reduce(
      (total, stock) => total + (stock.qtyOnHand ?? 0),
      0,
    );

    const totalStock =
      (girisAggregate._sum.quantity ?? 0) - (cikisAggregate._sum.quantity ?? 0);

    return {
      ...product,
      productLocationStocks,
      productLocationStockTotal,
      totalStock,
    };
  }

  async update(id: string, dto: UpdateProductDto) {
    await this.findOne(id);

    const data: Record<string, unknown> = {};
    if (dto.code != null) data.code = dto.code;
    if (dto.name != null) data.name = dto.name;
    if (dto.description != null) data.description = dto.description;
    if (dto.unit != null) data.unit = dto.unit;
    if (dto.unitId != null) data.unitId = dto.unitId;
    if (dto.purchasePrice != null) data.purchasePrice = dto.purchasePrice;
    if (dto.salePrice != null) data.salePrice = dto.salePrice;
    if (dto.vatRate != null) data.vatRate = dto.vatRate;
    if (dto.category != null) data.category = dto.category;
    if (dto.mainCategory != null) data.mainCategory = dto.mainCategory;
    if (dto.subCategory != null) data.subCategory = dto.subCategory;
    if (dto.brand != null) data.brand = dto.brand;
    if (dto.model != null) data.model = dto.model;
    if (dto.oem != null) data.oem = dto.oem;
    if (dto.size != null) data.size = dto.size;
    if (dto.shelf != null) data.shelf = dto.shelf;
    if (dto.barcode != null) data.barcode = dto.barcode;
    if (dto.supplierCode != null) data.supplierCode = dto.supplierCode;
    if (dto.vehicleBrand != null) data.vehicleBrand = dto.vehicleBrand;
    if (dto.vehicleModel != null) data.vehicleModel = dto.vehicleModel;
    if (dto.vehicleEngineSize != null) data.vehicleEngineSize = dto.vehicleEngineSize;
    if (dto.vehicleFuelType != null) data.vehicleFuelType = dto.vehicleFuelType;
    if (dto.weight != null) data.weight = dto.weight;
    if (dto.weightUnit != null) data.weightUnit = dto.weightUnit;
    if (dto.dimensions != null) data.dimensions = dto.dimensions;
    if (dto.countryOfOrigin != null) data.countryOfOrigin = dto.countryOfOrigin;
    if (dto.warrantyMonths != null) data.warrantyMonths = dto.warrantyMonths;
    if (dto.internalNote != null) data.internalNote = dto.internalNote;
    if (dto.minOrderQty != null) data.minOrderQty = dto.minOrderQty;
    if (dto.leadTimeDays != null) data.leadTimeDays = dto.leadTimeDays;

    return this.prisma.extended.product.update({
      where: { id },
      data,
    });
  }

  async canDelete(id: string) {
    // Stok hareketi var mı kontrol et
    const hareketSayisi = await this.prisma.extended.productMovement.count({
      where: { productId: id },
    });

    // Invoice kalemi var mı kontrol et
    const faturaKalemSayisi = await this.prisma.extended.invoiceItem.count({
      where: { productId: id },
    });

    // Sipariş kalemi var mı kontrol et (Satış ve Satınalma)
    const satisSiparisKalemSayisi = await this.prisma.extended.salesOrderItem.count({
      where: { productId: id },
    });
    const satinAlmaSiparisKalemSayisi = await this.prisma.extended.purchaseOrderItem.count({
      where: { productId: id },
    });
    const siparisKalemSayisi = satisSiparisKalemSayisi + satinAlmaSiparisKalemSayisi;

    // Teklif kalemi var mı kontrol et
    const quoteKalemSayisi = await this.prisma.extended.quoteItem.count({
      where: { productId: id },
    });

    // Sayım kalemi var mı kontrol et
    const sayimKalemSayisi = await this.prisma.extended.stocktakeItem.count({
      where: { productId: id },
    });

    // Stock move var mı kontrol et
    const stockMoveSayisi = await this.prisma.extended.stockMove.count({
      where: { productId: id },
    });

    // Toplam hareket sayısı
    const toplamHareketSayisi =
      hareketSayisi +
      faturaKalemSayisi +
      siparisKalemSayisi +
      quoteKalemSayisi +
      sayimKalemSayisi +
      stockMoveSayisi;

    return {
      canDelete: toplamHareketSayisi === 0,
      hareketSayisi,
      faturaKalemSayisi,
      siparisKalemSayisi,
      quoteKalemSayisi,
      sayimKalemSayisi,
      stockMoveSayisi,
      toplamHareketSayisi,
    };
  }

  async remove(id: string) {
    const tenantId = await this.tenantResolver.resolveForQuery();
    if (!tenantId) throw new BadRequestException('Tenant ID not found');

    await this.deletionProtection.checkStokDeletion(id, tenantId);

    return this.prisma.extended.product.delete({
      where: { id },
    });
  }

  async addEsdeger(productId1: string, productId2: string) {
    return this.prisma.extended.productEquivalent.create({
      data: {
        product1Id: productId1,
        product2Id: productId2,
      },
    });
  }

  async getStockMovements(productId: string, page = 1, limit = 50) {
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      this.prisma.extended.productMovement.findMany({
        where: { productId },
        skip,
        take: limit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.extended.productMovement.count({ where: { productId } }),
    ]);

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async matchProducts(mainProductId: string, equivalentProductIds: string[]) {
    // Ana ürünü kontrol et
    const anaUrun = await this.findOne(mainProductId);

    console.log('🔗 [ProductService] matchProducts started', { mainProductId, equivalentProductIds, anaUrunGrupId: anaUrun.equivalencyGroupId });

    // Eş ürünleri kontrol et
    const esUrunler = await this.prisma.extended.product.findMany({
      where: { id: { in: equivalentProductIds } },
      include: { equivalencyGroup: true },
    });

    if (esUrunler.length !== equivalentProductIds.length) {
      throw new NotFoundException('Some equivalent products not found');
    }

    // Tüm ürünlerin grup ID'lerini topla (null olmayanlar)
    const mevcutGrupIds = new Set<string>();

    if (anaUrun.equivalencyGroupId) {
      mevcutGrupIds.add(anaUrun.equivalencyGroupId);
    }

    esUrunler.forEach((urun) => {
      if (urun.equivalencyGroupId) {
        mevcutGrupIds.add(urun.equivalencyGroupId);
      }
    });

    let hedefGrupId: string;

    if (mevcutGrupIds.size === 0) {
      // Hiçbir ürünün grubu yok, yeni grup oluştur
      // EĞER equivalentProductIds boş ise ve ana ürünün de grubu yoksa, işlem yapmaya gerek yok
      if (equivalentProductIds.length === 0) {
        return {
          message: 'No match found or no changes made',
          grupId: null,
          toplamUrun: 0,
          urunler: [],
        }
      }

      const yeniGrup = await this.prisma.extended.equivalencyGroup.create({
        data: {
          name: `Grup - ${anaUrun.code}`,
        },
      });
      hedefGrupId = yeniGrup.id;
    } else if (mevcutGrupIds.size === 1) {
      // Bir grup var, onu kullan
      hedefGrupId = Array.from(mevcutGrupIds)[0];
    } else {
      // Birden fazla grup var, hepsini birleştir
      const grupIds = Array.from(mevcutGrupIds);
      hedefGrupId = grupIds[0];

      // Diğer gruplardaki tüm ürünleri hedef gruba taşı
      for (let i = 1; i < grupIds.length; i++) {
        await this.prisma.extended.product.updateMany({
          where: { equivalencyGroupId: grupIds[i] },
          data: { equivalencyGroupId: hedefGrupId },
        });

        // Boş kalan grupları sil
        await this.prisma.extended.equivalencyGroup.delete({
          where: { id: grupIds[i] },
        });
      }
    }

    // Ana ürünü gruba ekle
    await this.prisma.extended.product.update({
      where: { id: mainProductId },
      data: { equivalencyGroupId: hedefGrupId },
    });

    // Eş ürünleri gruba ekle (seçilenleri güncelle)
    if (equivalentProductIds.length > 0) {
      await this.prisma.extended.product.updateMany({
        where: {
          id: { in: equivalentProductIds },
        },
        data: { equivalencyGroupId: hedefGrupId },
      });
    }

    // Grupta olup listede olmayan ürünleri gruptan çıkar
    // 1. Gruptaki tüm ürünleri bul
    const gruptakiTumUrunler = await this.prisma.extended.product.findMany({
      where: { equivalencyGroupId: hedefGrupId },
      select: { id: true }
    });

    console.log('🔍 [matchProducts] Group members before cleanup:', gruptakiTumUrunler.map(u => u.id));

    // 2. Listede olmayanları belirle (Ana ürün hariç)
    const gruptanCikarilacakIds = gruptakiTumUrunler
      .map(u => u.id)
      .filter(id => !equivalentProductIds.includes(id) && id !== mainProductId);

    console.log('🔍 [matchProducts] IDs to remove:', gruptanCikarilacakIds);

    // 3. Bu ürünlerin grup bağlantısını kes
    if (gruptanCikarilacakIds.length > 0) {
      await this.prisma.extended.product.updateMany({
        where: {
          id: { in: gruptanCikarilacakIds }
        },
        data: { equivalencyGroupId: null }
      });
      console.log('✅ [matchProducts] Removed products from group');
    }

    // GRUP TEMİZLİĞİ: Eğer grupta 2'den az ürün kaldıysa, grubu dağıt
    const gruptakiSonUrunler = await this.prisma.extended.product.count({
      where: { equivalencyGroupId: hedefGrupId }
    });

    if (gruptakiSonUrunler < 2) {
      // Grubu dağıt (kalan ürünlerin bağlantısını kes)
      await this.prisma.extended.product.updateMany({
        where: { equivalencyGroupId: hedefGrupId },
        data: { equivalencyGroupId: null }
      });

      // Grubu sil
      await this.prisma.extended.equivalencyGroup.delete({
        where: { id: hedefGrupId }
      });

      return {
        message: 'Eşleşmeler kaldırıldı',
        grupId: null,
        toplamUrun: 0,
        urunler: [],
      };
    }

    // Grup içindeki tüm ürünleri getir (son status - eğer grup hala varsa)
    const grupUrunler = await this.prisma.extended.product.findMany({
      where: { equivalencyGroupId: hedefGrupId },
      select: {
        id: true,
        code: true,
        name: true,
        brand: true,
        oem: true,
      },
    });

    return {
      message: 'Ürünler başarıyla eşleştirildi',
      grupId: hedefGrupId,
      toplamUrun: grupUrunler.length,
      urunler: grupUrunler,
    };
  }

  async getEsdegerUrunler(productId: string) {
    const product = await this.prisma.extended.product.findUnique({
      where: { id: productId },
      select: { equivalencyGroupId: true },
    });

    if (!product) {
      throw new NotFoundException('Stock not found');
    }

    if (!product.equivalencyGroupId) {
      return {
        message: 'Bu ürünün eşdeğeri yok',
        esdegerler: [],
      };
    }

    // Aynı gruptaki diğer ürünleri getir (kendisi hariç)
    const esdegerler = await this.prisma.extended.product.findMany({
      where: {
        equivalencyGroupId: product.equivalencyGroupId,
        id: { not: productId },
      },
      select: {
        id: true,
        code: true,
        name: true,
        brand: true,
        oem: true,
        purchasePrice: true,
        salePrice: true,
        unit: true,
      },
    });

    // Eğer grupta başka ürün yoksa, bu "yetim grup" statusu - temizle
    if (esdegerler.length === 0) {
      const grupId = product.equivalencyGroupId;

      // Ürünü gruptan çıkar
      await this.prisma.extended.product.update({
        where: { id: productId },
        data: { equivalencyGroupId: null },
      });

      // Grubu sil
      try {
        await this.prisma.extended.equivalencyGroup.delete({
          where: { id: grupId },
        });
      } catch (err) {
        // Grup zaten silinmiş olabilir, hata vermemeli
      }

      return {
        message: 'Bu ürünün eşdeğeri yok (yetim grup temizlendi)',
        esdegerler: [],
      };
    }

    // Her eşdeğer ürün için quantity hesapla
    const esdegerlerWithMiktar = await Promise.all(
      esdegerler.map(async (urun) => {
        const productHareketler = await this.prisma.extended.productMovement.findMany({
          where: { productId: urun.id },
          include: { invoiceItem: { include: { invoice: { select: { status: true } } } } },
        });

        let quantity = 0;
        productHareketler.forEach((hareket) => {
          if ((hareket as any).invoiceItem?.invoice?.status === 'CANCELLED') return;
          if (
            hareket.movementType === MovementType.ENTRY ||
            hareket.movementType === MovementType.COUNT_SURPLUS ||
            hareket.movementType === MovementType.RETURN ||
            hareket.movementType === MovementType.CANCELLATION_ENTRY
          ) {
            quantity += hareket.quantity;
          } else if (
            hareket.movementType === MovementType.EXIT ||
            hareket.movementType === MovementType.SALE ||
            hareket.movementType === MovementType.COUNT_SHORTAGE ||
            hareket.movementType === MovementType.CANCELLATION_EXIT
          ) {
            quantity -= hareket.quantity;
          }
        });

        return {
          ...urun,
          quantity,
        };
      }),
    );

    return {
      message: 'Eşdeğer ürünler getirildi',
      toplamEsdeger: esdegerlerWithMiktar.length,
      esdegerler: esdegerlerWithMiktar,
    };
  }

  async matchmeKaldir(productId: string) {
    const product = await this.findOne(productId);

    if (!product.equivalencyGroupId) {
      return {
        message: 'Bu ürünün zaten eşleştirmesi yok',
      };
    }

    const grupId = product.equivalencyGroupId;

    // Gruptaki diğer ürünleri say
    const gruptakiUrunSayisi = await this.prisma.extended.product.count({
      where: { equivalencyGroupId: grupId },
    });

    // Bu ürünü gruptan çıkar
    await this.prisma.extended.product.update({
      where: { id: productId },
      data: { equivalencyGroupId: null },
    });

    // Eğer grupta sadece 1 ürün kaldıysa, onu da gruptan çıkar ve grubu sil
    if (gruptakiUrunSayisi === 2) {
      const kalanUrun = await this.prisma.extended.product.findFirst({
        where: { equivalencyGroupId: grupId },
      });

      if (kalanUrun) {
        await this.prisma.extended.product.update({
          where: { id: kalanUrun.id },
          data: { equivalencyGroupId: null },
        });
      }

      await this.prisma.extended.equivalencyGroup.delete({
        where: { id: grupId },
      });
    }

    return {
      message: 'Eşleştirme başarıyla kaldırıldı',
      code: product.code,
    };
  }

  async matchmeCiftiKaldir(productId: string, eslesikId: string) {
    if (productId === eslesikId) {
      throw new NotFoundException('Equivalent product to remove not found');
    }

    const urunler = await this.prisma.extended.product.findMany({
      where: { id: { in: [productId, eslesikId] } },
      select: {
        id: true,
        code: true,
        equivalencyGroupId: true,
      },
    });

    if (urunler.length !== 2) {
      throw new NotFoundException('One of the products not found');
    }

    const anaUrun = urunler.find((u) => u.id === productId)!;
    const eslesikUrun = urunler.find((u) => u.id === eslesikId)!;

    if (!anaUrun.equivalencyGroupId || !eslesikUrun.equivalencyGroupId) {
      throw new NotFoundException('Ürünlerden biri eşdeğer gruba bağlı değil');
    }

    if (anaUrun.equivalencyGroupId !== eslesikUrun.equivalencyGroupId) {
      throw new NotFoundException('Ürünler aynı eşdeğer grupta değil');
    }

    const grupId = anaUrun.equivalencyGroupId;

    await this.prisma.extended.product.update({
      where: { id: eslesikId },
      data: { equivalencyGroupId: null },
    });

    const kalanUrunler = await this.prisma.extended.product.findMany({
      where: { equivalencyGroupId: grupId },
      select: {
        id: true,
        code: true,
        name: true,
        brand: true,
        oem: true,
      },
    });

    if (kalanUrunler.length <= 1) {
      const kalan = kalanUrunler[0];

      if (kalan) {
        await this.prisma.extended.product.update({
          where: { id: kalan.id },
          data: { equivalencyGroupId: null },
        });
      }

      await this.prisma.extended.equivalencyGroup.delete({
        where: { id: grupId },
      });

      return {
        message: 'Eşleştirme kaldırıldı ve grup temizlendi',
        kalanUrunler: kalan ? [kalan] : [],
      };
    }

    return {
      message: 'Eşleştirme başarıyla kaldırıldı',
      kalanUrunler,
    };
  }

  async matchOemIle() {
    // OEM numarası olan tüm ürünleri getir
    const urunler = await this.prisma.extended.product.findMany({
      where: {
        oem: { not: null },
      },
      select: {
        id: true,
        code: true,
        name: true,
        oem: true,
        equivalencyGroupId: true,
      },
    });

    // OEM numaralarına göre grupla
    const oemGruplari = new Map<string, typeof urunler>();

    urunler.forEach((urun) => {
      if (urun.oem) {
        const oemKey = urun.oem.trim().toUpperCase();
        if (!oemGruplari.has(oemKey)) {
          oemGruplari.set(oemKey, []);
        }
        oemGruplari.get(oemKey)!.push(urun);
      }
    });

    let toplamEslestirme = 0;
    let toplamGrup = 0;
    const hatalar: string[] = [];

    // Her OEM grubu için eşleştirme yap
    for (const [oem, grupUrunler] of oemGruplari.entries()) {
      // Aynı OEM'e sahip 2'den fazla ürün varsa eşleştir
      if (grupUrunler.length < 2) {
        continue;
      }

      try {
        // İlk ürünü ana ürün olarak seç, diğerlerini eş ürün olarak eşleştir
        const anaUrun = grupUrunler[0];
        const equivalentProductIds = grupUrunler.slice(1).map((u) => u.id);

        // Mevcut eşleştirme metodunu kullan
        await this.matchProducts(anaUrun.id, equivalentProductIds);

        toplamEslestirme += grupUrunler.length;
        toplamGrup++;
      } catch (error: any) {
        hatalar.push(`OEM ${oem}: ${error.message || 'Bilinmeyen hata'}`);
      }
    }

    return {
      message: 'OEM ile eşleştirme tamamlandı',
      toplamEslestirilenUrun: toplamEslestirme,
      toplamGrup,
      hatalar: hatalar.length > 0 ? hatalar : undefined,
    };
  }
}
