# Database Query Helper MCP

Veritabanı sorgularını optimize etmek, SQL'i Prisma'ya çevirmek ve performans analizi yapmak için MCP sunucusu.

## Özellikler

- ✅ SQL → Prisma çevirici
- ✅ Yavaş sorgu analizi
- ✅ Query execution plan
- ✅ Veritabanı yedekleme
- ✅ Tablo istatistikleri

## Kurulum

```bash
cd /var/www/.mcp-servers/db-query-mcp
npm install
npm run build
```

## Kullanılabilir Komutlar

### 1. sql_to_prisma
SQL sorgusunu Prisma query'sine çevirir.

**Parametreler:**
- `sql`: SQL sorgusu
- `tableName`: Model/tablo adı

### 2. analyze_slow_queries
Yavaş çalışan sorguları tespit eder.

**Parametreler:**
- `environment`: staging/production
- `minDuration`: Minimum süre (ms)

### 3. explain_query
SQL sorgusunun execution plan'ını gösterir.

**Parametreler:**
- `sql`: Analiz edilecek sorgu
- `environment`: staging/production

### 4. backup_database
Veritabanını yedekler.

**Parametreler:**
- `environment`: staging/production

### 5. table_stats
Tablo istatistiklerini gösterir.

**Parametreler:**
- `tableName`: Tablo adı (opsiyonel)
- `environment`: staging/production

## Claude Desktop Konfigürasyonu

```json
{
  "mcpServers": {
    "db-query": {
      "command": "node",
      "args": ["/var/www/.mcp-servers/db-query-mcp/dist/index.js"]
    }
  }
}
```

## Kullanım Örnekleri

1. **"Bu SQL sorgusunu Prisma'ya çevir: SELECT * FROM users WHERE active = true"**
2. **"1 saniyeden yavaş sorguları bul"**
3. **"Bu sorgunun execution plan'ını göster"**
4. **"Staging veritabanını yedekle"**
5. **"users tablosunun istatistiklerini göster"**
