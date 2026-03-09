'use client';

import React, { useState, useRef } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Alert,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Chip,
  Stack,
} from '@mui/material';
import { UploadFile, Download, Save, Delete, CheckCircle, Error as ErrorIcon } from '@mui/icons-material';
import MainLayout from '@/components/Layout/MainLayout';
import axios from '@/lib/axios';
import * as XLSX from 'xlsx';

interface ExcelRow {
  cariKodu?: string;
  unvan?: string;
  tip?: string;
  sirketTipi?: string;
  vergiNo?: string;
  vergiDairesi?: string;
  tcKimlikNo?: string;
  isimSoyisim?: string;
  telefon?: string;
  email?: string;
  yetkili?: string;
  ulke?: string;
  il?: string;
  ilce?: string;
  adres?: string;
  vadeSuresi?: string;
  aktif?: string | boolean;
}

interface ParsedExcelRow extends ExcelRow {
  rowNumber: number;
  status: 'pending' | 'success' | 'error';
  error?: string;
  cariId?: string;
}

interface ExcelErrorRow {
  rowNumber: number;
  cariKodu?: string;
  message: string;
  category: 'validation' | 'api';
}

const normalizeHeaderKey = (key: string) =>
  key
    .trim()
    .toLowerCase()
    .replace(/ı/g, 'i')
    .replace(/İ/g, 'i')
    .replace(/ğ/g, 'g')
    .replace(/Ğ/g, 'g')
    .replace(/ş/g, 's')
    .replace(/Ş/g, 's')
    .replace(/ç/g, 'c')
    .replace(/Ç/g, 'c')
    .replace(/ö/g, 'o')
    .replace(/Ö/g, 'o')
    .replace(/ü/g, 'u')
    .replace(/Ü/g, 'u')
    .replace(/\s+/g, '');

