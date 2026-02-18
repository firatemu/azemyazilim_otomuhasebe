# API Testing & Documentation MCP

NestJS API endpoint'lerinizi test etmek ve dokümante etmek için MCP sunucusu.

## Özellikler

- ✅ Endpoint keşfi
- ✅ Endpoint testi
- ✅ Sağlık kontrolü
- ✅ Postman collection oluşturma

## Kurulum

```bash
cd /var/www/.mcp-servers/api-docs-mcp
npm install
npm run build
```

## Kullanılabilir Komutlar

### 1. discover_endpoints
Controller dosyalarını tarayarak endpoint'leri keşfeder.

### 2. test_endpoint
Belirli bir endpoint'i test eder.

**Parametreler:**
- `method`: GET, POST, PUT, DELETE, PATCH
- `path`: Endpoint yolu
- `body`: Request body (JSON)
- `environment`: staging/production

### 3. health_check_all
Kritik endpoint'lerin sağlık kontrolü.

### 4. generate_postman
Postman collection oluşturur.

## Claude Desktop Konfigürasyonu

```json
{
  "mcpServers": {
    "api-docs": {
      "command": "node",
      "args": ["/var/www/.mcp-servers/api-docs-mcp/dist/index.js"]
    }
  }
}
```

## Kullanım Örnekleri

1. **"Tüm endpoint'leri keşfet"**
2. **"GET /api/users endpoint'ini test et"**
3. **"Tüm endpoint'lerin sağlık kontrolünü yap"**
4. **"Postman collection oluştur"**
