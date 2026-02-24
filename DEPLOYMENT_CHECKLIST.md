# Staging Migrasyon Kontrol Listesi

stnoto.com sunucusunda kurulum sırasında takip edilecek adımlar.

---

## Mevcut Sunucuda (Backup Öncesi)

- [ ] Tüm servisler çalışıyor (postgres, redis, minio, backend, panel)
- [ ] `./scripts/backup-all.sh` çalıştırıldı
- [ ] `backups/staging_full_*/` klasörü oluşturuldu
- [ ] Taşınabilir arşiv oluşturuldu: `tar -czf staging_backup_*.tar.gz -C backups staging_full_*`
- [ ] Arşiv yeni sunucuya aktarıldı (scp/rsync)

---

## Yeni Sunucuda – Hazırlık

- [ ] Ubuntu 22.04 güncel
- [ ] Docker kuruldu (`docker --version`)
- [ ] Docker Compose kuruldu (`docker compose version`)
- [ ] Git kuruldu
- [ ] Kullanıcı `docker` grubunda

---

## DNS

- [ ] `stnoto.com` A kaydı → sunucu IP
- [ ] `api.stnoto.com` A kaydı → sunucu IP
- [ ] `www.stnoto.com` A kaydı → sunucu IP
- [ ] `dig stnoto.com +short` ile doğrulama

---

## Proje ve Backup

- [ ] `/var/www/otomuhasebe` oluşturuldu
- [ ] `git clone` ile proje alındı
- [ ] Backup arşivi `backups/` içine çıkarıldı
- [ ] `backups/staging_full_*/` klasörü mevcut

---

## Veri Restore

- [ ] `docker compose -f docker-compose.base.yml up -d postgres redis minio`
- [ ] PostgreSQL restore tamamlandı
- [ ] MinIO restore tamamlandı (veya bucket boş)
- [ ] Uploads klasörü restore edildi

---

## Yapılandırma

- [ ] `.env.staging` oluşturuldu (backup veya example'dan)
- [ ] `CORS_ORIGINS` yeni domain'lerle güncellendi
- [ ] `NEXT_PUBLIC_API_BASE_URL` = `https://api.stnoto.com`
- [ ] `VITE_API_BASE_URL` = `https://api.stnoto.com`
- [ ] Şifreler ve secret'lar yeni ortam için güncellendi (önerilir)
- [ ] Caddyfile'da stnoto.com blokları var

---

## Servisler

- [ ] `make up-staging` veya `docker compose ... up -d` çalıştırıldı
- [ ] `make migrate-staging` çalıştırıldı
- [ ] `docker ps` ile tüm container'lar çalışıyor
- [ ] `curl http://localhost:3020/api/health` başarılı
- [ ] `curl http://localhost:3010` başarılı

---

## SSL ve Erişim

- [ ] Port 80 ve 443 açık
- [ ] `https://stnoto.com` açılıyor
- [ ] `https://api.stnoto.com/api/health` başarılı
- [ ] Tarayıcıda giriş testi yapıldı

---

## Son Kontroller

- [ ] Mevcut kullanıcı ile giriş yapılabiliyor
- [ ] Cari, stok, fatura vb. veriler görünüyor
- [ ] Dosya yükleme (logo vb.) çalışıyor
- [ ] `docker compose logs` ile hata kontrolü yapıldı
