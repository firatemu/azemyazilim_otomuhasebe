import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import * as ExcelJS from 'exceljs';
import PdfPrinter = require('pdfmake');
import type { TDocumentDefinitions, Content } from 'pdfmake/interfaces';
import { CollectionType, PaymentMethod } from '@prisma/client';

@Injectable()
export class CollectionExportService {
  constructor(private readonly prisma: PrismaService) { }

  async generateExcel(
    tip?: CollectionType,
    paymentMethod?: PaymentMethod,
    accountId?: string, // accountId
    startDate?: string,
    endDate?: string,
    cashboxId?: string, // cashboxId
    bankAccountId?: string, // bankAccountId
    companyCreditCardId?: string, // companyCreditCardId
  ): Promise<Buffer> {
    const where: any = {
      deletedAt: null,
      OR: [
        { invoiceId: null },
        { invoice: { deletedAt: null } }
      ]
    };

    if (tip) {
      where.type = tip;
    }

    if (paymentMethod) {
      where.paymentType = paymentMethod;
    }

    if (accountId) {
      where.accountId = accountId;
    }

    if (cashboxId) {
      where.cashboxId = cashboxId;
    }

    if (bankAccountId) {
      where.bankAccountId = bankAccountId;
    }

    if (companyCreditCardId) {
      where.companyCreditCardId = companyCreditCardId;
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

    const collectionlar = await this.prisma.extended.collection.findMany({
      where,
      include: {
        account: true,
        cashbox: true,
        bankAccount: {
          include: {
            bank: true,
          },
        },
        companyCreditCard: true,
      },
      orderBy: {
        date: 'desc',
      },
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Collection Raporu');

    // Başlık bilgileri
    worksheet.mergeCells('A1:J1');
    worksheet.getCell('A1').value =
      tip === 'COLLECTION'
        ? 'TAHSİLAT RAPORU'
        : tip === 'PAYMENT'
          ? 'ÖDEME RAPORU'
          : 'TAHSİLAT & ÖDEME RAPORU';
    worksheet.getCell('A1').font = { bold: true, size: 16 };
    worksheet.getCell('A1').alignment = {
      horizontal: 'center',
      vertical: 'middle',
    };
    worksheet.getRow(1).height = 30;

    // Filtre bilgileri
    let row = 3;
    if (startDate || endDate) {
      worksheet.getCell(`A${row}`).value = 'Tarih Aralığı:';
      worksheet.getCell(`B${row}`).value =
        `${startDate || 'Başlangıç'} - ${endDate || 'Bitiş'}`;
      row++;
    }

    if (tip) {
      worksheet.getCell(`A${row}`).value = 'Tip:';
      worksheet.getCell(`B${row}`).value =
        tip === 'COLLECTION' ? 'Collection' : 'Ödeme';
      row++;
    }

    if (paymentMethod) {
      worksheet.getCell(`A${row}`).value = 'Ödeme Tipi:';
      worksheet.getCell(`B${row}`).value = this.getOdemeTipiText(paymentMethod);
      row++;
    }

    row += 2;

    // Tablo başlıkları
    const headers = [
      'Tarih',
      'Cari Kodu',
      'Cari Ünvan',
      'Tip',
      'Ödeme Tipi',
      'Kasa',
      'Kasa Tipi',
      'Banka',
      'Kart Adı',
      'Tutar',
      'Açıklama',
    ];

    worksheet.getRow(row).values = headers;
    worksheet.getRow(row).font = { bold: true };
    worksheet.getRow(row).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };

    // Veriler
    let currentRow = row + 1;
    let toplamCollection = 0;
    let totalPayment = 0;

    collectionlar.forEach((collection) => {
      const date = new Date((collection as any).date).toLocaleDateString('tr-TR');
      const code = (collection as any).account?.code || '-';
      const title = (collection as any).account?.title || '-';
      const tip = (collection as any).type === 'COLLECTION' ? 'Collection' : 'Ödeme';
      const paymentMethod = this.getOdemeTipiText((collection as any).paymentType);
      const kasa = (collection as any).cashbox?.name || 'Çapraz Ödeme';
      const kasaTipi = (collection as any).cashbox
        ? this.getKasaTipiText((collection as any).cashbox.type)
        : '-';
      const banka =
        (collection as any).companyCreditCard?.bankName ||
        (collection as any).bankAccount?.bank?.name ||
        '-';
      const kartAdi =
        (collection as any).companyCreditCard?.name ||
        (collection as any).bankAccount?.name ||
        '-';
      const amount = parseFloat((collection as any).amount.toString());
      const notes = (collection as any).notes || '-';

      if ((collection as any).type === 'COLLECTION') {
        toplamCollection += amount;
      } else {
        totalPayment += amount;
      }

      worksheet.getRow(currentRow).values = [
        date,
        code,
        title,
        tip,
        paymentMethod,
        kasa,
        kasaTipi,
        banka,
        kartAdi,
        amount,
        notes,
      ];

      // Tutar hücresini renklendir
      const amountCell = worksheet.getCell(`J${currentRow}`);
      if ((collection as any).type === 'COLLECTION') {
        amountCell.font = { color: { argb: 'FF008000' }, bold: true };
      } else {
        amountCell.font = { color: { argb: 'FFFF0000' }, bold: true };
      }

      currentRow++;
    });

    // Özet bilgileri
    currentRow += 2;
    worksheet.getCell(`A${currentRow}`).value = 'ÖZET';
    worksheet.getCell(`A${currentRow}`).font = { bold: true, size: 14 };
    currentRow++;

    worksheet.getCell(`A${currentRow}`).value = 'Toplam Collection:';
    worksheet.getCell(`B${currentRow}`).value = toplamCollection;
    worksheet.getCell(`B${currentRow}`).font = {
      color: { argb: 'FF008000' },
      bold: true,
    };
    worksheet.getCell(`B${currentRow}`).numFmt = '#,##0.00';
    currentRow++;

    worksheet.getCell(`A${currentRow}`).value = 'Toplam Ödeme:';
    worksheet.getCell(`B${currentRow}`).value = totalPayment;
    worksheet.getCell(`B${currentRow}`).font = {
      color: { argb: 'FFFF0000' },
      bold: true,
    };
    worksheet.getCell(`B${currentRow}`).numFmt = '#,##0.00';
    currentRow++;

    worksheet.getCell(`A${currentRow}`).value = 'Net Tutar:';
    worksheet.getCell(`B${currentRow}`).value = toplamCollection - totalPayment;
    worksheet.getCell(`B${currentRow}`).font = { bold: true };
    worksheet.getCell(`B${currentRow}`).numFmt = '#,##0.00';
    currentRow++;

    worksheet.getCell(`A${currentRow}`).value = 'Toplam Kayıt:';
    worksheet.getCell(`B${currentRow}`).value = collectionlar.length;

    // Sütun genişlikleri
    worksheet.columns = [
      { width: 12 }, // Tarih
      { width: 15 }, // Cari Kodu
      { width: 30 }, // Cari Ünvan
      { width: 12 }, // Tip
      { width: 15 }, // Ödeme Tipi
      { width: 20 }, // Kasa
      { width: 15 }, // Kasa Tipi
      { width: 15 }, // Banka
      { width: 15 }, // Kart Adı
      { width: 15 }, // Tutar
      { width: 40 }, // Açıklama
    ];

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  async generatePdf(
    tip?: CollectionType,
    paymentMethod?: PaymentMethod,
    accountId?: string, // accountId
    startDate?: string,
    endDate?: string,
    cashboxId?: string, // cashboxId
    bankAccountId?: string, // bankAccountId
    companyCreditCardId?: string, // companyCreditCardId
  ): Promise<Buffer> {
    const where: any = {
      deletedAt: null,
      OR: [
        { invoiceId: null },
        { invoice: { deletedAt: null } }
      ]
    };

    if (tip) {
      where.type = tip;
    }

    if (paymentMethod) {
      where.paymentType = paymentMethod;
    }

    if (accountId) {
      where.accountId = accountId;
    }

    if (cashboxId) {
      where.cashboxId = cashboxId;
    }

    if (bankAccountId) {
      where.bankAccountId = bankAccountId;
    }

    if (companyCreditCardId) {
      where.companyCreditCardId = companyCreditCardId;
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

    const collectionlar = await this.prisma.extended.collection.findMany({
      where,
      include: {
        account: true,
        cashbox: true,
        bankAccount: {
          include: {
            bank: true,
          },
        },
        companyCreditCard: true,
      },
      orderBy: {
        date: 'desc',
      },
    });

    // PDF font tanımlamaları
    const vfs = require('pdfmake/build/vfs_fonts.js');
    const fonts = {
      Roboto: {
        normal: Buffer.from(vfs['Roboto-Regular.ttf'] || '', 'base64'),
        bold: Buffer.from(
          vfs['Roboto-Medium.ttf'] || vfs['Roboto-Regular.ttf'] || '',
          'base64',
        ),
      },
    };
    const printer = new (require('pdfmake'))(fonts);

    // Tablo body
    const tableBody: any[] = [];

    // Başlık satırı
    tableBody.push([
      { text: 'Tarih', style: 'tableHeader' },
      { text: 'Cari Kodu', style: 'tableHeader' },
      { text: 'Cari Ünvan', style: 'tableHeader' },
      { text: 'Tip', style: 'tableHeader' },
      { text: 'Kasa', style: 'tableHeader' },
      { text: 'Banka', style: 'tableHeader' },
      { text: 'Tutar', style: 'tableHeader', alignment: 'right' },
      { text: 'Açıklama', style: 'tableHeader' },
    ]);

    // Veri satırları
    let toplamCollection = 0;
    let totalPayment = 0;

    collectionlar.forEach((collection) => {
      const date = new Date((collection as any).date).toLocaleDateString('tr-TR');
      const code = (collection as any).account?.code || '-';
      const title = (collection as any).account?.title || '-';
      const tip = (collection as any).type === 'COLLECTION' ? 'Collection' : 'Ödeme';
      const kasa = (collection as any).cashbox?.name || 'Çapraz Ödeme';
      const banka =
        (collection as any).companyCreditCard?.bankName ||
        (collection as any).bankAccount?.bank?.name ||
        '-';
      const amount = parseFloat((collection as any).amount.toString());
      const notes = (collection as any).notes || '-';

      if ((collection as any).type === 'COLLECTION') {
        toplamCollection += amount;
      } else {
        totalPayment += amount;
      }

      const amountColor = (collection as any).type === 'COLLECTION' ? 'green' : 'red';

      tableBody.push([
        date,
        code,
        { text: title, fontSize: 8 },
        tip,
        { text: kasa, fontSize: 8 },
        { text: banka, fontSize: 8 },
        {
          text: amount.toFixed(2),
          alignment: 'right',
          color: amountColor,
          bold: true,
        },
        { text: notes, fontSize: 7 },
      ]);
    });

    // Filtre bilgileri
    const filterInfo: Content[] = [];
    if (startDate || endDate) {
      filterInfo.push({
        text: `Tarih Aralığı: ${startDate || 'Başlangıç'} - ${endDate || 'Bitiş'}`,
        style: 'info',
      });
    }
    if (tip) {
      filterInfo.push({
        text: `Tip: ${tip === 'COLLECTION' ? 'Collection' : 'Ödeme'}`,
        style: 'info',
      });
    }
    if (paymentMethod) {
      filterInfo.push({
        text: `Ödeme Tipi: ${this.getOdemeTipiText(paymentMethod)}`,
        style: 'info',
      });
    }

    const docDefinition: TDocumentDefinitions = {
      content: [
        {
          text:
            tip === 'COLLECTION'
              ? 'TAHSİLAT RAPORU'
              : tip === 'PAYMENT'
                ? 'ÖDEME RAPORU'
                : 'TAHSİLAT & ÖDEME RAPORU',
          style: 'header',
          alignment: 'center',
        },
        { text: '\n' },
        ...filterInfo,
        { text: '\n' },
        {
          table: {
            headerRows: 1,
            widths: [60, 60, '*', 50, 60, 60, 60, '*'],
            body: tableBody,
          },
          layout: {
            fillColor: (rowIndex: number) =>
              rowIndex === 0 ? '#CCCCCC' : null,
          },
        },
        { text: '\n' },
        { text: 'ÖZET', style: 'subheader' },
        {
          text: `Toplam Collection: ${toplamCollection.toFixed(2)} TL`,
          style: 'info',
          color: 'green',
        },
        {
          text: `Toplam Ödeme: ${totalPayment.toFixed(2)} TL`,
          style: 'info',
          color: 'red',
        },
        {
          text: `Net Tutar: ${(toplamCollection - totalPayment).toFixed(2)} TL`,
          style: 'info',
          bold: true,
        },
        { text: `Toplam Kayıt: ${collectionlar.length}`, style: 'info' },
      ],
      styles: {
        header: {
          fontSize: 18,
          bold: true,
          margin: [0, 0, 0, 10],
        },
        subheader: {
          fontSize: 14,
          bold: true,
          margin: [0, 10, 0, 5],
        },
        info: {
          fontSize: 10,
          margin: [0, 2, 0, 2],
        },
        tableHeader: {
          bold: true,
          fontSize: 9,
          color: 'black',
          fillColor: '#CCCCCC',
        },
      },
      defaultStyle: {
        fontSize: 8,
      },
    };

    const pdfDoc = printer.createPdfKitDocument(docDefinition);
    const chunks: Uint8Array[] = [];

    return new Promise((resolve, reject) => {
      pdfDoc.on('data', (chunk: Uint8Array) => chunks.push(chunk));
      pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
      pdfDoc.on('error', reject);
      pdfDoc.end();
    });
  }

  private getOdemeTipiText(paymentMethod: PaymentMethod): string {
    const paymentMethodMap: Record<string, string> = {
      CASH: 'Nakit',
      CREDIT_CARD: 'Kredi Kartı',
      BANK_TRANSFER: 'Havale',
      CHECK: 'Çek',
      PROMISSORY_NOTE: 'Senet',
      GIFT_CARD: 'Hediye Kartı',
      LOAN_ACCOUNT: 'Kredi Hesabı',
    };
    return paymentMethodMap[paymentMethod] || paymentMethod;
  }

  private getKasaTipiText(kasaTipi: string): string {
    const kasaTipiMap: Record<string, string> = {
      CASH: 'Nakit',
      POS: 'POS',
      COMPANY_CREDIT_CARD: 'Firma Kredi Kartı',
      BANK: 'Banka',
    };
    return kasaTipiMap[kasaTipi] || kasaTipi;
  }
}
