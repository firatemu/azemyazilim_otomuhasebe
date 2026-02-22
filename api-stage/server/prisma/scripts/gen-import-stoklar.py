#!/usr/bin/env python3
"""
Read remote-stoklar.json and print INSERT SQL for stoklar (malzeme kartları).
Sets tenantId, esdegerGrupId=NULL, sadeceKategoriTanimi=false, sadeceMarkaTanimi=false.
Batches of 100 rows per INSERT to avoid huge statements.
"""
import json
import sys

def esc(s):
    if s is None:
        return "NULL"
    return "'" + str(s).replace("'", "''") + "'"

def row_vals(r):
    def dt(s):
        if s is None or s == "":
            return "NULL"
        return "'" + str(s).replace("T", " ").replace("Z", "")[:26] + "'"
    return (
        f"  ({esc(r.get('id'))}, {esc(r.get('stokKodu'))}, {esc(TENANT_ID)}, {esc(r.get('stokAdi'))}, "
        f"{esc(r.get('aciklama'))}, {esc(r.get('birim') or 'Adet')}, {float(r.get('alisFiyati', 0))}, {float(r.get('satisFiyati', 0))}, "
        f"{int(r.get('kdvOrani', 20))}, {int(r.get('kritikStokMiktari', 0))}, "
        f"{esc(r.get('kategori'))}, {esc(r.get('anaKategori'))}, {esc(r.get('altKategori'))}, "
        f"{esc(r.get('marka'))}, {esc(r.get('model'))}, {esc(r.get('oem'))}, {esc(r.get('olcu'))}, "
        f"{esc(r.get('raf'))}, {esc(r.get('barkod'))}, NULL, NULL, "
        f"{esc(r.get('aracMarka'))}, {esc(r.get('aracModel'))}, {esc(r.get('aracMotorHacmi'))}, {esc(r.get('aracYakitTipi'))}, "
        f"{dt(r.get('createdAt'))}, {dt(r.get('updatedAt'))}, false, false)"
    )

TENANT_ID = "clxyedekparca00001"
BATCH = 100

path = "remote-stoklar.json"
if len(sys.argv) > 1:
    path = sys.argv[1]
with open(path, "r", encoding="utf-8") as f:
    rows = json.load(f)

print("-- Malzeme kartları (stoklar) import - Yedek Parça tenant")
print("-- esdegerGrupId ve tedarikciKodu NULL atandı.")
print("BEGIN;")

for i in range(0, len(rows), BATCH):
    chunk = rows[i : i + BATCH]
    print(f"\n-- Rows {i+1}-{i+len(chunk)}")
    print("INSERT INTO stoklar (id, \"stokKodu\", \"tenantId\", \"stokAdi\", aciklama, birim, \"alisFiyati\", \"satisFiyati\", \"kdvOrani\", \"kritikStokMiktari\", kategori, \"anaKategori\", \"altKategori\", marka, model, oem, olcu, raf, barkod, \"tedarikciKodu\", \"esdegerGrupId\", \"aracMarka\", \"aracModel\", \"aracMotorHacmi\", \"aracYakitTipi\", \"createdAt\", \"updatedAt\", \"sadeceKategoriTanimi\", \"sadeceMarkaTanimi\")")
    print("VALUES")
    print(",\n".join(row_vals(r) for r in chunk))
    on_conflict = (
        'ON CONFLICT (id) DO UPDATE SET "stokKodu" = EXCLUDED."stokKodu", "tenantId" = EXCLUDED."tenantId", '
        '"stokAdi" = EXCLUDED."stokAdi", aciklama = EXCLUDED.aciklama, birim = EXCLUDED.birim, '
        '"alisFiyati" = EXCLUDED."alisFiyati", "satisFiyati" = EXCLUDED."satisFiyati", '
        '"kdvOrani" = EXCLUDED."kdvOrani", "kritikStokMiktari" = EXCLUDED."kritikStokMiktari", '
        'kategori = EXCLUDED.kategori, "anaKategori" = EXCLUDED."anaKategori", "altKategori" = EXCLUDED."altKategori", '
        'marka = EXCLUDED.marka, model = EXCLUDED.model, oem = EXCLUDED.oem, olcu = EXCLUDED.olcu, '
        'raf = EXCLUDED.raf, barkod = EXCLUDED.barkod, "aracMarka" = EXCLUDED."aracMarka", '
        '"aracModel" = EXCLUDED."aracModel", "aracMotorHacmi" = EXCLUDED."aracMotorHacmi", '
        '"aracYakitTipi" = EXCLUDED."aracYakitTipi", "updatedAt" = EXCLUDED."updatedAt";'
    )
    print(on_conflict)

print("\nCOMMIT;")
