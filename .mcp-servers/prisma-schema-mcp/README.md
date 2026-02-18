# Prisma Schema MCP

Prisma şema dosyanızı analiz eden, model ilişkilerini gösteren ve optimizasyon önerileri sunan MCP sunucusu.

## Özellikler

- ✅ Şema analizi ve istatistikler
- ✅ Model ilişkilerini görselleştirme
- ✅ Index önerileri
- ✅ Model listesi
- ✅ Staging ve Production ortam desteği

## Kurulum

```bash
cd /var/www/.mcp-servers/prisma-schema-mcp
npm install
npm run build
```

## Kullanılabilir Komutlar

### 1. analyze_schema
Prisma şemasını analiz eder ve genel istatistikleri gösterir.

**Parametreler:**
- `environment` (opsiyonel): "staging" veya "production" (varsayılan: "staging")

**Örnek Çıktı:**
- Toplam model sayısı
- Toplam enum sayısı
- İlişki sayısı
- En çok ilişkili modeller

### 2. show_relations
Belirli bir modelin tüm ilişkilerini gösterir.

**Parametreler:**
- `modelName` (zorunlu): Model adı (örn: "User", "Banka", "Stok")
- `environment` (opsiyonel): "staging" veya "production"

**Örnek:**
```
modelName: "User"
environment: "staging"
```

### 3. suggest_indexes
Performans için eksik index önerileri sunar.

**Parametreler:**
- `environment` (opsiyonel): "staging" veya "production"

**Öneriler:**
- Foreign key alanları için index'ler
- Sık filtrelenen alanlar (createdAt, status, vb.)

### 4. list_models
Tüm Prisma modellerini listeler.

**Parametreler:**
- `environment` (opsiyonel): "staging" veya "production"

## Claude Desktop Konfigürasyonu

`~/Library/Application Support/Claude/claude_desktop_config.json` dosyanıza ekleyin:

```json
{
  "mcpServers": {
    "prisma-schema": {
      "command": "node",
      "args": ["/var/www/.mcp-servers/prisma-schema-mcp/dist/index.js"]
    }
  }
}
```

## Kullanım Örnekleri

1. **Şema analizi:**
   - "Staging ortamındaki Prisma şemasını analiz et"
   
2. **İlişkileri görüntüleme:**
   - "User modelinin tüm ilişkilerini göster"
   
3. **Index önerileri:**
   - "Performans için hangi index'leri eklemeliyim?"
   
4. **Model listesi:**
   - "Tüm Prisma modellerini listele"

## Notlar

- Şema dosyaları `/var/www/api-stage/server/prisma/schema.prisma` ve `/var/www/api-prod/server/prisma/schema.prisma` konumlarında aranır
- MCP sunucusu bu dosyalara okuma erişimi gerektirir
