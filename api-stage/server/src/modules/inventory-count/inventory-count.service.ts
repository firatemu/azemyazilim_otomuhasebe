import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { TenantResolverService } from '../../common/services/tenant-resolver.service';
import { buildTenantWhereClause } from '../../common/utils/staging.util';
import { CreateInventoryCountDto } from './dto/create-inventory-count.dto';
import { UpdateInventoryCountDto } from './dto/update-inventory-count.dto';
import { AddItemDto } from './dto/add-item.dto';
import { InventoryCountType, InventoryCountStatus } from './dto/create-inventory-count.dto';
import { Prisma } from '@prisma/client';

@Injectable()
export class InventoryCountService {
    constructor(
        private prisma: PrismaService,
        private tenantResolver: TenantResolverService,
    ) { }

    async findAll(countType?: InventoryCountType, status?: InventoryCountStatus) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const where: Prisma.StocktakeWhereInput = {
            ...buildTenantWhereClause(tenantId ?? undefined),
        };

        if (countType) {
            where.stocktakeType = countType as any;
        }

        if (status) {
            where.status = status as any;
        }

        const inventoryCounts = await this.prisma.extended.stocktake.findMany({
            where,
            include: {
                createdByUser: {
                    select: {
                        id: true,
                        fullName: true,
                        username: true,
                    },
                },
                _count: {
                    select: {
                        items: true,
                    },
                },
            },
            orderBy: { createdAt: 'desc' },
        });

