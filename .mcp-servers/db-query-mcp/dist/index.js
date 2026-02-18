#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema, } from '@modelcontextprotocol/sdk/types.js';
import { Client } from 'pg';
import { exec } from 'child_process';
import { promisify } from 'util';
const execAsync = promisify(exec);
const DB_CONFIGS = {
    staging: {
        host: 'otomuhasebe-postgres',
        port: 5432,
        database: 'otomuhasebe_stage',
        user: 'postgres',
        password: 'postgres',
    },
    production: {
        host: 'otomuhasebe-postgres',
        port: 5432,
        database: 'otomuhasebe_prod',
        user: 'postgres',
        password: 'postgres',
    },
};
class DatabaseQueryServer {
    server;
    constructor() {
        this.server = new Server({
            name: 'db-query-mcp',
            version: '1.0.0',
        }, {
            capabilities: {
                tools: {},
            },
        });
        this.setupHandlers();
    }
    setupHandlers() {
        this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
            tools: [
                {
                    name: 'sql_to_prisma',
                    description: 'SQL sorgusunu Prisma query formatına çevirir',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            sql: {
                                type: 'string',
                                description: 'Çevrilecek SQL sorgusu',
                            },
                            tableName: {
                                type: 'string',
                                description: 'Tablo adı (model adı)',
                            },
                        },
                        required: ['sql', 'tableName'],
                    },
                },
                {
                    name: 'analyze_slow_queries',
                    description: 'Yavaş çalışan sorguları tespit eder ve analiz eder',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            environment: {
                                type: 'string',
                                enum: ['staging', 'production'],
                                default: 'staging',
                            },
                            minDuration: {
                                type: 'number',
                                description: 'Minimum süre (ms)',
                                default: 1000,
                            },
                        },
                    },
                },
                {
                    name: 'explain_query',
                    description: 'SQL sorgusunun execution plan\'ını gösterir',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            sql: {
                                type: 'string',
                                description: 'Analiz edilecek SQL sorgusu',
                            },
                            environment: {
                                type: 'string',
                                enum: ['staging', 'production'],
                                default: 'staging',
                            },
                        },
                        required: ['sql'],
                    },
                },
                {
                    name: 'backup_database',
                    description: 'Veritabanını yedekler',
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
                    name: 'table_stats',
                    description: 'Tablo istatistiklerini gösterir (satır sayısı, boyut, index\'ler)',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            tableName: {
                                type: 'string',
                                description: 'Tablo adı (opsiyonel, boş bırakılırsa tüm tablolar)',
                            },
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
                    case 'sql_to_prisma':
                        return await this.sqlToPrisma(args?.sql, args?.tableName);
                    case 'analyze_slow_queries':
                        return await this.analyzeSlowQueries(args?.environment || 'staging', args?.minDuration || 1000);
                    case 'explain_query':
                        return await this.explainQuery(args?.sql, args?.environment || 'staging');
                    case 'backup_database':
                        return await this.backupDatabase(args?.environment || 'staging');
                    case 'table_stats':
                        return await this.tableStats(args?.tableName || '', args?.environment || 'staging');
                    default:
                        throw new Error(`Bilinmeyen komut: ${name}`);
                }
            }
            catch (error) {
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
    async getClient(environment) {
        const config = DB_CONFIGS[environment];
        if (!config) {
            throw new Error(`Geçersiz ortam: ${environment}`);
        }
        const client = new Client(config);
        await client.connect();
        return client;
    }
    async sqlToPrisma(sql, tableName) {
        // Basit SQL -> Prisma çevirici
        const lowerSql = sql.toLowerCase().trim();
        let prismaQuery = '';
        if (lowerSql.startsWith('select')) {
            // SELECT sorgusu
            if (lowerSql.includes('where')) {
                const whereMatch = sql.match(/where\s+(.+?)(?:order|limit|$)/i);
                const whereClause = whereMatch ? whereMatch[1].trim() : '';
                prismaQuery = `await prisma.${tableName}.findMany({
  where: {
    // ${whereClause}
    // Buraya Prisma where koşullarını ekleyin
  }
})`;
            }
            else {
                prismaQuery = `await prisma.${tableName}.findMany()`;
            }
        }
        else if (lowerSql.startsWith('insert')) {
            prismaQuery = `await prisma.${tableName}.create({
  data: {
    // Buraya insert edilecek verileri ekleyin
  }
})`;
        }
        else if (lowerSql.startsWith('update')) {
            prismaQuery = `await prisma.${tableName}.update({
  where: {
    // ID veya unique alan
  },
  data: {
    // Güncellenecek alanlar
  }
})`;
        }
        else if (lowerSql.startsWith('delete')) {
            prismaQuery = `await prisma.${tableName}.delete({
  where: {
    // ID veya unique alan
  }
})`;
        }
        const result = `
# SQL → Prisma Çevirisi

## Orijinal SQL
\`\`\`sql
${sql}
\`\`\`

## Prisma Query
\`\`\`typescript
${prismaQuery}
\`\`\`

> **Not:** Bu otomatik çeviridir. WHERE koşullarını ve diğer detayları manuel olarak düzenlemeniz gerekebilir.
    `.trim();
        return {
            content: [{ type: 'text', text: result }],
        };
    }
    async analyzeSlowQueries(environment, minDuration) {
        const client = await this.getClient(environment);
        try {
            // pg_stat_statements extension'ı kullanarak yavaş sorguları bul
            const result = await client.query(`
        SELECT 
          query,
          calls,
          total_exec_time,
          mean_exec_time,
          max_exec_time
        FROM pg_stat_statements
        WHERE mean_exec_time > $1
        ORDER BY mean_exec_time DESC
        LIMIT 10
      `, [minDuration]);
            if (result.rows.length === 0) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: `${minDuration}ms'den yavaş sorgu bulunamadı. ✅`,
                        },
                    ],
                };
            }
            const analysis = `
# Yavaş Sorgu Analizi (${environment})

${result.rows.map((row, i) => `
## ${i + 1}. Sorgu
- **Ortalama Süre:** ${Math.round(row.mean_exec_time)}ms
- **Maksimum Süre:** ${Math.round(row.max_exec_time)}ms
- **Çağrı Sayısı:** ${row.calls}
- **Toplam Süre:** ${Math.round(row.total_exec_time)}ms

