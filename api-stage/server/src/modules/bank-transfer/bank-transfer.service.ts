import {
  BadRequestException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import {
  DocumentType,
  DebitCredit,
  TransferType,
  CashboxMovementType,
  CashboxType,
  Prisma,
  BankMovementType,
  BankMovementSubType,
  Cashbox,
  BankAccount,
} from '@prisma/client';
import { PrismaService } from '../../common/prisma.service';
import { CreateBankTransferDto } from './dto/create-bank-transfer.dto';
import { FilterBankTransferDto } from './dto/filter-bank-transfer.dto';
import { UpdateBankTransferDto } from './dto/update-bank-transfer.dto';
import { SystemParameterService } from '../system-parameter/system-parameter.service';

@Injectable()
export class BankTransferService {
  constructor(
    private prisma: PrismaService,
    private systemParameterService: SystemParameterService,
  ) { }

  async create(createDto: CreateBankTransferDto, userId: string) {
    console.log('[BankTransferService] createDto received:', JSON.stringify(createDto, null, 2));
    let bankaHesabiKasa: Cashbox | null = null;
    let bankaHesabiYeni: BankAccount | null = null;

    // 1. Durum: Eski sistem (Kasa ID ile)
    if (createDto.cashboxId) {
      bankaHesabiKasa = await this.prisma.extended.cashbox.findUnique({
        where: { id: createDto.cashboxId },
      });

      if (!bankaHesabiKasa) {
        throw new NotFoundException('Cashbox not found');
      }

      if (bankaHesabiKasa.type !== CashboxType.BANK) {
        throw new BadRequestException('Seçilen kasa bir banka hesabı değil');
      }

      if (!bankaHesabiKasa.isActive) {
        throw new BadRequestException('Banka hesabı isActive değil');
      }
    }

    // 2. Durum: Yeni sistem (BankAccount ID ile)
    if (createDto.bankAccountId) {
      bankaHesabiYeni = await this.prisma.extended.bankAccount.findUnique({
        where: { id: createDto.bankAccountId },
      });

      if (!bankaHesabiYeni) {
        throw new NotFoundException('Bank account not found');
      }

      if (!bankaHesabiYeni.isActive) {
        throw new BadRequestException('Banka hesabı isActive değil');
      }
    }

    // En az biri seçili olmalı
    if (!bankaHesabiKasa && !bankaHesabiYeni) {
      throw new BadRequestException('Bir banka hesabı seçilmelidir');
    }

    // Transaction ile işlemleri gerçekleştir
    return this.prisma.extended.$transaction(async (prisma) => {
      // Account kontrolü
      const account = await prisma.account.findUnique({
        where: { id: createDto.accountId },
      });

      if (!account) {
        throw new NotFoundException('Account not found');
      }

      if (!account.isActive) {
        throw new BadRequestException('Account hesap isActive değil');
      }

      const date = createDto.date ? new Date(createDto.date) : new Date();

      // Banka havale kaydını oluştur
      const bankTransfer = await prisma.bankTransfer.create({
        data: {
          transferType: createDto.transferType as any,
          cashboxId: createDto.cashboxId, // Optional olabilir
          bankAccountId: createDto.bankAccountId,   // Optional olabilir
          accountId: createDto.accountId,
          amount: createDto.amount,
          date: date,
          notes: createDto.notes,
          referenceNo: createDto.referenceNo,
          sender: createDto.sender,
          receiver: createDto.receiver,
          createdBy: userId,
        },
        include: {
          cashbox: {
            select: {
              id: true,
              code: true,
              name: true,
            },
          },
          account: {
            select: {
              id: true,
              code: true,
              title: true,
            },
          },
          createdByUser: {
            select: {
              id: true,
              fullName: true,
              username: true,
            },
          },
        },
      });

      const isGelen = createDto.transferType === TransferType.INCOMING;

      // 1. Kasa Bakiyesi Güncelleme (Eğer seçildiyse)
      if (bankaHesabiKasa) {
        const yeniBankaBakiye = isGelen
          ? Number(bankaHesabiKasa.balance) + createDto.amount
          : Number(bankaHesabiKasa.balance) - createDto.amount;

        if (!isGelen && yeniBankaBakiye < 0) {
          const negativeBalanceControl = await this.systemParameterService.getParameterAsBoolean('NEGATIVE_BANK_BALANCE_CONTROL', false);
          if (negativeBalanceControl) {
            throw new BadRequestException('Banka hesabında yeterli bakiye yok (Kasa)');
          }
        }

        await prisma.cashbox.update({
          where: { id: bankaHesabiKasa.id },
          data: { balance: yeniBankaBakiye },
        });

        // Kasa hareket kaydı oluştur
        await prisma.cashboxMovement.create({
          data: {
            cashboxId: bankaHesabiKasa.id,
            movementType: isGelen
              ? CashboxMovementType.INCOMING_TRANSFER
              : CashboxMovementType.OUTGOING_TRANSFER,
            amount: createDto.amount,
            balance: yeniBankaBakiye,
            documentType: 'HAVALE',
            documentNo: createDto.referenceNo,
            accountId: createDto.accountId,
            notes:
              createDto.notes ||
              `${isGelen ? 'Gelen' : 'Giden'} Havale - ${account.title}`,
            date: date,
            createdBy: userId,
          },
        });
      }

      // 2. BankAccount Bakiyesi Güncelleme (Eğer seçildiyse)
      if (bankaHesabiYeni) {
        const yeniHesapBakiye = isGelen
          ? Number(bankaHesabiYeni.balance) + createDto.amount
          : Number(bankaHesabiYeni.balance) - createDto.amount;

        if (!isGelen && yeniHesapBakiye < 0) {
          const negativeBalanceControl = await this.systemParameterService.getParameterAsBoolean('NEGATIVE_BANK_BALANCE_CONTROL', false);
          if (negativeBalanceControl) {
            throw new BadRequestException('Banka hesabında yeterli bakiye yok (Banka Hesabı)');
          }
        }

        await prisma.bankAccount.update({
          where: { id: bankaHesabiYeni.id },
          data: { balance: yeniHesapBakiye },
        });

        // BankaHesapHareket kaydı oluştur
        await prisma.bankAccountMovement.create({
          data: {
            bankAccountId: bankaHesabiYeni.id,
            movementType: isGelen ? BankMovementType.INCOMING : BankMovementType.OUTGOING,
            movementSubType: isGelen ? BankMovementSubType.INCOMING_TRANSFER : BankMovementSubType.OUTGOING_TRANSFER,
            amount: createDto.amount,
            balance: yeniHesapBakiye,
            notes: createDto.notes || `${isGelen ? 'Gelen' : 'Giden'} Havale`,
            referenceNo: createDto.referenceNo,
            accountId: createDto.accountId,
            date: date,
          },
        });
      }

      // Account bakiyesini güncelle
      const yeniAccountBakiye = isGelen
        ? Number(account.balance) - createDto.amount // Gelen havale -> müşterinin borcu azalır (alacağımız azalır)
        : Number(account.balance) + createDto.amount; // Giden havale -> tedarikçiye ödeme (borcumuz azalır, bakiye artar)

      await prisma.account.update({
        where: { id: createDto.accountId },
        data: { balance: yeniAccountBakiye },
      });

      // Account hareket kaydı oluştur
      await prisma.accountMovement.create({
        data: {
          accountId: createDto.accountId,
          type: isGelen ? DebitCredit.DEBIT : DebitCredit.CREDIT,
          amount: createDto.amount,
          balance: yeniAccountBakiye,
          documentType: DocumentType.COLLECTION,
          documentNo: createDto.referenceNo,
          date: date,
          notes:
            createDto.notes ||
            `${isGelen ? 'Gelen' : 'Giden'} Havale - ${bankaHesabiKasa ? bankaHesabiKasa.name : (bankaHesabiYeni ? bankaHesabiYeni.name : '')}`,
        },
      });

      // Log kaydı oluştur
      await prisma.bankTransferLog.create({
        data: {
          bankTransferId: bankTransfer.id,
          userId: userId,
          actionType: 'CREATE',
          changes: JSON.stringify({
            action: 'create',
            data: createDto,
          }),
        },
      });

      return bankTransfer;
    });
  }

  async findAll(filterDto?: FilterBankTransferDto) {
    const where: Prisma.BankTransferWhereInput = {
      deletedAt: null, // Soft delete kontrolü
    };

    if (filterDto?.transferType) {
      where.transferType = filterDto.transferType;
    }

    if (filterDto?.cashboxId) {
      where.cashboxId = filterDto.cashboxId;
    }

    if (filterDto?.accountId) {
      where.accountId = filterDto.accountId;
    }

    if (filterDto?.referenceNo) {
      where.referenceNo = {
        contains: filterDto.referenceNo,
        mode: 'insensitive',
      };
    }

    if (filterDto?.startDate || filterDto?.endDate) {
      where.date = {};
      if (filterDto.startDate) {
        where.date.gte = new Date(filterDto.startDate);
      }
      if (filterDto.endDate) {
        where.date.lte = new Date(filterDto.endDate);
      }
    }

    return this.prisma.extended.bankTransfer.findMany({
      where,
      include: {
        cashbox: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        bankAccount: {
          select: {
            id: true,
            code: true,
            name: true,
            bank: {
              select: {
                name: true,
                logo: true,
              },
            },
          },
        },
        account: {
          select: {
            id: true,
            code: true,
            title: true,
            phone: true,
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
      },
      orderBy: { date: 'desc' },
    });
  }

  async findOne(id: string) {
    const bankTransfer = await this.prisma.extended.bankTransfer.findUnique({
      where: { id },
      include: {
        cashbox: {
          select: {
            id: true,
            code: true,
            name: true,
          },
        },
        bankAccount: {
          select: {
            id: true,
            accountNo: true,
            name: true,
            bank: {
              select: {
                name: true,
                logo: true,
              },
            },
          },
        },
        account: {
          select: {
            id: true,
            code: true,
            title: true,
            phone: true,
            email: true,
            address: true,
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

    if (!bankTransfer || bankTransfer.deletedAt) {
      throw new NotFoundException('Bank transfer record not found');
    }

    return bankTransfer;
  }

  async update(id: string, updateDto: UpdateBankTransferDto, userId: string) {
    const existingHavale = await this.prisma.extended.bankTransfer.findUnique({
      where: { id },
      include: {
        cashbox: true,
        bankAccount: true,
      },
    });

    if (!existingHavale) {
      throw new NotFoundException('Bank transfer record not found');
    }

    // 1. Yeni girilen (veya eski) Banka/Kasa kontrolü
    let yeniKasa: Cashbox | null = null;
    let yeniBankaHesap: BankAccount | null = null;

    // Eğer updateDto'da yeni bir ID varsa onu kullan, yoksa eskisine bak
    // Not: DTO'da cashboxId veya bankAccountId gönderilmemişse, eski kayıttakini baz alacağız.
    // Ancak mekanizma karışık olabilir: Kullanıcı cashboxId gönderdiyse, bankAccountId null mu kabul edilmeli?
    // Basitlik adina: DTO'da hangisi varsa veya eskisi neyse onu bulalım.

    const targetKasaId = (updateDto as any).cashboxId !== undefined ? (updateDto as any).cashboxId : existingHavale.cashboxId;
    const targetBankaHesapId = (updateDto as any).bankAccountId !== undefined ? (updateDto as any).bankAccountId : existingHavale.bankAccountId;

    if (targetKasaId) {
      yeniKasa = await this.prisma.extended.cashbox.findUnique({ where: { id: targetKasaId } });
      if (!yeniKasa || !yeniKasa.isActive || yeniKasa.type !== CashboxType.BANK) {
        if ((updateDto as any).cashboxId) throw new BadRequestException('Geçersiz veya pasif kasa');
      }
    }

    if (targetBankaHesapId) {
      yeniBankaHesap = await this.prisma.extended.bankAccount.findUnique({ where: { id: targetBankaHesapId } });
      if (!yeniBankaHesap || !yeniBankaHesap.isActive) {
        if ((updateDto as any).bankAccountId) throw new BadRequestException('Geçersiz veya pasif banka hesabı');
      }
    }

    // 2. Yeni Account Kontrolü
    const targetAccountId = (updateDto as any).accountId || existingHavale.accountId;
    const yeniAccount = await this.prisma.extended.account.findUnique({ where: { id: targetAccountId as string } });
    if (!yeniAccount || !yeniAccount.isActive) {
      throw new BadRequestException('Geçersiz veya pasif account');
    }

    return this.prisma.extended.$transaction(async (prisma) => {
      // A. ESKİ BAKİYELERİ GERİ AL
      const eskiTutar = Number(existingHavale.amount);
      const eskiHareketTipi = existingHavale.transferType;

      // A1. Eski Kasa Bakiyesi Geri Al
      if (existingHavale.cashboxId && existingHavale.cashbox) {
        const eskiKasa = existingHavale.cashbox;
        const revertKasaBakiye = eskiHareketTipi === (TransferType.INCOMING as any)
          ? Number(eskiKasa.balance) - eskiTutar
          : Number(eskiKasa.balance) + eskiTutar;

        await prisma.cashbox.update({
          where: { id: existingHavale.cashboxId },
          data: { balance: revertKasaBakiye }
        });
      }

      // A2. Eski BankaHesap Bakiyesi Geri Al
      if (existingHavale.bankAccountId && existingHavale.bankAccount) {
        const eskiHesap = existingHavale.bankAccount;
        const revertHesapBakiye = eskiHareketTipi === (TransferType.INCOMING as any)
          ? Number(eskiHesap.balance) - eskiTutar
          : Number(eskiHesap.balance) + eskiTutar;

        await prisma.bankAccount.update({
          where: { id: existingHavale.bankAccountId },
          data: { balance: revertHesapBakiye }
        });
      }

      // A3. Eski Account Bakiyesi Geri Al
      const guncelEskiAccount = await prisma.account.findUnique({ where: { id: existingHavale.accountId } });
      if (guncelEskiAccount) {
        const revertAccountBakiye = eskiHareketTipi === (TransferType.INCOMING as any)
          ? Number(guncelEskiAccount.balance) + eskiTutar
          : Number(guncelEskiAccount.balance) - eskiTutar;

        await prisma.account.update({
          where: { id: existingHavale.accountId },
          data: { balance: revertAccountBakiye }
        });
      }

      // B. YENİ BAKİYELERİ UYGULA
      // Burada "yeniKasa", "yeniBankaHesap", "yeniAccount" nesnelerini tazeledik mi? 
      // Transaction başında okumuştuk (if (targetKasaId)...), ancak bakiyeler değişmiş olabilir (özellikle aynı hesapsa).
      // En doğrusu: Revert işleminden sonra "taze" hallerini tekrar okumak veya revert bakiyelerini baz almak.
      // Revert işleminden sonra tekrar okumak en garantisi.

      const tazeYeniTutar = (updateDto as any).amount !== undefined ? (updateDto as any).amount : eskiTutar;
      const tazeHareketTipi = (updateDto as any).transferType || eskiHareketTipi;

      // B1. Kasa Güncelle (Varsa)
      if (targetKasaId) {
        const tazeKasa = await prisma.cashbox.findUnique({ where: { id: targetKasaId } });
        if (tazeKasa) {
          const updateKasaBakiye = tazeHareketTipi === TransferType.INCOMING
            ? Number(tazeKasa.balance) + tazeYeniTutar
            : Number(tazeKasa.balance) - tazeYeniTutar;

          if (tazeHareketTipi === TransferType.OUTGOING && updateKasaBakiye < 0) {
            const negativeBalanceControl = await this.systemParameterService.getParameterAsBoolean('NEGATIVE_BANK_BALANCE_CONTROL', false);
            if (negativeBalanceControl) {
              throw new BadRequestException('Kasa bakiyesi yetersiz');
            }
          }

          await prisma.cashbox.update({
            where: { id: targetKasaId },
            data: { balance: updateKasaBakiye }
          });
        }
      }

      // B2. BankaHesap Güncelle (Varsa)
      if (targetBankaHesapId) {
        const tazeHesap = await prisma.bankAccount.findUnique({ where: { id: targetBankaHesapId } });
        if (tazeHesap) {
          const updateHesapBakiye = tazeHareketTipi === TransferType.INCOMING
            ? Number(tazeHesap.balance) + tazeYeniTutar
            : Number(tazeHesap.balance) - tazeYeniTutar;

          if (tazeHareketTipi === TransferType.OUTGOING && updateHesapBakiye < 0) {
            const negativeBalanceControl = await this.systemParameterService.getParameterAsBoolean('NEGATIVE_BANK_BALANCE_CONTROL', false);
            if (negativeBalanceControl) {
              throw new BadRequestException('Banka hesap bakiyesi yetersiz');
            }
          }

          await prisma.bankAccount.update({
            where: { id: targetBankaHesapId },
            data: { balance: updateHesapBakiye }
          });
        }
      }

      // B3. Account Güncelle
      const tazeAccount = await prisma.account.findUnique({ where: { id: targetAccountId as string } });
      if (tazeAccount) {
        const updateAccountBakiye = tazeHareketTipi === (TransferType.INCOMING as any)
          ? Number(tazeAccount.balance) - tazeYeniTutar
          : Number(tazeAccount.balance) + tazeYeniTutar;

        await prisma.account.update({
          where: { id: targetAccountId as string },
          data: { balance: updateAccountBakiye }
        });
      }

      // C. HAVALE KAYDINI GÜNCELLE
      const updateData: any = {
        transferType: tazeHareketTipi,
        cashboxId: targetKasaId || null,
        bankAccountId: targetBankaHesapId || null,
        accountId: targetAccountId,
        amount: tazeYeniTutar,
        notes: updateDto.notes,
        referenceNo: updateDto.referenceNo,
        sender: updateDto.sender,
        receiver: updateDto.receiver,
        updatedBy: userId,
      };

      if (updateDto.date) {
        updateData.date = new Date(updateDto.date);
      }

      const updatedHavale = await prisma.bankTransfer.update({
        where: { id },
        data: updateData,
        include: {
          cashbox: { select: { id: true, code: true, name: true } },
          bankAccount: { select: { id: true, name: true, accountNo: true, iban: true } },
          account: { select: { id: true, code: true, title: true } },
          createdByUser: { select: { id: true, fullName: true, username: true } },
          updatedByUser: { select: { id: true, fullName: true, username: true } },
        },
      });

      // Log
      await prisma.bankTransferLog.create({
        data: {
          bankTransferId: id,
          userId: userId,
          actionType: 'UPDATE',
          changes: JSON.stringify({
            action: 'update',
            before: existingHavale,
            after: updateDto,
          }),
        },
      });

      return updatedHavale;
    });
  }

  async remove(id: string, userId: string, deleteReason?: string) {
    const havale = await this.prisma.extended.bankTransfer.findUnique({
      where: { id },
      include: {
        cashbox: true,
        bankAccount: true,
        account: true,
      },
    });

    if (!havale || havale.deletedAt) {
      throw new NotFoundException('Bank transfer record not found');
    }

    return this.prisma.extended.$transaction(async (prisma) => {
      // Silinen kayıt tablosuna ekle
      await prisma.deletedBankTransfer.create({
        data: {
          originalId: havale.id,
          transferType: havale.transferType,
          cashboxId: havale.cashboxId ?? havale.bankAccountId ?? '',
          cashboxName: havale.cashbox?.name ?? havale.bankAccount?.name ?? 'Bilinmiyor',
          accountId: havale.accountId,
          accountName: havale.account?.title ?? '',
          amount: havale.amount,
          date: havale.date,
          notes: havale.notes,
          referenceNo: havale.referenceNo,
          sender: havale.sender,
          receiver: havale.receiver,
          originalCreatedBy: havale.createdBy,
          originalUpdatedBy: havale.updatedBy,
          originalCreatedAt: havale.createdAt,
          originalUpdatedAt: havale.updatedAt,
          deletedBy: userId,
          deleteReason: deleteReason,
        },
      });

      // Soft delete
      await prisma.bankTransfer.update({
        where: { id },
        data: {
          deletedAt: new Date(),
          deletedBy: userId,
        },
      });

      // Banka bakiyesini geri al (Kasa)
      if (havale.cashboxId && havale.cashbox) {
        const yeniBankaBakiye =
          havale.transferType === TransferType.INCOMING
            ? Number(havale.cashbox.balance) - Number(havale.amount)
            : Number(havale.cashbox.balance) + Number(havale.amount);

        await prisma.cashbox.update({
          where: { id: havale.cashboxId },
          data: { balance: yeniBankaBakiye },
        });
      }

      // Banka bakiyesini geri al (BankAccount)
      if (havale.bankAccountId && havale.bankAccount) {
        const yeniBankaBakiye =
          havale.transferType === (TransferType.INCOMING as any)
            ? Number(havale.bankAccount.balance) - Number(havale.amount)
            : Number(havale.bankAccount.balance) + Number(havale.amount);

        await prisma.bankAccount.update({
          where: { id: havale.bankAccountId },
          data: { balance: yeniBankaBakiye },
        });
      }

      // Account bakiyesini geri al
      const guncelAccount = await prisma.account.findUnique({
        where: { id: havale.accountId },
      });
      if (!guncelAccount) throw new NotFoundException('Account not found');

      const yeniAccountBakiye =
        havale.transferType === TransferType.INCOMING
          ? Number(guncelAccount.balance) + Number(havale.amount)
          : Number(guncelAccount.balance) - Number(havale.amount);

      await prisma.account.update({
        where: { id: havale.accountId },
        data: { balance: yeniAccountBakiye },
      });

      // Log kaydı oluştur
      await prisma.bankTransferLog.create({
        data: {
          bankTransferId: id,
          userId: userId,
          actionType: 'DELETE',
          changes: JSON.stringify({
            action: 'delete',
            reason: deleteReason,
            data: havale,
          }),
        },
      });

      return { message: 'Banka havale kaydı başarıyla silindi' };
    });
  }

  // Silinen kayıtları listele
  async findDeleted() {
    return this.prisma.extended.deletedBankTransfer.findMany({
      include: {
        deletedByUser: {
          select: {
            id: true,
            fullName: true,
            username: true,
          },
        },
      },
      orderBy: { deletedAt: 'desc' },
    });
  }

  // İstatistikler
  async getStats(
    cashboxId?: string,
    startDate?: string,
    endDate?: string,
    transferType?: TransferType,
  ) {
    const where: Prisma.BankTransferWhereInput = {
      deletedAt: null,
    };

    if (cashboxId) {
      where.OR = [
        { cashboxId: cashboxId },
        { bankAccountId: cashboxId },
      ];
    }

    if (transferType) {
      where.transferType = transferType;
    }

    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate);
      }
      if (endDate) {
        where.date.lte = new Date(endDate);
      }
    }

    const [gelirHavaleler, giderHavaleler, toplamKayit] = await Promise.all([
      this.prisma.extended.bankTransfer.aggregate({
        where: { ...where, transferType: TransferType.INCOMING },
        _sum: { amount: true },
        _count: true,
      }),
      this.prisma.extended.bankTransfer.aggregate({
        where: { ...where, transferType: TransferType.OUTGOING },
        _sum: { amount: true },
        _count: true,
      }),
      this.prisma.extended.bankTransfer.count({ where }),
    ]);

    return {
      toplamKayit,
      gelenHavale: {
        adet: gelirHavaleler._count,
        toplam: gelirHavaleler._sum.amount || 0,
      },
      gidenHavale: {
        adet: giderHavaleler._count,
        toplam: giderHavaleler._sum.amount || 0,
      },
      net:
        Number(gelirHavaleler._sum.amount || 0) -
        Number(giderHavaleler._sum.amount || 0),
    };
  }
}