        return inventoryCounts;
    }

    async findOne(id: string) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const inventoryCount = await this.prisma.extended.stocktake.findFirst({
            where: {
                id,
                ...buildTenantWhereClause(tenantId ?? undefined),
            },
            include: {
                items: {
                    include: {
                        product: {
                            select: {
                                id: true,
                                code: true,
                                name: true,
                                unit: true,
                            },
                        },
                        location: {
                            select: {
                                id: true,
                                code: true,
                                name: true,
                                warehouse: {
                                    select: {
                                        code: true,
                                        name: true,
                                    },
                                },
                            },
                        },
                    },
                },
                createdByUser: {
                    select: {
                        id: true,
                        fullName: true,
                        username: true,
                    },
                },
                approvedByUser: {
                    select: {
                        id: true,
                        fullName: true,
                        username: true,
                    },
                },
            },
        });

        if (!inventoryCount) {
            throw new NotFoundException('Inventory count not found');
        }

        return inventoryCount;
    }

    async create(createDto: CreateInventoryCountDto, userId?: string) {
        const { items, countType, countNumber, description } = createDto;

        const tenantId = await this.tenantResolver.resolveForCreate({ userId });

        const existingCount = await this.prisma.extended.stocktake.findFirst({
            where: {
                stocktakeNo: countNumber,
                ...buildTenantWhereClause(tenantId ?? undefined),
            },
        });

        if (existingCount) {
            throw new BadRequestException(
                `This count number already exists: ${countNumber}`,
            );
        }

        const itemsWithSystemQty = await Promise.all(
            items.map(async (item) => {
                let systemQty = 0;

                if (countType === 'SHELF_BASED' && item.locationId) {
                    const locationStock =
                        await this.prisma.extended.productLocationStock.findUnique({
                            where: {
                                warehouseId_locationId_productId: {
                                    warehouseId: (await this.prisma.extended.location.findUnique({
                                        where: { id: item.locationId },
                                    }))!.warehouseId,
                                    locationId: item.locationId,
                                    productId: item.productId,
                                },
                            },
                        });
                    systemQty = locationStock?.qtyOnHand || 0;
                } else {
                    const movements = await this.prisma.extended.productMovement.findMany({
                        where: { productId: item.productId },
                        include: { invoiceItem: { include: { invoice: { select: { status: true } } } } },
                    });

                    movements.forEach((movement) => {
                        if ((movement as any).invoiceItem?.invoice?.status === 'CANCELLED') return;
                        if (
                            (movement as any).movementType === 'ENTRY' ||
                            (movement as any).movementType === 'COUNT_SURPLUS' ||
                            (movement as any).movementType === 'RETURN' ||
                            (movement as any).movementType === 'CANCELLATION_ENTRY'
                        ) {
                            systemQty += (movement as any).quantity;
                        } else if (
                            (movement as any).movementType === 'EXIT' ||
                            (movement as any).movementType === 'SALE' ||
                            (movement as any).movementType === 'COUNT_SHORTAGE' ||
                            (movement as any).movementType === 'CANCELLATION_EXIT'
                        ) {
                            systemQty -= (movement as any).quantity;
                        }
                    });
                }

                const diffAmt = item.countedQuantity - systemQty;

                return {
                    productId: item.productId,
                    locationId: item.locationId || null,
                    systemQuantity: systemQty,
                    countedQuantity: item.countedQuantity,
                    difference: diffAmt,
                };
            }),
        );

        return this.prisma.extended.$transaction(async (prisma) => {
            const inventoryCount = await prisma.stocktake.create({
                data: {
                    stocktakeNo: countNumber,
                    stocktakeType: countType === 'SHELF_BASED' ? 'SHELF_BASED' : 'PRODUCT_BASED',
                    notes: description,
                    ...(tenantId != null && { tenantId }),
                    createdBy: userId,
                    items: {
                        create: itemsWithSystemQty,
                    },
                },
                include: {
                    items: {
                        include: {
                            product: true,
                            location: true,
                        },
                    },
                },
            });

            return inventoryCount;
        });
    }

    async update(id: string, updateDto: UpdateInventoryCountDto, userId?: string) {
        const inventoryCount = await this.findOne(id);

        if (inventoryCount.status === 'APPROVED') {
            throw new BadRequestException('Approved count cannot be updated');
        }

        const { items, countNumber, countType, description } = updateDto;

        if (!items) {
            return this.prisma.extended.stocktake.update({
                where: { id },
                data: {
                    ...(countNumber && { stocktakeNo: countNumber }),
                    ...(countType && { stocktakeType: countType === 'SHELF_BASED' ? 'SHELF_BASED' : 'PRODUCT_BASED' }),
                    ...(description && { notes: description }),
                    updatedBy: userId,
                },
                include: {
                    items: {
                        include: {
                            product: true,
                            location: true,
                        },
                    },
                },
            });
        }

        return this.prisma.extended.$transaction(async (prisma) => {
            await prisma.stocktakeItem.deleteMany({
                where: { stocktakeId: id },
            });

            const dbStocktakeType = inventoryCount.stocktakeType;

            const itemsWithSystemQty = await Promise.all(
                items.map(async (item) => {
                    let systemQty = 0;

                    if (dbStocktakeType === 'SHELF_BASED' && item.locationId) {
                        const locationStock = await prisma.productLocationStock.findUnique({
                            where: {
                                warehouseId_locationId_productId: {
                                    warehouseId: (await prisma.location.findUnique({
                                        where: { id: item.locationId },
                                    }))!.warehouseId,
                                    locationId: item.locationId,
                                    productId: item.productId,
                                },
                            },
                        });
                        systemQty = locationStock?.qtyOnHand || 0;
                    } else {
                        const movements = await prisma.productMovement.findMany({
                            where: { productId: item.productId },
                            include: { invoiceItem: { include: { invoice: { select: { status: true } } } } },
                        });

                        movements.forEach((movement) => {
                            if ((movement as any).invoiceItem?.invoice?.status === 'CANCELLED') return;
                            if (
                                (movement as any).movementType === 'ENTRY' ||
                                (movement as any).movementType === 'COUNT_SURPLUS' ||
                                (movement as any).movementType === 'RETURN' ||
                                (movement as any).movementType === 'CANCELLATION_ENTRY'
                            ) {
                                systemQty += (movement as any).quantity;
                            } else if (
                                (movement as any).movementType === 'EXIT' ||
                                (movement as any).movementType === 'SALE' ||
                                (movement as any).movementType === 'COUNT_SHORTAGE' ||
                                (movement as any).movementType === 'CANCELLATION_EXIT'
                            ) {
                                systemQty -= (movement as any).quantity;
                            }
                        });
                    }

                    const diffAmt = item.countedQuantity - systemQty;

                    return {
                        productId: item.productId,
                        locationId: item.locationId || null,
                        systemQuantity: systemQty,
                        countedQuantity: item.countedQuantity,
                        difference: diffAmt,
                    };
                }),
            );

            return prisma.stocktake.update({
                where: { id },
                data: {
                    ...(countNumber && { stocktakeNo: countNumber }),
                    ...(countType && { stocktakeType: countType === 'SHELF_BASED' ? 'SHELF_BASED' : 'PRODUCT_BASED' }),
                    ...(description && { notes: description }),
                    updatedBy: userId,
                    items: {
                        create: itemsWithSystemQty,
                    },
                },
                include: {
                    items: {
                        include: {
                            product: true,
                            location: true,
                        },
                    },
                },
            });
        });
    }

    async remove(id: string) {
        const inventoryCount = await this.findOne(id);

        if (inventoryCount.status === 'APPROVED') {
            throw new BadRequestException('Approved count cannot be deleted');
        }

        await this.prisma.extended.stocktake.delete({
            where: { id },
        });

        return { message: 'Inventory count deleted' };
    }

    async complete(id: string, userId?: string) {
        const inventoryCount = await this.findOne(id);

        if (inventoryCount.status !== 'DRAFT') {
            throw new BadRequestException('Only draft counts can be completed');
        }

        return this.prisma.extended.stocktake.update({
            where: { id },
            data: {
                status: 'COMPLETED',
                updatedBy: userId,
            },
            include: {
                items: {
                    include: {
                        product: true,
                        location: true,
                    },
                },
            },
        });
    }

    async approve(id: string, userId?: string) {
        const inventoryCount = await this.findOne(id);

        if (inventoryCount.status !== 'COMPLETED') {
            throw new BadRequestException(
                'Only completed counts can be approved',
            );
        }

        return this.prisma.extended.$transaction(async (prisma) => {
            for (const item of inventoryCount.items) {
                if (item.difference === 0) continue;

                if (inventoryCount.stocktakeType === 'SHELF_BASED' && item.locationId) {
                    const location = await prisma.location.findUnique({
                        where: { id: item.locationId },
                    });

                    if (!location) continue;

                    const locationStock = await prisma.productLocationStock.findUnique({
                        where: {
                            warehouseId_locationId_productId: {
                                warehouseId: location.warehouseId,
                                locationId: item.locationId,
                                productId: item.productId,
                            },
                        },
                    });

                    if (locationStock) {
                        await prisma.productLocationStock.update({
                            where: { id: locationStock.id },
                            data: {
                                qtyOnHand: item.countedQuantity,
                            },
                        });
                    } else if (item.countedQuantity > 0) {
                        await prisma.productLocationStock.create({
                            data: {
                                warehouseId: location.warehouseId,
                                locationId: item.locationId,
                                productId: item.productId,
                                qtyOnHand: item.countedQuantity,
                            },
                        });
                    }
                }

                const movementCategory =
                    item.difference > 0 ? 'COUNT_SURPLUS' : 'COUNT_SHORTAGE';
                const qtyToPost = Math.abs(item.difference);
                const descriptionText =
                    item.difference > 0
                        ? `Inventory Surplus: ${inventoryCount.stocktakeNo}`
                        : `Inventory Shortage: ${inventoryCount.stocktakeNo}`;

                await prisma.productMovement.create({
                    data: {
                        productId: item.productId,
                        movementType: movementCategory,
                        quantity: qtyToPost,
                        unitPrice: 0 as any,
                        notes: descriptionText,
                    },
                });
            }

            return prisma.stocktake.update({
                where: { id },
                data: {
                    status: 'APPROVED',
                    approvedById: userId,
                    approvalDate: new Date(),
                },
                include: {
                    items: {
                        include: {
                            product: true,
                            location: true,
                        },
                    },
                },
            });
        });
    }

    async findProductByBarcode(barcode: string) {
        const productBarcode = await this.prisma.extended.productBarcode.findUnique({
            where: { barcode },
            include: {
                product: true,
            },
        });

        if (productBarcode) {
            return productBarcode.product;
        }

        const product = await this.prisma.extended.product.findFirst({
            where: { barcode },
        });

        if (!product) {
            throw new NotFoundException('Barcode not found');
        }

        return product;
    }

    async findLocationByBarcode(barcode: string) {
        const location = await this.prisma.extended.location.findUnique({
            where: { barcode },
            include: {
                warehouse: true,
            },
        });

        if (!location) {
            throw new NotFoundException('Location barcode not found');
        }

        return location;
    }

    async addItem(inventoryCountId: string, addItemDto: AddItemDto) {
        const inventoryCount = await this.findOne(inventoryCountId);

        if (inventoryCount.status !== 'DRAFT') {
            throw new BadRequestException(
                'Items can only be added to draft counts',
            );
        }

        let systemQty = 0;

        if (inventoryCount.stocktakeType === 'SHELF_BASED' && addItemDto.locationId) {
            const location = await this.prisma.extended.location.findUnique({
                where: { id: addItemDto.locationId },
            });

            if (!location) {
                throw new NotFoundException('Location not found');
            }

            const locationStock = await this.prisma.extended.productLocationStock.findUnique({
                where: {
                    warehouseId_locationId_productId: {
                        warehouseId: location.warehouseId,
                        locationId: addItemDto.locationId,
                        productId: addItemDto.productId,
                    },
                },
            });

            systemQty = locationStock?.qtyOnHand || 0;
        } else {
            const movements = await this.prisma.extended.productMovement.findMany({
                where: { productId: addItemDto.productId },
                include: { invoiceItem: { include: { invoice: { select: { status: true } } } } },
            });

            movements.forEach((movement) => {
                if ((movement as any).invoiceItem?.invoice?.status === 'CANCELLED') return;
                if (
                    (movement as any).movementType === 'ENTRY' ||
                    (movement as any).movementType === 'COUNT_SURPLUS' ||
                    (movement as any).movementType === 'RETURN' ||
                    (movement as any).movementType === 'CANCELLATION_ENTRY'
                ) {
                    systemQty += (movement as any).quantity;
                } else if (
                    (movement as any).movementType === 'EXIT' ||
                    (movement as any).movementType === 'SALE' ||
                    (movement as any).movementType === 'COUNT_SHORTAGE' ||
                    (movement as any).movementType === 'CANCELLATION_EXIT'
                ) {
                    systemQty -= (movement as any).quantity;
                }
            });
        }

        const diffAmt = addItemDto.countedQuantity - systemQty;

        const existingItem = await this.prisma.extended.stocktakeItem.findFirst({
            where: {
                stocktakeId: inventoryCountId,
                productId: addItemDto.productId,
                locationId: addItemDto.locationId || null,
            },
        });

        if (existingItem) {
            return this.prisma.extended.stocktakeItem.update({
                where: { id: existingItem.id },
                data: {
                    countedQuantity: addItemDto.countedQuantity,
                    difference: diffAmt,
                },
                include: {
                    product: true,
                    location: true,
                },
            });
        }

        return this.prisma.extended.stocktakeItem.create({
            data: {
                stocktakeId: inventoryCountId,
                productId: addItemDto.productId,
                locationId: addItemDto.locationId || null,
                systemQuantity: systemQty,
                countedQuantity: addItemDto.countedQuantity,
                difference: diffAmt,
            },
            include: {
                product: true,
                location: true,
            },
        });
    }
}
