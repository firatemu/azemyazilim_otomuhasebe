#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
    CallToolRequestSchema,
    ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import Docker from 'dockerode';

const docker = new Docker({ socketPath: '/var/run/docker.sock' });

const SERVICE_NAMES = {
    backend_staging: 'compose-backend-staging-1',
    backend_prod: 'compose-backend-prod-1',
    user_panel_staging: 'compose-user-panel-staging-1',
    user_panel_prod: 'compose-user-panel-prod-1',
    admin_panel_staging: 'compose-admin-panel-staging-1',
    admin_panel_prod: 'compose-admin-panel-prod-1',
    landing_staging: 'compose-landing-page-staging-1',
    landing_prod: 'compose-landing-page-prod-1',
    postgres: 'otomuhasebe-postgres',
    redis: 'otomuhasebe-redis',
    caddy: 'otomuhasebe-caddy',
};

class DockerOpsServer {
    private server: Server;

    constructor() {
        this.server = new Server(
            {
                name: 'docker-ops-mcp',
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
                    name: 'container_status',
                    description: 'Tüm Docker konteynerlerinin durumunu gösterir (çalışıyor mu, sağlıklı mı, ne kadar süredir aktif)',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            filter: {
                                type: 'string',
                                description: 'Filtreleme (all, running, stopped)',
                                enum: ['all', 'running', 'stopped'],
                                default: 'running',
                            },
                        },
                    },
                },
                {
                    name: 'quick_restart',
                    description: 'Belirtilen servisi hızlıca yeniden başlatır',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            service: {
                                type: 'string',
                                description: 'Servis adı',
                                enum: Object.keys(SERVICE_NAMES),
                            },
                        },
                        required: ['service'],
                    },
                },
                {
                    name: 'stream_logs',
                    description: 'Belirtilen servisin son loglarını gösterir',
                    inputSchema: {
                        type: 'object',
                        properties: {
                            service: {
                                type: 'string',
                                description: 'Servis adı',
                                enum: Object.keys(SERVICE_NAMES),
                            },
                            lines: {
                                type: 'number',
                                description: 'Gösterilecek satır sayısı',
                                default: 50,
                            },
                        },
                        required: ['service'],
                    },
                },
                {
                    name: 'resource_usage',
                    description: 'Konteynerlerin kaynak kullanımını (CPU, RAM, Network) gösterir',
                    inputSchema: {
                        type: 'object',
                        properties: {},
                    },
                },
                {
                    name: 'health_check',
                    description: 'Tüm servislerin sağlık durumunu kontrol eder',
                    inputSchema: {
                        type: 'object',
                        properties: {},
                    },
                },
            ],
        }));

        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;

            try {
                switch (name) {
                    case 'container_status':
                        return await this.containerStatus((args?.filter as string) || 'running');
                    case 'quick_restart':
                        return await this.quickRestart(args?.service as string);
                    case 'stream_logs':
                        return await this.streamLogs(
                            args?.service as string,
                            (args?.lines as number) || 50
                        );
                    case 'resource_usage':
                        return await this.resourceUsage();
                    case 'health_check':
                        return await this.healthCheck();
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

    private async containerStatus(filter: string) {
        const containers = await docker.listContainers({
            all: filter === 'all',
        });

        if (containers.length === 0) {
            return {
                content: [
                    {
                        type: 'text',
                        text: 'Hiç konteyner bulunamadı.',
                    },
                ],
            };
        }

        const statusText = `
# Docker Konteyner Durumu

${containers
                .map((container) => {
                    const name = container.Names[0].replace('/', '');
                    const status = container.State;
                    const uptime = this.formatUptime(container.Status);
                    const health = container.Status.includes('healthy')
                        ? '✅ Sağlıklı'
                        : container.Status.includes('unhealthy')
                            ? '❌ Sağlıksız'
                            : '⚪ Bilinmiyor';

                    return `
## ${name}
- **Durum:** ${status === 'running' ? '🟢 Çalışıyor' : '🔴 Durdurulmuş'}
- **Sağlık:** ${health}
- **Çalışma Süresi:** ${uptime}
- **Image:** ${container.Image}
- **Portlar:** ${this.formatPorts(container.Ports)}
    `.trim();
                })
                .join('\n\n')}
    `.trim();

        return {
            content: [{ type: 'text', text: statusText }],
        };
    }

    private async quickRestart(service: string) {
        const containerName = SERVICE_NAMES[service as keyof typeof SERVICE_NAMES];
        if (!containerName) {
            throw new Error(`Geçersiz servis: ${service}`);
        }

        const container = docker.getContainer(containerName);

        try {
            await container.restart();
            return {
                content: [
                    {
                        type: 'text',
                        text: `✅ ${service} servisi başarıyla yeniden başlatıldı!`,
                    },
                ],
            };
        } catch (error) {
            throw new Error(`Restart hatası: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    private async streamLogs(service: string, lines: number) {
        const containerName = SERVICE_NAMES[service as keyof typeof SERVICE_NAMES];
        if (!containerName) {
            throw new Error(`Geçersiz servis: ${service}`);
        }

        const container = docker.getContainer(containerName);

        try {
            const logs = await container.logs({
                stdout: true,
                stderr: true,
                tail: lines,
                timestamps: true,
            });

            const logsText = logs.toString('utf-8');

            return {
                content: [
                    {
                        type: 'text',
                        text: `# ${service} Logları (Son ${lines} satır)\n\n\`\`\`\n${logsText}\n\`\`\``,
                    },
                ],
            };
        } catch (error) {
            throw new Error(`Log okuma hatası: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    private async resourceUsage() {
        const containers = await docker.listContainers();

        const stats = await Promise.all(
            containers.map(async (container) => {
                const containerObj = docker.getContainer(container.Id);
                const statsData = await containerObj.stats({ stream: false });

                const cpuDelta = statsData.cpu_stats.cpu_usage.total_usage -
                    statsData.precpu_stats.cpu_usage.total_usage;
                const systemDelta = statsData.cpu_stats.system_cpu_usage -
                    statsData.precpu_stats.system_cpu_usage;
                const cpuPercent = (cpuDelta / systemDelta) * 100;

                const memUsage = statsData.memory_stats.usage || 0;
                const memLimit = statsData.memory_stats.limit || 1;
                const memPercent = (memUsage / memLimit) * 100;

                return {
                    name: container.Names[0].replace('/', ''),
                    cpu: cpuPercent.toFixed(2),
                    memory: this.formatBytes(memUsage),
                    memoryPercent: memPercent.toFixed(2),
                };
            })
        );

        const usageText = `
# Kaynak Kullanımı

${stats
                .map(
                    (stat) => `
## ${stat.name}
- **CPU:** ${stat.cpu}%
- **RAM:** ${stat.memory} (${stat.memoryPercent}%)
    `.trim()
                )
                .join('\n\n')}
    `.trim();

        return {
            content: [{ type: 'text', text: usageText }],
        };
    }

    private async healthCheck() {
        const containers = await docker.listContainers();

        const healthStatuses = containers.map((container) => {
            const name = container.Names[0].replace('/', '');
            const isRunning = container.State === 'running';
            const health = container.Status.includes('healthy')
                ? 'healthy'
                : container.Status.includes('unhealthy')
                    ? 'unhealthy'
                    : 'unknown';

            return { name, isRunning, health };
        });

        const healthyCount = healthStatuses.filter(s => s.health === 'healthy').length;
        const unhealthyCount = healthStatuses.filter(s => s.health === 'unhealthy').length;
        const runningCount = healthStatuses.filter(s => s.isRunning).length;

        const healthText = `
# Sağlık Kontrolü

## Özet
- **Toplam Konteyner:** ${healthStatuses.length}
- **Çalışan:** ${runningCount}
- **Sağlıklı:** ${healthyCount}
- **Sağlıksız:** ${unhealthyCount}

## Detaylar
${healthStatuses
                .map((status) => {
                    const icon = status.health === 'healthy' ? '✅' : status.health === 'unhealthy' ? '❌' : '⚪';
                    const runIcon = status.isRunning ? '🟢' : '🔴';
                    return `${runIcon} ${icon} **${status.name}**`;
                })
                .join('\n')}
    `.trim();

        return {
            content: [{ type: 'text', text: healthText }],
        };
    }

    private formatUptime(status: string): string {
        const match = status.match(/Up (.+?)(?:\s+\(|$)/);
        return match ? match[1] : 'Bilinmiyor';
    }

    private formatPorts(ports: any[]): string {
        if (!ports || ports.length === 0) return 'Yok';
        return ports
            .map((p) => `${p.PublicPort || '?'}:${p.PrivatePort}`)
            .join(', ');
    }

    private formatBytes(bytes: number): string {
        if (bytes === 0) return '0 B';
        const k = 1024;
        const sizes = ['B', 'KB', 'MB', 'GB'];
        const i = Math.floor(Math.log(bytes) / Math.log(k));
        return `${(bytes / Math.pow(k, i)).toFixed(2)} ${sizes[i]}`;
    }

    async run() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error('Docker Operations MCP server çalışıyor...');
    }
}

const server = new DockerOpsServer();
server.run().catch(console.error);