export default function CariHesapAktarimPage() {
  const [excelData, setExcelData] = useState<ParsedExcelRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' | 'warning' }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const [excelErrors, setExcelErrors] = useState<ExcelErrorRow[]>([]);
  const [excelReportOpen, setExcelReportOpen] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExcelUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setLoading(true);
      const data = await file.arrayBuffer();
      const workbook = XLSX.read(data, { type: 'array' });
      const sheet = workbook.Sheets[workbook.SheetNames[0]];
      if (!sheet) {
        setSnackbar({ open: true, severity: 'error', message: 'Excel sayfası bulunamadı.' });
        return;
      }

      const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: null });
      if (rawRows.length === 0) {
        setSnackbar({ open: true, severity: 'info', message: 'Excel dosyasında veri bulunamadı.' });
        return;
      }

      // Normalize headers
      const normalizedRows = rawRows.map((row) => {
        const normalized: Record<string, unknown> = {};
        Object.keys(row).forEach((key) => {
          const normalizedKey = normalizeHeaderKey(key);
          normalized[normalizedKey] = row[key];
        });
        return normalized;
      });

      const validationErrors: ExcelErrorRow[] = [];
      const parsedData: ParsedExcelRow[] = [];

      for (let index = 0; index < normalizedRows.length; index += 1) {
        const row = normalizedRows[index];
        const rowNumber = index + 2; // +2 because Excel starts at 1 and we have header
        const errors: string[] = [];

        // Extract values with multiple possible keys
        const unvan = (row.unvan || row.ünvan || '') as string;
        const cariKodu = (row.carikodu || row.carikod || row.cari_kodu || '') as string;
        const tip = (row.tip || row.tipi || 'MUSTERI') as string;
        const sirketTipi = (row.sirkettipi || row.sirket_tipi || row.tip || 'KURUMSAL') as string;

        // Validation
        if (!unvan || !unvan.trim()) {
          errors.push('Ünvan zorunludur');
        }

        const parsedRow: ParsedExcelRow = {
          rowNumber,
          cariKodu: cariKodu || '',
          unvan: unvan || '',
          tip: tip === 'TEDARIKCI' || tip === 'tedarikci' ? 'TEDARIKCI' : 'MUSTERI',
          sirketTipi: sirketTipi === 'SAHIS' || sirketTipi === 'sahis' ? 'SAHIS' : 'KURUMSAL',
          vergiNo: (row.vergino || row.vergi_no || '') as string,
          vergiDairesi: (row.vergidairesi || row.vergi_dairesi || '') as string,
          tcKimlikNo: (row.tckimlikno || row.tc_kimlik_no || row.tcno || '') as string,
          isimSoyisim: (row.isimsoyisim || row.isim_soyisim || '') as string,
          telefon: (row.telefon || row.tel || '') as string,
          email: (row.email || row.e_posta || '') as string,
          yetkili: (row.yetkili || '') as string,
          ulke: (row.ulke || row.ülke || 'Türkiye') as string,
          il: (row.il || row.ilçe || 'İstanbul') as string,
          ilce: (row.ilce || row.ilçe || '') as string,
          adres: (row.adres || '') as string,
          vadeSuresi: (row.vadesuresi || row.vade_suresi || '') as string,
          aktif: row.aktif === false || row.aktif === 'false' || row.aktif === 'HAYIR' ? false : true,
          status: errors.length > 0 ? 'error' : 'pending',
          error: errors.length > 0 ? errors.join(', ') : undefined,
        };

        if (errors.length > 0) {
          validationErrors.push({
            rowNumber,
            cariKodu: cariKodu || '',
            message: errors.join(', '),
            category: 'validation',
          });
        }

        parsedData.push(parsedRow);
      }

      setExcelData(parsedData);
      setExcelErrors(validationErrors);
      setSnackbar({
        open: true,
        severity: validationErrors.length > 0 ? 'warning' : 'success',
        message: `${parsedData.length} satır yüklendi. ${validationErrors.length} hatalı satır var.`,
      });
    } catch (error) {
      console.error('Excel okuma hatası:', error);
      setSnackbar({ open: true, severity: 'error', message: 'Excel dosyası okunurken hata oluştu.' });
    } finally {
      setLoading(false);
    }
  };

  const handleBulkSubmit = async () => {
    if (excelData.filter((r) => r.status === 'pending').length === 0) {
      setSnackbar({ open: true, severity: 'info', message: 'İşlenecek veri bulunamadı.' });
      return;
    }

    try {
      setBulkLoading(true);
      const apiErrors: ExcelErrorRow[] = [];
      const pendingRows = excelData.filter((r) => r.status === 'pending');
      let successCount = 0;

      for (const row of pendingRows) {
        try {
          const payload: any = {
            unvan: row.unvan,
            tip: row.tip || 'MUSTERI',
            sirketTipi: row.sirketTipi || 'KURUMSAL',
            aktif: row.aktif !== false,
          };

          if (row.cariKodu) payload.cariKodu = row.cariKodu;
          if (row.vergiNo) payload.vergiNo = row.vergiNo;
          if (row.vergiDairesi) payload.vergiDairesi = row.vergiDairesi;
          if (row.tcKimlikNo) payload.tcKimlikNo = row.tcKimlikNo;
          if (row.isimSoyisim) payload.isimSoyisim = row.isimSoyisim;
          if (row.telefon) payload.telefon = row.telefon;
          if (row.email) payload.email = row.email;
          if (row.yetkili) payload.yetkili = row.yetkili;
          if (row.ulke) payload.ulke = row.ulke;
          if (row.il) payload.il = row.il;
          if (row.ilce) payload.ilce = row.ilce;
          if (row.adres) payload.adres = row.adres;
          if (row.vadeSuresi) payload.vadeSuresi = row.vadeSuresi;

          const response = await axios.post('/account', payload);
          successCount += 1;
          
          // Update row status
          setExcelData((prev) =>
            prev.map((r) => (r.rowNumber === row.rowNumber ? { ...r, status: 'success', cariId: response.data.id } : r))
          );
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Bilinmeyen hata';
          apiErrors.push({
            rowNumber: row.rowNumber,
            cariKodu: row.cariKodu || '',
            message: errorMessage,
            category: 'api',
          });

          setExcelData((prev) =>
            prev.map((r) => (r.rowNumber === row.rowNumber ? { ...r, status: 'error', error: errorMessage } : r))
          );
        }
      }

      setExcelErrors((prev) => [...prev, ...apiErrors]);
      setSnackbar({
        open: true,
        severity: apiErrors.length > 0 ? 'warning' : 'success',
        message: `${successCount} cari hesap başarıyla aktarıldı. ${apiErrors.length} hata oluştu.`,
      });
    } catch (error) {
      console.error('Toplu işlem hatası:', error);
      setSnackbar({ open: true, message: 'Toplu işlem başarısız', severity: 'error' });
    } finally {
      setBulkLoading(false);
    }
  };

  const downloadTemplate = () => {
    const template: ExcelRow[] = [
      {
        cariKodu: 'CAR001',
        unvan: 'Örnek Şirket A.Ş.',
        tip: 'MUSTERI',
        sirketTipi: 'KURUMSAL',
        vergiNo: '1234567890',
        vergiDairesi: 'Kadıköy Vergi Dairesi',
        tcKimlikNo: '',
        isimSoyisim: '',
        telefon: '02121234567',
        email: 'info@ornek.com',
        yetkili: 'Ahmet Yılmaz',
        ulke: 'Türkiye',
        il: 'İstanbul',
        ilce: 'Kadıköy',
        adres: 'Örnek Mah. Örnek Cad. No:1',
        vadeSuresi: '30',
        aktif: 'EVET',
      },
      {
        cariKodu: 'CAR002',
        unvan: 'Ahmet Demir',
        tip: 'MUSTERI',
        sirketTipi: 'SAHIS',
        vergiNo: '',
        vergiDairesi: '',
        tcKimlikNo: '12345678901',
        isimSoyisim: 'Ahmet Demir',
        telefon: '05321234567',
        email: 'ahmet@example.com',
        yetkili: '',
        ulke: 'Türkiye',
        il: 'Ankara',
        ilce: 'Çankaya',
        adres: 'Örnek Sokak No:5',
        vadeSuresi: '15',
        aktif: 'EVET',
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(template);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Cari Hesap Şablonu');

    worksheet['!cols'] = [
      { wch: 15 }, // cariKodu
      { wch: 30 }, // unvan
      { wch: 12 }, // tip
      { wch: 12 }, // sirketTipi
      { wch: 15 }, // vergiNo
      { wch: 25 }, // vergiDairesi
      { wch: 15 }, // tcKimlikNo
      { wch: 20 }, // isimSoyisim
      { wch: 15 }, // telefon
      { wch: 25 }, // email
      { wch: 20 }, // yetkili
      { wch: 12 }, // ulke
      { wch: 15 }, // il
      { wch: 15 }, // ilce
      { wch: 40 }, // adres
      { wch: 12 }, // vadeSuresi
      { wch: 8 }, // aktif
    ];

    XLSX.writeFile(workbook, 'cari-hesap-aktarim-sablonu.xlsx');
  };

  const clearExcelData = () => {
    setExcelData([]);
    setExcelErrors([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const downloadErrorReport = () => {
    if (excelErrors.length === 0) return;

    const rows = excelErrors.map((error, index) => ({
      sira: index + 1,
      satir: error.rowNumber,
      cariKodu: error.cariKodu ?? '',
      kategori: error.category === 'validation' ? 'Doğrulama' : 'API',
      mesaj: error.message,
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows, {
      header: ['sira', 'satir', 'cariKodu', 'kategori', 'mesaj'],
    });

    worksheet['!cols'] = [
      { wch: 6 },
      { wch: 8 },
      { wch: 15 },
      { wch: 14 },
      { wch: 60 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Hata Raporu');
    const timestamp = new Date().toISOString().replace(/[:T]/g, '-').slice(0, 16);
    XLSX.writeFile(workbook, `cari-hesap-aktarim-hata-raporu-${timestamp}.xlsx`);
  };

  const successCount = excelData.filter((r) => r.status === 'success').length;
  const errorCount = excelData.filter((r) => r.status === 'error').length;
  const pendingCount = excelData.filter((r) => r.status === 'pending').length;

  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">Cari Hesap Aktarımı</Typography>
        </Box>

        <Paper sx={{ p: 3, mb: 3 }}>
          <Alert severity="info" sx={{ mb: 3 }}>
            <Typography variant="body2">
              <strong>Kullanım:</strong>
              <br />
              1. Şablonu indirin ve verilerinizi doldurun
              <br />
              2. Excel dosyasını yükleyin
              <br />
              3. Önizleme sonrasında verileri aktarın
              <br />
              <strong>Not:</strong> Ünvan alanı zorunludur. Cari Kodu boş bırakılırsa otomatik oluşturulur.
            </Typography>
          </Alert>

          <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
            <Button variant="outlined" startIcon={<Download />} onClick={downloadTemplate}>
              Şablon İndir
            </Button>

            <Button variant="contained" component="label" startIcon={<UploadFile />} disabled={loading}>
              {loading ? <CircularProgress size={20} /> : 'Excel Yükle'}
              <input ref={fileInputRef} type="file" hidden accept=".xlsx,.xls" onChange={handleExcelUpload} />
            </Button>

            {excelData.length > 0 && (
              <>
                <Button
                  variant="contained"
                  color="success"
                  startIcon={bulkLoading ? <CircularProgress size={20} /> : <Save />}
                  onClick={handleBulkSubmit}
                  disabled={bulkLoading || pendingCount === 0}
                >
                  {bulkLoading ? 'Aktarılıyor...' : `${pendingCount} Kaydı Aktar`}
                </Button>
                {excelErrors.length > 0 && (
                  <Button variant="outlined" color="error" startIcon={<Download />} onClick={downloadErrorReport}>
                    Hata Raporu İndir
                  </Button>
                )}
                <Button variant="outlined" color="error" startIcon={<Delete />} onClick={clearExcelData}>
                  Temizle
                </Button>
              </>
            )}
          </Stack>

          {excelData.length > 0 && (
            <Box sx={{ mt: 3 }}>
              <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
                <Chip label={`Toplam: ${excelData.length}`} color="default" />
                <Chip label={`Beklemede: ${pendingCount}`} color="default" />
                <Chip label={`Başarılı: ${successCount}`} color="success" icon={<CheckCircle />} />
                <Chip label={`Hatalı: ${errorCount}`} color="error" icon={<ErrorIcon />} />
              </Box>

              <TableContainer component={Paper} sx={{ maxHeight: 600 }}>
                <Table stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell>Satır</TableCell>
                      <TableCell>Cari Kodu</TableCell>
                      <TableCell>Ünvan</TableCell>
                      <TableCell>Tip</TableCell>
                      <TableCell>Telefon</TableCell>
                      <TableCell>Email</TableCell>
                      <TableCell>Durum</TableCell>
                      <TableCell>Hata</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {excelData.map((row) => (
                      <TableRow key={row.rowNumber}>
                        <TableCell>{row.rowNumber}</TableCell>
                        <TableCell>{row.cariKodu || '-'}</TableCell>
                        <TableCell>{row.unvan}</TableCell>
                        <TableCell>
                          <Chip label={row.tip === 'TEDARIKCI' ? 'Tedarikçi' : 'Müşteri'} size="small" />
                        </TableCell>
                        <TableCell>{row.telefon || '-'}</TableCell>
                        <TableCell>{row.email || '-'}</TableCell>
                        <TableCell>
                          {row.status === 'success' && <Chip label="Başarılı" color="success" size="small" />}
                          {row.status === 'error' && <Chip label="Hatalı" color="error" size="small" />}
                          {row.status === 'pending' && <Chip label="Beklemede" color="warning" size="small" />}
                        </TableCell>
                        <TableCell>
                          {row.error && (
                            <Typography variant="caption" color="error">
                              {row.error}
                            </Typography>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </Paper>

        <Snackbar
          open={snackbar.open}
          autoHideDuration={6000}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
            {snackbar.message}
          </Alert>
        </Snackbar>
      </Box>
    </MainLayout>
  );
}

