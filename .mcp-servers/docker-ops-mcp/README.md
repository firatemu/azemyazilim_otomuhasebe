# Docker Operations MCP

Docker konteynerlerinizi yönetmek, logları izlemek ve kaynak kullanımını monitör etmek için MCP sunucusu.

## Özellikler

- ✅ Konteyner durum kontrolü
- ✅ Hızlı restart
- ✅ Log görüntüleme
- ✅ Kaynak kullanımı (CPU, RAM)
- ✅ Sağlık kontrolü

## Kurulum

```bash
cd /var/www/.mcp-servers/docker-ops-mcp
npm install
npm run build
```

## Kullanılabilir Komutlar

### 1. container_status
Tüm konteynerlerin durumunu gösterir.

**Parametreler:**
- `filter`: "all", "running", "stopped" (varsayılan: "running")

### 2. quick_restart
Servisi hızlıca yeniden başlatır.

**Parametreler:**
- `service`: backend_staging, backend_prod, user_panel_staging, postgres, redis, vb.

### 3. stream_logs
Servis loglarını gösterir.

**Parametreler:**
- `service`: Servis adı
- `lines`: Satır sayısı (varsayılan: 50)

### 4. resource_usage
CPU ve RAM kullanımını gösterir.

### 5. health_check
Tüm servislerin sağlık durumunu kontrol eder.

## Claude Desktop Konfigürasyonu

```json
{
  "mcpServers": {
    "docker-ops": {
      "command": "node",
      "args": ["/var/www/.mcp-servers/docker-ops-mcp/dist/index.js"]
    }
  }
}
```

## Kullanım Örnekleri

1. **"Tüm konteynerlerin durumunu göster"**
2. **"Backend staging'i yeniden başlat"**
3. **"Redis'in son 100 logunu göster"**
4. **"Kaynak kullanımını göster"**
5. **"Sağlık kontrolü yap"**

## Notlar

- Docker socket'e erişim gerektirir (`/var/run/docker.sock`)
- Root veya docker grubunda çalışmalı
