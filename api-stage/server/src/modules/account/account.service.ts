import {
    Injectable,
    NotFoundException,
    BadRequestException,
    Inject,
    forwardRef,
} from '@nestjs/common';
import { PrismaService } from '../../common/prisma.service';
import { TenantResolverService } from '../../common/services/tenant-resolver.service';
import { CreateAccountDto, UpdateAccountDto } from './dto';
import { CodeTemplateService } from '../code-template/code-template.service';
import { DeletionProtectionService } from '../../common/services/deletion-protection.service';
import * as ExcelJS from 'exceljs';
import PdfPrinter from 'pdfmake';
import type { TDocumentDefinitions } from 'pdfmake/interfaces';
import axios from 'axios';
import * as fs from 'fs';
import * as path from 'path';
import { ModuleType } from '../code-template/code-template.enums';

@Injectable()
export class AccountService {
    constructor(
        private prisma: PrismaService,
        private tenantResolver: TenantResolverService,
        @Inject(forwardRef(() => CodeTemplateService))
        private codeTemplateService: CodeTemplateService,
        private deletionProtection: DeletionProtectionService,
    ) { }

    async create(dto: CreateAccountDto) {
        const tenantId = await this.tenantResolver.resolveForCreate({ allowNull: true });

        let code = dto.code?.trim();
        if (!code || code.length === 0) {
            try {
                code = await this.codeTemplateService.getNextCode(ModuleType.CUSTOMER);
            } catch (error) {
                throw new BadRequestException(
                    'Account code must be provided or an automatic template must be defined',
                );
            }
        }

        if (!dto.title || !dto.title.trim()) {
            throw new BadRequestException('Title cannot be empty');
        }

        const type = dto.type || 'CUSTOMER';
        const finalTenantId = (dto as any).tenantId ?? tenantId ?? undefined;

        const existing = await this.prisma.extended.account.findFirst({
            where: {
                code,
                ...(finalTenantId ? { tenantId: finalTenantId } : {}),
            },
        });
        if (existing) {
            throw new BadRequestException('This account code is already in use');
        }

        const { contacts, addresses, banks, ...rest } = dto;

        const created = await this.prisma.extended.account.create({
            data: {
                ...rest,
                code: code!,
                type: type as any,
                tenantId: finalTenantId,
                salesAgentId: (dto.salesAgentId && dto.salesAgentId.trim() !== '') ? dto.salesAgentId : null,
                contacts: contacts?.length ? {
                    create: contacts.map((c: any) => ({
                        ...c,
                    })),
                } : undefined,
                addresses: addresses?.length ? {
                    create: addresses.map((a: any) => ({
                        ...a,
                    })),
                } : undefined,
                banks: banks?.length ? {
                    create: banks.map((b: any) => ({
                        ...b,
                    })),
                } : undefined,
            } as any,
            include: {
                salesAgent: { select: { fullName: true } },
            },
        });

        return {
            ...created,
            balance: Number(created.balance ?? 0),
            salesAgent: created.salesAgent ? { fullName: created.salesAgent.fullName } : null,
        };
    }

    async findAll(page = 1, limit = 50, search?: string, type?: string, isActive?: boolean) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const skip = (page - 1) * limit;

        const where: any = {};
        if (tenantId) where.tenantId = tenantId;
        if (isActive !== undefined) where.isActive = isActive;

        if (search) {
            where.OR = [
                { code: { contains: search, mode: 'insensitive' } },
                { title: { contains: search, mode: 'insensitive' } },
                { taxNumber: { contains: search, mode: 'insensitive' } },
            ];
        }

        if (type) {
            where.type = type;
        }

        const [accounts, total] = await Promise.all([
            this.prisma.extended.account.findMany({
                where,
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
                include: {
                    salesAgent: {
                        select: {
                            fullName: true,
                        },
                    },
                    _count: {
                        select: {
                            accountMovements: true,
                        },
                    },
                },
            }),
            this.prisma.extended.account.count({ where }),
        ]);

        const data = accounts.map((account) => ({
            ...account,
            balance: Number(account.balance ?? 0),
            movementCount: (account as any)._count?.accountMovements ?? 0,
        }));

