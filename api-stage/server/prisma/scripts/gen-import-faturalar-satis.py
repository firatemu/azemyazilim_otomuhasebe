#!/usr/bin/env python3
"""
Uzak veritabanından export edilen satış faturaları (SATIS, SATIS_IADE) + kalemler + stok hareketleri.
- Faturalar ve fatura kalemleri yerel faturalar/fatura_kalemleri tablolarına yazılır.
- Her kalem için stok_hareketleri: SATIS → CIKIS, SATIS_IADE → GIRIS (faturaKalemiId ile ilişki).
- Cari hareketler ve bakiye ayrı script ile kurulur: import-cari-hareketleri-satis.sql

Uzak DB'den export (örnek - remote DB'de çalıştırın):
  -- Faturalar (SATIS, SATIS_IADE)
  SELECT json_agg(t) FROM (SELECT id, "faturaNo", "faturaTipi", "tenantId", "cariId", tarih, vade, iskonto,
    "toplamTutar", "kdvTutar", "genelToplam", "dovizCinsi", "dovizKuru", aciklama, durum,
    "odenecekTutar", "odenenTutar", "siparisNo", "createdBy", "deletedAt", "deletedBy", "updatedBy", "createdAt", "updatedAt"
    FROM faturalar WHERE "faturaTipi" IN ('SATIS', 'SATIS_IADE')) t;
  -- Kalemler (bu faturalara ait)
  SELECT json_agg(k) FROM (SELECT k.* FROM fatura_kalemleri k
    JOIN faturalar f ON f.id = k."faturaId" WHERE f."faturaTipi" IN ('SATIS', 'SATIS_IADE')) k;

Çıktıları sırayla remote-faturalar-satis.json ve remote-fatura-kalemleri-satis.json olarak kaydedin.
"""
import json
import uuid

TENANT_ID = "clxyedekparca00001"
WAREHOUSE_01_ID = "eb067e72-b52b-45fd-94d6-510cd5df7eba"
NAMESPACE_SATIS_IMPORT = uuid.uuid5(uuid.NAMESPACE_URL, "https://otomuhasebe/satis-import")


def esc(s):
    if s is None:
        return "NULL"
    return "'" + str(s).replace("'", "''") + "'"


def dt(s):
    if s is None or s == "":
        return "NULL"
    x = str(s).replace("T", " ").replace("Z", "")[:26]
    if x.startswith("2526"):
        x = "2026" + x[4:]
    return "'" + x + "'"


