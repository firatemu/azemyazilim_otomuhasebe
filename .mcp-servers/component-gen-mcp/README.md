# Frontend Component Generator MCP

Material UI component'leri, form'lar ve TanStack Query hooks'ları otomatik oluşturan MCP sunucusu.

## Özellikler

- ✅ CRUD sayfa üretici
- ✅ Form component üretici (react-hook-form + Zod)
- ✅ TanStack Query hooks
- ✅ TypeScript type tanımları

## Kurulum

```bash
cd /var/www/.mcp-servers/component-gen-mcp
npm install
npm run build
```

## Kullanılabilir Komutlar

### 1. generate_crud_page
Material UI CRUD sayfası oluşturur.

**Parametreler:**
- `modelName`: Model adı
- `fields`: JSON string `[{name, type, required}]`

### 2. generate_form
Form component'i oluşturur.

### 3. generate_hooks
TanStack Query hooks oluşturur.

### 4. generate_types
TypeScript type tanımları oluşturur.

## Claude Desktop Konfigürasyonu

```json
{
  "mcpServers": {
    "component-gen": {
      "command": "node",
      "args": ["/var/www/.mcp-servers/component-gen-mcp/dist/index.js"]
    }
  }
}
```

## Kullanım Örneği

**"User modeli için CRUD sayfası oluştur. Alanlar: name (string, required), email (string, required), age (number, optional)"**
