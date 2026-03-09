import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateProductBarcodeDto } from './dto/create-product-barcode.dto';

@Injectable()
export class ProductBarcodeService {
  constructor(private prisma: PrismaService) {}

  async findByProduct(productId: string) {
    return this.prisma.extended.productBarcode.findMany({
      where: { productId },
      orderBy: [{ isPrimary: 'desc' }, { createdAt: 'asc' }],
    });
  }

  async findByBarcode(barcode: string) {
    const productBarcode = await this.prisma.extended.productBarcode.findUnique({
      where: { barcode },
      include: {
        product: {
          select: {
            id: true,
            code: true,
            name: true,
            brand: true,
          },
        },
      },
    });

    if (!productBarcode) {
      throw new NotFoundException('Product not found');
    }

    return {
      ...productBarcode,
      product: (productBarcode as any).product
        ? {
            ...(productBarcode as any).product,
            // Backward-compatible aliases
            code: (productBarcode as any).product.code,
            name: (productBarcode as any).product.name,
            marka: (productBarcode as any).product.brand,
          }
        : null,
    };
  }

  async create(createDto: CreateProductBarcodeDto) {
    // Ürün kontrolü
    const product = await this.prisma.extended.product.findUnique({
      where: { id: createDto.productId },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    // Barkod benzersizliği kontrolü
    const existing = await this.prisma.extended.productBarcode.findUnique({
      where: { barcode: createDto.barcode },
    });

    if (existing) {
      throw new BadRequestException('Bu barkod zaten kullanılıyor');
    }

    // Eğer birincil barkod olarak işaretleniyorsa, diğer birincil barkodları kaldır
    if (createDto.isPrimary) {
      await this.prisma.extended.productBarcode.updateMany({
        where: {
          productId: createDto.productId,
          isPrimary: true,
        },
        data: {
          isPrimary: false,
        },
      });
    }

    return this.prisma.extended.productBarcode.create({
      data: {
        productId: createDto.productId,
        barcode: createDto.barcode,
        symbology: createDto.symbology,
        isPrimary: createDto.isPrimary ?? false,
      },
    });
  }

  async remove(id: string) {
    const productBarcode = await this.prisma.extended.productBarcode.findUnique({
      where: { id },
    });

    if (!productBarcode) {
      throw new NotFoundException('Barcode not found');
    }

    return this.prisma.extended.productBarcode.delete({
      where: { id },
    });
  }

  async setPrimary(id: string) {
    const productBarcode = await this.prisma.extended.productBarcode.findUnique({
      where: { id },
    });

    if (!productBarcode) {
      throw new NotFoundException('Barcode not found');
    }

    // Diğer birincil barkodları kaldır
    await this.prisma.extended.productBarcode.updateMany({
      where: {
        productId: productBarcode.productId,
        isPrimary: true,
      },
      data: {
        isPrimary: false,
      },
    });

    // Bu barkodu birincil yap
    return this.prisma.extended.productBarcode.update({
      where: { id },
      data: {
        isPrimary: true,
      },
    });
  }
}