def main():
    with open("remote-faturalar-satis.json", "r", encoding="utf-8") as f:
        raw = f.read().strip()
        faturalar = json.loads(raw) if raw else []
    with open("remote-fatura-kalemleri-satis.json", "r", encoding="utf-8") as f:
        raw = f.read().strip()
        kalemler = json.loads(raw) if raw else []
    if faturalar is None:
        faturalar = []
    if kalemler is None:
        kalemler = []

    if not faturalar:
        print("-- Satış faturaları (SATIS/SATIS_IADE) - veri yok")
        print("BEGIN;\n-- No satış faturaları, INSERT atlanıyor.\nCOMMIT;")
        return

    fatura_tipi = {f["id"]: f["faturaTipi"] for f in faturalar}
    kalemler = [k for k in kalemler if k.get("faturaId") in fatura_tipi]

    print("-- Satış faturaları (SATIS/SATIS_IADE) + kalemler + stok hareketleri (malzeme hareketi, ambar 01)")
    print("-- İlişkiler: Fatura -> FaturaKalemi -> StokHareket (faturaKalemiId); Fatura -> Cari (cariId).")
    print("-- Cari bakiye ve cari_hareketler için import-cari-hareketleri-satis.sql çalıştırın.")
    print("BEGIN;")

    # 1) Faturalar
    print("\n-- Faturalar")
    print('INSERT INTO faturalar (id, "faturaNo", "faturaTipi", "tenantId", "cariId", tarih, vade, iskonto, "toplamTutar", "kdvTutar", "genelToplam", "dovizCinsi", "dovizKuru", aciklama, durum, "odenecekTutar", "odenenTutar", "siparisNo", "createdBy", "deletedAt", "deletedBy", "updatedBy", "createdAt", "updatedAt")')
    print("VALUES")
    rows = []
    for r in faturalar:
        t = r.get("tarih")
        if t:
            t = str(t).replace("T", " ").replace("Z", "")[:26]
            if t.startswith("2526"):
                t = "2026" + t[4:]
            tarih = "'" + t + "'"
        else:
            tarih = "NULL"
        vade = dt(r.get("vade"))
        created = dt(r.get("createdAt"))
        updated = dt(r.get("updatedAt"))
        deleted = dt(r.get("deletedAt"))
        odec = r.get("odenecekTutar")
        odec_sql = str(float(odec)) if odec is not None else "NULL"
        rows.append(
            f"  ({esc(r['id'])}, {esc(r['faturaNo'])}, {esc(r['faturaTipi'])}, {esc(TENANT_ID)}, {esc(r['cariId'])}, "
            f"{tarih}, {vade}, {float(r.get('iskonto', 0))}, {float(r.get('toplamTutar', 0))}, {float(r.get('kdvTutar', 0))}, {float(r.get('genelToplam', 0))}, "
            f"'TRY', 1, {esc(r.get('aciklama'))}, {esc(r.get('durum', 'ACIK'))}, "
            f"{odec_sql}, {float(r.get('odenenTutar', 0))}, "
            f"{esc(r.get('siparisNo'))}, {esc(r.get('createdBy'))}, {deleted}, {esc(r.get('deletedBy'))}, {esc(r.get('updatedBy'))}, {created}, {updated})"
        )
    print(",\n".join(rows))
    print('ON CONFLICT (id) DO UPDATE SET "tenantId" = EXCLUDED."tenantId", "faturaNo" = EXCLUDED."faturaNo", tarih = EXCLUDED.tarih, "updatedAt" = EXCLUDED."updatedAt";')

    # 2) Fatura kalemleri
    print("\n-- Fatura kalemleri (malzeme satırları)")
    print('INSERT INTO fatura_kalemleri (id, "faturaId", "stokId", miktar, "birimFiyat", "kdvOrani", "kdvTutar", tutar, "iskontoOrani", "iskontoTutari", raf, "createdAt")')
    print("VALUES")
    k_rows = []
    for k in kalemler:
        k_rows.append(
            f"  ({esc(k['id'])}, {esc(k['faturaId'])}, {esc(k['stokId'])}, {int(k['miktar'])}, {float(k['birimFiyat'])}, "
            f"{int(k['kdvOrani'])}, {float(k['kdvTutar'])}, {float(k['tutar'])}, 0, 0, {esc(k.get('raf'))}, {dt(k.get('createdAt'))})"
        )
    print(",\n".join(k_rows))
    print('ON CONFLICT (id) DO UPDATE SET "faturaId" = EXCLUDED."faturaId", "stokId" = EXCLUDED."stokId", miktar = EXCLUDED.miktar, "birimFiyat" = EXCLUDED."birimFiyat";')

    # 3) Stok hareketleri (malzeme hareketleri) - SATIS = CIKIS, SATIS_IADE = GIRIS; faturaKalemiId ile fatura kalemine bağlı
    # Deterministik id: aynı kalem tekrar import edilirse çift hareket oluşmaz (ON CONFLICT)
    print("\n-- Stok hareketleri (malzeme hareketleri, faturaKalemiId ile fatura kalemine bağlı)")
    hareket_tipi = {"SATIS": "CIKIS", "SATIS_IADE": "GIRIS"}
    h_rows = []
    for k in kalemler:
        tip = fatura_tipi.get(k["faturaId"], "SATIS")
        ht = hareket_tipi.get(tip, "CIKIS")
        # Deterministic UUID so re-run does not duplicate
        sh_id = str(uuid.uuid5(NAMESPACE_SATIS_IMPORT, k["id"]))
        h_rows.append(
            f"  ('{sh_id}', {esc(k['stokId'])}, '{ht}', {int(k['miktar'])}, {float(k['birimFiyat'])}, NULL, {esc(WAREHOUSE_01_ID)}, {esc(TENANT_ID)}, {esc(k['id'])})"
        )
    print('INSERT INTO stok_hareketleri (id, "stokId", "hareketTipi", miktar, "birimFiyat", aciklama, "warehouseId", "tenantId", "faturaKalemiId")')
    print("VALUES")
    print(",\n".join(h_rows))
    print('ON CONFLICT (id) DO UPDATE SET miktar = EXCLUDED.miktar, "birimFiyat" = EXCLUDED."birimFiyat";')

    print("\nCOMMIT;")


if __name__ == "__main__":
    main()
