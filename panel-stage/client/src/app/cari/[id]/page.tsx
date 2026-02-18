'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  Alert,
  CircularProgress,
  Stack,
  useTheme,
  useMediaQuery,
  Divider,
  Tabs,
  Tab,
  Grid,
  List,
  ListItem,
  ListItemText,
  Avatar,
  ListItemIcon,
} from '@mui/material';
import {
  ArrowBack,
  Add,
  Visibility,
  FileDownload,
  Print,
  PictureAsPdf,
  TableChart,
  TrendingUp,
  TrendingDown,
  AccountBalanceWallet,
  Business,
  ContactPage,
  Phone,
  Email,
  LocationOn,
  CreditCard,
  Person,
  Warning,
  CheckCircle,
  Block,
  Info,
} from '@mui/icons-material';
import { useParams, useRouter } from 'next/navigation';
import MainLayout from '@/components/Layout/MainLayout';
import axios from '@/lib/axios';

interface CariYetkili {
  id: string;
  adSoyad: string;
  unvan?: string;
  telefon?: string;
  email?: string;
  varsayilan: boolean;
}

interface CariAdres {
  id: string;
  baslik: string;
  tip: 'FATURA' | 'SEVK' | 'DIGER';
  adres: string;
  il?: string;
  ilce?: string;
}

interface CariBanka {
  id: string;
  bankaAdi: string;
  subeAdi?: string;
  iban: string;
  paraBirimi: string;
}

interface Cari {
  id: string;
  cariKodu: string;
  unvan: string;
  tip: string;
  vergiNo?: string;
  vergiDairesi?: string;
  tcKimlikNo?: string;
  isimSoyisim?: string;
  telefon?: string;
  email?: string;
  adres?: string;
  il?: string;
  ilce?: string;
  bakiye: string;
  riskLimiti?: number;
  riskDurumu?: 'NORMAL' | 'RISKLI' | 'BLOKELI' | 'TAKIPTE';
  teminatTutar?: number;
  sektor?: string;
  webSite?: string;
  yetkililer?: CariYetkili[];
  ekAdresler?: CariAdres[];
  tedarikciBankalar?: CariBanka[];
}

interface CariHareket {
  id: string;
  tip: 'BORC' | 'ALACAK' | 'DEVIR';
  tutar: string;
  bakiye: string;
  belgeTipi?: string;
  belgeNo?: string;
  tarih: string;
  aciklama: string;
}

