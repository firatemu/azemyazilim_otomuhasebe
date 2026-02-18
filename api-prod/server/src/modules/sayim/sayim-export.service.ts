import { Injectable } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import * as ExcelJS from 'exceljs';
import PdfPrinter = require('pdfmake');
import type { TDocumentDefinitions, Content } from 'pdfmake/interfaces';

@Injectable()
export class SayimExportService {
  constructor(private readonly prisma: PrismaService) {}

  async generateExcel(sayimId: string): Promise<Buffer> {
    const sayim = await this.prisma.sayim.findUnique({
      where: { id: sayimId },
      include: {
        kalemler: {
          include: {
            stok: true,
            location: true,
          },
        },
        createdByUser: true,
        onaylayan: true,
      },
    });

    if (!sayim) {
      throw new Error('Sayım bulunamadı');
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sayım Raporu');

    // Başlık bilgileri
    worksheet.mergeCells('A1:F1');
    worksheet.getCell('A1').value = 'STOK SAYIM RAPORU';
    worksheet.getCell('A1').font = { bold: true, size: 16 };
    worksheet.getCell('A1').alignment = {
      horizontal: 'center',
      vertical: 'middle',
    };
    worksheet.getRow(1).height = 30;

    // Sayım bilgileri
    worksheet.getCell('A3').value = 'Sayım No:';
    worksheet.getCell('B3').value = sayim.sayimNo;
    worksheet.getCell('A4').value = 'Sayım Tipi:';
    worksheet.getCell('B4').value =
      sayim.sayimTipi === 'URUN_BAZLI' ? 'Ürün Bazlı' : 'Raf Bazlı';
    worksheet.getCell('A5').value = 'Tarih:';
    worksheet.getCell('B5').value = new Date(sayim.tarih).toLocaleDateString(
      'tr-TR',
    );
    worksheet.getCell('A6').value = 'Durum:';
    worksheet.getCell('B6').value = this.getDurumText(sayim.durum);
    worksheet.getCell('A7').value = 'Oluşturan:';
    worksheet.getCell('B7').value = sayim.createdByUser?.fullName || '-';

    if (sayim.onaylayan) {
      worksheet.getCell('A8').value = 'Onaylayan:';
      worksheet.getCell('B8').value = sayim.onaylayan.fullName;
      worksheet.getCell('A9').value = 'Onay Tarihi:';
      worksheet.getCell('B9').value = sayim.onayTarihi
        ? new Date(sayim.onayTarihi).toLocaleDateString('tr-TR')
        : '-';
    }

    // Tablo başlıkları
    const headerRow = sayim.sayimTipi === 'RAF_BAZLI' ? 11 : 11;
    const headers =
      sayim.sayimTipi === 'RAF_BAZLI'
        ? [
            'Raf',
            'Stok Kodu',
            'Ürün Adı',
            'Sistem Miktarı',
            'Sayılan Miktar',
            'Fark',
          ]
        : ['Stok Kodu', 'Ürün Adı', 'Sistem Miktarı', 'Sayılan Miktar', 'Fark'];

    worksheet.getRow(headerRow).values = headers;
    worksheet.getRow(headerRow).font = { bold: true };
    worksheet.getRow(headerRow).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFE0E0E0' },
    };

    // Veriler
    let currentRow = headerRow + 1;
    sayim.kalemler.forEach((kalem) => {
      const rowData =
        sayim.sayimTipi === 'RAF_BAZLI'
          ? [
              kalem.location?.code || '-',
              kalem.stok.stokKodu,
              kalem.stok.stokAdi,
              kalem.sistemMiktari,
              kalem.sayilanMiktar,
              kalem.farkMiktari,
            ]
          : [
              kalem.stok.stokKodu,
              kalem.stok.stokAdi,
              kalem.sistemMiktari,
              kalem.sayilanMiktar,
              kalem.farkMiktari,
            ];

      worksheet.getRow(currentRow).values = rowData;

      // Fark hücresini renklendir
      const farkColumn = sayim.sayimTipi === 'RAF_BAZLI' ? 'F' : 'E';
      const farkCell = worksheet.getCell(`${farkColumn}${currentRow}`);
      if (kalem.farkMiktari > 0) {
        farkCell.font = { color: { argb: 'FF008000' }, bold: true };
      } else if (kalem.farkMiktari < 0) {
        farkCell.font = { color: { argb: 'FFFF0000' }, bold: true };
      }

      currentRow++;
    });

    // Özet bilgileri
    currentRow += 2;
    worksheet.getCell(`A${currentRow}`).value = 'ÖZET';
    worksheet.getCell(`A${currentRow}`).font = { bold: true };
    currentRow++;

    const toplamFazla = sayim.kalemler
      .filter((k) => k.farkMiktari > 0)
      .reduce((sum, k) => sum + k.farkMiktari, 0);
    const toplamEksik = sayim.kalemler
      .filter((k) => k.farkMiktari < 0)
      .reduce((sum, k) => sum + Math.abs(k.farkMiktari), 0);

    worksheet.getCell(`A${currentRow}`).value = 'Toplam Kalem:';
    worksheet.getCell(`B${currentRow}`).value = sayim.kalemler.length;
    currentRow++;
    worksheet.getCell(`A${currentRow}`).value = 'Sayım Fazlası:';
    worksheet.getCell(`B${currentRow}`).value = toplamFazla;
    worksheet.getCell(`B${currentRow}`).font = {
      color: { argb: 'FF008000' },
      bold: true,
    };
    currentRow++;
    worksheet.getCell(`A${currentRow}`).value = 'Sayım Eksiği:';
    worksheet.getCell(`B${currentRow}`).value = toplamEksik;
    worksheet.getCell(`B${currentRow}`).font = {
      color: { argb: 'FFFF0000' },
      bold: true,
    };

    // Sütun genişlikleri
    worksheet.columns = [
      { width: 20 },
      { width: 20 },
      { width: 40 },
      { width: 15 },
      { width: 15 },
      { width: 15 },
    ];

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  async generatePdf(sayimId: string): Promise<Buffer> {
    const sayim = await this.prisma.sayim.findUnique({
      where: { id: sayimId },
      include: {
        kalemler: {
          include: {
            stok: true,
            location: true,
          },
        },
        createdByUser: true,
        onaylayan: true,
      },
    });

    if (!sayim) {
      throw new Error('Sayım bulunamadı');
    }

    // PDF font tanımlamaları
    const fonts = {
      Roboto: {
        normal: 'node_modules/pdfmake/build/vfs_fonts.js',
        bold: 'node_modules/pdfmake/build/vfs_fonts.js',
      },
    };

    const printer = new PdfPrinter(fonts);

    // Tablo body
    const tableBody: any[] = [];

    // Başlık satırı
    if (sayim.sayimTipi === 'RAF_BAZLI') {
      tableBody.push([
        { text: 'Raf', style: 'tableHeader' },
        { text: 'Stok Kodu', style: 'tableHeader' },
        { text: 'Ürün Adı', style: 'tableHeader' },
        { text: 'Sistem', style: 'tableHeader', alignment: 'right' },
        { text: 'Sayılan', style: 'tableHeader', alignment: 'right' },
        { text: 'Fark', style: 'tableHeader', alignment: 'right' },
      ]);
    } else {
      tableBody.push([
        { text: 'Stok Kodu', style: 'tableHeader' },
        { text: 'Ürün Adı', style: 'tableHeader' },
        { text: 'Sistem', style: 'tableHeader', alignment: 'right' },
        { text: 'Sayılan', style: 'tableHeader', alignment: 'right' },
        { text: 'Fark', style: 'tableHeader', alignment: 'right' },
      ]);
    }

    // Veri satırları
    sayim.kalemler.forEach((kalem) => {
      const farkColor =
        kalem.farkMiktari > 0
          ? 'green'
          : kalem.farkMiktari < 0
            ? 'red'
            : 'black';

      if (sayim.sayimTipi === 'RAF_BAZLI') {
        tableBody.push([
          kalem.location?.code || '-',
          kalem.stok.stokKodu,
          kalem.stok.stokAdi,
          { text: kalem.sistemMiktari.toString(), alignment: 'right' },
          { text: kalem.sayilanMiktar.toString(), alignment: 'right' },
          {
            text:
              kalem.farkMiktari > 0
                ? `+${kalem.farkMiktari}`
                : kalem.farkMiktari.toString(),
            alignment: 'right',
            color: farkColor,
            bold: true,
          },
        ]);
      } else {
        tableBody.push([
          kalem.stok.stokKodu,
          kalem.stok.stokAdi,
          { text: kalem.sistemMiktari.toString(), alignment: 'right' },
          { text: kalem.sayilanMiktar.toString(), alignment: 'right' },
          {
            text:
              kalem.farkMiktari > 0
                ? `+${kalem.farkMiktari}`
                : kalem.farkMiktari.toString(),
            alignment: 'right',
            color: farkColor,
            bold: true,
          },
        ]);
      }
    });

    const toplamFazla = sayim.kalemler
      .filter((k) => k.farkMiktari > 0)
      .reduce((sum, k) => sum + k.farkMiktari, 0);
    const toplamEksik = sayim.kalemler
      .filter((k) => k.farkMiktari < 0)
      .reduce((sum, k) => sum + Math.abs(k.farkMiktari), 0);

    const rightStack: Content[] = [
      {
        text: `Oluşturan: ${sayim.createdByUser?.fullName || '-'}`,
        style: 'info',
      },
    ];

    if (sayim.onaylayan) {
      rightStack.push({
        text: `Onaylayan: ${sayim.onaylayan.fullName}`,
        style: 'info',
      });
    }

    if (sayim.onayTarihi) {
      rightStack.push({
        text: `Onay Tarihi: ${new Date(sayim.onayTarihi).toLocaleDateString('tr-TR')}`,
        style: 'info',
      });
    }

    const docDefinition: TDocumentDefinitions = {
      content: [
        { text: 'STOK SAYIM RAPORU', style: 'header', alignment: 'center' },
        { text: '\n' },
        {
          columns: [
            {
              width: '*',
              stack: [
                { text: `Sayım No: ${sayim.sayimNo}`, style: 'info' },
                {
                  text: `Sayım Tipi: ${sayim.sayimTipi === 'URUN_BAZLI' ? 'Ürün Bazlı' : 'Raf Bazlı'}`,
                  style: 'info',
                },
                {
                  text: `Tarih: ${new Date(sayim.tarih).toLocaleDateString('tr-TR')}`,
                  style: 'info',
                },
                {
                  text: `Durum: ${this.getDurumText(sayim.durum)}`,
                  style: 'info',
                },
              ],
            },
            {
              width: '*',
              stack: rightStack,
            },
          ],
        },
        { text: '\n' },
        {
          table: {
            headerRows: 1,
            widths:
              sayim.sayimTipi === 'RAF_BAZLI'
                ? [60, 80, '*', 50, 50, 50]
                : [80, '*', 50, 50, 50],
            body: tableBody,
          },
          layout: {
            fillColor: (rowIndex: number) =>
              rowIndex === 0 ? '#CCCCCC' : null,
          },
        },
        { text: '\n' },
        { text: 'ÖZET', style: 'subheader' },
        { text: `Toplam Kalem: ${sayim.kalemler.length}`, style: 'info' },
        {
          text: `Sayım Fazlası: ${toplamFazla}`,
          style: 'info',
          color: 'green',
        },
        { text: `Sayım Eksiği: ${toplamEksik}`, style: 'info', color: 'red' },
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
          fontSize: 10,
          color: 'black',
          fillColor: '#CCCCCC',
        },
      },
      defaultStyle: {
        fontSize: 9,
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

  private getDurumText(durum: string): string {
    const durumMap: Record<string, string> = {
      TASLAK: 'Taslak',
      TAMAMLANDI: 'Tamamlandı',
      ONAYLANDI: 'Onaylandı',
      IPTAL: 'İptal',
    };
    return durumMap[durum] || durum;
  }
}
