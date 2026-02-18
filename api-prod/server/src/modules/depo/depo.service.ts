import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';

@Injectable()
export class DepoService {
  constructor(private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.depo.findMany({
      include: { raflar: true },
      orderBy: { createdAt: 'desc' },
    });
  }

  async findOne(id: string) {
    return this.prisma.depo.findUnique({
      where: { id },
      include: {
        raflar: { include: { urunler: { include: { stok: true } } } },
      },
    });
  }
}
