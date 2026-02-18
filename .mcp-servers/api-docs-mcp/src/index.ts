#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import axios from 'axios';
import { readdir, readFile } from 'fs/promises';
import { join } from 'path';

const API_URLS = {
    staging: 'http://localhost:3000/api',
    production: 'http://localhost:3001/api',
};

class ApiDocsServer {
    private server: Server;

    constructor() {
        this.server = new Server(
            {
                name: 'api-docs-mcp',
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
                    name: 'discover_endpoints',
                    description: 'NestJS controller dosyalarını tarayarak tüm API endpoint\'lerini keşfeder',
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
                    name: 'test_endpoint',
                    description: 'Belirli bir endpoint\'i test eder',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            method: {
                                type: 'string',
                                enum: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
                                description: 'HTTP metodu',
                            },
                            path: {
                                type: 'string',
                                description: 'Endpoint yolu (örn: /users, /stok)',
                            },
                            body: {
                                type: 'string',
                                description: 'Request body (JSON string)',
                            },
                            environment: {
                                type: 'string',
                                enum: ['staging', 'production'],
                                default: 'staging',
                            },
                        },
                        required: ['method', 'path'],
                    },
                },
                {
                    name: 'health_check_all',
                    description: 'Tüm kritik endpoint\'lerin sağlık kontrolünü yapar',
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
                    name: 'generate_postman',
                    description: 'Postman collection formatında API dokümantasyonu oluşturur',
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
                    case 'discover_endpoints':
                        return await this.discoverEndpoints(
                            (args?.environment as string) || 'staging'
                        );
                    case 'test_endpoint':
                        return await this.testEndpoint(
                            (args?.method as string),
                            (args?.path as string),
                            (args?.body as string) || '',
                            (args?.environment as string) || 'staging'
                        );
                    case 'health_check_all':
                        return await this.healthCheckAll(
                            (args?.environment as string) || 'staging'
                        );
                    case 'generate_postman':
                        return await this.generatePostman(
                            (args?.environment as string) || 'staging'
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

    private async discoverEndpoints(environment: string) {
        const basePath = environment === 'staging'
            ? '/var/www/api-stage/server/src/modules'
            : '/var/www/api-prod/server/src/modules';

        try {
            const modules = await readdir(basePath);
            const endpoints: Array<{ module: string; path: string; method: string }> = [];

            for (const module of modules) {
                const controllerPath = join(basePath, module, `${module}.controller.ts`);

                try {
                    const content = await readFile(controllerPath, 'utf-8');

                    // Basit regex ile endpoint'leri bul
                    const routeMatches = content.matchAll(/@(Get|Post|Put|Delete|Patch)\(['"]?([^'")\s]*)?['"]?\)/g);

                    for (const match of routeMatches) {
                        const method = match[1].toUpperCase();
                        const route = match[2] || '';
                        endpoints.push({
                            module,
                            path: `/api/${module}${route ? '/' + route : ''}`,
                            method,
                        });
                    }
                } catch {
                    // Controller dosyası yoksa atla
                    continue;
                }
            }

            const endpointList = `
# API Endpoint Keşfi (${environment})

**Toplam:** ${endpoints.length} endpoint

${endpoints.map((ep, i) => `
${i + 1}. **${ep.method}** \`${ep.path}\`
   - Modül: ${ep.module}
`).join('\n')}
      `.trim();

            return {
                content: [{ type: 'text', text: endpointList }],
            };
        } catch (error) {
            throw new Error(`Endpoint keşfi hatası: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    private async testEndpoint(
        method: string,
        path: string,
        body: string,
        environment: string
    ) {
        const baseUrl = API_URLS[environment as keyof typeof API_URLS];
        const url = `${baseUrl}${path}`;

        try {
            const startTime = Date.now();

            const config: any = {
                method,
                url,
                headers: {
                    'Content-Type': 'application/json',
                },
            };

            if (body && (method === 'POST' || method === 'PUT' || method === 'PATCH')) {
                config.data = JSON.parse(body);
            }

            const response = await axios(config);
            const duration = Date.now() - startTime;

            const result = `
# Endpoint Test Sonucu

## İstek
- **Method:** ${method}
- **URL:** ${url}
- **Süre:** ${duration}ms

## Yanıt
- **Status:** ${response.status} ${response.statusText}
- **Headers:** 
\`\`\`json
${JSON.stringify(response.headers, null, 2)}
\`\`\`

## Body
\`\`\`json
${JSON.stringify(response.data, null, 2)}
\`\`\`
      `.trim();

            return {
                content: [{ type: 'text', text: result }],
            };
        } catch (error: any) {
            const errorMsg = `
# Endpoint Test Hatası

- **Method:** ${method}
- **URL:** ${url}
- **Hata:** ${error.response?.status || 'Network Error'} ${error.response?.statusText || ''}

${error.response?.data ? `\`\`\`json\n${JSON.stringify(error.response.data, null, 2)}\n\`\`\`` : ''}
      `.trim();

            return {
                content: [{ type: 'text', text: errorMsg }],
            };
        }
    }

    private async healthCheckAll(environment: string) {
        const baseUrl = API_URLS[environment as keyof typeof API_URLS];

        const criticalEndpoints = [
            { name: 'Health', path: '/health', method: 'GET' },
            { name: 'Auth Login', path: '/auth/login', method: 'POST' },
            { name: 'Users', path: '/users', method: 'GET' },
            { name: 'Stok', path: '/stok', method: 'GET' },
        ];

        const results = await Promise.all(
            criticalEndpoints.map(async (endpoint) => {
                try {
                    const startTime = Date.now();
                    await axios({
                        method: endpoint.method,
                        url: `${baseUrl}${endpoint.path}`,
                        timeout: 5000,
                    });
                    const duration = Date.now() - startTime;

                    return {
                        ...endpoint,
                        status: 'success',
                        duration,
                    };
                } catch (error: any) {
                    return {
                        ...endpoint,
                        status: 'failed',
                        error: error.response?.status || 'Network Error',
                    };
                }
            })
        );

        const healthReport = `
# API Sağlık Kontrolü (${environment})

${results.map((result) => `
## ${result.name}
- **Endpoint:** ${result.method} ${result.path}
- **Durum:** ${result.status === 'success' ? '✅ Başarılı' : '❌ Başarısız'}
${result.status === 'success' ? `- **Süre:** ${'duration' in result ? result.duration : 0}ms` : `- **Hata:** ${'error' in result ? result.error : 'Bilinmiyor'}`}
`).join('\n')}

**Özet:** ${results.filter(r => r.status === 'success').length}/${results.length} endpoint sağlıklı
    `.trim();

        return {
            content: [{ type: 'text', text: healthReport }],
        };
    }

    private async generatePostman(environment: string) {
        const baseUrl = API_URLS[environment as keyof typeof API_URLS];

        const collection = {
            info: {
                name: `Otomuhasebe API - ${environment}`,
                schema: 'https://schema.getpostman.com/json/collection/v2.1.0/collection.json',
            },
            item: [
                {
                    name: 'Auth',
                    item: [
                        {
                            name: 'Login',
                            request: {
                                method: 'POST',
                                header: [{ key: 'Content-Type', value: 'application/json' }],
                                url: { raw: `${baseUrl}/auth/login` },
                                body: {
                                    mode: 'raw',
                                    raw: JSON.stringify({ email: '', password: '' }, null, 2),
                                },
                            },
                        },
                    ],
                },
                {
                    name: 'Users',
                    item: [
                        {
                            name: 'Get Users',
                            request: {
                                method: 'GET',
                                url: { raw: `${baseUrl}/users` },
                            },
                        },
                    ],
                },
            ],
        };

        const postmanJson = `
# Postman Collection

\`\`\`json
${JSON.stringify(collection, null, 2)}
\`\`\`

Bu JSON'u kopyalayıp Postman'e import edebilirsiniz.
    `.trim();

        return {
            content: [{ type: 'text', text: postmanJson }],
        };
    }

    async run() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error('API Testing & Documentation MCP server çalışıyor...');
    }
}

const server = new ApiDocsServer();
server.run().catch(console.error);
