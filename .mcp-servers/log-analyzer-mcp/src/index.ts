#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

class LogAnalyzerServer {
    private server: Server;

    constructor() {
        this.server = new Server({ name: 'log-analyzer-mcp', version: '1.0.0' }, { capabilities: { tools: {} } });
        this.setupHandlers();
    }

    private setupHandlers() {
        this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
            tools: [
                { name: 'find_errors', description: 'Loglarda hata arar', inputSchema: { type: 'object', properties: { service: { type: 'string' }, lines: { type: 'number', default: 100 } }, required: ['service'] } },
                { name: 'analyze_performance', description: 'Performans loglarını analiz eder', inputSchema: { type: 'object', properties: { service: { type: 'string' } }, required: ['service'] } },
                { name: 'security_scan', description: 'Güvenlik loglarını tarar', inputSchema: { type: 'object', properties: { service: { type: 'string' } }, required: ['service'] } },
            ],
        }));

        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;
            try {
                switch (name) {
                    case 'find_errors': return await this.findErrors(args?.service as string, (args?.lines as number) || 100);
                    case 'analyze_performance': return await this.analyzePerformance(args?.service as string);
                    case 'security_scan': return await this.securityScan(args?.service as string);
                    default: throw new Error(`Bilinmeyen komut: ${name}`);
                }
            } catch (error) {
                return { content: [{ type: 'text', text: `Hata: ${error instanceof Error ? error.message : String(error)}` }] };
            }
        });
    }

    private async findErrors(service: string, lines: number) {
        try {
            const { stdout } = await execAsync(`docker logs ${service} --tail ${lines} 2>&1 | grep -i "error\\|exception\\|failed" || echo "Hata bulunamadı"`);
            return { content: [{ type: 'text', text: `# Hata Analizi (${service})\n\n\`\`\`\n${stdout}\n\`\`\`` }] };
        } catch (error) {
            throw new Error(`Log analizi hatası: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    private async analyzePerformance(service: string) {
        try {
            const { stdout } = await execAsync(`docker logs ${service} --tail 200 2>&1 | grep -i "ms\\|took\\|duration" | tail -20 || echo "Performans logu bulunamadı"`);
            return { content: [{ type: 'text', text: `# Performans Analizi (${service})\n\n\`\`\`\n${stdout}\n\`\`\`` }] };
        } catch (error) {
            throw new Error(`Performans analizi hatası: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    private async securityScan(service: string) {
        try {
            const { stdout } = await execAsync(`docker logs ${service} --tail 200 2>&1 | grep -i "unauthorized\\|forbidden\\|authentication\\|security" | tail -20 || echo "Güvenlik logu bulunamadı"`);
            return { content: [{ type: 'text', text: `# Güvenlik Taraması (${service})\n\n\`\`\`\n${stdout}\n\`\`\`` }] };
        } catch (error) {
            throw new Error(`Güvenlik taraması hatası: ${error instanceof Error ? error.message : String(error)}`);
        }
    }

    async run() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error('Log Analyzer MCP server çalışıyor...');
    }
}

const server = new LogAnalyzerServer();
server.run().catch(console.error);
