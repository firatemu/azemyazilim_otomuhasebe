#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import { readFile } from 'fs/promises';
import { join } from 'path';
import pkg from '@prisma/internals';
const { getDMMF } = pkg;


const SCHEMA_PATHS = {
    staging: '/var/www/api-stage/server/prisma/schema.prisma',
    production: '/var/www/api-prod/server/prisma/schema.prisma',
};

interface Model {
    name: string;
    fields: Array<{
        name: string;
        type: string;
        isRequired: boolean;
        isList: boolean;
        relationName?: string;
    }>;
}

class PrismaSchemaServer {
    private server: Server;

    constructor() {
        this.server = new Server(
            {
                name: 'prisma-schema-mcp',
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
                    name: 'analyze_schema',
                    description: 'Prisma şema dosyasını analiz eder ve model sayısı, ilişki sayısı gibi istatistikleri gösterir',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            environment: {
                                type: 'string',
                                enum: ['staging', 'production'],
                                description: 'Hangi ortamın şeması analiz edilecek',
                                default: 'staging',
                            },
                        },
                    },
                },
                {
                    name: 'show_relations',
                    description: 'Belirli bir modelin tüm ilişkilerini (relations) gösterir',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            modelName: {
                                type: 'string',
                                description: 'İlişkileri gösterilecek model adı (örn: User, Banka, Stok)',
                            },
                            environment: {
                                type: 'string',
                                enum: ['staging', 'production'],
                                default: 'staging',
                            },
                        },
                        required: ['modelName'],
                    },
                },
                {
                    name: 'suggest_indexes',
                    description: 'Performans için eksik index önerileri sunar',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            environment: {
                                type: 'string',
                                enum: ['staging', 'production'],
                                default: 'staging',
                            },
                        },
                    },
                },
                {
                    name: 'list_models',
                    description: 'Tüm Prisma modellerini listeler',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            environment: {
                                type: 'string',
                                enum: ['staging', 'production'],
                                default: 'staging',
                            },
                        },
                    },
                },
            ],
        }));

        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;

            try {
                switch (name) {
                    case 'analyze_schema':
                        return await this.analyzeSchema((args as any)?.environment || 'staging');
                    case 'show_relations':
                        return await this.showRelations(
                            (args as any)?.modelName as string,
                            (args as any)?.environment || 'staging'
                        );
                    case 'suggest_indexes':
                        return await this.suggestIndexes((args as any)?.environment || 'staging');
                    case 'list_models':
                        return await this.listModels((args as any)?.environment || 'staging');
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

    private async readSchema(environment: string): Promise<string> {
        const schemaPath = SCHEMA_PATHS[environment as keyof typeof SCHEMA_PATHS];
        if (!schemaPath) {
            throw new Error(`Geçersiz ortam: ${environment}`);
        }
        return await readFile(schemaPath, 'utf-8');
    }

    private async analyzeSchema(environment: string) {
        const schema = await this.readSchema(environment);
        const dmmf = await getDMMF({ datamodel: schema });

        const models = dmmf.datamodel.models;
        const enums = dmmf.datamodel.enums;

        let totalRelations = 0;
        let totalIndexes = 0;
        let totalUniqueConstraints = 0;

        models.forEach((model) => {
            model.fields.forEach((field) => {
                if (field.relationName) totalRelations++;
            });
            totalIndexes += model.dbName ? 1 : 0;
            totalUniqueConstraints += model.uniqueFields?.length || 0;
        });

        const analysis = `
# Prisma Şema Analizi (${environment})

## 📊 Genel İstatistikler
- **Toplam Model Sayısı:** ${models.length}
- **Toplam Enum Sayısı:** ${enums.length}
- **Toplam İlişki Sayısı:** ${totalRelations}
- **Toplam Index Sayısı:** ${totalIndexes}
- **Toplam Unique Constraint:** ${totalUniqueConstraints}

## 📋 Modeller
${models.map((m) => `- ${m.name} (${m.fields.length} alan)`).join('\n')}

## 🔗 En Çok İlişkili Modeller
${models
                .map((m) => ({
                    name: m.name,
                    relations: m.fields.filter((f) => f.relationName).length,
                }))
                .sort((a, b) => b.relations - a.relations)
                .slice(0, 5)
                .map((m) => `- ${m.name}: ${m.relations} ilişki`)
                .join('\n')}

## 📝 Enum'lar
${enums.map((e) => `- ${e.name} (${e.values.length} değer)`).join('\n')}
    `.trim();

        return {
            content: [{ type: 'text', text: analysis }],
        };
    }

    private async showRelations(modelName: string, environment: string) {
        const schema = await this.readSchema(environment);
        const dmmf = await getDMMF({ datamodel: schema });

        const model = dmmf.datamodel.models.find((m) => m.name === modelName);
        if (!model) {
            throw new Error(`Model bulunamadı: ${modelName}`);
        }

        const relations = model.fields.filter((f) => f.relationName);

        if (relations.length === 0) {
            return {
                content: [
                    {
                        type: 'text',
                        text: `${modelName} modelinin hiç ilişkisi yok.`,
                    },
                ],
            };
        }

        const relationInfo = `
# ${modelName} Model İlişkileri

${relations
                .map((rel) => {
                    const relType = rel.isList ? '1-N' : '1-1';
                    return `
## ${rel.name} → ${rel.type}
- **İlişki Tipi:** ${relType}
- **İlişki Adı:** ${rel.relationName}
- **Zorunlu:** ${rel.isRequired ? 'Evet' : 'Hayır'}
- **Liste:** ${rel.isList ? 'Evet' : 'Hayır'}
    `.trim();
                })
                .join('\n\n')}
    `.trim();

        return {
            content: [{ type: 'text', text: relationInfo }],
        };
    }

    private async suggestIndexes(environment: string) {
        const schema = await this.readSchema(environment);
        const dmmf = await getDMMF({ datamodel: schema });

        const suggestions: string[] = [];

        dmmf.datamodel.models.forEach((model) => {
            // Foreign key alanlarını kontrol et
            const foreignKeys = model.fields.filter(
                (f) => f.relationName && !f.isList
            );

            foreignKeys.forEach((fk) => {
                const hasIndex = model.fields.some(
                    (f) => f.name === fk.name && f.isId
                );
                if (!hasIndex) {
                    suggestions.push(
                        `${model.name}.${fk.name} - Foreign key için index eklenebilir`
                    );
                }
            });

            // Sık filtrelenen alanları kontrol et (createdAt, updatedAt, status vb.)
            const commonFilterFields = ['createdAt', 'updatedAt', 'status', 'durum', 'aktif'];
            commonFilterFields.forEach((fieldName) => {
                const field = model.fields.find((f) => f.name === fieldName);
                if (field) {
                    suggestions.push(
                        `${model.name}.${fieldName} - Sık filtreleme için index önerilir`
                    );
                }
            });
        });

        const result = suggestions.length > 0
            ? `# Index Önerileri\n\n${suggestions.map((s, i) => `${i + 1}. ${s}`).join('\n')}`
            : 'Tüm gerekli index\'ler mevcut! 🎉';

        return {
            content: [{ type: 'text', text: result }],
        };
    }

    private async listModels(environment: string) {
        const schema = await this.readSchema(environment);
        const dmmf = await getDMMF({ datamodel: schema });

        const modelList = `
# Prisma Modelleri (${environment})

${dmmf.datamodel.models
                .map((model) => {
                    const fieldCount = model.fields.length;
                    const relationCount = model.fields.filter((f) => f.relationName).length;
                    return `## ${model.name}\n- Toplam Alan: ${fieldCount}\n- İlişki Sayısı: ${relationCount}\n- Tablo Adı: ${model.dbName || model.name.toLowerCase()}`;
                })
                .join('\n\n')}
    `.trim();

        return {
            content: [{ type: 'text', text: modelList }],
        };
    }

    async run() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error('Prisma Schema MCP server çalışıyor...');
    }
}

const server = new PrismaSchemaServer();
server.run().catch(console.error);
