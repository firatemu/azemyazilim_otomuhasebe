#!/usr/bin/env python3
"""Read remote-kategoriler.json and print INSERT SQL for kategori tanımı stok records (ana + alt)."""
import json
import sys

def esc(s):
    if s is None:
        return "NULL"
    return "'" + str(s).replace("'", "''") + "'"

path = "remote-kategoriler.json"
if len(sys.argv) > 1:
    path = sys.argv[1]
with open(path, "r", encoding="utf-8") as f:
    rows = json.load(f)

TENANT_ID = "clxyedekparca00001"

print("-- Kategori tanımları import (Yedek Parça tenant) - sadeceKategoriTanimi stok kayıtları")
print("BEGIN;")
values = []
for i, r in enumerate(rows, start=1):
    ana = r.get("anaKategori") or ""
    alt = r.get("altKategori")
    stok_kodu = f"KAT-IMP-{i:06d}"
    if alt:
        stok_adi = f"[Kategori Tanımı] {ana} - {alt}"
    else:
        stok_adi = f"[Ana Kategori Tanımı] {ana}"
    aciklama = "Import: kategori tanımı. Gerçek stok kaydı değildir."
    values.append(
        f"  (gen_random_uuid()::text, {esc(stok_kodu)}, {esc(TENANT_ID)}, {esc(stok_adi)}, {esc(aciklama)}, 'Adet', 0, 0, 20, 0, {esc(ana) if ana else 'NULL'}, {esc(alt) if alt else 'NULL'}, true, now(), now())"
    )

print("INSERT INTO stoklar (id, \"stokKodu\", \"tenantId\", \"stokAdi\", aciklama, birim, \"alisFiyati\", \"satisFiyati\", \"kdvOrani\", \"kritikStokMiktari\", \"anaKategori\", \"altKategori\", \"sadeceKategoriTanimi\", \"createdAt\", \"updatedAt\")")
print("VALUES")
print(",\n".join(values))
print('ON CONFLICT ("stokKodu", "tenantId") DO UPDATE SET "stokAdi" = EXCLUDED."stokAdi", "anaKategori" = EXCLUDED."anaKategori", "altKategori" = EXCLUDED."altKategori", "sadeceKategoriTanimi" = true, "updatedAt" = now();')
print("COMMIT;")
