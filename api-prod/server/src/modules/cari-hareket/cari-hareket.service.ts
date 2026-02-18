import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { CreateCariHareketDto, EkstreQueryDto } from './dto';
import { Prisma } from '@prisma/client';
import * as ExcelJS from 'exceljs';
import PdfPrinter from 'pdfmake';
import type { TDocumentDefinitions } from 'pdfmake/interfaces';

@Injectable()
export class CariHareketService {
  constructor(private prisma: PrismaService) {}

  async create(dto: CreateCariHareketDto) {
    // Cari'nin mevcut bakiyesini al
    const cari = await this.prisma.cari.findUnique({
      where: { id: dto.cariId },
    });

    if (!cari) {
      throw new NotFoundException('Cari bulunamadı');
    }

    // Yeni bakiyeyi hesapla
    let yeniBakiye = Number(cari.bakiye);

    if (dto.tip === 'BORC') {
      yeniBakiye += Number(dto.tutar);
    } else if (dto.tip === 'ALACAK') {
      yeniBakiye -= Number(dto.tutar);
    } else if (dto.tip === 'DEVIR') {
      yeniBakiye = Number(dto.tutar);
    }

    // Transaction ile hem hareket hem cari bakiyesi güncelle
    const hareket = await this.prisma.$transaction(async (tx) => {
      // Hareket kaydı oluştur
      const yeniHareket = await tx.cariHareket.create({
        data: {
          cariId: dto.cariId,
          tip: dto.tip,
          tutar: new Prisma.Decimal(dto.tutar),
          bakiye: new Prisma.Decimal(yeniBakiye),
          belgeTipi: dto.belgeTipi,
          belgeNo: dto.belgeNo,
          tarih: dto.tarih ? new Date(dto.tarih) : new Date(),
          aciklama: dto.aciklama,
        },
        include: {
          cari: true,
        },
      });

      // Cari bakiyesini güncelle
      await tx.cari.update({
        where: { id: dto.cariId },
        data: { bakiye: new Prisma.Decimal(yeniBakiye) },
      });

      return yeniHareket;
    });

    return hareket;
  }

  async findAll(cariId: string, skip = 0, take = 100) {
    const [hareketler, total] = await Promise.all([
      this.prisma.cariHareket.findMany({
        where: { cariId },
        include: { cari: true },
        orderBy: { tarih: 'desc' },
        skip,
        take,
      }),
      this.prisma.cariHareket.count({ where: { cariId } }),
    ]);

    return { data: hareketler, total };
  }

  async getEkstre(query: EkstreQueryDto) {
    const where: any = { cariId: query.cariId };

    if (query.baslangicTarihi || query.bitisTarihi) {
      where.tarih = {};
      if (query.baslangicTarihi) {
        where.tarih.gte = new Date(query.baslangicTarihi);
      }
      if (query.bitisTarihi) {
        where.tarih.lte = new Date(query.bitisTarihi);
      }
    }

    const [cari, hareketler] = await Promise.all([
      this.prisma.cari.findUnique({
        where: { id: query.cariId },
      }),
      this.prisma.cariHareket.findMany({
        where,
        orderBy: { tarih: 'asc' },
      }),
    ]);

    return {
      cari,
      hareketler,
    };
  }