function TabPanel(props: { children?: React.ReactNode; index: number; value: number }) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`simple-tabpanel-${index}`}
      aria-labelledby={`simple-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function CariDetayPage() {
  const params = useParams();
  const router = useRouter();
  const cariId = params.id as string;

  const [cari, setCari] = useState<Cari | null>(null);
  const [hareketler, setHareketler] = useState<CariHareket[]>([]);
  const [loading, setLoading] = useState(true);
  const [openAdd, setOpenAdd] = useState(false);
  const [openIncele, setOpenIncele] = useState(false);
  const [selectedHareket, setSelectedHareket] = useState<CariHareket | null>(null);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as any });
  const [tabValue, setTabValue] = useState(0);

  const [baslangicTarihi, setBaslangicTarihi] = useState('');
  const [bitisTarihi, setBitisTarihi] = useState('');

  const [formData, setFormData] = useState({
    tip: 'BORC' as 'BORC' | 'ALACAK' | 'DEVIR',
    tutar: '',
    belgeTipi: '',
    belgeNo: '',
    tarih: new Date().toISOString().split('T')[0],
    aciklama: '',
  });

  useEffect(() => {
    fetchCari();
    fetchHareketler();
  }, [cariId]);

  const fetchCari = async () => {
    try {
      const response = await axios.get(`/cari/${cariId}`);
      setCari(response.data);
    } catch (error) {
      console.error('Cari bilgisi alınamadı:', error);
      showSnackbar('Cari bilgisi yüklenemedi', 'error');
    }
  };

  const fetchHareketler = async () => {
    try {
      setLoading(true);
      const response = await axios.get('/cari-hareket', {
        params: { cariId, take: 1000 },
      });
      setHareketler(response.data.data || []);
    } catch (error) {
      console.error('Hareketler alınamadı:', error);
      showSnackbar('Hareketler yüklenemedi', 'error');
    } finally {
      setLoading(false);
    }
  };

  const totals = hareketler.reduce(
    (acc, h) => {
      const val = parseFloat(h.tutar);
      if (h.tip === 'BORC') acc.borc += val;
      else if (h.tip === 'ALACAK') acc.alacak += val;
      return acc;
    },
    { borc: 0, alacak: 0 }
  );

  const handleAdd = async () => {
    try {
      await axios.post('/cari-hareket', {
        cariId,
        ...formData,
        tutar: parseFloat(formData.tutar),
      });
      showSnackbar('Hareket başarıyla eklendi', 'success');
      setOpenAdd(false);
      resetForm();
      fetchCari();
      fetchHareketler();
    } catch (error: any) {
      showSnackbar(error.response?.data?.message || 'Hareket eklenemedi', 'error');
    }
  };

  const handleIncele = (hareket: CariHareket) => {
    setSelectedHareket(hareket);
    setOpenIncele(true);
  };

  const handleExportExcel = async () => {
    try {
      showSnackbar('Excel indiriliyor...', 'info');
      const response = await axios.get(`/cari/${cariId}/ekstre/export/excel`, {
        params: { baslangicTarihi, bitisTarihi },
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Cari_Ekstre_${cari?.unvan}_${new Date().toISOString().split('T')[0]}.xlsx`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      showSnackbar('Excel başarıyla indirildi', 'success');
    } catch (error) {
      console.error('Excel indirme hatası:', error);
      showSnackbar('Excel indirilirken hata oluştu', 'error');
    }
  };

  const handleExportPdf = async () => {
    try {
      showSnackbar('PDF hazırlanıyor...', 'info');
      const response = await axios.get(`/cari/${cariId}/ekstre/export/pdf`, {
        params: { baslangicTarihi, bitisTarihi },
        responseType: 'blob',
      });

      const url = window.URL.createObjectURL(new Blob([response.data], { type: 'application/pdf' }));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `Cari_Ekstre_${cari?.unvan}_${new Date().toISOString().split('T')[0]}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      showSnackbar('PDF başarıyla indirildi', 'success');
    } catch (error) {
      console.error('PDF indirme hatası:', error);
      showSnackbar('PDF indirilirken hata oluştu', 'error');
    }
  };

  const handlePrint = () => {
    handleExportPdf();
  };

  const resetForm = () => {
    setFormData({
      tip: 'BORC',
      tutar: '',
      belgeTipi: '',
      belgeNo: '',
      tarih: new Date().toISOString().split('T')[0],
      aciklama: '',
    });
  };

  const showSnackbar = (message: string, severity: 'success' | 'error' | 'info' | 'warning' = 'success') => {
    setSnackbar({ open: true, message, severity });
  };

  const getTipColor = (tip: string) => {
    switch (tip) {
      case 'BORC': return 'error';
      case 'ALACAK': return 'success';
      case 'DEVIR': return 'default';
      default: return 'default';
    }
  };

  const getTipLabel = (tip: string) => {
    switch (tip) {
      case 'BORC': return 'Borç';
      case 'ALACAK': return 'Alacak';
      case 'DEVIR': return 'Devir';
      default: return tip;
    }
  };

  const getRiskColor = (status?: string) => {
    switch (status) {
      case 'RISKLI': return 'warning';
      case 'BLOKELI': return 'error';
      case 'TAKIPTE': return 'error';
      case 'NORMAL': return 'success';
      default: return 'default';
    }
  };

  const getRiskLabel = (status?: string) => {
    switch (status) {
      case 'RISKLI': return 'Riskli';
      case 'BLOKELI': return 'Blokeli';
      case 'TAKIPTE': return 'Takipte';
      case 'NORMAL': return 'Normal';
      default: return 'Belirsiz';
    }
  };

  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // Mobile movement card component
  const MobileMovementCard = ({ hareket }: { hareket: CariHareket }) => (
    <Paper
      variant="outlined"
      sx={{
        p: 2,
        mb: 2,
        borderRadius: 'var(--radius-md)',
        border: '1px solid var(--border)',
        bgcolor: 'var(--card)',
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1.5 }}>
        <Typography variant="body2" fontWeight="700" color="text.secondary">
          {new Date(hareket.tarih).toLocaleDateString('tr-TR')}
        </Typography>
        <Chip
          label={getTipLabel(hareket.tip)}
          color={getTipColor(hareket.tip)}
          size="small"
          sx={{ fontWeight: 600 }}
        />
      </Box>

      <Typography variant="body1" fontWeight="600" sx={{ mb: 1 }}>
        {hareket.aciklama}
      </Typography>

      {hareket.belgeNo && (
        <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mb: 1 }}>
          Belge No: {hareket.belgeNo}
        </Typography>
      )}

      <Divider sx={{ my: 1.5, borderStyle: 'dashed' }} />

      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="body2" color="text.secondary">Tutar:</Typography>
          <Typography variant="body2" fontWeight="700" color={hareket.tip === 'BORC' ? '#ef4444' : '#10b981'}>
            {hareket.tip === 'BORC' ? 'Borç: ' : 'Alacak: '}
            ₺{parseFloat(hareket.tutar).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
          </Typography>
        </Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
          <Typography variant="body2" color="text.secondary">Bakiye:</Typography>
          <Typography variant="body2" fontWeight="800">
            ₺{parseFloat(hareket.bakiye).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
          </Typography>
        </Box>
      </Box>

      <Button
        fullWidth
        size="small"
        variant="outlined"
        startIcon={<Visibility />}
        onClick={() => handleIncele(hareket)}
        sx={{ mt: 2, textTransform: 'none' }}
      >
        Detayları İncele
      </Button>
    </Paper>
  );

  if (!cari) {
    return (
      <MainLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '60vh' }}>
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      {/* Header & Hero Section */}
      <Box sx={{ mb: 3 }}>
        <Button
          startIcon={<ArrowBack />}
          onClick={() => router.push('/cari')}
          sx={{ mb: 2, color: 'text.secondary', '&:hover': { color: 'primary.main' } }}
        >
          Cari Listesine Dön
        </Button>

        <Box sx={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'stretch' : 'flex-start',
          gap: 3
        }}>
          <Box>
            <Typography
              variant="h4"
              sx={{
                fontWeight: 800,
                fontSize: isMobile ? '1.5rem' : '1.875rem',
                color: 'var(--foreground)',
                letterSpacing: '-0.03em',
                mb: 0.5,
                display: 'flex',
                alignItems: 'center',
                gap: 1.5
              }}
            >
              <Box sx={{ width: 8, height: 32, bgcolor: 'var(--primary)', borderRadius: 'var(--radius-sm)' }} />
              {cari.unvan}
            </Typography>
            <Stack direction="row" spacing={1.5} sx={{ ml: 2.5, alignItems: 'center', flexWrap: 'wrap', gap: 1 }}>
              <Typography variant="body2" sx={{ color: 'var(--muted-foreground)', fontWeight: 600 }}>
                {cari.cariKodu}
              </Typography>
              <Box sx={{ width: 4, height: 4, borderRadius: '50%', bgcolor: 'var(--border)' }} />
              <Typography variant="body2" sx={{ color: 'var(--muted-foreground)', fontWeight: 500 }}>
                {cari.tip === 'ALICI' ? 'Müşteri' : cari.tip === 'SATICI' ? 'Tedarikçi' : 'Müşteri + Tedarikçi'}
              </Typography>
              {cari.riskDurumu && cari.riskDurumu !== 'NORMAL' && (
                <Chip
                  label={getRiskLabel(cari.riskDurumu)}
                  color={getRiskColor(cari.riskDurumu)}
                  size="small"
                  icon={cari.riskDurumu === 'BLOKELI' ? <Block /> : <Warning />}
                  sx={{ ml: 2, fontWeight: 700 }}
                />
              )}
            </Stack>
          </Box>
        </Box>
      </Box>

      {/* Tabs */}
      <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
        <Tabs value={tabValue} onChange={handleTabChange} aria-label="cari detay tabs">
          <Tab label="Genel Bakış" />
          <Tab label="Profil & İletişim" />
          <Tab label="Hareketler" />
        </Tabs>
      </Box>

      {/* GENEL BAKIŞ TAB */}
      <TabPanel value={tabValue} index={0}>
        <Box sx={{
          display: 'grid',
          gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr 1fr' },
          gap: 3,
          mb: 4
        }}>
          {/* Borç Card */}
          <Paper elevation={0} sx={{ p: 3, borderRadius: '16px', border: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="overline" color="text.secondary" fontWeight="700">Toplam Borç</Typography>
              <TrendingUp sx={{ color: '#ef4444' }} />
            </Box>
            <Typography variant="h5" fontWeight="800">₺{totals.borc.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</Typography>
          </Paper>

          {/* Alacak Card */}
          <Paper elevation={0} sx={{ p: 3, borderRadius: '16px', border: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="overline" color="text.secondary" fontWeight="700">Toplam Alacak</Typography>
              <TrendingDown sx={{ color: '#10b981' }} />
            </Box>
            <Typography variant="h5" fontWeight="800">₺{totals.alacak.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</Typography>
          </Paper>

          {/* Net Bakiye Card */}
          <Paper elevation={0} sx={{ p: 3, borderRadius: '16px', border: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="overline" color="text.secondary" fontWeight="700">Net Bakiye</Typography>
              <AccountBalanceWallet sx={{ color: '#7c3aed' }} />
            </Box>
            <Typography variant="h5" fontWeight="800" color={totals.borc > totals.alacak ? 'error.main' : 'success.main'}>
              ₺{Math.abs(totals.borc - totals.alacak).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
            </Typography>
            <Typography variant="caption" color="text.secondary" fontWeight="600">
              {totals.borc > totals.alacak ? '(Borçlu)' : totals.alacak > totals.borc ? '(Alacaklı)' : '(Dengede)'}
            </Typography>
          </Paper>

          {/* Risk Card */}
          <Paper elevation={0} sx={{ p: 3, borderRadius: '16px', border: '1px solid', borderColor: 'divider' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
              <Typography variant="overline" color="text.secondary" fontWeight="700">Risk Durumu</Typography>
              <Warning sx={{ color: getRiskColor(cari.riskDurumu) === 'error' ? '#ef4444' : '#f59e0b' }} />
            </Box>
            <Typography variant="h6" fontWeight="700">{getRiskLabel(cari.riskDurumu)}</Typography>
            {cari.riskLimiti && cari.riskLimiti > 0 && (
              <Typography variant="caption" display="block">Limit: ₺{cari.riskLimiti.toLocaleString()}</Typography>
            )}
          </Paper>
        </Box>
      </TabPanel>

      {/* PROFIL TAB */}
      <TabPanel value={tabValue} index={1}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', md: '1fr 1fr', lg: '1fr 1fr 1fr' }, gap: 3 }}>
          {/* Sol Kolon: Temel Bilgiler */}
          <Box>
            <Paper variant="outlined" sx={{ p: 3, borderRadius: '12px' }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Business fontSize="small" /> Firma Bilgileri
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <List dense>
                <ListItem disablePadding sx={{ py: 1 }}>
                  <ListItemText primary="Vergi No / Tc" secondary={cari.vergiNo || cari.tcKimlikNo || '-'} />
                </ListItem>
                <ListItem disablePadding sx={{ py: 1 }}>
                  <ListItemText primary="Vergi Dairesi" secondary={cari.vergiDairesi || '-'} />
                </ListItem>
                <ListItem disablePadding sx={{ py: 1 }}>
                  <ListItemText primary="Sektör" secondary={cari.sektor || '-'} />
                </ListItem>
                <ListItem disablePadding sx={{ py: 1 }}>
                  <ListItemText primary="Web Sitesi" secondary={cari.webSite || '-'} />
                </ListItem>
              </List>
            </Paper>

            <Paper variant="outlined" sx={{ p: 3, borderRadius: '12px', mt: 3 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <LocationOn fontSize="small" /> Adres Bilgileri
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <Typography variant="subtitle2" color="primary">Merkez Adres</Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                {cari.adres} <br /> {cari.ilce} / {cari.il}
              </Typography>

              {cari.ekAdresler && cari.ekAdresler.length > 0 && (
                <Box sx={{ mt: 2 }}>
                  <Typography variant="subtitle2" color="primary">Diğer Adresler</Typography>
                  <List dense>
                    {cari.ekAdresler.map(adres => (
                      <ListItem key={adres.id} disablePadding sx={{ py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}><LocationOn fontSize="small" color="action" /></ListItemIcon>
                        <ListItemText
                          primary={adres.baslik}
                          secondary={`${adres.adres} ${adres.ilce || ''}/${adres.il || ''}`}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Box>
              )}
            </Paper>
          </Box>

          {/* Orta Kolon: İletişim & Yetkililer */}
          <Box>
            <Paper variant="outlined" sx={{ p: 3, borderRadius: '12px' }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <ContactPage fontSize="small" /> İletişim
              </Typography>
              <Divider sx={{ mb: 2 }} />
              <List dense>
                <ListItem disablePadding sx={{ py: 1 }}>
                  <ListItemIcon><Phone fontSize="small" /></ListItemIcon>
                  <ListItemText primary={cari.telefon || '-'} secondary="Telefon" />
                </ListItem>
                <ListItem disablePadding sx={{ py: 1 }}>
                  <ListItemIcon><Email fontSize="small" /></ListItemIcon>
                  <ListItemText primary={cari.email || '-'} secondary="E-posta" />
                </ListItem>
              </List>
            </Paper>

            {cari.yetkililer && cari.yetkililer.length > 0 && (
              <Paper variant="outlined" sx={{ p: 3, borderRadius: '12px', mt: 3 }}>
                <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <Person fontSize="small" /> Yetkililer
                </Typography>
                <Divider sx={{ mb: 2 }} />
                <List>
                  {cari.yetkililer.map((yetkili) => (
                    <ListItem key={yetkili.id} alignItems="flex-start" sx={{ px: 0 }}>
                      <ListItemIcon>
                        <Avatar sx={{ width: 32, height: 32, bgcolor: yetkili.varsayilan ? 'primary.main' : 'grey.400' }}>
                          {yetkili.adSoyad.charAt(0)}
                        </Avatar>
                      </ListItemIcon>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle2">
                            {yetkili.adSoyad} {yetkili.varsayilan && <Chip label="Varsayılan" size="small" color="primary" sx={{ height: 16, fontSize: '0.6rem', ml: 1 }} />}
                          </Typography>
                        }
                        secondary={
                          <React.Fragment>
                            <Typography component="span" variant="body2" color="text.primary" display="block">
                              {yetkili.unvan}
                            </Typography>
                            {yetkili.telefon && <Typography component="span" variant="caption" display="block"><Phone fontSize="inherit" sx={{ verticalAlign: 'middle', mr: 0.5 }} />{yetkili.telefon}</Typography>}
                            {yetkili.email && <Typography component="span" variant="caption" display="block"><Email fontSize="inherit" sx={{ verticalAlign: 'middle', mr: 0.5 }} />{yetkili.email}</Typography>}
                          </React.Fragment>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              </Paper>
            )}
          </Box>

          {/* Sağ Kolon: Banka Bilgileri */}
          <Box>
            <Paper variant="outlined" sx={{ p: 3, borderRadius: '12px' }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <CreditCard fontSize="small" /> Banka Hesapları
              </Typography>
              <Divider sx={{ mb: 2 }} />
              {cari.tedarikciBankalar && cari.tedarikciBankalar.length > 0 ? (
                <List>
                  {cari.tedarikciBankalar.map(banka => (
                    <ListItem key={banka.id} sx={{ px: 0, borderBottom: '1px solid var(--border)' }}>
                      <ListItemText
                        primary={banka.bankaAdi}
                        secondary={
                          <React.Fragment>
                            <Typography component="span" variant="caption" display="block" color="text.primary" sx={{ fontFamily: 'monospace', mt: 0.5 }}>
                              {banka.iban}
                            </Typography>
                            <Chip label={banka.paraBirimi} size="small" variant="outlined" sx={{ height: 20, fontSize: '0.65rem', mt: 0.5 }} />
                          </React.Fragment>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">Kayıtlı banka bilgisi yok.</Typography>
              )}
            </Paper>
          </Box>
        </Box>
      </TabPanel>

      {/* HAREKETLER TAB */}
      <TabPanel value={tabValue} index={2}>
        {/* Actions */}
        <Box sx={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: 2,
          mb: 3,
          alignItems: isMobile ? 'stretch' : 'center'
        }}>
          <Button
            variant="contained"
            startIcon={<Add />}
            onClick={() => setOpenAdd(true)}
            size={isMobile ? "large" : "medium"}
            sx={{
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              textTransform: 'none',
              fontWeight: 700,
              boxShadow: '0 4px 12px rgba(124, 58, 237, 0.2)',
              '&:hover': {
                transform: 'translateY(-1px)',
                boxShadow: '0 6px 16px rgba(124, 58, 237, 0.3)',
              }
            }}
          >
            Yeni Hareket
          </Button>

          {!isMobile && <Box sx={{ flexGrow: 1 }} />}

          <Box sx={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            gap: 2,
            width: isMobile ? '100%' : 'auto'
          }}>
            <TextField
              type="date"
              label="Başlangıç"
              value={baslangicTarihi}
              onChange={(e) => setBaslangicTarihi(e.target.value)}
              InputLabelProps={{ shrink: true }}
              size="small"
              fullWidth={isMobile}
            />
            <TextField
              type="date"
              label="Bitiş"
              value={bitisTarihi}
              onChange={(e) => setBitisTarihi(e.target.value)}
              InputLabelProps={{ shrink: true }}
              size="small"
              fullWidth={isMobile}
            />
          </Box>

          <Stack direction="row" spacing={1} sx={{ width: isMobile ? '100%' : 'auto' }}>
            <Button
              variant="outlined"
              fullWidth={isMobile}
              startIcon={<TableChart />}
              onClick={handleExportExcel}
              color="success"
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              Excel
            </Button>
            <Button
              variant="outlined"
              fullWidth={isMobile}
              startIcon={<PictureAsPdf />}
              onClick={handleExportPdf}
              color="error"
              sx={{ textTransform: 'none', fontWeight: 600 }}
            >
              PDF
            </Button>
            <IconButton
              sx={{ display: isMobile ? 'none' : 'inline-flex', border: '1px solid var(--border)' }}
              onClick={handlePrint}
            >
              <Print />
            </IconButton>
          </Stack>
        </Box>

        {/* Hareketler Listesi */}
        {
          isMobile ? (
            <Box sx={{ mb: 4 }}>
              {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                  <CircularProgress />
                </Box>
              ) : hareketler.length === 0 ? (
                <Paper variant="outlined" sx={{ p: 4, textAlign: 'center', bgcolor: 'var(--card)' }}>
                  <Typography variant="body2" color="text.secondary">
                    Henüz hareket kaydı bulunmuyor
                  </Typography>
                </Paper>
              ) : (
                hareketler.map((hareket) => (
                  <MobileMovementCard key={hareket.id} hareket={hareket} />
                ))
              )}
            </Box>
          ) : (
            <TableContainer component={Paper} elevation={0} sx={{ borderRadius: 'var(--radius-lg)', border: '1px solid var(--border)', overflow: 'hidden' }}>
              <Table>
                <TableHead sx={{ bgcolor: 'var(--muted)' }}>
                  <TableRow>
                    <TableCell sx={{ fontWeight: 700 }}>Tarih</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Tip</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Belge No</TableCell>
                    <TableCell sx={{ fontWeight: 700 }}>Açıklama</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Borç</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Alacak</TableCell>
                    <TableCell align="right" sx={{ fontWeight: 700 }}>Bakiye</TableCell>
                    <TableCell align="center" sx={{ fontWeight: 700 }}>İşlemler</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                        <CircularProgress />
                      </TableCell>
                    </TableRow>
                  ) : hareketler.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={8} align="center" sx={{ py: 8 }}>
                        <Typography variant="body1" color="text.secondary">
                          Henüz hareket kaydı bulunmuyor
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    hareketler.map((hareket) => (
                      <TableRow key={hareket.id} hover>
                        <TableCell>
                          {new Date(hareket.tarih).toLocaleDateString('tr-TR')}
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={getTipLabel(hareket.tip)}
                            color={getTipColor(hareket.tip)}
                            size="small"
                            sx={{ fontWeight: 600 }}
                          />
                        </TableCell>
                        <TableCell>{hareket.belgeNo || '-'}</TableCell>
                        <TableCell>{hareket.aciklama}</TableCell>
                        <TableCell align="right" sx={{ color: '#ef4444', fontWeight: 600 }}>
                          {hareket.tip === 'BORC' ? `₺${parseFloat(hareket.tutar).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}` : '-'}
                        </TableCell>
                        <TableCell align="right" sx={{ color: '#10b981', fontWeight: 600 }}>
                          {hareket.tip === 'ALACAK' ? `₺${parseFloat(hareket.tutar).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}` : '-'}
                        </TableCell>
                        <TableCell align="right" sx={{ fontWeight: 800 }}>
                          ₺{parseFloat(hareket.bakiye).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                        </TableCell>
                        <TableCell align="center">
                          <IconButton
                            size="small"
                            color="primary"
                            onClick={() => handleIncele(hareket)}
                            title="İncele"
                          >
                            <Visibility fontSize="small" />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          )
        }
      </TabPanel>

      {/* Add Dialog */}
      <Dialog open={openAdd} onClose={() => setOpenAdd(false)} maxWidth="sm" fullWidth fullScreen={isMobile}>
        <DialogTitle sx={{
          background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
          color: 'white',
          fontWeight: 'bold',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          Yeni Hareket Ekle
          <IconButton onClick={() => setOpenAdd(false)} sx={{ color: 'white' }}>
            <Add sx={{ transform: 'rotate(45deg)' }} />
          </IconButton>
        </DialogTitle>
        <DialogContent sx={{ pt: 3 }}>
          <Box component="form" sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <FormControl fullWidth size="small">
              <InputLabel>İşlem Tipi</InputLabel>
              <Select
                value={formData.tip}
                label="İşlem Tipi"
                onChange={(e) => setFormData({ ...formData, tip: e.target.value as any })}
              >
                <MenuItem value="BORC">Borç (Satış)</MenuItem>
                <MenuItem value="ALACAK">Alacak (Tahsilat)</MenuItem>
                <MenuItem value="DEVIR">Devir</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="Tarih"
              type="date"
              fullWidth
              size="small"
              value={formData.tarih}
              onChange={(e) => setFormData({ ...formData, tarih: e.target.value })}
              InputLabelProps={{ shrink: true }}
            />

            <TextField
              label="Tutar"
              type="number"
              fullWidth
              size="small"
              value={formData.tutar}
              onChange={(e) => setFormData({ ...formData, tutar: e.target.value })}
              InputProps={{
                startAdornment: <Typography sx={{ mr: 1, color: 'text.secondary' }}>₺</Typography>
              }}
            />

            <TextField
              label="Belge No"
              fullWidth
              size="small"
              value={formData.belgeNo}
              onChange={(e) => setFormData({ ...formData, belgeNo: e.target.value })}
            />

            <TextField
              label="Açıklama"
              fullWidth
              multiline
              rows={3}
              size="small"
              value={formData.aciklama}
              onChange={(e) => setFormData({ ...formData, aciklama: e.target.value })}
            />
          </Box>
        </DialogContent>
        <DialogActions sx={{ p: 2, borderTop: '1px solid', borderColor: 'divider' }}>
          <Button onClick={() => setOpenAdd(false)} sx={{ color: 'text.secondary' }}>İptal</Button>
          <Button
            variant="contained"
            onClick={handleAdd}
            sx={{
              background: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
              px: 4
            }}
          >
            Kaydet
          </Button>
        </DialogActions>
      </Dialog>

      {/* İncele Dialog */}
      <Dialog open={openIncele} onClose={() => setOpenIncele(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Hareket Detayı</DialogTitle>
        <DialogContent>
          {selectedHareket && (
            <List>
              <ListItem>
                <ListItemText primary="Tarih" secondary={new Date(selectedHareket.tarih).toLocaleDateString()} />
              </ListItem>
              <ListItem>
                <ListItemText primary="Tip" secondary={getTipLabel(selectedHareket.tip)} />
              </ListItem>
              <ListItem>
                <ListItemText primary="Tutar" secondary={`₺${parseFloat(selectedHareket.tutar).toLocaleString()}`} />
              </ListItem>
              <ListItem>
                <ListItemText primary="Açıklama" secondary={selectedHareket.aciklama} />
              </ListItem>
              <ListItem>
                <ListItemText primary="Belge No" secondary={selectedHareket.belgeNo || '-'} />
              </ListItem>
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenIncele(false)}>Kapat</Button>
        </DialogActions>
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <Alert severity={snackbar.severity} onClose={() => setSnackbar({ ...snackbar, open: false })}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </MainLayout>
  );
}
