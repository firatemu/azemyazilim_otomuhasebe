import { Global, Module } from '@nestjs/common';
import { PrismaService } from './prisma.service';

export const EXTENDED_PRISMA = 'EXTENDED_PRISMA';

@Global()
@Module({
  providers: [
    PrismaService,
    {
      provide: EXTENDED_PRISMA,
      useFactory: (prisma: PrismaService) => prisma.extended,
      inject: [PrismaService],
    },
  ],
  exports: [PrismaService, EXTENDED_PRISMA],
})
export class PrismaModule { }
