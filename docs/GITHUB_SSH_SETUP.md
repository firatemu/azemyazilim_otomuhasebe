# GitHub SSH ile Push (Kimlik Doğrulama)

Bu projede push için SSH kullanılıyor. Aşağıdaki adımları tamamlayın.

## 1. SSH public key'inizi kopyalayın

Terminalde çalıştırın (panoya kopyalanır veya çıktıyı kopyalayın):

```bash
cat ~/.ssh/id_ed25519.pub
```

Çıktı şuna benzer olacak:
```
ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIPwFQcEFnUmaX2liWK4PDgPJm7jguZlNhNvmpx/9FqGK azem@otomuhasebe
```

Tüm satırı kopyalayın.

## 2. GitHub'a key ekleyin

1. https://github.com/settings/keys adresine gidin
2. **"New SSH key"** tıklayın
3. **Title:** Örn. `WSL Otomuhasebe` veya `Cursor`
4. **Key:** Kopyaladığınız public key'i yapıştırın
5. **"Add SSH key"** tıklayın

## 3. Push'ı tekrar deneyin

```bash
cd /home/azem/projects/otomuhasebe
git push origin main
```

Başarılı olursa GitHub Actions tetiklenir (main branch için staging-deploy workflow'u).

## Remote URL kontrolü

Remote zaten SSH'ye çevrildi:

```bash
git remote -v
# origin  git@github.com:firatemu/otomuhasebe.git (fetch)
# origin  git@github.com:firatemu/otomuhasebe.git (push)
```

HTTPS'e geri dönmek isterseniz:

```bash
git remote set-url origin https://github.com/firatemu/otomuhasebe.git
```

(HTTPS için kullanıcı adı + Personal Access Token gerekir.)
