#!/usr/bin/env python3
"""Read remote-markalar.json and print INSERT SQL for marka tanımı stok records."""
import json
import sys

def esc(s):
    if s is None:
        return "NULL"
    return "'" + str(s).replace("'", "''") + "'"

path = "remote-markalar.json"
if len(sys.argv) > 1:
    path = sys.argv[1]
with open(path, "r", encoding="utf-8") as f:
    markalar = json.load(f)

TENANT_ID = "clxyedekparca00001"

print("-- Marka tanımları import (Yedek Parça tenant) - sadeceMarkaTanimi stok kayıtları")
print("BEGIN;")
values = []
for i, marka in enumerate(markalar, start=1):
    stok_kodu = f"MRK-IMP-{i:06d}"
    stok_adi = f"[Marka Tanımı] {marka}"
    aciklama = "Import: marka tanımı. Gerçek stok kaydı değildir."
    values.append(f"  (gen_random_uuid()::text, {esc(stok_kodu)}, {esc(TENANT_ID)}, {esc(stok_adi)}, {esc(aciklama)}, 'Adet', 0, 0, 20, 0, {esc(marka)}, true, now(), now())")

print("INSERT INTO stoklar (id, \"stokKodu\", \"tenantId\", \"stokAdi\", aciklama, birim, \"alisFiyati\", \"satisFiyati\", \"kdvOrani\", \"kritikStokMiktari\", marka, \"sadeceMarkaTanimi\", \"createdAt\", \"updatedAt\")")
print("VALUES")
print(",\n".join(values))
print('ON CONFLICT ("stokKodu", "tenantId") DO UPDATE SET "stokAdi" = EXCLUDED."stokAdi", marka = EXCLUDED.marka, "sadeceMarkaTanimi" = true, "updatedAt" = now();')
print("COMMIT;")
