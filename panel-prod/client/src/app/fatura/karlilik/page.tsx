'use client';

import MainLayout from '@/components/Layout/MainLayout';
import {
  getProfitList,
  getProfitByProduct,
  getProfitDetail,
  type ProfitListItem,
  type ProfitByProductItem,
  type ProfitDetailItem,
} from '@/services/invoiceProfitService';
import {
  Box,
  Paper,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Tabs,
  Tab,
  CircularProgress,
  Alert,
  Chip,
  TextField,
  Button,
  Collapse,
  IconButton,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  TrendingUp,
  ExpandMore,
  ExpandLess,
  Search,
  DateRange,
} from '@mui/icons-material';
import { useState, useEffect } from 'react';
import React from 'react';
import axios from '@/lib/axios';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`profit-tabpanel-${index}`}
      aria-labelledby={`profit-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ py: 3 }}>{children}</Box>}
    </div>
  );
}

export default function FaturaKarlilikPage() {
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fatura bazlı state
  const [profitList, setProfitList] = useState<ProfitListItem[]>([]);
  const [expandedFaturas, setExpandedFaturas] = useState<Set<string>>(new Set());
  const [faturaDetails, setFaturaDetails] = useState<Record<string, ProfitDetailItem[]>>({});
  const [loadingDetails, setLoadingDetails] = useState<Set<string>>(new Set());

  // Ürün bazlı state
  const [productProfits, setProductProfits] = useState<ProfitByProductItem[]>([]);
  const [expandedProducts, setExpandedProducts] = useState<Set<string>>(new Set());

  // Filtreler
  const [filters, setFilters] = useState({
    startDate: '',
    endDate: '',
    cariId: '',
    durum: '',
    stokSearch: '',
  });
  const [cariler, setCariler] = useState<any[]>([]);

  useEffect(() => {
    fetchCariler();
    if (activeTab === 0) {
      fetchProfitList();
    } else {
      fetchProductProfits();
    }
  }, [activeTab, filters]);

  const fetchCariler = async () => {
    try {
      const response = await axios.get('/cari', { params: { limit: 1000 } });
      setCariler(response.data.data || []);
    } catch (error) {
      console.error('Cariler yüklenirken hata:', error);
    }
  };

  const fetchProfitList = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getProfitList({
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        cariId: filters.cariId || undefined,
        durum: filters.durum || undefined,
      });
      setProfitList(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Kar listesi yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const fetchProductProfits = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getProfitByProduct({
        startDate: filters.startDate || undefined,
        endDate: filters.endDate || undefined,
        stokId: undefined, // Tüm ürünler
      });
      setProductProfits(data);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Ürün kar listesi yüklenirken hata oluştu');
    } finally {
      setLoading(false);
    }
  };

  const handleFaturaExpand = async (faturaId: string) => {
    if (expandedFaturas.has(faturaId)) {
      const newExpanded = new Set(expandedFaturas);
      newExpanded.delete(faturaId);
      setExpandedFaturas(newExpanded);
      return;
    }

    setLoadingDetails((prev) => new Set(prev).add(faturaId));
    try {
      const details = await getProfitDetail(faturaId);
      setFaturaDetails((prev) => ({ ...prev, [faturaId]: details }));
      setExpandedFaturas((prev) => new Set(prev).add(faturaId));
    } catch (err: any) {
      setError(err.response?.data?.message || 'Fatura detayları yüklenirken hata oluştu');
    } finally {
      setLoadingDetails((prev) => {
        const newSet = new Set(prev);
        newSet.delete(faturaId);
        return newSet;
      });
    }
  };

  const handleProductExpand = (stokId: string) => {
    const newExpanded = new Set(expandedProducts);
    if (newExpanded.has(stokId)) {
      newExpanded.delete(stokId);
    } else {
      newExpanded.add(stokId);
    }
    setExpandedProducts(newExpanded);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  const filteredProductProfits = productProfits.filter((product) => {
    if (!filters.stokSearch) return true;
    const search = filters.stokSearch.toLowerCase();
    return (
      product.stok.stokKodu.toLowerCase().includes(search) ||
      product.stok.stokAdi.toLowerCase().includes(search)
    );
  });

  return (
    <MainLayout>
      <Box sx={{ p: 3 }}>
        <Box display="flex" alignItems="center" gap={2} mb={3}>
          <TrendingUp sx={{ fontSize: 32, color: '#10b981' }} />
          <Typography variant="h4" fontWeight="bold">
            Fatura Karlılığı
          </Typography>
        </Box>

        {/* Filtreler */}
        <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
          <Box display="flex" gap={2} flexWrap="wrap" alignItems="center">
            <TextField
              label="Başlangıç Tarihi"
              type="date"
              size="small"
              value={filters.startDate}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, startDate: e.target.value }))
              }
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 180 }}
            />
            <TextField
              label="Bitiş Tarihi"
              type="date"
              size="small"
              value={filters.endDate}
              onChange={(e) =>
                setFilters((prev) => ({ ...prev, endDate: e.target.value }))
              }
              InputLabelProps={{ shrink: true }}
              sx={{ minWidth: 180 }}
            />
            {activeTab === 0 && (
              <>
                <FormControl size="small" sx={{ minWidth: 200 }}>
                  <InputLabel>Cari</InputLabel>
                  <Select
                    value={filters.cariId}
                    label="Cari"
                    onChange={(e) =>
                      setFilters((prev) => ({ ...prev, cariId: e.target.value }))
                    }
                  >
                    <MenuItem value="">Tümü</MenuItem>
                    {cariler.map((cari) => (
                      <MenuItem key={cari.id} value={cari.id}>
                        {cari.unvan}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                <FormControl size="small" sx={{ minWidth: 150 }}>
                  <InputLabel>Durum</InputLabel>
                  <Select
                    value={filters.durum}
                    label="Durum"
                    onChange={(e) =>
                      setFilters((prev) => ({ ...prev, durum: e.target.value }))
                    }
                  >
                    <MenuItem value="">Tümü</MenuItem>
                    <MenuItem value="ACIK">Açık</MenuItem>
                    <MenuItem value="ONAYLANDI">Onaylandı</MenuItem>
                    <MenuItem value="KAPALI">Kapalı</MenuItem>
                  </Select>
                </FormControl>
              </>
            )}
            {activeTab === 1 && (
              <TextField
                label="Ürün Ara"
                size="small"
                value={filters.stokSearch}
                onChange={(e) =>
                  setFilters((prev) => ({ ...prev, stokSearch: e.target.value }))
                }
                InputProps={{
                  startAdornment: <Search sx={{ mr: 1, color: 'text.secondary' }} />,
                }}
                sx={{ flex: 1, maxWidth: 300 }}
              />
            )}
            <Button
              variant="outlined"
              onClick={() => {
                setFilters({
                  startDate: '',
                  endDate: '',
                  cariId: '',
                  durum: '',
                  stokSearch: '',
                });
              }}
            >
              Temizle
            </Button>
          </Box>
        </Paper>

        {/* Tabs */}
        <Paper elevation={1}>
          <Tabs
            value={activeTab}
            onChange={(e, newValue) => setActiveTab(newValue)}
            sx={{ borderBottom: 1, borderColor: 'divider' }}
          >
            <Tab label="Fatura Bazlı Karlılık" />
            <Tab label="Ürün Bazlı Karlılık" />
          </Tabs>

          {/* Fatura Bazlı Tab */}
          <TabPanel value={activeTab} index={0}>
            {loading ? (
              <Box display="flex" justifyContent="center" py={4}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            ) : profitList.length === 0 ? (
              <Alert severity="info">Fatura bulunamadı</Alert>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell width="50px"></TableCell>
                      <TableCell>Fatura No</TableCell>
                      <TableCell>Tarih</TableCell>
                      <TableCell>Cari</TableCell>
                      <TableCell align="right">Toplam Satış</TableCell>
                      <TableCell align="right">Toplam Maliyet</TableCell>
                      <TableCell align="right">Toplam Kar</TableCell>
                      <TableCell align="right">Kar Oranı</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {profitList.map((item) => (
                      <React.Fragment key={item.fatura.id}>
                        <TableRow
                          hover
                          sx={{ cursor: 'pointer' }}
                          onClick={() => handleFaturaExpand(item.fatura.id)}
                        >
                          <TableCell>
                            <IconButton size="small">
                              {expandedFaturas.has(item.fatura.id) ? (
                                <ExpandLess />
                              ) : (
                                <ExpandMore />
                              )}
                            </IconButton>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight="medium">
                              {item.fatura.faturaNo}
                            </Typography>
                            <Chip
                              label={item.fatura.durum}
                              size="small"
                              color={
                                item.fatura.durum === 'ONAYLANDI'
                                  ? 'success'
                                  : item.fatura.durum === 'IPTAL'
                                  ? 'error'
                                  : 'default'
                              }
                              sx={{ mt: 0.5 }}
                            />
                          </TableCell>
                          <TableCell>{formatDate(item.fatura.tarih)}</TableCell>
                          <TableCell>{item.fatura.cari.unvan}</TableCell>
                          <TableCell align="right">
                            {formatCurrency(item.toplamSatisTutari)}
                          </TableCell>
                          <TableCell align="right">
                            {formatCurrency(item.toplamMaliyet)}
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{
                              color: item.toplamKar >= 0 ? 'success.main' : 'error.main',
                              fontWeight: 'bold',
                            }}
                          >
                            {formatCurrency(item.toplamKar)}
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{
                              color: item.karOrani >= 0 ? 'success.main' : 'error.main',
                              fontWeight: 'bold',
                            }}
                          >
                            {item.karOrani.toFixed(2)}%
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell
                            colSpan={8}
                            sx={{ py: 0, border: 0 }}
                          >
                            <Collapse
                              in={expandedFaturas.has(item.fatura.id)}
                              timeout="auto"
                              unmountOnExit
                            >
                              {loadingDetails.has(item.fatura.id) ? (
                                <Box display="flex" justifyContent="center" py={2}>
                                  <CircularProgress size={24} />
                                </Box>
                              ) : (
                                <Box sx={{ p: 2, bgcolor: '#f9fafb' }}>
                                  <Typography variant="subtitle2" mb={2}>
                                    Kalem Detayları
                                  </Typography>
                                  <Table size="small">
                                    <TableHead>
                                      <TableRow>
                                        <TableCell>Ürün</TableCell>
                                        <TableCell align="right">Miktar</TableCell>
                                        <TableCell align="right">Birim Fiyat</TableCell>
                                        <TableCell align="right">Birim Maliyet</TableCell>
                                        <TableCell align="right">Toplam Satış</TableCell>
                                        <TableCell align="right">Toplam Maliyet</TableCell>
                                        <TableCell align="right">Kar</TableCell>
                                        <TableCell align="right">Kar Oranı</TableCell>
                                      </TableRow>
                                    </TableHead>
                                    <TableBody>
                                      {faturaDetails[item.fatura.id]?.map((detail, index) => (
                                        <TableRow key={`${detail.id}-${index}`}>
                                          <TableCell>
                                            <Typography variant="body2" fontWeight="medium">
                                              {detail.stok?.stokKodu || '-'}
                                            </Typography>
                                            <Typography variant="caption" color="text.secondary">
                                              {detail.stok?.stokAdi || '-'}
                                            </Typography>
                                          </TableCell>
                                          <TableCell align="right">{detail.miktar}</TableCell>
                                          <TableCell align="right">
                                            {formatCurrency(detail.birimFiyat)}
                                          </TableCell>
                                          <TableCell align="right">
                                            {formatCurrency(detail.birimMaliyet)}
                                          </TableCell>
                                          <TableCell align="right">
                                            {formatCurrency(detail.toplamSatisTutari)}
                                          </TableCell>
                                          <TableCell align="right">
                                            {formatCurrency(detail.toplamMaliyet)}
                                          </TableCell>
                                          <TableCell
                                            align="right"
                                            sx={{
                                              color:
                                                detail.kar >= 0 ? 'success.main' : 'error.main',
                                              fontWeight: 'bold',
                                            }}
                                          >
                                            {formatCurrency(detail.kar)}
                                          </TableCell>
                                          <TableCell
                                            align="right"
                                            sx={{
                                              color:
                                                detail.karOrani >= 0
                                                  ? 'success.main'
                                                  : 'error.main',
                                              fontWeight: 'bold',
                                            }}
                                          >
                                            {detail.karOrani.toFixed(2)}%
                                          </TableCell>
                                        </TableRow>
                                      ))}
                                    </TableBody>
                                  </Table>
                                </Box>
                              )}
                            </Collapse>
                          </TableCell>
                        </TableRow>
                      </React.Fragment>
                    ))}
                    {/* Alt Toplam Satırı */}
                    {profitList.length > 0 && (
                      <TableRow
                        sx={{
                          backgroundColor: '#f5f5f5',
                          '& td': {
                            fontWeight: 'bold',
                            borderTop: '2px solid #ddd',
                          },
                        }}
                      >
                        <TableCell colSpan={4} align="right">
                          <Typography variant="subtitle1" fontWeight="bold">
                            TOPLAM
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          {formatCurrency(
                            profitList.reduce(
                              (sum, item) => sum + item.toplamSatisTutari,
                              0,
                            ),
                          )}
                        </TableCell>
                        <TableCell align="right">
                          {formatCurrency(
                            profitList.reduce((sum, item) => sum + item.toplamMaliyet, 0),
                          )}
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{
                            color:
                              profitList.reduce((sum, item) => sum + item.toplamKar, 0) >= 0
                                ? 'success.main'
                                : 'error.main',
                          }}
                        >
                          {formatCurrency(
                            profitList.reduce((sum, item) => sum + item.toplamKar, 0),
                          )}
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{
                            color:
                              profitList.reduce((sum, item) => {
                                const totalSales = profitList.reduce(
                                  (s, i) => s + i.toplamSatisTutari,
                                  0,
                                );
                                const totalCost = profitList.reduce(
                                  (s, i) => s + i.toplamMaliyet,
                                  0,
                                );
                                return totalSales > 0
                                  ? ((totalSales - totalCost) / totalSales) * 100
                                  : 0;
                              }, 0) >= 0
                                ? 'success.main'
                                : 'error.main',
                          }}
                        >
                          {(() => {
                            const totalSales = profitList.reduce(
                              (sum, item) => sum + item.toplamSatisTutari,
                              0,
                            );
                            const totalCost = profitList.reduce(
                              (sum, item) => sum + item.toplamMaliyet,
                              0,
                            );
                            const profitMargin =
                              totalSales > 0 ? ((totalSales - totalCost) / totalSales) * 100 : 0;
                            return profitMargin.toFixed(2) + '%';
                          })()}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </TabPanel>

          {/* Ürün Bazlı Tab */}
          <TabPanel value={activeTab} index={1}>
            {loading ? (
              <Box display="flex" justifyContent="center" py={4}>
                <CircularProgress />
              </Box>
            ) : error ? (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            ) : filteredProductProfits.length === 0 ? (
              <Alert severity="info">Ürün bulunamadı</Alert>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell width="50px"></TableCell>
                      <TableCell>Ürün Kodu</TableCell>
                      <TableCell>Ürün Adı</TableCell>
                      <TableCell align="right">Toplam Miktar</TableCell>
                      <TableCell align="right">Toplam Satış</TableCell>
                      <TableCell align="right">Toplam Maliyet</TableCell>
                      <TableCell align="right">Toplam Kar</TableCell>
                      <TableCell align="right">Kar Oranı</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {filteredProductProfits.map((product) => (
                      <React.Fragment key={product.stok.id}>
                        <TableRow
                          hover
                          sx={{ cursor: 'pointer' }}
                          onClick={() => handleProductExpand(product.stok.id)}
                        >
                          <TableCell>
                            <IconButton size="small">
                              {expandedProducts.has(product.stok.id) ? (
                                <ExpandLess />
                              ) : (
                                <ExpandMore />
                              )}
                            </IconButton>
                          </TableCell>
                          <TableCell>
                            <Typography variant="body2" fontWeight="medium">
                              {product.stok.stokKodu}
                            </Typography>
                          </TableCell>
                          <TableCell>{product.stok.stokAdi}</TableCell>
                          <TableCell align="right">{product.toplamMiktar}</TableCell>
                          <TableCell align="right">
                            {formatCurrency(product.toplamSatisTutari)}
                          </TableCell>
                          <TableCell align="right">
                            {formatCurrency(product.toplamMaliyet)}
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{
                              color:
                                product.toplamKar >= 0 ? 'success.main' : 'error.main',
                              fontWeight: 'bold',
                            }}
                          >
                            {formatCurrency(product.toplamKar)}
                          </TableCell>
                          <TableCell
                            align="right"
                            sx={{
                              color:
                                product.karOrani >= 0 ? 'success.main' : 'error.main',
                              fontWeight: 'bold',
                            }}
                          >
                            {product.karOrani.toFixed(2)}%
                          </TableCell>
                        </TableRow>
                        <TableRow>
                          <TableCell colSpan={8} sx={{ py: 0, border: 0 }}>
                            <Collapse
                              in={expandedProducts.has(product.stok.id)}
                              timeout="auto"
                              unmountOnExit
                            >
                              <Box sx={{ p: 2, bgcolor: '#f9fafb' }}>
                                <Typography variant="subtitle2" mb={2}>
                                  Fatura Detayları
                                </Typography>
                                <Table size="small">
                                  <TableHead>
                                    <TableRow>
                                      <TableCell>Fatura No</TableCell>
                                      <TableCell>Tarih</TableCell>
                                      <TableCell>Cari</TableCell>
                                      <TableCell align="right">Miktar</TableCell>
                                      <TableCell align="right">Satış Tutarı</TableCell>
                                      <TableCell align="right">Maliyet</TableCell>
                                      <TableCell align="right">Kar</TableCell>
                                    </TableRow>
                                  </TableHead>
                                  <TableBody>
                                    {product.faturalar.map((fatura) => (
                                      <TableRow key={fatura.faturaId}>
                                        <TableCell>
                                          <Typography variant="body2" fontWeight="medium">
                                            {fatura.faturaNo}
                                          </Typography>
                                        </TableCell>
                                        <TableCell>{formatDate(fatura.tarih)}</TableCell>
                                        <TableCell>{fatura.cari.unvan}</TableCell>
                                        <TableCell align="right">{fatura.miktar}</TableCell>
                                        <TableCell align="right">
                                          {formatCurrency(fatura.satisTutari)}
                                        </TableCell>
                                        <TableCell align="right">
                                          {formatCurrency(fatura.maliyet)}
                                        </TableCell>
                                        <TableCell
                                          align="right"
                                          sx={{
                                            color: fatura.kar >= 0 ? 'success.main' : 'error.main',
                                            fontWeight: 'bold',
                                          }}
                                        >
                                          {formatCurrency(fatura.kar)}
                                        </TableCell>
                                      </TableRow>
                                    ))}
                                  </TableBody>
                                </Table>
                              </Box>
                            </Collapse>
                          </TableCell>
                        </TableRow>
                      </React.Fragment>
                    ))}
                    {/* Alt Toplam Satırı */}
                    {filteredProductProfits.length > 0 && (
                      <TableRow
                        sx={{
                          backgroundColor: '#f5f5f5',
                          '& td': {
                            fontWeight: 'bold',
                            borderTop: '2px solid #ddd',
                          },
                        }}
                      >
                        <TableCell colSpan={3} align="right">
                          <Typography variant="subtitle1" fontWeight="bold">
                            TOPLAM
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          {filteredProductProfits.reduce(
                            (sum, product) => sum + product.toplamMiktar,
                            0,
                          )}
                        </TableCell>
                        <TableCell align="right">
                          {formatCurrency(
                            filteredProductProfits.reduce(
                              (sum, product) => sum + product.toplamSatisTutari,
                              0,
                            ),
                          )}
                        </TableCell>
                        <TableCell align="right">
                          {formatCurrency(
                            filteredProductProfits.reduce(
                              (sum, product) => sum + product.toplamMaliyet,
                              0,
                            ),
                          )}
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{
                            color:
                              filteredProductProfits.reduce(
                                (sum, product) => sum + product.toplamKar,
                                0,
                              ) >= 0
                                ? 'success.main'
                                : 'error.main',
                          }}
                        >
                          {formatCurrency(
                            filteredProductProfits.reduce(
                              (sum, product) => sum + product.toplamKar,
                              0,
                            ),
                          )}
                        </TableCell>
                        <TableCell
                          align="right"
                          sx={{
                            color:
                              (() => {
                                const totalSales = filteredProductProfits.reduce(
                                  (sum, product) => sum + product.toplamSatisTutari,
                                  0,
                                );
                                const totalCost = filteredProductProfits.reduce(
                                  (sum, product) => sum + product.toplamMaliyet,
                                  0,
                                );
                                return totalSales > 0
                                  ? ((totalSales - totalCost) / totalSales) * 100
                                  : 0;
                              })() >= 0
                                ? 'success.main'
                                : 'error.main',
                          }}
                        >
                          {(() => {
                            const totalSales = filteredProductProfits.reduce(
                              (sum, product) => sum + product.toplamSatisTutari,
                              0,
                            );
                            const totalCost = filteredProductProfits.reduce(
                              (sum, product) => sum + product.toplamMaliyet,
                              0,
                            );
                            const profitMargin =
                              totalSales > 0 ? ((totalSales - totalCost) / totalSales) * 100 : 0;
                            return profitMargin.toFixed(2) + '%';
                          })()}
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </TabPanel>
        </Paper>
      </Box>
    </MainLayout>
  );
}
