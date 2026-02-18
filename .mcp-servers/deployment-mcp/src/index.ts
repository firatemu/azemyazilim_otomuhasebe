#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

class DeploymentServer {
    private server: Server;

    constructor() {
        this.server = new Server({ name: 'deployment-mcp', version: '1.0.0' }, { capabilities: { tools: {} } });
        this.setupHandlers();
    }

    private setupHandlers() {
        this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
            tools: [
                { name: 'deploy_service', description: 'Servisi deploy eder', inputSchema: { type: 'object', properties: { service: { type: 'string', enum: ['backend', 'user-panel', 'admin-panel', 'landing'] }, environment: { type: 'string', enum: ['staging', 'production'] } }, required: ['service', 'environment'] } },
                { name: 'rollback', description: 'Son deploy\'u geri alır', inputSchema: { type: 'object', properties: { service: { type: 'string' }, environment: { type: 'string' } }, required: ['service', 'environment'] } },
                { name: 'deployment_status', description: 'Deploy durumunu gösterir', inputSchema: { type: 'object', properties: {} } },
            ],
        }));

        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;
            try {
                switch (name) {
                    case 'deploy_service': return await this.deployService(args?.service as string, args?.environment as string);
                    case 'rollback': return await this.rollback(args?.service as string, args?.environment as string);
                    case 'deployment_status': return await this.deploymentStatus();
                    default: throw new Error(`Bilinmeyen komut: ${name}`);
                }
            } catch (error) {
                return { content: [{ type: 'text', text: `Hata: ${error instanceof Error ? error.message : String(error)}` }] };
            }
        });
    }

    private async deployService(service: string, environment: string) {
        const containerName = `compose-${service}-${environment}-1`;
        try {
            await execAsync(`docker restart ${containerName}`);
            return { content: [{ type: 'text', text: `✅ ${service} (${environment}) başarıyla deploy edildi!` }] };
        } catch (error) {
            throw new Error(`Deploy hatası: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    private async rollback(service: string, environment: string) {
        return { content: [{ type: 'text', text: `⚠️ Rollback özelliği henüz aktif değil. Manuel olarak önceki image'a dönün.` }] };
    }

    private async deploymentStatus() {
        const { stdout } = await execAsync('docker ps --format "{{.Names}}\t{{.Status}}"');
        return { content: [{ type: 'text', text: `# Deployment Durumu\n\n\`\`\`\n${stdout}\n\`\`\`` }] };
    }

    async run() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error('Deployment MCP server çalışıyor...');
    }
}

const server = new DeploymentServer();
server.run().catch(console.error);
