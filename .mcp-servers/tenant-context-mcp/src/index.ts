#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { Client } from 'pg';

const DB_CONFIG = {
    host: 'otomuhasebe-postgres',
    port: 5432,
    database: 'otomuhasebe_stage',
    user: 'postgres',
    password: 'postgres',
};

class TenantContextServer {
    private server: Server;

    constructor() {
        this.server = new Server(
            {
                name: 'tenant-context-mcp',
                version: '1.0.0',
            },
            {
                capabilities: {
                    tools: {},
                },
            }
        );

        this.setupHandlers();
    }

    private setupHandlers() {
        this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
            tools: [
                {
                    name: 'list_tenants',
                    description: 'Tüm tenant\'ları listeler (firma adı, subdomain, aktif durum)',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            activeOnly: {
                                type: 'boolean',
                                description: 'Sadece aktif tenant\'ları göster',
                                default: true,
                            },
                        },
                    },
                },
                {
                    name: 'tenant_details',
                    description: 'Belirli bir tenant\'ın detaylı bilgilerini gösterir',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            tenantId: {
                                type: 'string',
                                description: 'Tenant ID veya subdomain',
                            },
                        },
                        required: ['tenantId'],
                    },
                },
                {
                    name: 'tenant_data_count',
                    description: 'Tenant\'a ait veri sayılarını gösterir (kullanıcı, stok, fatura vb.)',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            tenantId: {
                                type: 'string',
                                description: 'Tenant ID',
                            },
                        },
                        required: ['tenantId'],
                    },
                },
                {
                    name: 'test_isolation',
                    description: 'Tenant izolasyonunu test eder (başka tenant\'ların verilerine erişim kontrolü)',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            tenantId: {
                                type: 'string',
                                description: 'Test edilecek tenant ID',
                            },
                        },
                        required: ['tenantId'],
                    },
                },
                {
                    name: 'tenant_activity',
                    description: 'Tenant\'ın son aktivitelerini gösterir',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            tenantId: {
                                type: 'string',
                                description: 'Tenant ID',
                            },
                            limit: {
                                type: 'number',
                                description: 'Gösterilecek aktivite sayısı',
                                default: 10,
                            },
                        },
                        required: ['tenantId'],
                    },
                },
            ],
        }));

        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;

            try {
                switch (name) {
                    case 'list_tenants':
                        return await this.listTenants((args?.activeOnly as boolean) ?? true);
                    case 'tenant_details':
                        return await this.tenantDetails(args?.tenantId as string);
                    case 'tenant_data_count':
                        return await this.tenantDataCount(args?.tenantId as string);
                    case 'test_isolation':
                        return await this.testIsolation(args?.tenantId as string);
                    case 'tenant_activity':
                        return await this.tenantActivity(
                            args?.tenantId as string,
                            (args?.limit as number) || 10
                        );
                    default:
                        throw new Error(`Bilinmeyen komut: ${name}`);
                }
            } catch (error) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `Hata: ${error instanceof Error ? error.message : String(error)}`,
                        },
                    ],
                };
            }
        });
    }

    private async getClient(): Promise<Client> {
        const client = new Client(DB_CONFIG);
        await client.connect();
        return client;
    }

    private async listTenants(activeOnly: boolean) {
        const client = await this.getClient();

        try {
            const query = activeOnly
                ? 'SELECT id, "firmaAdi", subdomain, aktif, "createdAt" FROM tenants WHERE aktif = true ORDER BY "createdAt" DESC'
                : 'SELECT id, "firmaAdi", subdomain, aktif, "createdAt" FROM tenants ORDER BY "createdAt" DESC';

            const result = await client.query(query);

            if (result.rows.length === 0) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: 'Hiç tenant bulunamadı.',
                        },
                    ],
                };
            }

            const tenantList = `
# Tenant Listesi

**Toplam:** ${result.rows.length} tenant

${result.rows.map((tenant, i) => `
## ${i + 1}. ${tenant.firmaAdi}
- **ID:** ${tenant.id}
- **Subdomain:** ${tenant.subdomain}
- **Durum:** ${tenant.aktif ? '✅ Aktif' : '❌ Pasif'}
- **Oluşturulma:** ${new Date(tenant.createdAt).toLocaleDateString('tr-TR')}
`).join('\n')}
      `.trim();

            return {
                content: [{ type: 'text', text: tenantList }],
            };
        } finally {
            await client.end();
        }
    }

    private async tenantDetails(tenantId: string) {
        const client = await this.getClient();

        try {
            // ID veya subdomain ile arama
            const result = await client.query(
                'SELECT * FROM tenants WHERE id = $1 OR subdomain = $1',
                [tenantId]
            );

            if (result.rows.length === 0) {
                throw new Error(`Tenant bulunamadı: ${tenantId}`);
            }

            const tenant = result.rows[0];

            const details = `
# ${tenant.firmaAdi} - Detaylar

## Genel Bilgiler
- **ID:** ${tenant.id}
- **Firma Adı:** ${tenant.firmaAdi}
- **Subdomain:** ${tenant.subdomain}
- **Durum:** ${tenant.aktif ? '✅ Aktif' : '❌ Pasif'}

## İletişim
- **Email:** ${tenant.email || 'Belirtilmemiş'}
- **Telefon:** ${tenant.telefon || 'Belirtilmemiş'}
- **Adres:** ${tenant.adres || 'Belirtilmemiş'}

## Tarihler
- **Oluşturulma:** ${new Date(tenant.createdAt).toLocaleString('tr-TR')}
- **Son Güncelleme:** ${new Date(tenant.updatedAt).toLocaleString('tr-TR')}

## Ayarlar
- **Vergi No:** ${tenant.vergiNo || 'Belirtilmemiş'}
- **Vergi Dairesi:** ${tenant.vergiDairesi || 'Belirtilmemiş'}
      `.trim();

            return {
                content: [{ type: 'text', text: details }],
            };
        } finally {
            await client.end();
        }
    }

    private async tenantDataCount(tenantId: string) {
        const client = await this.getClient();

        try {
            // Tenant'ın varlığını kontrol et
            const tenantCheck = await client.query(
                'SELECT id, "firmaAdi" FROM tenants WHERE id = $1',
                [tenantId]
            );

            if (tenantCheck.rows.length === 0) {
                throw new Error(`Tenant bulunamadı: ${tenantId}`);
            }

            const tenant = tenantCheck.rows[0];

            // Çeşitli tablolardaki veri sayılarını say
            const counts = await Promise.all([
                client.query('SELECT COUNT(*) FROM users WHERE "tenantId" = $1', [tenantId]),
                client.query('SELECT COUNT(*) FROM stoklar WHERE "tenantId" = $1', [tenantId]),
                client.query('SELECT COUNT(*) FROM cariler WHERE "tenantId" = $1', [tenantId]),
                client.query('SELECT COUNT(*) FROM faturalar WHERE "tenantId" = $1', [tenantId]),
                client.query('SELECT COUNT(*) FROM depolar WHERE "tenantId" = $1', [tenantId]),
            ]);

            const dataCounts = `
# ${tenant.firmaAdi} - Veri Sayıları

- **Kullanıcılar:** ${counts[0].rows[0].count}
- **Stoklar:** ${counts[1].rows[0].count}
- **Cariler:** ${counts[2].rows[0].count}
- **Faturalar:** ${counts[3].rows[0].count}
- **Depolar:** ${counts[4].rows[0].count}

**Toplam Veri:** ${counts.reduce((sum, c) => sum + parseInt(c.rows[0].count), 0)} kayıt
      `.trim();

            return {
                content: [{ type: 'text', text: dataCounts }],
            };
        } finally {
            await client.end();
        }
    }

    private async testIsolation(tenantId: string) {
        const client = await this.getClient();

        try {
            // Tenant'ın varlığını kontrol et
            const tenantCheck = await client.query(
                'SELECT id, "firmaAdi" FROM tenants WHERE id = $1',
                [tenantId]
            );

            if (tenantCheck.rows.length === 0) {
                throw new Error(`Tenant bulunamadı: ${tenantId}`);
            }

            const tenant = tenantCheck.rows[0];

            // Diğer tenant'ların verilerine erişim testi
            const otherTenantData = await client.query(
                'SELECT COUNT(*) FROM stoklar WHERE "tenantId" != $1',
                [tenantId]
            );

            const ownData = await client.query(
                'SELECT COUNT(*) FROM stoklar WHERE "tenantId" = $1',
                [tenantId]
            );

            const isolationTest = `
# ${tenant.firmaAdi} - İzolasyon Testi

## Test Sonuçları

✅ **Kendi Verileri:** ${ownData.rows[0].count} stok kaydı
⚠️  **Diğer Tenant Verileri:** ${otherTenantData.rows[0].count} stok kaydı (erişilmemeli)

## Değerlendirme
${parseInt(otherTenantData.rows[0].count) > 0
                    ? '⚠️ **UYARI:** Diğer tenant verilerine erişim mümkün görünüyor. Middleware kontrollerini gözden geçirin.'
                    : '✅ **BAŞARILI:** Tenant izolasyonu çalışıyor.'}

## Öneriler
- Her Prisma sorgusunda \`tenantId\` filtresi kullanıldığından emin olun
- Middleware'de tenant context kontrolü yapın
- API endpoint'lerinde tenant doğrulaması yapın
      `.trim();

            return {
                content: [{ type: 'text', text: isolationTest }],
            };
        } finally {
            await client.end();
        }
    }

    private async tenantActivity(tenantId: string, limit: number) {
        const client = await this.getClient();

        try {
            // Tenant'ın varlığını kontrol et
            const tenantCheck = await client.query(
                'SELECT id, "firmaAdi" FROM tenants WHERE id = $1',
                [tenantId]
            );

            if (tenantCheck.rows.length === 0) {
                throw new Error(`Tenant bulunamadı: ${tenantId}`);
            }

            const tenant = tenantCheck.rows[0];

            // Son aktiviteleri getir (örnek: son oluşturulan faturalar)
            const activities = await client.query(
                `SELECT 
          'Fatura' as tip,
          "faturaNo" as detay,
          "createdAt" as tarih
        FROM faturalar 
        WHERE "tenantId" = $1 
        ORDER BY "createdAt" DESC 
        LIMIT $2`,
                [tenantId, limit]
            );

            if (activities.rows.length === 0) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `${tenant.firmaAdi} için henüz aktivite kaydı yok.`,
                        },
                    ],
                };
            }

            const activityList = `
# ${tenant.firmaAdi} - Son Aktiviteler

${activities.rows.map((activity, i) => `
${i + 1}. **${activity.tip}:** ${activity.detay}
   - ${new Date(activity.tarih).toLocaleString('tr-TR')}
`).join('\n')}
      `.trim();

            return {
                content: [{ type: 'text', text: activityList }],
            };
        } finally {
            await client.end();
        }
    }

    async run() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error('Multi-Tenant Context MCP server çalışıyor...');
    }
}

const server = new TenantContextServer();
server.run().catch(console.error);
