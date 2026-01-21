# Form Controls Style Guide

Bu dokümanda, projede kullanılacak standart form kontrol stilleri açıklanmaktadır.

## 📋 Kullanılabilir CSS Class'ları

### 1. `form-control-select` - Select/Dropdown için

Material-UI Select/Dropdown bileşenleri için kullanılır.

**Özellikler:**
- ✅ Dark mode uyumlu
- ✅ Tutarlı font (AR One Sans)
- ✅ Disabled state desteği
- ✅ Hover ve focus efektleri
- ✅ Tutarlı renkler (CSS variables)

**Kullanım:**

```tsx
<FormControl fullWidth size="small" className="form-control-select">
  <InputLabel>Kategori</InputLabel>
  <Select
    label="Kategori"
    value={selectedValue}
    onChange={handleChange}
  >
    <MenuItem value="">Hepsi</MenuItem>
    <MenuItem value="option1">Seçenek 1</MenuItem>
  </Select>
</FormControl>
```

**Disabled Kullanımı:**

```tsx
<FormControl 
  fullWidth 
  size="small" 
  disabled={!isEnabled}
  className="form-control-select"
>
  <InputLabel>Alt Kategori</InputLabel>
  <Select label="Alt Kategori" value={value}>
    {/* options */}
  </Select>
</FormControl>
```

### 2. `form-control-textfield` - TextField için

Material-UI TextField bileşenleri için kullanılır.

**Özellikler:**
- ✅ Dark mode uyumlu
- ✅ Tutarlı font (AR One Sans)
- ✅ Hover ve focus efektleri
- ✅ Tutarlı renkler (CSS variables)

**Kullanım:**

```tsx
<TextField
  fullWidth
  size="small"
  className="form-control-textfield"
  placeholder="Arama yapın..."
  value={searchValue}
  onChange={handleSearch}
/>
```

**Label ile kullanım:**

```tsx
<TextField
  fullWidth
  label="Stok Kodu"
  className="form-control-textfield"
  value={stokKodu}
  onChange={handleChange}
/>
```

**Helper Text ve Placeholder:**

```tsx
<TextField
  fullWidth
  label="Barkod"
  className="form-control-textfield"
  placeholder="Örn: 8690123456789"
  helperText="Ürün barkod numarası"
  value={barkod}
  onChange={handleChange}
/>
```

**Autocomplete ile kullanım:**

```tsx
<Autocomplete
  fullWidth
  options={options}
  renderInput={(params) => (
    <TextField
      {...params}
      className="form-control-textfield"
      label="Seçim yapın"
      placeholder="Ara..."
    />
  )}
/>
```

## 🎨 Kullanılan CSS Variables

Tüm class'lar aşağıdaki CSS değişkenlerini kullanır:

- `--input`: Input arka plan rengi
- `--border`: Border rengi
- `--ring`: Focus border rengi (hover/focus)
- `--foreground`: Metin rengi (input text)
- `--muted-foreground`: İkincil metin rengi (label, helper text, placeholder)
- `--font-sans`: Font ailesi (AR One Sans)

**Otomatik Uygulanan Stiller:**
- Helper text renkleri dark mode'da otomatik ayarlanır
- Placeholder opacity: 0.7 ile görünürlük sağlanır
- Disabled state'de text rengi korunur (opacity ile soluklaştırılır)

## 🌙 Dark Mode Desteği

Tüm class'lar otomatik olarak dark mode'u destekler. Ek bir stil eklemenize gerek yoktur.

## 📝 Örnek Sayfa Kullanımı

```tsx
import { FormControl, InputLabel, Select, MenuItem, TextField } from '@mui/material';

function MyPage() {
  return (
    <Box>
      {/* Arama TextField */}
      <TextField
        fullWidth
        size="small"
        className="form-control-textfield"
        placeholder="Ara..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />

      {/* Kategori Select */}
      <FormControl fullWidth size="small" className="form-control-select">
        <InputLabel>Kategori</InputLabel>
        <Select
          label="Kategori"
          value={kategori}
          onChange={(e) => setKategori(e.target.value)}
        >
          <MenuItem value="">Hepsi</MenuItem>
          <MenuItem value="cat1">Kategori 1</MenuItem>
          <MenuItem value="cat2">Kategori 2</MenuItem>
        </Select>
      </FormControl>

      {/* Disabled Alt Kategori Select */}
      <FormControl 
        fullWidth 
        size="small" 
        disabled={!kategori}
        className="form-control-select"
      >
        <InputLabel>Alt Kategori</InputLabel>
        <Select
          label="Alt Kategori"
          value={altKategori}
          onChange={(e) => setAltKategori(e.target.value)}
        >
          <MenuItem value="">Hepsi</MenuItem>
          <MenuItem value="sub1">Alt Kategori 1</MenuItem>
        </Select>
      </FormControl>
    </Box>
  );
}
```

## ⚠️ Önemli Notlar

1. **Class'ı FormControl/TextField'e ekleyin**, Select'e değil
2. **sx prop ile birlikte kullanılabilir** (ek özel stiller için)
3. **Size prop'u her zaman ekleyin** (örn: `size="small"`)
4. **Label ve value her zaman eşleşmeli** (Select için)

## 🔄 Güncelleme

Bu class'lar `/var/www/panel-stage/client/src/app/globals.css` dosyasında tanımlıdır.

