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
  Chip,
  Stack,
} from '@mui/material';
import { UploadFile, Download, Save, Delete, CheckCircle, Error as ErrorIcon } from '@mui/icons-material';
import MainLayout from '@/components/Layout/MainLayout';
import axios from '@/lib/axios';
import * as XLSX from 'xlsx';

interface ExcelRow {
  stokKodu?: string;
  stokAdi?: string;
  barkod?: string;
  marka?: string;
  anaKategori?: string;
  altKategori?: string;
  birim?: string;
  olcu?: string;
  oem?: string;
  raf?: string;
  tedarikciKodu?: string;
  alisFiyati?: number | string;
  satisFiyati?: number | string;
  aracMarka?: string;
  aracModel?: string;
  aracMotorHacmi?: string;
  aracYakitTipi?: string;
}

interface ParsedExcelRow extends ExcelRow {
  rowNumber: number;
  status: 'pending' | 'success' | 'error';
  error?: string;
  stokId?: string;
}

interface ExcelErrorRow {
  rowNumber: number;
  stokKodu?: string;
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

const parsePriceValue = (value: unknown): number | null => {
  if (value == null) return null;
  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }
  if (typeof value === 'string') {
    const compact = value.trim().replace(/\s/g, '');
    if (!compact) return null;
    const hasComma = compact.includes(',');
    const hasDot = compact.includes('.');

    let normalized = compact;
    if (hasComma && hasDot) {
      normalized = compact.replace(/\./g, '').replace(/,/g, '.');
    } else if (hasComma) {
      normalized = compact.replace(/,/g, '.');
    }

    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
};

export default function MalzemeAktarimPage() {
  const [excelData, setExcelData] = useState<ParsedExcelRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [bulkLoading, setBulkLoading] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' | 'info' | 'warning' }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const [excelErrors, setExcelErrors] = useState<ExcelErrorRow[]>([]);
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
        const rowNumber = index + 2;
        const errors: string[] = [];

        const stokKodu = (row.stokkodu || row.stok_kodu || '') as string;
        const stokAdi = (row.stokadi || row.stok_adi || '') as string;
        const marka = (row.marka || '') as string;
        const anaKategori = (row.anakategori || row.ana_kategori || '') as string;
        const altKategori = (row.altkategori || row.alt_kategori || '') as string;
        const birim = (row.birim || 'ADET') as string;

        // Validation
        if (!stokKodu || !stokKodu.trim()) {
          errors.push('Stok Kodu zorunludur');
        }
        if (!stokAdi || !stokAdi.trim()) {
          errors.push('Stok Adı zorunludur');
        }

        const parsedRow: ParsedExcelRow = {
          rowNumber,
          stokKodu: stokKodu || '',
          stokAdi: stokAdi || '',
          barkod: (row.barkod || '') as string,
          marka: marka || '',
          anaKategori: anaKategori || '',
          altKategori: altKategori || '',
          birim: birim || 'ADET',
          olcu: (row.olcu || row.ölçü || '') as string,
          oem: (row.oem || '') as string,
          raf: (row.raf || '') as string,
          tedarikciKodu: (row.tedarikcikodu || row.tedarikci_kodu || '') as string,
          alisFiyati: parsePriceValue(row.alisfiyati || row.alis_fiyati || 0) || 0,
          satisFiyati: parsePriceValue(row.satisfiyati || row.satis_fiyati || 0) || 0,
          aracMarka: (row.aracmarka || row.arac_marka || '') as string,
          aracModel: (row.aracmodel || row.arac_model || '') as string,
          aracMotorHacmi: (row.aracmotorhacmi || row.arac_motor_hacmi || '') as string,
          aracYakitTipi: (row.aracyakittipi || row.arac_yakit_tipi || '') as string,
          status: errors.length > 0 ? 'error' : 'pending',
          error: errors.length > 0 ? errors.join(', ') : undefined,
        };

        if (errors.length > 0) {
          validationErrors.push({
            rowNumber,
            stokKodu: stokKodu || '',
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
            stokKodu: row.stokKodu,
            stokAdi: row.stokAdi,
            birim: row.birim || 'ADET',
            alisFiyati: row.alisFiyati || 0,
            satisFiyati: row.satisFiyati || 0,
          };

          if (row.barkod) payload.barkod = row.barkod;
          if (row.marka) payload.marka = row.marka;
          if (row.anaKategori) payload.anaKategori = row.anaKategori;
          if (row.altKategori) payload.altKategori = row.altKategori;
          if (row.olcu) payload.olcu = row.olcu;
          if (row.oem) payload.oem = row.oem;
          if (row.raf) payload.raf = row.raf;
          if (row.tedarikciKodu) payload.tedarikciKodu = row.tedarikciKodu;
          if (row.aracMarka) payload.aracMarka = row.aracMarka;
          if (row.aracModel) payload.aracModel = row.aracModel;
          if (row.aracMotorHacmi) payload.aracMotorHacmi = row.aracMotorHacmi;
          if (row.aracYakitTipi) payload.aracYakitTipi = row.aracYakitTipi;

          const response = await axios.post('/stok', payload);
          successCount += 1;

          setExcelData((prev) =>
            prev.map((r) => (r.rowNumber === row.rowNumber ? { ...r, status: 'success', stokId: response.data.id } : r))
          );
        } catch (error: any) {
          const errorMessage = error.response?.data?.message || 'Bilinmeyen hata';
          apiErrors.push({
            rowNumber: row.rowNumber,
            stokKodu: row.stokKodu || '',
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
        message: `${successCount} malzeme başarıyla aktarıldı. ${apiErrors.length} hata oluştu.`,
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
        stokKodu: 'STK001',
        stokAdi: 'Örnek Malzeme',
        barkod: '1234567890123',
        marka: 'Örnek Marka',
        anaKategori: 'Motor Parçaları',
        altKategori: 'Motor Yağı',
        birim: 'ADET',
        olcu: '5L',
        oem: 'OEM001',
        raf: 'A-1-1',
        tedarikciKodu: 'TED001',
        alisFiyati: 100.50,
        satisFiyati: 150.00,
        aracMarka: 'TOYOTA',
        aracModel: 'Corolla',
        aracMotorHacmi: '1.6',
        aracYakitTipi: 'Benzin',
      },
      {
        stokKodu: 'STK002',
        stokAdi: 'Başka Bir Malzeme',
        barkod: '',
        marka: 'Başka Marka',
        anaKategori: 'Filtreler',
        altKategori: 'Hava Filtresi',
        birim: 'ADET',
        olcu: '',
        oem: '',
        raf: '',
        tedarikciKodu: '',
        alisFiyati: 50,
        satisFiyati: 75,
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(template);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Malzeme Şablonu');

    worksheet['!cols'] = [
      { wch: 15 }, // stokKodu
      { wch: 30 }, // stokAdi
      { wch: 15 }, // barkod
      { wch: 20 }, // marka
      { wch: 20 }, // anaKategori
      { wch: 20 }, // altKategori
      { wch: 10 }, // birim
      { wch: 10 }, // olcu
      { wch: 15 }, // oem
      { wch: 10 }, // raf
      { wch: 15 }, // tedarikciKodu
      { wch: 12 }, // alisFiyati
      { wch: 12 }, // satisFiyati
      { wch: 15 }, // aracMarka
      { wch: 15 }, // aracModel
      { wch: 10 }, // aracMotorHacmi
      { wch: 12 }, // aracYakitTipi
    ];

    XLSX.writeFile(workbook, 'malzeme-aktarim-sablonu.xlsx');
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
      stokKodu: error.stokKodu ?? '',
      kategori: error.category === 'validation' ? 'Doğrulama' : 'API',
      mesaj: error.message,
    }));

    const worksheet = XLSX.utils.json_to_sheet(rows, {
      header: ['sira', 'satir', 'stokKodu', 'kategori', 'mesaj'],
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
    XLSX.writeFile(workbook, `malzeme-aktarim-hata-raporu-${timestamp}.xlsx`);
  };

  const successCount = excelData.filter((r) => r.status === 'success').length;
  const errorCount = excelData.filter((r) => r.status === 'error').length;
  const pendingCount = excelData.filter((r) => r.status === 'pending').length;

  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">Malzeme Aktarımı</Typography>
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
              <strong>Not:</strong> Stok Kodu ve Stok Adı alanları zorunludur. Stok Kodu boş bırakılırsa otomatik oluşturulur.
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
                      <TableCell>Stok Kodu</TableCell>
                      <TableCell>Stok Adı</TableCell>
                      <TableCell>Marka</TableCell>
                      <TableCell>Kategori</TableCell>
                      <TableCell>Birim</TableCell>
                      <TableCell>Alış Fiyatı</TableCell>
                      <TableCell>Satış Fiyatı</TableCell>
                      <TableCell>Durum</TableCell>
                      <TableCell>Hata</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {excelData.map((row) => (
                      <TableRow key={row.rowNumber}>
                        <TableCell>{row.rowNumber}</TableCell>
                        <TableCell>{row.stokKodu}</TableCell>
                        <TableCell>{row.stokAdi}</TableCell>
                        <TableCell>{row.marka || '-'}</TableCell>
                        <TableCell>
                          {row.anaKategori}
                          {row.altKategori && ` / ${row.altKategori}`}
                        </TableCell>
                        <TableCell>{row.birim}</TableCell>
                        <TableCell>{typeof row.alisFiyati === 'number' ? row.alisFiyati.toFixed(2) : (Number(row.alisFiyati) || 0).toFixed(2)}</TableCell>
                        <TableCell>{typeof row.satisFiyati === 'number' ? row.satisFiyati.toFixed(2) : (Number(row.satisFiyati) || 0).toFixed(2)}</TableCell>
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

