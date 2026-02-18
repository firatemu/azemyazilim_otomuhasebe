#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';
import { createClient } from 'redis';
class RedisCacheServer {
    server;
    redis;
    constructor() {
        this.server = new Server({ name: 'redis-cache-mcp', version: '1.0.0' }, { capabilities: { tools: {} } });
        this.setupHandlers();
    }
    async getRedisClient() {
        if (!this.redis) {
            this.redis = createClient({ url: 'redis://otomuhasebe-redis:6379' });
            await this.redis.connect();
        }
        return this.redis;
    }
    setupHandlers() {
        this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
            tools: [
                { name: 'cache_stats', description: 'Cache istatistiklerini gösterir', inputSchema: { type: 'object', properties: {} } },
                { name: 'clear_cache', description: 'Cache\'i temizler', inputSchema: { type: 'object', properties: { pattern: { type: 'string', description: 'Silinecek key pattern (örn: user:*)' } } } },
                { name: 'get_key', description: 'Belirli bir key\'in değerini getirir', inputSchema: { type: 'object', properties: { key: { type: 'string' } }, required: ['key'] } },
            ],
        }));
        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;
            try {
                switch (name) {
                    case 'cache_stats': return await this.cacheStats();
                    case 'clear_cache': return await this.clearCache(args?.pattern || '*');
                    case 'get_key': return await this.getKey(args?.key);
                    default: throw new Error(`Bilinmeyen komut: ${name}`);
                }
            }
            catch (error) {
                return { content: [{ type: 'text', text: `Hata: ${error instanceof Error ? error.message : String(error)}` }] };
            }
        });
    }
    async cacheStats() {
        try {
            const client = await this.getRedisClient();
            const info = await client.info('stats');
            const dbSize = await client.dbSize();
            return { content: [{ type: 'text', text: `# Redis Cache İstatistikleri\n\n**Toplam Key:** ${dbSize}\n\n\`\`\`\n${info}\n\`\`\`` }] };
        }
        catch (error) {
            throw new Error(`Redis bağlantı hatası: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async clearCache(pattern) {
        try {
            const client = await this.getRedisClient();
            const keys = await client.keys(pattern);
            if (keys.length > 0) {
                await client.del(keys);
            }
            return { content: [{ type: 'text', text: `✅ ${keys.length} adet key silindi (pattern: ${pattern})` }] };
        }
        catch (error) {
            throw new Error(`Cache temizleme hatası: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async getKey(key) {
        try {
            const client = await this.getRedisClient();
            const value = await client.get(key);
            return { content: [{ type: 'text', text: value ? `**${key}:**\n\`\`\`json\n${value}\n\`\`\`` : `Key bulunamadı: ${key}` }] };
        }
        catch (error) {
            throw new Error(`Key okuma hatası: ${error instanceof Error ? error.message : String(error)}`);
        }
    }
    async run() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error('Redis Cache MCP server çalışıyor...');
    }
}
const server = new RedisCacheServer();
server.run().catch(console.error);
//# sourceMappingURL=index.js.map