\`\`\`sql
${row.query}
\`\`\`
`).join('\n')}
      `.trim();
            return {
                content: [{ type: 'text', text: analysis }],
            };
        }
        catch (error) {
            // pg_stat_statements yoksa alternatif mesaj
            return {
                content: [
                    {
                        type: 'text',
                        text: 'pg_stat_statements extension\'ı yüklü değil. Yavaş sorgu analizi yapılamıyor.',
                    },
                ],
            };
        }
        finally {
            await client.end();
        }
    }
    async explainQuery(sql, environment) {
        const client = await this.getClient(environment);
        try {
            const result = await client.query(`EXPLAIN ANALYZE ${sql}`);
            const plan = result.rows.map(row => row['QUERY PLAN']).join('\n');
            const explanation = `
# Query Execution Plan

\`\`\`
${plan}
\`\`\`

## Orijinal Sorgu
\`\`\`sql
${sql}
\`\`\`
      `.trim();
            return {
                content: [{ type: 'text', text: explanation }],
            };
        }
        finally {
            await client.end();
        }
    }
    async backupDatabase(environment) {
        const config = DB_CONFIGS[environment];
        const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
        const backupFile = `/var/www/backups/db_${environment}_${timestamp}.sql`;
        try {
            const { stdout, stderr } = await execAsync(`docker exec otomuhasebe-postgres pg_dump -U ${config.user} ${config.database} > ${backupFile}`);
            return {
                content: [
                    {
                        type: 'text',
                        text: `✅ Veritabanı yedeklendi!\n\n**Dosya:** ${backupFile}`,
                    },
                ],
            };
        }
        catch (error) {
            throw new Error(`Yedekleme hatası: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async tableStats(tableName, environment) {
        const client = await this.getClient(environment);
        try {
            let query = '';
            if (tableName) {
                // Belirli bir tablo
                query = `
          SELECT 
            schemaname,
            tablename,
            pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
            n_live_tup AS row_count
          FROM pg_stat_user_tables
          WHERE tablename = $1
        `;
            }
            else {
                // Tüm tablolar
                query = `
          SELECT 
            schemaname,
            tablename,
            pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size,
            n_live_tup AS row_count
          FROM pg_stat_user_tables
          ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
          LIMIT 20
        `;
            }
            const result = tableName
                ? await client.query(query, [tableName])
                : await client.query(query);
            if (result.rows.length === 0) {
                return {
                    content: [
                        {
                            type: 'text',
                            text: tableName ? `Tablo bulunamadı: ${tableName}` : 'Hiç tablo bulunamadı.',
                        },
                    ],
                };
            }
            const stats = `
# Tablo İstatistikleri (${environment})

${result.rows.map(row => `
## ${row.tablename}
- **Satır Sayısı:** ${row.row_count?.toLocaleString() || 'Bilinmiyor'}
- **Boyut:** ${row.size}
- **Schema:** ${row.schemaname}
`).join('\n')}
      `.trim();
            return {
                content: [{ type: 'text', text: stats }],
            };
        }
        finally {
            await client.end();
        }
    }
    async run() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error('Database Query Helper MCP server çalışıyor...');
    }
}
const server = new DatabaseQueryServer();
server.run().catch(console.error);
//# sourceMappingURL=index.js.map