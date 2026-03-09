import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreatePriceListDto } from './dto/create-price-list.dto';
import { UpdatePriceListDto } from './dto/update-price-list.dto';

@Injectable()
export class PriceListService {
    constructor(private readonly prisma: PrismaService) { }

    async create(createDto: CreatePriceListDto) {
        const { items, ...data } = createDto;
        return this.prisma.extended.priceList.create({
            data: {
                name: (data as any).ad,
                startDate: (data as any).startDate ? new Date((data as any).startDate) : null,
                endDate: (data as any).endDate ? new Date((data as any).endDate) : null,
                isActive: (data as any).isActive ?? true,
                ...(items && items.length > 0
                    ? {
                        items: {
                            create: items.map((k: any) => ({
                                productId: k.productId,
                                price: k.price,
                                discountRate: k.discountRate ?? 0,
                            })),
                        },
                    }
                    : {}),
            },
            include: {
                items: true,
            },
        });
    }

    async findAll(tenantId: string) {
        return this.prisma.extended.priceList.findMany({
            where: { tenantId, isActive: true },
            include: {
                _count: {
                    select: { items: true },
                },
            },
        });
    }

    async findOne(id: string) {
        const list = await this.prisma.extended.priceList.findUnique({
            where: { id },
            include: {
                items: {
                    include: {
                        product: true,
                    },
                },
            },
        });
        if (!list) throw new NotFoundException('Price list not found');
        return list;
    }

    async findStokPrice(productId: string, accountId?: string) {
        let priceListId: string | null = null;

        if (accountId) {
            const cari = await this.prisma.extended.account.findUnique({
                where: { id: accountId },
                select: { priceListId: true },
            });
            priceListId = (cari as any)?.priceListId || null;
        }

        if (!priceListId) {
            // Cari için özel liste yoksa, genel isActive bir liste var mı bak (eğer mantık buysa)
            // Şimdilik sadece cariye bağlı listeyi kontrol ediyoruz
            return null;
        }

        const kalem = await this.prisma.extended.priceListItem.findUnique({
            where: {
                priceListId_productId: {
                    priceListId: priceListId,
                    productId: productId,
                },
            },
        });

        return kalem;
    }
}
