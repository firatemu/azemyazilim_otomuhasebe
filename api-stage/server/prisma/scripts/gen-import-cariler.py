#!/usr/bin/env python3
"""Read remote-cariler.json and print INSERT SQL for local cariler (with tenantId)."""
import json
import sys

def esc(s):
    if s is None: return "NULL"
    return "'" + str(s).replace("'", "''") + "'"

path = "remote-cariler.json"
if len(sys.argv) > 1:
    path = sys.argv[1]
with open(path, "r", encoding="utf-8") as f:
    rows = json.load(f)

TENANT_ID = "clxyedekparca00001"

print("-- Cari hesapları import (Yedek Parça tenant)")
print("BEGIN;")
print("INSERT INTO cariler (id, \"cariKodu\", \"tenantId\", unvan, tip, \"sirketTipi\", \"vergiNo\", \"vergiDairesi\", \"tcKimlikNo\", \"isimSoyisim\", telefon, email, ulke, il, ilce, adres, yetkili, bakiye, \"vadeSuresi\", aktif, \"createdAt\", \"updatedAt\")")
print("VALUES")

values = []
for r in rows:
    vals = [
        esc(r["id"]),
        esc(r["cariKodu"]),
        esc(TENANT_ID),
        esc(r["unvan"]),
        esc(r["tip"]),
        esc(r.get("sirketTipi") or "KURUMSAL"),
        esc(r.get("vergiNo")),
        esc(r.get("vergiDairesi")),
        esc(r.get("tcKimlikNo")),
        esc(r.get("isimSoyisim")),
        esc(r.get("telefon")),
        esc(r.get("email")),
        esc(r.get("ulke") or "Türkiye"),
        esc(r.get("il")),
        esc(r.get("ilce")),
        esc(r.get("adres")),
        esc(r.get("yetkili")),
        str(float(r.get("bakiye", 0))),
        str(r["vadeSuresi"]) if r.get("vadeSuresi") is not None else "NULL",
        "true" if r.get("aktif", True) else "false",
        "'" + r["createdAt"].replace("T", " ").replace("Z", "") + "'",
        "'" + r["updatedAt"].replace("T", " ").replace("Z", "") + "'",
    ]
    values.append("  (" + ", ".join(vals) + ")")

print(",\n".join(values))
print("ON CONFLICT (id) DO UPDATE SET")
print('  "cariKodu" = EXCLUDED."cariKodu", "tenantId" = EXCLUDED."tenantId", unvan = EXCLUDED.unvan, tip = EXCLUDED.tip,')
print('  "sirketTipi" = EXCLUDED."sirketTipi", "vergiNo" = EXCLUDED."vergiNo", "vergiDairesi" = EXCLUDED."vergiDairesi",')
print('  "tcKimlikNo" = EXCLUDED."tcKimlikNo", "isimSoyisim" = EXCLUDED."isimSoyisim", telefon = EXCLUDED.telefon, email = EXCLUDED.email,')
print('  ulke = EXCLUDED.ulke, il = EXCLUDED.il, ilce = EXCLUDED.ilce, adres = EXCLUDED.adres, yetkili = EXCLUDED.yetkili,')
print('  bakiye = EXCLUDED.bakiye, "vadeSuresi" = EXCLUDED."vadeSuresi", aktif = EXCLUDED.aktif, "updatedAt" = EXCLUDED."updatedAt";')
print("COMMIT;")