        return {
            data,
            metadata: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async getDebtCreditReport(query: any) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const { search, type, salesAgentId, status, page = 1, limit = 50 } = query;
        const skip = (page - 1) * limit;

        const where: any = {};
        if (tenantId) where.tenantId = tenantId;

        if (salesAgentId) {
            where.salesAgentId = salesAgentId;
        }

        if (status) {
            if (status === 'DEBIT') {
                where.balance = { lt: 0 };
            } else if (status === 'CREDIT') {
                where.balance = { gt: 0 };
            } else if (status === 'ZERO') {
                where.balance = 0;
            }
        }

        if (search) {
            where.OR = [
                { code: { contains: search, mode: 'insensitive' } },
                { title: { contains: search, mode: 'insensitive' } },
                { taxNumber: { contains: search, mode: 'insensitive' } },
            ];
        }

        if (type) {
            where.type = type;
        }

        const [accounts, total] = await Promise.all([
            this.prisma.extended.account.findMany({
                where,
                skip,
                take: limit,
                orderBy: { balance: 'desc' },
                include: {
                    salesAgent: {
                        select: {
                            fullName: true,
                        },
                    },
                }
            }),
            this.prisma.extended.account.count({ where }),
        ]);

        const aggregates = await this.prisma.extended.account.aggregate({
            where,
            _sum: {
                balance: true,
            },
            _count: {
                id: true
            }
        });

        const [totalDebtResult, totalCreditResult] = await Promise.all([
            this.prisma.extended.account.aggregate({
                where: { ...where, balance: { gt: 0 } },
                _sum: { balance: true }
            }),
            this.prisma.extended.account.aggregate({
                where: { ...where, balance: { lt: 0 } },
                _sum: { balance: true }
            })
        ]);

        const items = accounts.map((item) => {
            const balance = Number(item.balance || 0);
            return {
                ...item,
                balance,
                debt: balance < 0 ? Math.abs(balance) : 0,
                credit: balance > 0 ? balance : 0,
            };
        });

        return {
            items,
            summary: {
                totalDebt: Math.abs(Number(totalCreditResult._sum.balance || 0)),
                totalCredit: Number(totalDebtResult._sum.balance || 0),
                netBalance: Number(aggregates._sum.balance || 0),
                count: aggregates._count.id,
            },
            meta: {
                total,
                page,
                limit,
                pageCount: Math.ceil(total / limit),
            },
        };
    }

    async findOne(id: string) {
        const account = await this.prisma.extended.account.findUnique({
            where: { id },
            include: {
                invoices: {
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                },
                collections: {
                    orderBy: { createdAt: 'desc' },
                    take: 10,
                },
                accountMovements: {
                    orderBy: { createdAt: 'desc' },
                    take: 20,
                },
                contacts: true,
                addresses: true,
                banks: true,
            },
        });

        if (!account) {
            throw new NotFoundException('Account not found');
        }

        return account;
    }

    async update(id: string, dto: UpdateAccountDto) {
        await this.findOne(id);

        const { contacts, addresses, banks, ...rest } = dto;

        return this.prisma.extended.account.update({
            where: { id },
            data: {
                ...rest,
                salesAgentId: (rest as any).salesAgentId === '' ? null : (rest as any).salesAgentId,
                contacts: contacts ? { deleteMany: {}, create: contacts } : undefined,
                addresses: addresses ? { deleteMany: {}, create: addresses } : undefined,
                banks: banks ? { deleteMany: {}, create: banks } : undefined,
            } as any,
        });
    }

    async remove(id: string) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        if (!tenantId) throw new BadRequestException('Tenant ID not found');

        await this.deletionProtection.checkCariDeletion(id, tenantId);

