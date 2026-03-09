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
  price?: number | string;
  effectiveFrom?: string;
  effectiveTo?: string;
  note?: string;
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

interface Stok {
  id: string;
  stokKodu: string;
  stokAdi: string;
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

const extractValue = (row: Record<string, unknown>, keys: string[]) => {
  for (const key of keys) {
    if (key in row) {
      return row[key];
    }
  }
  return undefined;
};

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

const formatDateOnly = (date: Date) => {
  const pad = (n: number) => n.toString().padStart(2, '0');
  return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}`;
};

const parseExcelDateValue = (value: unknown): string | undefined => {
  if (value == null || value === '') return undefined;
  if (typeof value === 'number') {
    const parsed = (XLSX.SSF as any)?.parse_date_code?.(value);
    if (!parsed) return undefined;
    const date = new Date(Date.UTC(parsed.y, parsed.m - 1, parsed.d));
    return Number.isNaN(date.getTime()) ? undefined : formatDateOnly(date);
  }
  if (value instanceof Date) {
    return Number.isNaN(value.getTime()) ? undefined : formatDateOnly(value);
  }
  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (!trimmed) return undefined;
    const parsedDate = new Date(trimmed);
    return Number.isNaN(parsedDate.getTime()) ? undefined : formatDateOnly(parsedDate);
  }
  return undefined;
};

const toNoteValue = (value: unknown): string | undefined => {
  if (value == null) return undefined;
  if (typeof value === 'string') {
    const trimmed = value.trim();
    return trimmed ? trimmed : undefined;
  }
  return String(value);
};

export default function SatisFiyatAktarimPage() {
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
  const stokLookupRef = useRef<Record<string, Stok>>({});

  const getStokByCode = async (stokKodu: string): Promise<Stok | null> => {
    if (stokLookupRef.current[stokKodu]) {
      return stokLookupRef.current[stokKodu];
    }

    try {
      const response = await axios.get('/product', {
        params: {
          limit: 1000,
          search: stokKodu,
        },
      });
      const items: Stok[] = response.data?.data ?? [];
      const stok = items.find((s) => s.stokKodu === stokKodu);
      if (stok) {
        stokLookupRef.current[stokKodu] = stok;
        return stok;
      }
    } catch (error) {
      console.error('Stok bulunamadı:', error);
    }

    return null;
  };

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

      const now = new Date();
      const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59);
      const defaultEffectiveFromDate = formatDateOnly(now);
      const defaultEffectiveToDate = formatDateOnly(endOfYear);

      const validationErrors: ExcelErrorRow[] = [];
      const parsedData: ParsedExcelRow[] = [];

      for (let index = 0; index < rawRows.length; index += 1) {
        const row = rawRows[index];
        const rowNumber = index + 2;
        const normalizedRow = Object.entries(row).reduce<Record<string, unknown>>((acc, [key, value]) => {
          if (typeof key === 'string' && key.trim()) {
            acc[normalizeHeaderKey(key)] = value;
          }
          return acc;
        }, {});

        const stokCodeRaw = extractValue(normalizedRow, ['stokkodu', 'stok_kodu', 'stok']);
        const stokKodu = typeof stokCodeRaw === 'string' ? stokCodeRaw.trim() : '';

        if (!stokKodu) {
          validationErrors.push({ rowNumber, message: 'Stok kodu bulunamadı.', category: 'validation' });
          parsedData.push({ rowNumber, status: 'error', error: 'Stok kodu bulunamadı.' });
          continue;
        }

        const stok = await getStokByCode(stokKodu);
        if (!stok) {
          validationErrors.push({ rowNumber, stokKodu, message: `Stok kodu (${stokKodu}) sistemde bulunamadı.`, category: 'validation' });
          parsedData.push({ rowNumber, stokKodu, status: 'error', error: `Stok kodu (${stokKodu}) sistemde bulunamadı.` });
          continue;
        }

        const priceRaw = extractValue(normalizedRow, ['price', 'fiyat', 'satisfiyati', 'satisfiyat']);
        const price = parsePriceValue(priceRaw);
        if (price == null || price <= 0) {
          validationErrors.push({ rowNumber, stokKodu, message: 'Geçerli bir fiyat bulunamadı.', category: 'validation' });
          parsedData.push({ rowNumber, stokKodu, status: 'error', error: 'Geçerli bir fiyat bulunamadı.', stokId: stok.id });
          continue;
        }

        const effectiveFromRaw = extractValue(normalizedRow, ['effectivefrom', 'baslangic', 'baslangictarihi', 'gecerlilikbaslangici']);
        const effectiveToRaw = extractValue(normalizedRow, ['effectiveto', 'bitis', 'bitistarihi', 'gecerlilikbitisi']);
        const noteRaw = extractValue(normalizedRow, ['note', 'not', 'aciklama']);

        const effectiveFrom = parseExcelDateValue(effectiveFromRaw) ?? defaultEffectiveFromDate;
        const effectiveTo = parseExcelDateValue(effectiveToRaw) ?? defaultEffectiveToDate;
        const note = toNoteValue(noteRaw);

        parsedData.push({
          rowNumber,
          stokKodu,
          price,
          effectiveFrom,
          effectiveTo,
          note,
          status: 'pending',
          stokId: stok.id,
        });
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
      const pendingRows = excelData.filter((r) => r.status === 'pending' && r.stokId && r.price);
      let successCount = 0;

      for (const row of pendingRows) {
        try {
          const payload: any = {
            stokId: row.stokId,
            type: 'SALE',
            price: row.price,
          };

          if (row.effectiveFrom) payload.effectiveFrom = row.effectiveFrom;
          if (row.effectiveTo) payload.effectiveTo = row.effectiveTo;
          if (row.note) payload.note = row.note;

          await axios.post('/price-cards', payload);
          successCount += 1;

          setExcelData((prev) =>
            prev.map((r) => (r.rowNumber === row.rowNumber ? { ...r, status: 'success' } : r))
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
        message: `${successCount} satış fiyatı başarıyla aktarıldı. ${apiErrors.length} hata oluştu.`,
      });
    } catch (error) {
      console.error('Toplu işlem hatası:', error);
      setSnackbar({ open: true, message: 'Toplu işlem başarısız', severity: 'error' });
    } finally {
      setBulkLoading(false);
    }
  };

  const downloadTemplate = () => {
    const now = new Date();
    const endOfYear = new Date(now.getFullYear(), 11, 31, 23, 59);

    const template: ExcelRow[] = [
      {
        stokKodu: 'STK001',
        price: 150.50,
        effectiveFrom: formatDateOnly(now),
        effectiveTo: formatDateOnly(endOfYear),
        note: 'Örnek not',
      },
      {
        stokKodu: 'STK002',
        price: 250.00,
        effectiveFrom: formatDateOnly(now),
        effectiveTo: formatDateOnly(endOfYear),
        note: '',
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(template, {
      header: ['stokKodu', 'price', 'effectiveFrom', 'effectiveTo', 'note'],
    });

    worksheet['!cols'] = [
      { wch: 20 },
      { wch: 12 },
      { wch: 26 },
      { wch: 26 },
      { wch: 30 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Satış Fiyat Aktarımı');
    XLSX.writeFile(workbook, 'satis-fiyat-aktarim-sablonu.xlsx');
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
      { wch: 20 },
      { wch: 14 },
      { wch: 60 },
    ];

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Hata Raporu');
    const timestamp = new Date().toISOString().replace(/[:T]/g, '-').slice(0, 16);
    XLSX.writeFile(workbook, `satis-fiyat-aktarim-hata-raporu-${timestamp}.xlsx`);
  };

  const successCount = excelData.filter((r) => r.status === 'success').length;
  const errorCount = excelData.filter((r) => r.status === 'error').length;
  const pendingCount = excelData.filter((r) => r.status === 'pending').length;

  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h4">Satış Fiyat Aktarımı</Typography>
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
              <strong>Not:</strong> Stok Kodu sistemde mevcut olmalıdır. Fiyat ve Stok Kodu alanları zorunludur.
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
                      <TableCell>Fiyat</TableCell>
                      <TableCell>Geçerlilik Başlangıcı</TableCell>
                      <TableCell>Geçerlilik Bitişi</TableCell>
                      <TableCell>Not</TableCell>
                      <TableCell>Durum</TableCell>
                      <TableCell>Hata</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {excelData.map((row) => (
                      <TableRow key={row.rowNumber}>
                        <TableCell>{row.rowNumber}</TableCell>
                        <TableCell>{row.stokKodu || '-'}</TableCell>
                        <TableCell>{typeof row.price === 'number' ? row.price.toFixed(2) : row.price || '-'}</TableCell>
                        <TableCell>{row.effectiveFrom || '-'}</TableCell>
                        <TableCell>{row.effectiveTo || '-'}</TableCell>
                        <TableCell>{row.note || '-'}</TableCell>
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