Değişiklik yapmak için bu dosyayı düzenleyin ve tüm sayfalar otomatik olarak güncellenecektir.

## 📚 Referans Sayfalar

Bu class'ların kullanıldığı örnek sayfalar:

- `/stok/malzeme-listesi` - Malzeme Listesi (liste + dialog)
- `/satis-irsaliyesi` - Satış İrsaliyeleri Listesi
- `/satis-irsaliyesi/yeni` - Yeni Satış İrsaliyesi

## 🎯 CSS Implementasyon Detayları

### Helper Text ve Placeholder Stilleri

**Helper Text:**
```css
.form-control-textfield .MuiFormHelperText-root {
  color: var(--muted-foreground) !important;
}

.form-control-select .MuiFormHelperText-root {
  color: var(--muted-foreground) !important;
}
```

**Placeholder:**
```css
.form-control-textfield .MuiInputBase-input::placeholder {
  color: var(--muted-foreground) !important;
  opacity: 0.7;
}
```

### Dialog Kullanımı

Dialog içinde kullanırken background ayarlaması:

```tsx
<Dialog
  open={open}
  onClose={onClose}
  PaperProps={{
    sx: { 
      bgcolor: 'var(--card)',
      backgroundImage: 'none'
    }
  }}
>
  <DialogContent sx={{ bgcolor: 'var(--background)' }}>
    {/* Form elemanları */}
    <TextField className="form-control-textfield" ... />
    <FormControl className="form-control-select">...</FormControl>
  </DialogContent>
</Dialog>
```

### Tablo İçinde Kullanım

Tablolarda form elemanları için:

```tsx
<TableContainer component={Paper} sx={{ bgcolor: 'var(--card)' }}>
  <Table>
    <TableHead>
      <TableRow sx={{ bgcolor: 'var(--muted)' }}>
        <TableCell sx={{ color: 'var(--foreground)', fontWeight: 700 }}>
          Başlık
        </TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      <TableRow sx={{ 
        '&:hover': { bgcolor: 'var(--muted)' },
        borderBottom: '1px solid var(--border)'
      }}>
        <TableCell sx={{ color: 'var(--foreground)' }}>
          <TextField className="form-control-textfield" size="small" />
        </TableCell>
      </TableRow>
    </TableBody>
  </Table>
</TableContainer>
```

## 💡 Best Practices

1. **Her zaman class kullanın**: Tekrar eden inline styles yerine bu class'ları kullanın
2. **Helper text ekleyin**: Kullanıcı deneyimi için açıklayıcı metinler ekleyin
3. **Placeholder kullanın**: Örnek değerler gösterin
4. **Disabled state**: Disabled olduğunda helper text ile açıklama yapın
5. **Dialog background**: Dialog'larda mutlaka background renklerini ayarlayın
6. **Tablo renkleri**: Tablolarda tüm text renkleri CSS variable kullanmalı

## 📊 Global Table Styles

Tüm Material-UI tablolar için otomatik uygulanan global stiller:

```css
/* Tablo Container */
.MuiTableContainer-root {
  background-color: var(--card);
}

/* Tablo Başlıkları */
.MuiTableHead-root .MuiTableCell-root {
  background-color: var(--muted);
  font-weight: 700;
}

/* Tablo Satırları */
.MuiTableBody-root .MuiTableRow-root {
  background-color: var(--background);
  border-bottom: 1px solid var(--border);
}

/* Hover Durumu */
.MuiTableBody-root .MuiTableRow-root:hover {
  background-color: var(--muted) !important;
}
```

**Kullanım:**
```tsx
// Hiçbir ek stil gerekmez, otomatik uygulanır
<TableContainer component={Paper}>
  <Table>
    <TableHead>
      <TableRow>
        <TableCell>Başlık</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      <TableRow>
        <TableCell sx={{ color: 'var(--foreground)' }}>Veri</TableCell>
      </TableRow>
    </TableBody>
  </Table>
</TableContainer>
```

## 🔧 Troubleshooting

**Sorun:** Dark mode'da helper text görünmüyor
**Çözüm:** `!important` kullanıldığından emin olun veya global CSS'i kontrol edin

**Sorun:** Placeholder çok koyu görünüyor
**Çözüm:** `opacity: 0.7` ayarlandığından emin olun

**Sorun:** Disabled state'de text görünmüyor
**Çözüm:** `form-control-select` class'ı disabled özel styling içerir, kullanın

**Sorun:** Dialog arka planı yanlış renkte
**Çözüm:** `PaperProps` ve `DialogContent` sx prop'larını ayarlayın

**Sorun:** Tablo arka planı farklı renkte
**Çözüm:** Global table CSS'leri otomatik uygulanır, ekstra stil gerekmez

---

**Son Güncelleme:** 2026-01-21
**Versiyon:** 1.2.0
**Changelog:**
- v1.2.0: Global table CSS stilleri eklendi (otomatik uygulanır)
- v1.2.0: Tablo arka plan ve hover durumları CSS'e taşındı
- v1.1.0: Helper text ve placeholder stilleri eklendi
- v1.1.0: Dialog ve tablo kullanım örnekleri eklendi
- v1.1.0: Best practices ve troubleshooting bölümleri eklendi
- v1.0.0: İlk versiyon