  async exportExcel(query: EkstreQueryDto): Promise<Buffer> {
    const { cari, hareketler } = await this.getEkstre(query);

    if (!cari) {
      throw new NotFoundException('Cari bulunamadı');
    }

    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Cari Ekstre');

    // Başlık bilgileri
    worksheet.mergeCells('A1:F1');
    worksheet.getCell('A1').value = 'CARİ HESAP EKSTRESİ';
    worksheet.getCell('A1').font = { size: 16, bold: true };
    worksheet.getCell('A1').alignment = { horizontal: 'center' };

    worksheet.mergeCells('A2:F2');
    worksheet.getCell('A2').value = `Cari: ${cari.unvan} (${cari.cariKodu})`;
    worksheet.getCell('A2').font = { size: 12, bold: true };

    if (cari.vergiNo) {
      worksheet.mergeCells('A3:F3');
      worksheet.getCell('A3').value =
        `Vergi No: ${cari.vergiNo} - Vergi Dairesi: ${cari.vergiDairesi}`;
    } else if (cari.tcKimlikNo) {
      worksheet.mergeCells('A3:F3');
      worksheet.getCell('A3').value =
        `TC Kimlik No: ${cari.tcKimlikNo} - ${cari.isimSoyisim}`;
    }

    worksheet.mergeCells('A4:F4');
    worksheet.getCell('A4').value =
      `Tarih: ${new Date().toLocaleDateString('tr-TR')}`;

    // Tablo başlıkları
    const headerRow = worksheet.addRow([
      'Tarih',
      'Belge No',
      'Açıklama',
      'Borç',
      'Alacak',
      'Bakiye',
    ]);
    headerRow.font = { bold: true };
    headerRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FF8B5CF6' },
    };
    headerRow.eachCell((cell) => {
      cell.alignment = { horizontal: 'center' };
      cell.font = { bold: true, color: { argb: 'FFFFFFFF' } };
    });

    // Veriler
    hareketler.forEach((hareket) => {
      const row = worksheet.addRow([
        new Date(hareket.tarih).toLocaleDateString('tr-TR'),
        hareket.belgeNo || '-',
        hareket.aciklama,
        hareket.tip === 'BORC' ? Number(hareket.tutar) : '',
        hareket.tip === 'ALACAK' ? Number(hareket.tutar) : '',
        Number(hareket.bakiye),
      ]);

      // Para formatı
      row.getCell(4).numFmt = '#,##0.00 ₺';
      row.getCell(5).numFmt = '#,##0.00 ₺';
      row.getCell(6).numFmt = '#,##0.00 ₺';
    });

    // Toplam satırı
    const toplamBorc = hareketler
      .filter((h) => h.tip === 'BORC')
      .reduce((sum, h) => sum + Number(h.tutar), 0);
    const toplamAlacak = hareketler
      .filter((h) => h.tip === 'ALACAK')
      .reduce((sum, h) => sum + Number(h.tutar), 0);

