# Multi-Tenant Context MCP

Multi-tenant yapınızı yönetmek, tenant verilerini sorgulamak ve izolasyon testleri yapmak için MCP sunucusu.

## Özellikler

- ✅ Tenant listesi
- ✅ Tenant detayları
- ✅ Tenant veri sayıları
- ✅ İzolasyon testi
- ✅ Aktivite takibi

## Kurulum

```bash
cd /var/www/.mcp-servers/tenant-context-mcp
npm install
npm run build
```

## Kullanılabilir Komutlar

### 1. list_tenants
Tüm tenant'ları listeler.

**Parametreler:**
- `activeOnly`: Sadece aktif tenant'lar (varsayılan: true)

### 2. tenant_details
Tenant detaylarını gösterir.

**Parametreler:**
- `tenantId`: Tenant ID veya subdomain

### 3. tenant_data_count
Tenant'a ait veri sayılarını gösterir.

**Parametreler:**
- `tenantId`: Tenant ID

### 4. test_isolation
Tenant izolasyonunu test eder.

**Parametreler:**
- `tenantId`: Test edilecek tenant ID

### 5. tenant_activity
Son aktiviteleri gösterir.

**Parametreler:**
- `tenantId`: Tenant ID
- `limit`: Aktivite sayısı (varsayılan: 10)

## Claude Desktop Konfigürasyonu

```json
{
  "mcpServers": {
    "tenant-context": {
      "command": "node",
      "args": ["/var/www/.mcp-servers/tenant-context-mcp/dist/index.js"]
    }
  }
}
```

## Kullanım Örnekleri

1. **"Tüm aktif tenant'ları listele"**
2. **"xyz tenant'ının detaylarını göster"**
3. **"abc tenant'ının veri sayılarını göster"**
4. **"xyz tenant'ı için izolasyon testi yap"**
5. **"abc tenant'ının son 20 aktivitesini göster"**
