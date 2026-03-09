import {
    Injectable,
    NotFoundException,
    BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class CategoryService {
    constructor(private prisma: PrismaService) { }

    /**
     * Fetch all main categories and their subcategories from products
     */
    async findAll() {
        const products = await this.prisma.extended.product.findMany({
            where: {
                mainCategory: {
                    not: null,
                },
            },
            select: {
                mainCategory: true,
                subCategory: true,
            },
        });

        const categoryMap = new Map<string, Set<string>>();

        products.forEach((p) => {
            if (p.mainCategory) {
                if (!categoryMap.has(p.mainCategory)) {
                    categoryMap.set(p.mainCategory, new Set<string>());
                }

                if (p.subCategory) {
                    categoryMap.get(p.mainCategory)!.add(p.subCategory);
                }
            }
        });

        const categories = Array.from(categoryMap.entries())
            .map(([mainCategory, subCategorySet]) => ({
                mainCategory,
                subCategories: Array.from(subCategorySet).sort((a, b) =>
                    a.localeCompare(b, 'tr'),
                ),
            }))
            .sort((a, b) => a.mainCategory.localeCompare(b.mainCategory, 'tr'));

        return categories;
    }

    /**
     * Fetch subcategories of a specific main category
     */
    async findSubCategories(mainCategory: string) {
        const decodedMainCategory = decodeURIComponent(mainCategory);

        const products = await this.prisma.extended.product.findMany({
            where: {
                mainCategory: decodedMainCategory,
                subCategory: {
                    not: null,
                },
            },
            select: {
                subCategory: true,
            },
            distinct: ['subCategory'],
        });

        const subCategories = products
            .map((p) => p.subCategory!)
            .filter(Boolean)
            .sort((a, b) => a.localeCompare(b, 'tr'));

        return {
            mainCategory: decodedMainCategory,
            subCategories,
        };
    }

    /**
     * Add a subcategory to a main category (through a placeholder product)
     */
    async addSubCategory(mainCategory: string, subCategory: string) {
        const decodedMainCategory = decodeURIComponent(mainCategory);
        const decodedSubCategory = decodeURIComponent(subCategory);

        const existingProduct = await this.prisma.extended.product.findFirst({
            where: {
                mainCategory: decodedMainCategory,
                subCategory: decodedSubCategory,
            },
        });

        if (existingProduct) {
            return {
                message: `This subcategory already exists: ${decodedSubCategory}`,
                mainCategory: decodedMainCategory,
                subCategory: decodedSubCategory,
                exists: true,
            };
        }

        try {
            const timestamp = Date.now().toString().slice(-6);
            const code = `CAT-${decodedMainCategory.substring(0, 3).toUpperCase()}-${decodedSubCategory.substring(0, 3).toUpperCase()}-${timestamp}`;

            await this.prisma.extended.product.create({
                data: {
                    code,
                    name: `[Category Definition] ${decodedMainCategory} - ${decodedSubCategory}`,
                    unit: 'Adet',
                    purchasePrice: 0,
                    salePrice: 0,
                    mainCategory: decodedMainCategory,
                    subCategory: decodedSubCategory,
                    isCategoryOnly: true,
                    description:
                        'This record is created only for category definition. It is not a real product.',
                },
            });

            return {
                message: `Subcategory "${decodedSubCategory}" added under main category "${decodedMainCategory}" successfully`,
                mainCategory: decodedMainCategory,
                subCategory: decodedSubCategory,
                exists: false,
            };
        } catch (error: any) {
            if (error.code === 'P2002') {
                const timestamp = Date.now().toString();
                const code = `CAT-${decodedMainCategory.substring(0, 3).toUpperCase()}-${decodedSubCategory.substring(0, 3).toUpperCase()}-${timestamp}`;

                await this.prisma.extended.product.create({
                    data: {
                        code,
                        name: `[Category Definition] ${decodedMainCategory} - ${decodedSubCategory}`,
                        unit: 'Adet',
                        purchasePrice: 0,
                        salePrice: 0,
                        mainCategory: decodedMainCategory,
                        subCategory: decodedSubCategory,
                        isCategoryOnly: true,
                        description:
                            'This record is created only for category definition. It is not a real product.',
                    },
                });

                return {
                    message: `Subcategory "${decodedSubCategory}" added under main category "${decodedMainCategory}" successfully`,
                    mainCategory: decodedMainCategory,
                    subCategory: decodedSubCategory,
                    exists: false,
                };
            }

            throw new BadRequestException(
                `Error adding subcategory: ${error.message}`,
            );
        }
    }

    /**
     * Add a main category
     */
    async addMainCategory(mainCategory: string) {
        const decodedMainCategory = decodeURIComponent(mainCategory);

        const existingProduct = await this.prisma.extended.product.findFirst({
            where: {
                mainCategory: decodedMainCategory,
            },
        });

        if (existingProduct) {
            throw new BadRequestException(
                `This main category already exists: ${decodedMainCategory}`,
            );
        }

        try {
            const timestamp = Date.now().toString().slice(-6);
            const code = `CAT-${decodedMainCategory.substring(0, 3).toUpperCase()}-${timestamp}`;

            await this.prisma.extended.product.create({
                data: {
                    code,
                    name: `[Main Category Definition] ${decodedMainCategory}`,
                    unit: 'Adet',
                    purchasePrice: 0,
                    salePrice: 0,
                    mainCategory: decodedMainCategory,
                    subCategory: null,
                    isCategoryOnly: true,
                    description:
                        'This record is created only for main category definition. It is not a real product.',
                },
            });

            return {
                message: `Main category "${decodedMainCategory}" added successfully`,
                mainCategory: decodedMainCategory,
                exists: false,
            };
        } catch (error: any) {
            if (error.code === 'P2002') {
                const timestamp = Date.now().toString();
                const code = `CAT-${decodedMainCategory.substring(0, 3).toUpperCase()}-${timestamp}`;

                await this.prisma.extended.product.create({
                    data: {
                        code,
                        name: `[Main Category Definition] ${decodedMainCategory}`,
                        unit: 'Adet',
                        purchasePrice: 0,
                        salePrice: 0,
                        mainCategory: decodedMainCategory,
                        subCategory: null,
                        isCategoryOnly: true,
                        description:
                            'This record is created only for main category definition. It is not a real product.',
                    },
                });

                return {
                    message: `Main category "${decodedMainCategory}" added successfully`,
                    mainCategory: decodedMainCategory,
                    exists: false,
                };
            }

            throw new BadRequestException(
                `Error adding main category: ${error.message}`,
            );
        }
    }

    /**
     * Remove subcategory
     */
    async removeSubCategory(mainCategory: string, subCategory: string) {
        const decodedMainCategory = decodeURIComponent(mainCategory);
        const decodedSubCategory = decodeURIComponent(subCategory);

        const productCount = await this.prisma.extended.product.count({
            where: {
                mainCategory: decodedMainCategory,
                subCategory: decodedSubCategory,
            },
        });

        if (productCount === 0) {
            throw new NotFoundException(
                `Subcategory not found: ${decodedSubCategory}`,
            );
        }

        await this.prisma.extended.product.updateMany({
            where: {
                mainCategory: decodedMainCategory,
                subCategory: decodedSubCategory,
            },
            data: {
                subCategory: null,
            },
        });

        return {
            message: `Subcategory "${decodedSubCategory}" removed successfully from ${productCount} products`,
            mainCategory: decodedMainCategory,
            subCategory: decodedSubCategory,
            affectedProductCount: productCount,
        };
    }

    /**
     * Remove main category
     */
    async removeMainCategory(mainCategory: string) {
        const decodedMainCategory = decodeURIComponent(mainCategory);

        const productCount = await this.prisma.extended.product.count({
            where: {
                mainCategory: decodedMainCategory,
            },
        });

        if (productCount === 0) {
            throw new NotFoundException(
                `Main category not found: ${decodedMainCategory}`,
            );
        }

        await this.prisma.extended.product.updateMany({
            where: {
                mainCategory: decodedMainCategory,
            },
            data: {
                mainCategory: null,
                subCategory: null,
            },
        });

        return {
            message: `Main category "${decodedMainCategory}" removed successfully from ${productCount} products`,
            mainCategory: decodedMainCategory,
            affectedProductCount: productCount,
        };
    }
}