    const totalRow = worksheet.addRow([
      '',
      '',
      'TOPLAM',
      toplamBorc,
      toplamAlacak,
      Number(cari.bakiye),
    ]);
    totalRow.font = { bold: true };
    totalRow.fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFF3F4F6' },
    };
    totalRow.getCell(4).numFmt = '#,##0.00 ₺';
    totalRow.getCell(5).numFmt = '#,##0.00 ₺';
    totalRow.getCell(6).numFmt = '#,##0.00 ₺';

    // Sütun genişlikleri
    worksheet.columns = [
      { width: 12 },
      { width: 15 },
      { width: 40 },
      { width: 15 },
      { width: 15 },
      { width: 15 },
    ];

    const buffer = await workbook.xlsx.writeBuffer();
    return Buffer.from(buffer);
  }

  async exportPdf(query: EkstreQueryDto): Promise<Buffer> {
    const { cari, hareketler } = await this.getEkstre(query);

    if (!cari) {
      throw new NotFoundException('Cari bulunamadı');
    }

    const fonts = {
      Roboto: {
        normal: 'node_modules/pdfmake/build/vfs_fonts.js',
        bold: 'node_modules/pdfmake/build/vfs_fonts.js',
      },
    };

    const printer = new PdfPrinter(fonts);

    // Tablo satırları
    const tableBody: any[] = [
      [
        { text: 'Tarih', style: 'tableHeader' },
        { text: 'Belge No', style: 'tableHeader' },
        { text: 'Açıklama', style: 'tableHeader' },
        { text: 'Borç', style: 'tableHeader', alignment: 'right' },
        { text: 'Alacak', style: 'tableHeader', alignment: 'right' },
        { text: 'Bakiye', style: 'tableHeader', alignment: 'right' },
      ],
    ];

    hareketler.forEach((hareket) => {
      tableBody.push([
        new Date(hareket.tarih).toLocaleDateString('tr-TR'),
        hareket.belgeNo || '-',
        hareket.aciklama,
        hareket.tip === 'BORC' ? `${Number(hareket.tutar).toFixed(2)} ₺` : '',
        hareket.tip === 'ALACAK' ? `${Number(hareket.tutar).toFixed(2)} ₺` : '',
        { text: `${Number(hareket.bakiye).toFixed(2)} ₺`, alignment: 'right' },
      ]);
    });

    // Toplam satırı
    const toplamBorc = hareketler
      .filter((h) => h.tip === 'BORC')
      .reduce((sum, h) => sum + Number(h.tutar), 0);
    const toplamAlacak = hareketler
      .filter((h) => h.tip === 'ALACAK')
      .reduce((sum, h) => sum + Number(h.tutar), 0);

    tableBody.push([
      { text: '', colSpan: 2 },
      {},
      { text: 'TOPLAM', bold: true },
      { text: `${toplamBorc.toFixed(2)} ₺`, alignment: 'right', bold: true },
      { text: `${toplamAlacak.toFixed(2)} ₺`, alignment: 'right', bold: true },
      {
        text: `${Number(cari.bakiye).toFixed(2)} ₺`,
        alignment: 'right',
        bold: true,
      },
    ]);

    const docDefinition: TDocumentDefinitions = {
      pageSize: 'A4',
      pageMargins: [40, 60, 40, 60],
      content: [
        { text: 'CARİ HESAP EKSTRESİ', style: 'header', alignment: 'center' },
        { text: '\n' },
        { text: `Cari: ${cari.unvan} (${cari.cariKodu})`, style: 'subheader' },
        ...(cari.vergiNo
          ? [
              {
                text: `Vergi No: ${cari.vergiNo} - Vergi Dairesi: ${cari.vergiDairesi}`,
              },
            ]
          : cari.tcKimlikNo
            ? [
                {
                  text: `TC Kimlik No: ${cari.tcKimlikNo} - ${cari.isimSoyisim}`,
                },
              ]
            : []),
        {
          text: `Tarih: ${new Date().toLocaleDateString('tr-TR')}`,
          style: 'date',
        },
        { text: '\n' },
        {
          table: {
            headerRows: 1,
            widths: ['auto', 'auto', '*', 'auto', 'auto', 'auto'],
            body: tableBody,
          },
          layout: 'lightHorizontalLines',
        },
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
        tableHeader: {
          bold: true,
          fontSize: 11,
          fillColor: '#8B5CF6',
          color: 'white',
        },
        date: {
          fontSize: 10,
          italics: true,
          margin: [0, 5, 0, 0],
        },
      },
      defaultStyle: {
        fontSize: 10,
      },
    };

    return new Promise((resolve, reject) => {
      try {
        const pdfDoc = printer.createPdfKitDocument(docDefinition);
        const chunks: Buffer[] = [];

        pdfDoc.on('data', (chunk) => chunks.push(chunk));
        pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
        pdfDoc.on('error', reject);

        pdfDoc.end();
      } catch (error) {
        reject(error);
      }
    });
  }

  async delete(id: string) {
    // Hareket kaydını sil ve cari bakiyesini güncelle
    const hareket = await this.prisma.cariHareket.findUnique({
      where: { id },
    });

    if (!hareket) {
      throw new NotFoundException('Hareket kaydı bulunamadı');
    }

    // Cari'nin mevcut bakiyesini al
    const cari = await this.prisma.cari.findUnique({
      where: { id: hareket.cariId },
    });

    if (!cari) {
      throw new NotFoundException('Cari bulunamadı');
    }

    // Bakiyeyi tersine çevir
    let yeniBakiye = Number(cari.bakiye);

    if (hareket.tip === 'BORC') {
      yeniBakiye -= Number(hareket.tutar);
    } else if (hareket.tip === 'ALACAK') {
      yeniBakiye += Number(hareket.tutar);
    }

    // Transaction ile sil ve güncelle
    await this.prisma.$transaction(async (tx) => {
      await tx.cariHareket.delete({
        where: { id },
      });

      await tx.cari.update({
        where: { id: hareket.cariId },
        data: { bakiye: new Prisma.Decimal(yeniBakiye) },
      });
    });

    return { message: 'Hareket kaydı silindi ve bakiye güncellendi' };
  }
}
