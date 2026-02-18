#!/usr/bin/env node
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { CallToolRequestSchema, ListToolsRequestSchema } from '@modelcontextprotocol/sdk/types.js';

class EmailTemplateServer {
    private server: Server;

    constructor() {
        this.server = new Server({ name: 'email-template-mcp', version: '1.0.0' }, { capabilities: { tools: {} } });
        this.setupHandlers();
    }

    private setupHandlers() {
        this.server.setRequestHandler(ListToolsRequestSchema, async () => ({
            tools: [
                { name: 'generate_template', description: 'Email şablonu oluşturur', inputSchema: { type: 'object', properties: { templateName: { type: 'string' }, purpose: { type: 'string', description: 'Şablonun amacı (welcome, reset-password, invoice, vb.)' } }, required: ['templateName', 'purpose'] } },
                { name: 'preview_template', description: 'Şablon önizlemesi oluşturur', inputSchema: { type: 'object', properties: { templateName: { type: 'string' }, data: { type: 'string', description: 'Test verileri (JSON)' } }, required: ['templateName'] } },
            ],
        }));

        this.server.setRequestHandler(CallToolRequestSchema, async (request) => {
            const { name, arguments: args } = request.params;
            try {
                switch (name) {
                    case 'generate_template': return await this.generateTemplate(args?.templateName as string, args?.purpose as string);
                    case 'preview_template': return await this.previewTemplate(args?.templateName as string, (args?.data as string) || '{}');
                    default: throw new Error(`Bilinmeyen komut: ${name}`);
                }
            } catch (error) {
                return { content: [{ type: 'text', text: `Hata: ${error instanceof Error ? error.message : String(error)}` }] };
            }
        });
    }

    private async generateTemplate(templateName: string, purpose: string) {
        const templates: Record<string, string> = {
            'welcome': `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>Hoş Geldiniz</title></head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #1976d2;">Hoş Geldiniz!</h1>
  <p>Merhaba {{name}},</p>
  <p>Otomuhasebe'ye hoş geldiniz. Hesabınız başarıyla oluşturuldu.</p>
  <a href="{{loginUrl}}" style="display: inline-block; padding: 10px 20px; background: #1976d2; color: white; text-decoration: none; border-radius: 4px;">Giriş Yap</a>
</body>
</html>`,
            'reset-password': `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>Şifre Sıfırlama</title></head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #1976d2;">Şifre Sıfırlama</h1>
  <p>Merhaba {{name}},</p>
  <p>Şifrenizi sıfırlamak için aşağıdaki linke tıklayın:</p>
  <a href="{{resetUrl}}" style="display: inline-block; padding: 10px 20px; background: #1976d2; color: white; text-decoration: none; border-radius: 4px;">Şifremi Sıfırla</a>
  <p style="color: #666; font-size: 12px;">Bu link 1 saat geçerlidir.</p>
</body>
</html>`,
            'invoice': `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"><title>Fatura</title></head>
<body style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
  <h1 style="color: #1976d2;">Fatura #{{invoiceNo}}</h1>
  <p>Sayın {{customerName}},</p>
  <p>Faturanız hazır. Detaylar için ekteki PDF'i inceleyebilirsiniz.</p>
  <table style="width: 100%; border-collapse: collapse; margin: 20px 0;">
    <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Tutar:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">{{amount}} TL</td></tr>
    <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Vade:</strong></td><td style="padding: 8px; border: 1px solid #ddd;">{{dueDate}}</td></tr>
  </table>
</body>
</html>`,
        };

        const template = templates[purpose] || templates['welcome'];

        return { content: [{ type: 'text', text: `# ${templateName} Email Şablonu\n\n\`\`\`html\n${template}\n\`\`\`` }] };
    }

    private async previewTemplate(templateName: string, dataJson: string) {
        const data = JSON.parse(dataJson);
        let preview = `<h1>Önizleme: ${templateName}</h1><p>Test verileri ile render edilmiş hali burada görünecek.</p>`;

        return { content: [{ type: 'text', text: `# Şablon Önizleme\n\n\`\`\`html\n${preview}\n\`\`\`` }] };
    }

    async run() {
        const transport = new StdioServerTransport();
        await this.server.connect(transport);
        console.error('Email Template MCP server çalışıyor...');
    }
}

const server = new EmailTemplateServer();
server.run().catch(console.error);
