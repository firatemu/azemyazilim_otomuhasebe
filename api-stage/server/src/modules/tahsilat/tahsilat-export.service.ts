import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import * as ExcelJS from 'exceljs';
import PdfPrinter = require('pdfmake');
import type { TDocumentDefinitions, Content } from 'pdfmake/interfaces';
import { TahsilatTip, OdemeTipi } from '@prisma/client';

@Injectable()
export class TahsilatExportService {
  constructor(private readonly prisma: PrismaService) { }

  async generateExcel(
    tip?: TahsilatTip,
    odemeTipi?: OdemeTipi,
    cariId?: string,
    baslangicTarihi?: string,
    bitisTarihi?: string,
    kasaId?: string,
    bankaHesapId?: string,
    firmaKrediKartiId?: string,
  ): Promise<Buffer> {
    const where: any = {
      deletedAt: null,
      OR: [
        { faturaId: null },
        { fatura: { deletedAt: null } }
      ]
    };

    if (tip) {
      where.tip = tip;
    }

    if (odemeTipi) {
      where.odemeTipi = odemeTipi;
    }

    if (cariId) {
      where.cariId = cariId;
    }

    if (kasaId) {
      where.kasaId = kasaId;
    }

    if (bankaHesapId) {
      where.bankaHesapId = bankaHesapId;
    }

    if (firmaKrediKartiId) {
      where.firmaKrediKartiId = firmaKrediKartiId;
    }

    if (baslangicTarihi || bitisTarihi) {
      where.tarih = {};
      if (baslangicTarihi) {
        where.tarih.gte = new Date(baslangicTarihi);
      }
      if (bitisTarihi) {
        where.tarih.lte = new Date(bitisTarihi);
      }
    }

    const tahsilatlar = await this.prisma.tahsilat.findMany({
      where,
      include: {
        cari: true,
        kasa: true,
        bankaHesap: {
          include: {
            banka: true,
          },
        },
        firmaKrediKarti: true,
      },
      orderBy: {
        tarih: 'desc',
      },
    });

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Tahsilat Raporu');

    // Başlık bilgileri
    worksheet.mergeCells('A1:J1');
    worksheet.getCell('A1').value =
      tip === 'TAHSILAT'
        ? 'TAHSİLAT RAPORU'
        : tip === 'ODEME'
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
    if (baslangicTarihi || bitisTarihi) {
      worksheet.getCell(`A${row}`).value = 'Tarih Aralığı:';
      worksheet.getCell(`B${row}`).value =
        `${baslangicTarihi || 'Başlangıç'} - ${bitisTarihi || 'Bitiş'}`;
      row++;
    }

    if (tip) {
      worksheet.getCell(`A${row}`).value = 'Tip:';
      worksheet.getCell(`B${row}`).value =
        tip === 'TAHSILAT' ? 'Tahsilat' : 'Ödeme';
      row++;
    }

    if (odemeTipi) {
      worksheet.getCell(`A${row}`).value = 'Ödeme Tipi:';
      worksheet.getCell(`B${row}`).value = this.getOdemeTipiText(odemeTipi);
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
    let toplamTahsilat = 0;
    let toplamOdeme = 0;

    tahsilatlar.forEach((tahsilat) => {
      const tarih = new Date(tahsilat.tarih).toLocaleDateString('tr-TR');
      const cariKodu = tahsilat.cari?.cariKodu || '-';
      const cariUnvan = tahsilat.cari?.unvan || '-';
      const tip = tahsilat.tip === 'TAHSILAT' ? 'Tahsilat' : 'Ödeme';
      const odemeTipi = this.getOdemeTipiText(tahsilat.odemeTipi);
      const kasa = tahsilat.kasa?.kasaAdi || 'Çapraz Ödeme';
      const kasaTipi = tahsilat.kasa
        ? this.getKasaTipiText(tahsilat.kasa.kasaTipi)
        : '-';
      const banka =
        tahsilat.firmaKrediKarti?.bankaAdi ||
        tahsilat.bankaHesap?.banka?.ad ||
        '-';
      const kartAdi =
        tahsilat.firmaKrediKarti?.kartAdi ||
        tahsilat.bankaHesap?.hesapAdi ||
        '-';
      const tutar = parseFloat(tahsilat.tutar.toString());
      const aciklama = tahsilat.aciklama || '-';

      if (tahsilat.tip === 'TAHSILAT') {
        toplamTahsilat += tutar;
      } else {
        toplamOdeme += tutar;
      }

      worksheet.getRow(currentRow).values = [
        tarih,
        cariKodu,
        cariUnvan,
        tip,
        odemeTipi,
        kasa,
        kasaTipi,
        banka,
        kartAdi,
        tutar,
        aciklama,
      ];

      // Tutar hücresini renklendir
      const tutarCell = worksheet.getCell(`J${currentRow}`);
      if (tahsilat.tip === 'TAHSILAT') {
        tutarCell.font = { color: { argb: 'FF008000' }, bold: true };
      } else {
        tutarCell.font = { color: { argb: 'FFFF0000' }, bold: true };
      }

      currentRow++;
    });

    // Özet bilgileri
    currentRow += 2;
    worksheet.getCell(`A${currentRow}`).value = 'ÖZET';
    worksheet.getCell(`A${currentRow}`).font = { bold: true, size: 14 };
    currentRow++;

    worksheet.getCell(`A${currentRow}`).value = 'Toplam Tahsilat:';
    worksheet.getCell(`B${currentRow}`).value = toplamTahsilat;
    worksheet.getCell(`B${currentRow}`).font = {
      color: { argb: 'FF008000' },
      bold: true,
    };
    worksheet.getCell(`B${currentRow}`).numFmt = '#,##0.00';
    currentRow++;

    worksheet.getCell(`A${currentRow}`).value = 'Toplam Ödeme:';
    worksheet.getCell(`B${currentRow}`).value = toplamOdeme;
    worksheet.getCell(`B${currentRow}`).font = {
      color: { argb: 'FFFF0000' },
      bold: true,
    };
    worksheet.getCell(`B${currentRow}`).numFmt = '#,##0.00';
    currentRow++;

    worksheet.getCell(`A${currentRow}`).value = 'Net Tutar:';
    worksheet.getCell(`B${currentRow}`).value = toplamTahsilat - toplamOdeme;
    worksheet.getCell(`B${currentRow}`).font = { bold: true };
    worksheet.getCell(`B${currentRow}`).numFmt = '#,##0.00';
    currentRow++;

    worksheet.getCell(`A${currentRow}`).value = 'Toplam Kayıt:';
    worksheet.getCell(`B${currentRow}`).value = tahsilatlar.length;

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
    tip?: TahsilatTip,
    odemeTipi?: OdemeTipi,
    cariId?: string,
    baslangicTarihi?: string,
    bitisTarihi?: string,
    kasaId?: string,
    bankaHesapId?: string,
    firmaKrediKartiId?: string,
  ): Promise<Buffer> {
    const where: any = {
      deletedAt: null,
      OR: [
        { faturaId: null },
        { fatura: { deletedAt: null } }
      ]
    };

    if (tip) {
      where.tip = tip;
    }

    if (odemeTipi) {
      where.odemeTipi = odemeTipi;
    }

    if (cariId) {
      where.cariId = cariId;
    }

    if (kasaId) {
      where.kasaId = kasaId;
    }

    if (bankaHesapId) {
      where.bankaHesapId = bankaHesapId;
    }

    if (firmaKrediKartiId) {
      where.firmaKrediKartiId = firmaKrediKartiId;
    }

    if (baslangicTarihi || bitisTarihi) {
      where.tarih = {};
      if (baslangicTarihi) {
        where.tarih.gte = new Date(baslangicTarihi);
      }
      if (bitisTarihi) {
        where.tarih.lte = new Date(bitisTarihi);
      }
    }

    const tahsilatlar = await this.prisma.tahsilat.findMany({
      where,
      include: {
        cari: true,
        kasa: true,
        bankaHesap: {
          include: {
            banka: true,
          },
        },
        firmaKrediKarti: true,
      },
      orderBy: {
        tarih: 'desc',
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
    let toplamTahsilat = 0;
    let toplamOdeme = 0;

    tahsilatlar.forEach((tahsilat) => {
      const tarih = new Date(tahsilat.tarih).toLocaleDateString('tr-TR');
      const cariKodu = tahsilat.cari?.cariKodu || '-';
      const cariUnvan = tahsilat.cari?.unvan || '-';
      const tip = tahsilat.tip === 'TAHSILAT' ? 'Tahsilat' : 'Ödeme';
      const kasa = tahsilat.kasa?.kasaAdi || 'Çapraz Ödeme';
      const banka =
        tahsilat.firmaKrediKarti?.bankaAdi ||
        tahsilat.bankaHesap?.banka?.ad ||
        '-';
      const tutar = parseFloat(tahsilat.tutar.toString());
      const aciklama = tahsilat.aciklama || '-';

      if (tahsilat.tip === 'TAHSILAT') {
        toplamTahsilat += tutar;
      } else {
        toplamOdeme += tutar;
      }

      const tutarColor = tahsilat.tip === 'TAHSILAT' ? 'green' : 'red';

      tableBody.push([
        tarih,
        cariKodu,
        { text: cariUnvan, fontSize: 8 },
        tip,
        { text: kasa, fontSize: 8 },
        { text: banka, fontSize: 8 },
        {
          text: tutar.toFixed(2),
          alignment: 'right',
          color: tutarColor,
          bold: true,
        },
        { text: aciklama, fontSize: 7 },
      ]);
    });

    // Filtre bilgileri
    const filterInfo: Content[] = [];
    if (baslangicTarihi || bitisTarihi) {
      filterInfo.push({
        text: `Tarih Aralığı: ${baslangicTarihi || 'Başlangıç'} - ${bitisTarihi || 'Bitiş'}`,
        style: 'info',
      });
    }
    if (tip) {
      filterInfo.push({
        text: `Tip: ${tip === 'TAHSILAT' ? 'Tahsilat' : 'Ödeme'}`,
        style: 'info',
      });
    }
    if (odemeTipi) {
      filterInfo.push({
        text: `Ödeme Tipi: ${this.getOdemeTipiText(odemeTipi)}`,
        style: 'info',
      });
    }

    const docDefinition: TDocumentDefinitions = {
      content: [
        {
          text:
            tip === 'TAHSILAT'
              ? 'TAHSİLAT RAPORU'
              : tip === 'ODEME'
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
          text: `Toplam Tahsilat: ${toplamTahsilat.toFixed(2)} TL`,
          style: 'info',
          color: 'green',
        },
        {
          text: `Toplam Ödeme: ${toplamOdeme.toFixed(2)} TL`,
          style: 'info',
          color: 'red',
        },
        {
          text: `Net Tutar: ${(toplamTahsilat - toplamOdeme).toFixed(2)} TL`,
          style: 'info',
          bold: true,
        },
        { text: `Toplam Kayıt: ${tahsilatlar.length}`, style: 'info' },
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

  private getOdemeTipiText(odemeTipi: OdemeTipi): string {
    const odemeTipiMap: Record<string, string> = {
      NAKIT: 'Nakit',
      KREDI_KARTI: 'Kredi Kartı',
      HAVALE: 'Havale',
    };
    return odemeTipiMap[odemeTipi] || odemeTipi;
  }

  private getKasaTipiText(kasaTipi: string): string {
    const kasaTipiMap: Record<string, string> = {
      NAKIT: 'Nakit',
      POS: 'POS',
      FIRMA_KREDI_KARTI: 'Firma Kredi Kartı',
      BANKA: 'Banka',
    };
    return kasaTipiMap[kasaTipi] || kasaTipi;
  }
}
