# Uzak Veritabanından Satış Faturası Aktarımı

Bu doküman, uzak sunucudaki veritabanından **satış faturaları**nı (SATIS, SATIS_IADE) aktarırken **cari hesap hareketleri**, **malzeme (stok) hareketleri** ve **bakiye hareketleri** ilişkisinin nasıl kurulduğunu açıklar.

## İlişki Özeti

| Varlık | İlişki |
|--------|--------|
| **Fatura** | `cariId` → Cari (müşteri); `faturaNo` ile cari harekette belgeNo’ya bağlanır. |
| **FaturaKalemi** | `faturaId` → Fatura; `stokId` → Stok. |
| **StokHareket** | `faturaKalemiId` → FaturaKalemi (malzeme hareketi); SATIS → CIKIS, SATIS_IADE → GIRIS. |
| **CariHareket** | `cariId` → Cari; `belgeNo` = faturaNo; SATIS → BORC (müşteri borcu), SATIS_IADE → ALACAK. |
| **Cari.bakiye** | Bu faturaların toplam etkisiyle güncellenir (SATIS artırır, SATIS_IADE azaltır). |

## Adımlar

### 1. Uzak veya yerel veritabanından export

**Otomatik (Docker ile yerel DB):** Scripts klasöründe `./export-remote-satis-json.sh` çalıştırın. Çıktılar `remote-faturalar-satis.json` ve `remote-fatura-kalemleri-satis.json` olarak yazılır. Veri yoksa `[]` yazar.

**Manuel (uzak sunucuda):** Uzak PostgreSQL’de aşağıdaki sorguları çalıştırıp çıktıyı JSON dosyası olarak kaydedin.

**Satış faturaları (SATIS, SATIS_IADE):**

```sql
SELECT json_agg(t) FROM (
  SELECT id, "faturaNo", "faturaTipi", "tenantId", "cariId", tarih, vade, iskonto,
         "toplamTutar", "kdvTutar", "genelToplam", "dovizCinsi", "dovizKuru",
         aciklama, durum, "odenecekTutar", "odenenTutar", "siparisNo",
         "createdBy", "deletedAt", "deletedBy", "updatedBy", "createdAt", "updatedAt"
  FROM faturalar
  WHERE "faturaTipi" IN ('SATIS', 'SATIS_IADE')
) t;
```

Çıktıyı `prisma/scripts/remote-faturalar-satis.json` olarak kaydedin.

**Bu faturalara ait fatura kalemleri:**

```sql
SELECT json_agg(k) FROM (
  SELECT k.id, k."faturaId", k."stokId", k.miktar, k."birimFiyat", k."kdvOrani",
         k."kdvTutar", k.tutar, k.raf, k."createdAt"
  FROM fatura_kalemleri k
  JOIN faturalar f ON f.id = k."faturaId"
  WHERE f."faturaTipi" IN ('SATIS', 'SATIS_IADE')
) k;
```

Çıktıyı `prisma/scripts/remote-fatura-kalemleri-satis.json` olarak kaydedin.

### 2. SQL üretimi (faturalar + kalemler + stok hareketleri)

`prisma/scripts` klasöründe:

```bash
cd api-stage/server/prisma/scripts
python3 gen-import-faturalar-satis.py > import-faturalar-satis.sql
```

Bu script:

- **faturalar** tablosuna satış/satış iade faturalarını yazar.
- **fatura_kalemleri** tablosuna kalemleri yazar (malzeme satırları).
- **stok_hareketleri** tablosuna her kalem için bir hareket yazar: SATIS → CIKIS, SATIS_IADE → GIRIS; `faturaKalemiId` ile fatura kalemine bağlar (malzeme hareketi ilişkisi).

### 3. Yerel veritabanına faturalar + malzeme hareketleri

Oluşan SQL’i yerel/hedef veritabanında çalıştırın:

```bash
psql -U postgres -d otomuhasebe_stage -f import-faturalar-satis.sql
```

(Veya Docker: `docker exec -i otomuhasebe-postgres psql -U postgres -d otomuhasebe_stage < import-faturalar-satis.sql`)

### 4. Cari hareketleri ve bakiye ilişkisi

Cari hesap hareketleri ve cari bakiye güncellemesi için:

```bash
psql -U postgres -d otomuhasebe_stage -f import-cari-hareketleri-satis.sql
```

Bu script:

- **cariler.bakiye**: Sadece henüz cari hareketi olmayan satış/satış iade faturalarının toplam etkisiyle güncellenir (SATIS artırır, SATIS_IADE azaltır).
- **cari_hareketler**: Her böyle fatura için bir satır ekler; `belgeNo` = fatura no, `belgeTipi` = FATURA; SATIS → BORC, SATIS_IADE → ALACAK; tarih sırasına göre yürüyen bakiye yazılır.

Tekrar çalıştırmada aynı fatura için çift cari hareket oluşmaz (belgeNo + cariId kontrolü).

## Dosya Listesi

| Dosya | Açıklama |
|-------|----------|
| `gen-import-faturalar-satis.py` | JSON → faturalar + fatura_kalemleri + stok_hareketleri SQL üretici |
| `import-cari-hareketleri-satis.sql` | Cari hareket + bakiye ilişkisini kuran SQL |
| `remote-faturalar-satis.json` | Uzak DB’den export (sizin oluşturacağınız) |
| `remote-fatura-kalemleri-satis.json` | Uzak DB’den export (sizin oluşturacağınız) |

## Notlar

- **Tenant:** Script’lerde varsayılan tenant `clxyedekparca00001`; farklı tenant için Python ve SQL içindeki `TENANT_ID` / `'clxyedekparca00001'` değerini değiştirin.
- **Ambar:** Stok hareketleri `WAREHOUSE_01_ID` (gen-import-faturalar-satis.py içinde) ile aynı ambarı kullanır; gerekirse bu sabiti güncelleyin.
- **Cari ve stok:** Uzak DB’deki `cariId` ve `stokId` değerlerinin yerel veritabanında mevcut cariler ve stoklar ile aynı (veya eşlenmiş) olması gerekir; gerekirse önce cari/stok aktarımı yapın.
