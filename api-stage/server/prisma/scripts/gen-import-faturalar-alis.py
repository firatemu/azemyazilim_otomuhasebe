#!/usr/bin/env python3
"""
Import satınalma faturaları (ALIS, ALIS_IADE) + kalemler + stok_hareketleri.
Tüm stok hareketleri "01" kodlu ambara (WAREHOUSE_01_ID) yazılır.
"""
import json
import sys

TENANT_ID = "clxyedekparca00001"
WAREHOUSE_01_ID = "eb067e72-b52b-45fd-94d6-510cd5df7eba"

def esc(s):
    if s is None:
        return "NULL"
    return "'" + str(s).replace("'", "''") + "'"

def dt(s):
    if s is None or s == "":
        return "NULL"
    x = str(s).replace("T", " ").replace("Z", "")[:26]
    if x.startswith("2526"):  # typo on remote
        x = "2026" + x[4:]
    return "'" + x + "'"

def main():
    with open("remote-faturalar-alis.json", "r", encoding="utf-8") as f:
        faturalar = json.load(f)
    with open("remote-fatura-kalemleri-alis.json", "r", encoding="utf-8") as f:
        kalemler = json.load(f)

    fatura_tipi = {f["id"]: f["faturaTipi"] for f in faturalar}

    print("-- Satınalma faturaları (ALIS/ALIS_IADE) + kalemler + stok hareketleri (ambar 01)")
    print("BEGIN;")

    # 1) Faturalar - purchaseOrderId ve satinAlmaSiparisiId NULL (import etmiyoruz)
    print("\n-- Faturalar")
    print("INSERT INTO faturalar (id, \"faturaNo\", \"faturaTipi\", \"tenantId\", \"cariId\", tarih, vade, iskonto, \"toplamTutar\", \"kdvTutar\", \"genelToplam\", \"dovizCinsi\", \"dovizKuru\", aciklama, durum, \"odenecekTutar\", \"odenenTutar\", \"siparisNo\", \"createdBy\", \"deletedAt\", \"deletedBy\", \"updatedBy\", \"createdAt\", \"updatedAt\")")
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
    print("ON CONFLICT (id) DO UPDATE SET \"tenantId\" = EXCLUDED.\"tenantId\", \"faturaNo\" = EXCLUDED.\"faturaNo\", tarih = EXCLUDED.tarih, \"updatedAt\" = EXCLUDED.\"updatedAt\";")

    # 2) Fatura kalemleri (iskontoOrani, iskontoTutari = 0)
    print("\n-- Fatura kalemleri")
    print("INSERT INTO fatura_kalemleri (id, \"faturaId\", \"stokId\", miktar, \"birimFiyat\", \"kdvOrani\", \"kdvTutar\", tutar, \"iskontoOrani\", \"iskontoTutari\", raf, \"createdAt\")")
    print("VALUES")
    k_rows = []
    for k in kalemler:
        k_rows.append(
            f"  ({esc(k['id'])}, {esc(k['faturaId'])}, {esc(k['stokId'])}, {int(k['miktar'])}, {float(k['birimFiyat'])}, "
            f"{int(k['kdvOrani'])}, {float(k['kdvTutar'])}, {float(k['tutar'])}, 0, 0, {esc(k.get('raf'))}, {dt(k.get('createdAt'))})"
        )
    print(",\n".join(k_rows))
    print("ON CONFLICT (id) DO UPDATE SET \"faturaId\" = EXCLUDED.\"faturaId\", \"stokId\" = EXCLUDED.\"stokId\", miktar = EXCLUDED.miktar, \"birimFiyat\" = EXCLUDED.\"birimFiyat\";")
    # Local fatura_kalemleri has no updatedAt - check. Actually the table has only createdAt. So ON CONFLICT DO UPDATE we need to not set updatedAt. Remove that part.
    # Let me fix: fatura_kalemleri local has no updatedAt column. So just do ON CONFLICT (id) DO UPDATE SET ... without updatedAt.
    # I already wrote "updatedAt\" = fatura_kalemleri.\"createdAt\"" but local table might not have updatedAt. Let me check - we had createdAt only. So change to DO NOTHING or minimal update.
    # I'll use DO UPDATE SET the main fields so re-run is idempotent.

    # 3) Stok hareketleri - her kalem için bir GIRIS (ALIS) veya CIKIS (ALIS_IADE), warehouseId = 01
    # id = 'sh-import-' || faturaKalemiId so re-run is idempotent
    print("\n-- Stok hareketleri (ambar 01)")
    hareket_tipi = {"ALIS": "GIRIS", "ALIS_IADE": "CIKIS"}
    h_rows = []
    for k in kalemler:
        tip = fatura_tipi.get(k["faturaId"], "ALIS")
        ht = hareket_tipi.get(tip, "GIRIS")
        hid = "'sh-import-' || " + esc(k["id"])
        h_rows.append(
            f"  ({hid}, {esc(k['stokId'])}, '{ht}', {int(k['miktar'])}, {float(k['birimFiyat'])}, NULL, {esc(WAREHOUSE_01_ID)}, {esc(TENANT_ID)}, {esc(k['id'])})"
        )
    print("INSERT INTO stok_hareketleri (id, \"stokId\", \"hareketTipi\", miktar, \"birimFiyat\", aciklama, \"warehouseId\", \"tenantId\", \"faturaKalemiId\")")
    print("VALUES")
    print(",\n".join(h_rows))
    print("ON CONFLICT (id) DO UPDATE SET miktar = EXCLUDED.miktar, \"birimFiyat\" = EXCLUDED.\"birimFiyat\";")
    # Actually stok_hareketleri we're inserting new rows with gen_random_uuid() so no conflict. But we might run script twice - then we'd duplicate stok_hareketleri. So better: INSERT only if not exists for (faturaKalemiId)? There's no unique on faturaKalemiId. So we could add a condition: only insert stok_hareketleri when faturaKalemiId not in (select id from stok_hareketleri). That's complex. Simpler: run once; if run twice, skip duplicate by checking faturaKalemiId. Or use ON CONFLICT DO NOTHING and id from a deterministic source. Let me use a deterministic id: hash of faturaKalemiId so same kalem = same hareket id. Then ON CONFLICT (id) DO NOTHING. So: id = md5(faturaKalemiId)::uuid or something. Or just use gen_random_uuid() and if user runs twice they get duplicate movements - we document that. For now leave as is.

    print("\nCOMMIT;")

if __name__ == "__main__":
    main()