        return this.prisma.extended.account.delete({
            where: { id },
        });
    }

    async getMovements(accountId: string, page = 1, limit = 50) {
        const skip = (page - 1) * limit;

        const [data, total] = await Promise.all([
            this.prisma.extended.accountMovement.findMany({
                where: { accountId },
                skip,
                take: limit,
                orderBy: { createdAt: 'desc' },
            }),
            this.prisma.extended.accountMovement.count({ where: { accountId } }),
        ]);

        return {
            data,
            meta: {
                total,
                page,
                limit,
                totalPages: Math.ceil(total / limit),
            },
        };
    }

    async exportDebtCreditReportExcel(query: any): Promise<Buffer> {
        const { items: accounts, summary } = await this.getDebtCreditReport({ ...query, limit: 10000 });

        const tenantId = await this.tenantResolver.resolveForQuery();
        const tenantSettings = await this.prisma.extended.tenantSettings.findUnique({
            where: { tenantId: tenantId || '' },
        });

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Debt Credit Report');

        worksheet.mergeCells('A1:G1');
        worksheet.getCell('A1').value = tenantSettings?.companyName || 'OTOMUHASEBE ERP';
        worksheet.getCell('A1').font = { size: 14, bold: true, color: { argb: 'FF1F2937' } };

        worksheet.mergeCells('A2:G2');
        worksheet.getCell('A2').value = 'DEBT CREDIT STATUS REPORT';
        worksheet.getCell('A2').font = { size: 18, bold: true, color: { argb: 'FF8B5CF6' } };
        worksheet.getCell('A2').alignment = { horizontal: 'center' };

        worksheet.getCell('D4').value = 'Date:';
        worksheet.getCell('E4').value = new Date().toLocaleDateString('tr-TR');
        worksheet.getCell('D4').font = { bold: true };

        worksheet.getCell('A6').value = 'TOTAL DEBT';
        worksheet.getCell('B6').value = Number(summary.totalDebt);
        worksheet.getCell('B6').numFmt = '#,##0.00 ₺';
        worksheet.getCell('B6').font = { bold: true, color: { argb: 'FFEF4444' } };

        worksheet.getCell('C6').value = 'TOTAL CREDIT';
        worksheet.getCell('D6').value = Number(summary.totalCredit);
        worksheet.getCell('D6').numFmt = '#,##0.00 ₺';
        worksheet.getCell('D6').font = { bold: true, color: { argb: 'FF10B981' } };

        worksheet.getCell('E6').value = 'NET BALANCE';
        worksheet.getCell('F6').value = Number(summary.netBalance);
        worksheet.getCell('F6').numFmt = '#,##0.00 ₺';
        worksheet.getCell('F6').font = { bold: true };

        const dataHeaderRow = worksheet.addRow([
            'Account Code',
            'Title',
            'Sales Agent',
            'Debt',
            'Credit',
            'Balance',
        ]);
        dataHeaderRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        dataHeaderRow.eachCell((cell) => {
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF8B5CF6' },
            };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
        });

        accounts.forEach((item, index) => {
            const balance = item.balance;
            const debt = balance > 0 ? balance : 0;
            const credit = balance < 0 ? Math.abs(balance) : 0;

            const row = worksheet.addRow([
                item.code,
                item.title,
                item.salesAgent?.fullName || '-',
                debt || null,
                credit || null,
                Math.abs(balance),
            ]);

            row.eachCell((cell, colNumber) => {
                if (colNumber >= 4) {
                    cell.numFmt = '#,##0.00 ₺';
                }
                cell.alignment = { vertical: 'middle' };
                if (index % 2 === 0) {
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FFF9FAFB' },
                    };
                }
            });

            if (debt > 0) row.getCell(4).font = { color: { argb: 'FFEF4444' } };
            if (credit > 0) row.getCell(5).font = { color: { argb: 'FF10B981' } };
            row.getCell(6).font = { bold: true };
        });

        worksheet.columns = [
            { width: 15 },
            { width: 40 },
            { width: 20 },
            { width: 15 },
            { width: 15 },
            { width: 15 },
        ];

        const buffer = await workbook.xlsx.writeBuffer();
        return Buffer.from(buffer);
    }

    async exportDebtCreditReportPdf(query: any): Promise<Buffer> {
        const { items: accounts, summary } = await this.getDebtCreditReport({ ...query, limit: 10000 });

        const tenantId = await this.tenantResolver.resolveForQuery();
        const tenantSettings = await this.prisma.extended.tenantSettings.findUnique({
            where: { tenantId: tenantId || '' },
        });

        let logoBase64: string | null = null;
        if (tenantSettings?.logoUrl) {
            try {
                if (tenantSettings.logoUrl.startsWith('/api/uploads/')) {
                    const fileName = tenantSettings.logoUrl.replace('/api/uploads/', '');
                    const filePath = path.join(process.cwd(), 'uploads', fileName);
                    if (fs.existsSync(filePath)) {
                        const buffer = fs.readFileSync(filePath);
                        const ext = path.extname(fileName).toLowerCase().replace('.', '');
                        logoBase64 = `data:image/${ext === 'jpg' ? 'jpeg' : ext};base64,${buffer.toString('base64')}`;
                    }
                } else if (tenantSettings.logoUrl.startsWith('data:image')) {
                    logoBase64 = tenantSettings.logoUrl;
                } else {
                    const response = await axios.get(tenantSettings.logoUrl, { responseType: 'arraybuffer' });
                    const buffer = Buffer.from(response.data, 'binary');
                    const ext = path.extname(tenantSettings.logoUrl).toLowerCase().replace('.', '') || 'png';
                    logoBase64 = `data:image/${ext === 'jpg' ? 'jpeg' : ext};base64,${buffer.toString('base64')}`;
                }
            } catch (error) {
                console.error('Logo error:', error);
            }
        }

        const vfs = require('pdfmake/build/vfs_fonts.js');
        const fonts = {
            Roboto: {
                normal: Buffer.from(vfs['Roboto-Regular.ttf'], 'base64'),
                bold: Buffer.from(vfs['Roboto-Medium.ttf'] || vfs['Roboto-Regular.ttf'], 'base64'),
                italics: Buffer.from(vfs['Roboto-Italic.ttf'] || vfs['Roboto-Regular.ttf'], 'base64'),
            },
        };

        const printer = new PdfPrinter(fonts);

        const docDefinition: TDocumentDefinitions = {
            pageSize: 'A4',
            pageMargins: [40, 140, 40, 60],
            header: (currentPage) => ({
                margin: [40, 20, 40, 0],
                stack: [
                    {
                        columns: [
                            {
                                width: '*',
                                stack: [
                                    logoBase64 ? { image: logoBase64, width: 80, margin: [0, 0, 0, 10] as any } : { text: '' },
                                    { text: tenantSettings?.companyName || 'OTOMUHASEBE ERP', style: 'companyName' },
                                    {
                                        text: [
                                            tenantSettings?.address || '',
                                            tenantSettings?.district ? ` ${tenantSettings.district}` : '',
                                            tenantSettings?.city ? ` / ${tenantSettings.city}` : '',
                                            '\n',
                                            tenantSettings?.phone ? `Tel: ${tenantSettings.phone}` : '',
                                            tenantSettings?.email ? ` | Email: ${tenantSettings.email}` : '',
                                            tenantSettings?.website ? ` | Web: ${tenantSettings.website}` : '',
                                            '\n',
                                            tenantSettings?.taxOffice ? `Tax Office: ${tenantSettings.taxOffice}` : '',
                                            tenantSettings?.taxNumber ? ` | Tax No: ${tenantSettings.taxNumber}` : '',
                                            tenantSettings?.tcNo ? ` | National ID: ${tenantSettings.tcNo}` : '',
                                        ].filter(Boolean).join(''),
                                        style: 'companyAddress',
                                    },
                                ],
                            },
                            {
                                width: 'auto',
                                stack: [
                                    { text: 'DEBT CREDIT REPORT', style: 'docTitle', alignment: 'right' },
                                    { text: `Date: ${new Date().toLocaleDateString('tr-TR')}`, style: 'docTag', alignment: 'right' },
                                    { text: `Page: ${currentPage}`, style: 'docTag', alignment: 'right', margin: [0, 2, 0, 0] },
                                ],
                            },
                        ],
                    },
                    {
                        canvas: [
                            {
                                type: 'line',
                                x1: 0, y1: 15,
                                x2: 515, y2: 15,
                                lineWidth: 1,
                                lineColor: '#1e293b',
                            },
                        ],
                    },
                ],
            }),
            content: [
                {
                    style: 'summarySection',
                    table: {
                        widths: ['*', '*', '*'],
                        body: [
                            [
                                {
                                    stack: [
                                        { text: 'TOTAL DEBT', style: 'summaryLabel' },
                                        { text: `${Number(summary.totalDebt).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL`, style: 'summaryValueDanger' }
                                    ],
                                    fillColor: '#fef2f2',
                                    padding: [10, 10, 10, 10] as any
                                },
                                {
                                    stack: [
                                        { text: 'TOTAL CREDIT', style: 'summaryLabel' },
                                        { text: `${Number(summary.totalCredit).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL`, style: 'summaryValueSuccess' }
                                    ],
                                    fillColor: '#f0fdf4',
                                    padding: [10, 10, 10, 10] as any
                                },
                                {
                                    stack: [
                                        { text: 'NET BALANCE', style: 'summaryLabel' },
                                        { text: `${Math.abs(Number(summary.netBalance)).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL ${summary.netBalance < 0 ? '(D)' : summary.netBalance > 0 ? '(C)' : ''}`, style: 'summaryValue' }
                                    ],
                                    fillColor: '#f3f4f6',
                                    padding: [10, 10, 10, 10] as any
                                }
                            ]
                        ]
                    },
                    layout: 'noBorders'
                },
                {
                    style: 'transactionTable',
                    table: {
                        headerRows: 1,
                        widths: ['auto', '*', 'auto', 'auto', 'auto', 'auto'],
                        body: [
                            [
                                { text: 'ACCOUNT CODE', style: 'tableHeader' },
                                { text: 'TITLE', style: 'tableHeader' },
                                { text: 'SALES AGENT', style: 'tableHeader' },
                                { text: 'DEBT', style: 'tableHeader', alignment: 'right' },
                                { text: 'CREDIT', style: 'tableHeader', alignment: 'right' },
                                { text: 'BALANCE', style: 'tableHeader', alignment: 'right' },
                            ],
                            ...accounts.map((item) => {
                                const balance = item.balance;
                                const debt = balance < 0 ? Math.abs(balance) : 0;
                                const credit = balance > 0 ? balance : 0;
                                return [
                                    { text: item.code, style: 'tableCell' },
                                    { text: item.title, style: 'tableCell' },
                                    { text: item.salesAgent?.fullName || '-', style: 'tableCell' },
                                    { text: debt > 0 ? debt.toLocaleString('tr-TR', { minimumFractionDigits: 2 }) : '-', style: 'tableCellDanger', alignment: 'right' },
                                    { text: credit > 0 ? credit.toLocaleString('tr-TR', { minimumFractionDigits: 2 }) : '-', style: 'tableCellSuccess', alignment: 'right' },
                                    {
                                        text: `${Math.abs(balance).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} ${balance < 0 ? '(D)' : balance > 0 ? '(C)' : ''}`,
                                        style: 'tableCellBold',
                                        alignment: 'right'
                                    },
                                ]
                            }),
                        ],
                    },
                    layout: {
                        fillColor: (rowIndex: number) => (rowIndex > 0 && rowIndex % 2 === 0) ? '#f9fafb' : null,
                        hLineWidth: (i: number) => 0.5,
                        vLineWidth: (i: number) => 0.5,
                        hLineColor: () => '#e5e7eb',
                        vLineColor: () => '#e5e7eb',
                    }
                } as any,
            ],
            footer: (currentPage: number, pageCount: number) => ({
                text: `Page ${currentPage} / ${pageCount} | Prepared by OTOMUHASEBE ERP.`,
                alignment: 'center',
                fontSize: 7,
                color: '#94a3b8',
                margin: [0, 20, 0, 0]
            }),
            styles: {
                companyName: { fontSize: 13, bold: true, color: '#0f172a', margin: [0, 0, 0, 2] },
                companyAddress: { fontSize: 8, color: '#64748b', lineHeight: 1.2 },
                docTitle: { fontSize: 18, bold: true, color: '#1e293b', margin: [0, 0, 0, 4] },
                docTag: { fontSize: 8, color: '#94a3b8' },
                summarySection: { margin: [0, 0, 0, 20] },
                summaryLabel: { fontSize: 7, bold: true, color: '#64748b', margin: [0, 0, 0, 4] },
                summaryValue: { fontSize: 12, bold: true, color: '#1e293b' },
                summaryValueSuccess: { fontSize: 12, bold: true, color: '#15803d' },
                summaryValueDanger: { fontSize: 12, bold: true, color: '#b91c1c' },
                transactionTable: { margin: [0, 0, 0, 0] },
                tableHeader: { fontSize: 8, bold: true, color: '#ffffff', fillColor: '#1e293b', margin: [0, 4, 0, 4] },
                tableCell: { fontSize: 8, color: '#334155', margin: [0, 4, 0, 4] },
                tableCellBold: { fontSize: 8, bold: true, color: '#0f172a', margin: [0, 4, 0, 4] },
                tableCellSuccess: { fontSize: 8, color: '#15803d', margin: [0, 4, 0, 4] },
                tableCellDanger: { fontSize: 8, color: '#b91c1c', margin: [0, 4, 0, 4] },
            },
            defaultStyle: { font: 'Roboto' },
        };

        return new Promise((resolve, reject) => {
            try {
                const pdfDoc = printer.createPdfKitDocument(docDefinition);
                const chunks: Buffer[] = [];
                pdfDoc.on('data', chunk => chunks.push(chunk));
                pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
                pdfDoc.on('error', reject);
                pdfDoc.end();
                pdfDoc.end();
            } catch (error) {
                reject(error);
            }
        });
    }

    async getCreditLimitReport(query: any) {
        const tenantId = await this.tenantResolver.resolveForQuery();
        const { search, type, salesAgentId, status, page = 1, limit = 50 } = query;
        const skip = (page - 1) * limit;

        const where: any = {};
        if (tenantId) where.tenantId = tenantId;

        if (salesAgentId) {
            where.salesAgentId = salesAgentId;
        }

        if (search) {
            where.OR = [
                { code: { contains: search, mode: 'insensitive' } },
                { title: { contains: search, mode: 'insensitive' } },
                { taxNumber: { contains: search, mode: 'insensitive' } },
            ];
        }

        if (type) {
            where.type = type;
        }

        const [accounts, total] = await Promise.all([
            this.prisma.extended.account.findMany({
                where,
                skip,
                take: limit,
                orderBy: { title: 'asc' },
                include: {
                    salesAgent: {
                        select: {
                            fullName: true,
                        },
                    },
                }
            }),
            this.prisma.extended.account.count({ where }),
        ]);

        const aggregates = await this.prisma.extended.account.aggregate({
            where,
            _sum: {
                balance: true,
                creditLimit: true,
            },
            _count: {
                id: true
            }
        });

        const items = accounts.map((item) => {
            const balance = Number(item.balance || 0);
            const creditLimit = Number(item.creditLimit || 0);

            const debt = balance > 0 ? balance : 0;
            const remainingLimit = creditLimit - debt;

            return {
                ...item,
                balance,
                debt,
                creditLimit,
                remainingLimit,
            };
        });

        let finalItems = items;
        let finalTotal = total;

        if (status === 'LIMIT_EXCEEDED') {
            finalItems = items.filter(item => item.remainingLimit < 0);
            finalTotal = finalItems.length;
        } else if (status === 'NORMAL') {
            finalItems = items.filter(item => item.remainingLimit >= 0);
            finalTotal = finalItems.length;
        }

        const sumBalance = aggregates._sum.balance ? Number(aggregates._sum.balance) : 0;
        const sumRisk = aggregates._sum.creditLimit ? Number(aggregates._sum.creditLimit) : 0;
        const totalRemaining = sumRisk - (sumBalance > 0 ? sumBalance : 0);

        return {
            items: finalItems,
            summary: {
                totalDebt: sumBalance > 0 ? sumBalance : 0,
                totalCreditLimit: sumRisk,
                totalRemainingLimit: totalRemaining,
                count: finalTotal,
            },
            meta: {
                total: finalTotal,
                page,
                limit,
                pageCount: Math.ceil(finalTotal / limit),
            },
        };
    }

    async exportCreditLimitReportExcel(query: any): Promise<Buffer> {
        const { items: accounts, summary } = await this.getCreditLimitReport({ ...query, limit: 10000 });

        const tenantId = await this.tenantResolver.resolveForQuery();
        const tenantSettings = await this.prisma.extended.tenantSettings.findUnique({
            where: { tenantId: tenantId || '' },
        });

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Credit Limit Report');

        worksheet.mergeCells('A1:G1');
        worksheet.getCell('A1').value = tenantSettings?.companyName || 'OTOMUHASEBE ERP';
        worksheet.getCell('A1').font = { size: 14, bold: true, color: { argb: 'FF1F2937' } };

        worksheet.mergeCells('A2:G2');
        worksheet.getCell('A2').value = 'ACCOUNT CREDIT LIMIT REPORT';
        worksheet.getCell('A2').font = { size: 18, bold: true, color: { argb: 'FF8B5CF6' } };
        worksheet.getCell('A2').alignment = { horizontal: 'center' };

        worksheet.getCell('D4').value = 'Date:';
        worksheet.getCell('E4').value = new Date().toLocaleDateString('tr-TR');
        worksheet.getCell('D4').font = { bold: true };

        worksheet.getCell('A6').value = 'TOTAL CREDIT LIMIT';
        worksheet.getCell('B6').value = Number(summary.totalCreditLimit);
        worksheet.getCell('B6').numFmt = '#,##0.00 ₺';
        worksheet.getCell('B6').font = { bold: true, color: { argb: 'FF0284C7' } };

        worksheet.getCell('C6').value = 'TOTAL DEBT';
        worksheet.getCell('D6').value = Number(summary.totalDebt);
        worksheet.getCell('D6').numFmt = '#,##0.00 ₺';
        worksheet.getCell('D6').font = { bold: true, color: { argb: 'FFEF4444' } };

        worksheet.getCell('E6').value = 'TOTAL REMAINING LIMIT';
        worksheet.getCell('F6').value = Number(summary.totalRemainingLimit);
        worksheet.getCell('F6').numFmt = '#,##0.00 ₺';
        worksheet.getCell('F6').font = { bold: true };

        const dataHeaderRow = worksheet.addRow([
            'Account Code',
            'Title',
            'Sales Agent',
            'Credit Limit',
            'Current Debt',
            'Remaining Limit',
        ]);
        dataHeaderRow.font = { bold: true, color: { argb: 'FFFFFFFF' } };
        dataHeaderRow.eachCell((cell) => {
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF8B5CF6' },
            };
            cell.alignment = { horizontal: 'center', vertical: 'middle' };
        });

        accounts.forEach((item, index) => {
            const row = worksheet.addRow([
                item.code,
                item.title,
                item.salesAgent?.fullName || '-',
                item.creditLimit,
                item.debt,
                item.remainingLimit,
            ]);

            row.eachCell((cell, colNumber) => {
                if (colNumber >= 4) {
                    cell.numFmt = '#,##0.00 ₺';
                }
                cell.alignment = { vertical: 'middle' };
                if (index % 2 === 0) {
                    cell.fill = {
                        type: 'pattern',
                        pattern: 'solid',
                        fgColor: { argb: 'FFF9FAFB' },
                    };
                }
            });

            row.getCell(4).font = { color: { argb: 'FF0284C7' } };
            if (item.debt > 0) row.getCell(5).font = { color: { argb: 'FFEF4444' } };

            if (item.remainingLimit < 0) {
                row.getCell(6).font = { bold: true, color: { argb: 'FFEF4444' } };
                row.getCell(6).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFFEE2E2' } };
            } else {
                row.getCell(6).font = { bold: true, color: { argb: 'FF10B981' } };
            }
        });

        worksheet.columns = [
            { width: 15 },
            { width: 40 },
            { width: 20 },
            { width: 20 },
            { width: 20 },
            { width: 20 },
        ];

        const buffer = await workbook.xlsx.writeBuffer();
        return Buffer.from(buffer);
    }

    async exportCreditLimitReportPdf(query: any): Promise<Buffer> {
        const { items: accounts, summary } = await this.getCreditLimitReport({ ...query, limit: 10000 });

        const tenantId = await this.tenantResolver.resolveForQuery();
        const tenantSettings = await this.prisma.extended.tenantSettings.findUnique({
            where: { tenantId: tenantId || '' },
        });

        let logoBase64: string | null = null;
        if (tenantSettings?.logoUrl) {
            try {
                if (tenantSettings.logoUrl.startsWith('/api/uploads/')) {
                    const fileName = tenantSettings.logoUrl.replace('/api/uploads/', '');
                    const filePath = path.join(process.cwd(), 'uploads', fileName);
                    if (fs.existsSync(filePath)) {
                        const buffer = fs.readFileSync(filePath);
                        const ext = path.extname(fileName).toLowerCase().replace('.', '');
                        logoBase64 = `data:image/${ext === 'jpg' ? 'jpeg' : ext};base64,${buffer.toString('base64')}`;
                    }
                } else if (tenantSettings.logoUrl.startsWith('data:image')) {
                    logoBase64 = tenantSettings.logoUrl;
                } else {
                    const response = await axios.get(tenantSettings.logoUrl, { responseType: 'arraybuffer' });
                    const buffer = Buffer.from(response.data, 'binary');
                    const ext = path.extname(tenantSettings.logoUrl).toLowerCase().replace('.', '') || 'png';
                    logoBase64 = `data:image/${ext === 'jpg' ? 'jpeg' : ext};base64,${buffer.toString('base64')}`;
                }
            } catch (error) {
                console.error('Logo error:', error);
            }
        }

        const vfs = require('pdfmake/build/vfs_fonts.js');
        const fonts = {
            Roboto: {
                normal: Buffer.from(vfs['Roboto-Regular.ttf'], 'base64'),
                bold: Buffer.from(vfs['Roboto-Medium.ttf'] || vfs['Roboto-Regular.ttf'], 'base64'),
                italics: Buffer.from(vfs['Roboto-Italic.ttf'] || vfs['Roboto-Regular.ttf'], 'base64'),
            },
        };

        const printer = new PdfPrinter(fonts);

        const docDefinition: TDocumentDefinitions = {
            pageSize: 'A4',
            pageMargins: [40, 140, 40, 60],
            header: (currentPage) => ({
                margin: [40, 20, 40, 0],
                stack: [
                    {
                        columns: [
                            {
                                width: '*',
                                stack: [
                                    logoBase64 ? { image: logoBase64, width: 80, margin: [0, 0, 0, 10] as any } : { text: '' },
                                    { text: tenantSettings?.companyName || 'OTOMUHASEBE ERP', style: 'companyName' },
                                    {
                                        text: [
                                            tenantSettings?.address || '',
                                            tenantSettings?.district ? ` ${tenantSettings.district}` : '',
                                            tenantSettings?.city ? ` / ${tenantSettings.city}` : '',
                                            '\n',
                                            tenantSettings?.phone ? `Tel: ${tenantSettings.phone}` : '',
                                            tenantSettings?.email ? ` | Email: ${tenantSettings.email}` : '',
                                            tenantSettings?.website ? ` | Web: ${tenantSettings.website}` : '',
                                            '\n',
                                            tenantSettings?.taxOffice ? `Tax Office: ${tenantSettings.taxOffice}` : '',
                                            tenantSettings?.taxNumber ? ` | Tax No: ${tenantSettings.taxNumber}` : '',
                                            tenantSettings?.tcNo ? ` | National ID: ${tenantSettings.tcNo}` : '',
                                        ].filter(Boolean).join(''),
                                        style: 'companyAddress',
                                    },
                                ],
                            },
                            {
                                width: 'auto',
                                stack: [
                                    { text: 'CREDIT LIMIT REPORT', style: 'docTitle', alignment: 'right' },
                                    { text: `Date: ${new Date().toLocaleDateString('tr-TR')}`, style: 'docTag', alignment: 'right' },
                                    { text: `Page: ${currentPage}`, style: 'docTag', alignment: 'right', margin: [0, 2, 0, 0] },
                                ],
                            },
                        ],
                    },
                    {
                        canvas: [
                            {
                                type: 'line',
                                x1: 0, y1: 15,
                                x2: 515, y2: 15,
                                lineWidth: 1,
                                lineColor: '#1e293b',
                            },
                        ],
                    },
                ],
            }),
            content: [
                {
                    style: 'summarySection',
                    table: {
                        widths: ['*', '*', '*'],
                        body: [
                            [
                                {
                                    stack: [
                                        { text: 'TOTAL CREDIT LIMIT', style: 'summaryLabel' },
                                        { text: `${Number(summary.totalCreditLimit).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL`, style: 'summaryValueBlue' }
                                    ],
                                    fillColor: '#f0f9ff',
                                    padding: [10, 10, 10, 10] as any
                                },
                                {
                                    stack: [
                                        { text: 'TOTAL DEBT', style: 'summaryLabel' },
                                        { text: `${Number(summary.totalDebt).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL`, style: 'summaryValueDanger' }
                                    ],
                                    fillColor: '#fef2f2',
                                    padding: [10, 10, 10, 10] as any
                                },
                                {
                                    stack: [
                                        { text: 'TOTAL REMAINING LIMIT', style: 'summaryLabel' },
                                        { text: `${Number(summary.totalRemainingLimit).toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL`, style: 'summaryValue' }
                                    ],
                                    fillColor: '#f3f4f6',
                                    padding: [10, 10, 10, 10] as any
                                }
                            ]
                        ]
                    },
                    layout: 'noBorders'
                },
                {
                    style: 'transactionTable',
                    table: {
                        headerRows: 1,
                        widths: ['auto', '*', 'auto', 'auto', 'auto', 'auto'],
                        body: [
                            [
                                { text: 'ACCOUNT CODE', style: 'tableHeader' },
                                { text: 'TITLE', style: 'tableHeader' },
                                { text: 'SALES AGENT', style: 'tableHeader' },
                                { text: 'CREDIT LIMIT', style: 'tableHeader', alignment: 'right' },
                                { text: 'DEBT', style: 'tableHeader', alignment: 'right' },
                                { text: 'REMAINING LIMIT', style: 'tableHeader', alignment: 'right' },
                            ],
                            ...accounts.map((item) => {
                                const isOverLimit = item.remainingLimit < 0;
                                return [
                                    { text: item.code, style: 'tableCell' },
                                    { text: item.title, style: 'tableCell' },
                                    { text: item.salesAgent?.fullName || '-', style: 'tableCell' },
                                    { text: Number(item.creditLimit) > 0 ? Number(item.creditLimit).toLocaleString('tr-TR', { minimumFractionDigits: 2 }) : '-', style: 'tableCellBlue', alignment: 'right' },
                                    { text: Number(item.debt) > 0 ? Number(item.debt).toLocaleString('tr-TR', { minimumFractionDigits: 2 }) : '-', style: 'tableCellDanger', alignment: 'right' },
                                    {
                                        text: `${item.remainingLimit.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} TL`,
                                        style: isOverLimit ? 'tableCellDangerBold' : 'tableCellSuccessBold',
                                        fillColor: isOverLimit ? '#fef2f2' : null,
                                        alignment: 'right'
                                    },
                                ]
                            }),
                        ],
                    },
                    layout: {
                        fillColor: (rowIndex: number) => (rowIndex > 0 && rowIndex % 2 === 0) ? '#f9fafb' : null,
                        hLineWidth: (i: number) => 0.5,
                        vLineWidth: (i: number) => 0.5,
                        hLineColor: () => '#e5e7eb',
                        vLineColor: () => '#e5e7eb',
                    }
                } as any,
            ],
            footer: (currentPage: number, pageCount: number) => ({
                text: `Page ${currentPage} / ${pageCount} | Prepared by OTOMUHASEBE ERP.`,
                alignment: 'center',
                fontSize: 7,
                color: '#94a3b8',
                margin: [0, 20, 0, 0]
            }),
            styles: {
                companyName: { fontSize: 13, bold: true, color: '#0f172a', margin: [0, 0, 0, 2] },
                companyAddress: { fontSize: 8, color: '#64748b', lineHeight: 1.2 },
                docTitle: { fontSize: 16, bold: true, color: '#1e293b', margin: [0, 0, 0, 4] },
                docTag: { fontSize: 8, color: '#94a3b8' },
                summarySection: { margin: [0, 0, 0, 20] },
                summaryLabel: { fontSize: 7, bold: true, color: '#64748b', margin: [0, 0, 0, 4] },
                summaryValue: { fontSize: 12, bold: true, color: '#1e293b' },
                summaryValueBlue: { fontSize: 12, bold: true, color: '#0284c7' },
                summaryValueSuccess: { fontSize: 12, bold: true, color: '#15803d' },
                summaryValueDanger: { fontSize: 12, bold: true, color: '#b91c1c' },
                transactionTable: { margin: [0, 0, 0, 0] },
                tableHeader: { fontSize: 8, bold: true, color: '#ffffff', fillColor: '#1e293b', margin: [0, 4, 0, 4] },
                tableCell: { fontSize: 8, color: '#334155', margin: [0, 4, 0, 4] },
                tableCellBlue: { fontSize: 8, color: '#0284c7', margin: [0, 4, 0, 4] },
                tableCellBold: { fontSize: 8, bold: true, color: '#0f172a', margin: [0, 4, 0, 4] },
                tableCellSuccessBold: { fontSize: 8, bold: true, color: '#15803d', margin: [0, 4, 0, 4] },
                tableCellDanger: { fontSize: 8, color: '#b91c1c', margin: [0, 4, 0, 4] },
                tableCellDangerBold: { fontSize: 8, bold: true, color: '#b91c1c', margin: [0, 4, 0, 4] },
            },
            defaultStyle: { font: 'Roboto' },
        };

        return new Promise((resolve, reject) => {
            try {
                const pdfDoc = printer.createPdfKitDocument(docDefinition);
                const chunks: Buffer[] = [];
                pdfDoc.on('data', chunk => chunks.push(chunk));
                pdfDoc.on('end', () => resolve(Buffer.concat(chunks)));
                pdfDoc.on('error', reject);
                pdfDoc.end();
            } catch (error) {
                reject(error);
            }
        });
    }
}
