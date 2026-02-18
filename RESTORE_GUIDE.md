# 🚀 OtoMuhasebe Yerel Kurulum ve Geri Yükleme Rehberi

Bu rehber, sunucudan alınan tam yedeğin kendi bilgisayarınızda (Localhost) nasıl ayağa kaldırılacağını adım adım açıklar.

## 🛠 Ön Gereksinimler

Yedeği bilgisayarınızda çalıştırmak için şu araçların kurulu olması gerekir:
1. **Docker & Docker Desktop** (Windows/Mac/Linux)
2. **Git**
3. **Pnpm** (Opsiyonel, docker içinde pnpm kullanılmaktadır)

---

## 📂 1. Yedeği Açma

İndirdiğiniz `otomuhasebe_full_backup_[tarih].tar.gz` dosyasını bir klasöre çıkartın:
```bash
tar -xzf otomuhasebe_full_backup_[tarih].tar.gz
cd otomuhasebe_full_backup_[tarih]
```

## 🏗 2. Klasör Yapısını Hazırlama

Yerel bilgisayarınızda aşağıdaki yapıyı oluşturun (Dosyaları bu düzene göre yerleştirin):
```text
/calisma-alani
  ├── api-stage/              (api-stage_source.tar.gz içeriği buraya)
  ├── panel-stage/
  │    └── client/            (panel-stage-client_source.tar.gz içeriği buraya)
  ├── docker/
  │    └── compose/
  │         ├── docker-compose.base.yml
  │         └── docker-compose.staging.dev.yml
  └── .env.staging
```

## 🐘 3. Veritabanını Geri Yükleme

1. Önce altyapı servislerini başlatın:
   ```bash
   docker compose -f docker/compose/docker-compose.base.yml up -d postgres redis minio
   ```
2. Veritabanı dump dosyasını yükleyin:
   ```bash
   # Dump dosyasını postgres container içine kopyalayın
   docker cp database_dump.sql otomuhasebe-postgres:/database_dump.sql
   
   # Yükleme komutunu çalıştırın
   docker exec -it otomuhasebe-postgres psql -U postgres -d otomuhasebe_stage -f /database_dump.sql
   ```

## 📦 4. Minio (Dosya Depolama) Verilerini Yükleme

Minio verilerini sisteminize geri yüklemek için:
```bash
# Minio verilerini çıkartın
tar -xzf minio_data.tar.gz
# Çıkan dosyaları Docker'ın minio volume'una veya bind path'ine taşıyın
# (Varsayılan olarak /opt/minio-data kullanılır, yerel makinenizde bu yolu ayarlayabilirsiniz)
```

## 🚀 5. Uygulamayı Başlatma

Tüm yapıyı ayağa kaldırmak için:
```bash
docker compose -f docker/compose/docker-compose.base.yml -f docker/compose/docker-compose.staging.dev.yml up -d
```

Uygulama şu adreslerden erişilebilir olacaktır (Caddy ayarlarınıza göre değişebilir):
- **Backend API**: `http://localhost:3020`
- **Frontend Panel**: `http://localhost:3000`

---

## 💡 İpuçları
- `.env.staging` içindeki `CORS_ORIGINS` ve API URL'lerini gerekirse `localhost` olarak güncelleyin.
- Eğer Windows kullanıyorsanız `tar` komutları yerine WinRAR/7-Zip kullanabilirsiniz.
