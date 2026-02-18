'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  Paper,
  Stack,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Badge,
  IconButton,
  Alert,
  LinearProgress,
  useTheme,
  useMediaQuery,
  Tooltip,
  Collapse,
  Button,
  ButtonGroup,
  Skeleton,
} from '@mui/material';
import {
  Inventory2Outlined,
  PeopleAltOutlined,
  ReceiptOutlined,
  TrendingUpOutlined,
  NotificationsActiveOutlined,
  EmailOutlined,
  CreditCardOutlined,
  AddOutlined,
  AccountBalanceWalletOutlined,
  PaymentOutlined,
  AttachMoneyOutlined,
  CalendarMonthOutlined,
  ExpandMore,
  ExpandLess,
  AccountBalanceOutlined,
  DescriptionOutlined,
  ArrowForward,
  TodayOutlined,
  EventOutlined,
  DateRangeOutlined,
} from '@mui/icons-material';
import axios from '@/lib/axios';
import MainLayout from '@/components/Layout/MainLayout';
import { useRouter } from 'next/navigation';
import * as Icons from '@mui/icons-material';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip as RechartsTooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  AreaChart,
  Area,
} from 'recharts';

// Stats cards ve sales data artık API'den çekilecek

interface GunlukHatirlatici {
  personelOdemeleri: any[];
  vadesiGecenFaturalar: any[];
  krediTaksitleri: any[];
  krediKartiTarihleri: any[];
  cekSenetler: any[];
}

export default function DashboardPage() {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));
  const [hatirlaticilar, setHatirlaticilar] = useState<GunlukHatirlatici>({
    personelOdemeleri: [],
    vadesiGecenFaturalar: [],
    krediTaksitleri: [],
    krediKartiTarihleri: [],
    cekSenetler: [],
  });
  const [hatirlaticiOpen, setHatirlaticiOpen] = useState(true);
  const [loading, setLoading] = useState(false);
  const [filtre, setFiltre] = useState<'bugun' | 'yarin' | 'bu-hafta'>('bugun');
  const [sesAktif, setSesAktif] = useState(false);

  // Dashboard istatistikleri
  const [stats, setStats] = useState({
    toplamStok: 0,
    cariSayisi: 0,
    aylikSatis: 0,
    karMarji: 0,
  });
  const [salesData, setSalesData] = useState<Array<{ name: string; satis: number; kar: number }>>([]);
  const [statsLoading, setStatsLoading] = useState(false);
  const [maasStats, setMaasStats] = useState({
    toplamMaas: 0,
    odenenMaas: 0,
    kalanMaas: 0
  });
  const [tenantSettings, setTenantSettings] = useState<any>(null);

  // Toplam hatırlatıcı sayısı
  const toplamHatirlatici =
    hatirlaticilar.personelOdemeleri.length +
    hatirlaticilar.vadesiGecenFaturalar.length +
    hatirlaticilar.krediTaksitleri.length +
    hatirlaticilar.krediKartiTarihleri.length +
    hatirlaticilar.cekSenetler.length;

  useEffect(() => {
    fetchGunlukHatirlaticilar();
    fetchDashboardStats();
    fetchMaasStats();
    fetchTenantSettings();
  }, [filtre]);

  useEffect(() => {
    // Ses bildirimi (sadece ilk yüklemede ve hatırlatıcı varsa)
    if (sesAktif && toplamHatirlatici > 0) {
      playNotificationSound();
    }
  }, [hatirlaticilar, sesAktif, toplamHatirlatici]);

  const playNotificationSound = () => {
    try {
      const audio = new Audio('/notification.mp3');
      audio.volume = 0.5;
      audio.play().catch(err => console.log('Ses çalınamadı:', err));
    } catch (error) {
      console.log('Ses özelliği desteklenmiyor');
    }
  };

  const fetchGunlukHatirlaticilar = async () => {
    try {
      setLoading(true);

      let baslangic = new Date();
      let bitis = new Date();

      // Saat bilgisini sıfırla (timezone sorununu önlemek için)
      baslangic.setHours(0, 0, 0, 0);
      bitis.setHours(23, 59, 59, 999);

      // Filtre'ye göre tarih aralığı belirle
      if (filtre === 'bugun') {
        // Bugün
      } else if (filtre === 'yarin') {
        baslangic.setDate(baslangic.getDate() + 1);
        bitis.setDate(bitis.getDate() + 1);
      } else if (filtre === 'bu-hafta') {
        bitis.setDate(bitis.getDate() + 7);
      }

      // Tarihleri YYYY-MM-DD formatına çevir (yerel saat kullanarak)
      const formatDate = (date: Date) => {
        const year = date.getFullYear();
        const month = String(date.getMonth() + 1).padStart(2, '0');
        const day = String(date.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
      };

      const baslangicStr = formatDate(baslangic);
      const bitisStr = formatDate(bitis);

      // Bugün maaş günü olan personeller
      const gun = new Date().getDate();
      const personelRes = await axios.get('/personel', {
        params: { aktif: true },
      });
      const personelDataRaw = Array.isArray(personelRes.data) ? personelRes.data : (personelRes.data?.data || []);
      const personelData = Array.isArray(personelDataRaw) ? personelDataRaw : [];
      let personelOdemeleri = [];

      // Sadece filtre bugün ise maaş günü kontrolü yap (mevcut mantık bunu varsayıyor gibi)
      if (filtre === 'bugun') {
        personelOdemeleri = personelData.filter((p: any) => {
          if (!p.maasGunu) return false;
          if (p.maasGunu === 0) {
            // Ay sonu kontrolü
            const sonGun = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
            return gun === sonGun;
          }
          return p.maasGunu === gun;
        });
      }

      // Vadesi geçmiş faturalar
      let vadesiGecenFaturalar: any[] = [];
      try {
        const faturaRes = await axios.get('/fatura', {
          params: { limit: 100 },
        });

        const faturaDataRaw = faturaRes.data?.data || (Array.isArray(faturaRes.data) ? faturaRes.data : []);
        const validFaturaDataRaw = Array.isArray(faturaDataRaw) ? faturaDataRaw : [];

        vadesiGecenFaturalar = validFaturaDataRaw.filter((f: any) =>
          f.vade &&
          new Date(f.vade) < new Date() &&
          f.odenecekTutar &&
          Number(f.odenecekTutar) > 0
        ) || [];
      } catch (faturaError) {
        console.log('Fatura hatırlatıcıları yüklenemedi:', faturaError);
      }

      // Kredi Taksitleri
      let krediTaksitleri: any[] = [];
      try {
        const krediRes = await axios.get('/banka/taksitler/yaklasan', {
          params: { baslangic: baslangicStr, bitis: bitisStr }
        });
        krediTaksitleri = Array.isArray(krediRes.data) ? krediRes.data : [];
      } catch (krediError) {
        console.log('Kredi hatırlatıcıları yüklenemedi:', krediError);
      }

      // Kredi Kartı Tarihleri - Her zaman önümüzdeki 15 günü getir (filtre ne olursa olsun)
      let krediKartiTarihleri: any[] = [];
      try {
        const ccBitis = new Date();
        ccBitis.setDate(ccBitis.getDate() + 15);
        const ccBitisStr = ccBitis.toISOString();

        const ccRes = await axios.get('/banka/kredi-karti/yaklasan', {
          params: { baslangic: baslangicStr, bitis: ccBitisStr }
        });
        krediKartiTarihleri = Array.isArray(ccRes.data) ? ccRes.data : [];
      } catch (ccError) {
        console.log('Kredi kartı hatırlatıcıları yüklenemedi:', ccError);
      }

      // Çek/Senet Vadeleri
      let cekSenetler: any[] = [];
      try {
        const cekRes = await axios.get('/cek-senet/yaklasan', {
          params: { baslangic: baslangicStr, bitis: bitisStr }
        });
        cekSenetler = Array.isArray(cekRes.data) ? cekRes.data : [];
      } catch (cekError) {
        console.log('Çek/Senet hatırlatıcıları yüklenemedi:', cekError);
      }

      setHatirlaticilar({
        personelOdemeleri,
        vadesiGecenFaturalar: vadesiGecenFaturalar.slice(0, 5),
        krediTaksitleri,
        krediKartiTarihleri,
        cekSenetler,
      });
    } catch (error) {
      console.error('Hatırlatıcılar yüklenirken hata:', error);
      // Hata olsa bile kısmi veri göster
      setHatirlaticilar({
        personelOdemeleri: [],
        vadesiGecenFaturalar: [],
        krediTaksitleri: [],
        krediKartiTarihleri: [],
        cekSenetler: [],
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchDashboardStats = async () => {
    try {
      setStatsLoading(true);

      // Toplam stok sayısı
      const stokRes = await axios.get('/stok', { params: { limit: 1 } });
      const toplamStok = stokRes.data?.meta?.total || 0;

      // Cari sayısı
      const cariRes = await axios.get('/cari', { params: { limit: 1 } });
      const cariSayisi = cariRes.data?.meta?.total || 0;

      // Aylık satış (bu ayın satış faturaları)
      const bugun = new Date();
      const ayBaslangic = new Date(bugun.getFullYear(), bugun.getMonth(), 1);
      const ayBitis = new Date(bugun.getFullYear(), bugun.getMonth() + 1, 0, 23, 59, 59);

      const faturaRes = await axios.get('/fatura', {
        params: {
          faturaTipi: 'SATIS',
          limit: 1000,
        },
      });

      const faturalarRaw = faturaRes.data?.data || [];
      const faturalar = Array.isArray(faturalarRaw) ? faturalarRaw : [];
      // Bu ayın faturalarını filtrele
      const buAyFaturalar = faturalar.filter((f: any) => {
        if (!f.createdAt && !f.tarih) return false;
        const faturaTarihi = new Date(f.createdAt || f.tarih);
        return faturaTarihi >= ayBaslangic && faturaTarihi <= ayBitis;
      });
      const aylikSatis = buAyFaturalar.reduce((sum: number, f: any) => {
        const tutar = Number(f.genelToplam || f.toplamTutar || 0);
        return sum + tutar;
      }, 0);

      // Kâr marjı hesaplama (basit: satış - maliyet / satış * 100)
      // Bu hesaplama için daha detaylı veri gerekebilir, şimdilik basit bir yaklaşım
      const karMarji = aylikSatis > 0 ? ((aylikSatis * 0.15) / aylikSatis * 100) : 0; // Varsayılan %15 kar

      // Son 6 ayın satış verileri
      const aylikSatislar: Array<{ name: string; satis: number; kar: number }> = [];
      const ayIsimleri = ['Oca', 'Şub', 'Mar', 'Nis', 'May', 'Haz', 'Tem', 'Ağu', 'Eyl', 'Eki', 'Kas', 'Ara'];

      for (let i = 5; i >= 0; i--) {
        const tarih = new Date(bugun.getFullYear(), bugun.getMonth() - i, 1);
        const ayBas = new Date(tarih.getFullYear(), tarih.getMonth(), 1);
        const ayBit = new Date(tarih.getFullYear(), tarih.getMonth() + 1, 0, 23, 59, 59);

        try {
          const ayFaturaRes = await axios.get('/fatura', {
            params: {
              faturaTipi: 'SATIS',
              limit: 1000,
            },
          });

          const tumFaturalarRaw = ayFaturaRes.data?.data || [];
          const tumFaturalar = Array.isArray(tumFaturalarRaw) ? tumFaturalarRaw : [];
          // İlgili ayın faturalarını filtrele
          const ayFaturalar = tumFaturalar.filter((f: any) => {
            if (!f.createdAt && !f.tarih) return false;
            const faturaTarihi = new Date(f.createdAt || f.tarih);
            return faturaTarihi >= ayBas && faturaTarihi <= ayBit;
          });
          const aySatis = ayFaturalar.reduce((sum: number, f: any) => {
            return sum + Number(f.genelToplam || f.toplamTutar || 0);
          }, 0);
          const ayKar = aySatis * 0.15; // Varsayılan %15 kar

          aylikSatislar.push({
            name: ayIsimleri[tarih.getMonth()],
            satis: aySatis,
            kar: ayKar,
          });
        } catch (error) {
          // Hata durumunda 0 değer ekle
          aylikSatislar.push({
            name: ayIsimleri[tarih.getMonth()],
            satis: 0,
            kar: 0,
          });
        }
      }

      setStats({
        toplamStok,
        cariSayisi,
        aylikSatis,
        karMarji,
      });
      setSalesData(aylikSatislar);
    } catch (error) {
      console.error('Dashboard istatistikleri yüklenirken hata:', error);
      // Hata durumunda varsayılan değerler
      setStats({
        toplamStok: 0,
        cariSayisi: 0,
        aylikSatis: 0,
        karMarji: 0,
      });
      setSalesData([
        { name: 'Oca', satis: 0, kar: 0 },
        { name: 'Şub', satis: 0, kar: 0 },
        { name: 'Mar', satis: 0, kar: 0 },
        { name: 'Nis', satis: 0, kar: 0 },
        { name: 'May', satis: 0, kar: 0 },
        { name: 'Haz', satis: 0, kar: 0 },
      ]);
    } finally {
      setStatsLoading(false);
    }
  };

  const fetchMaasStats = async () => {
    try {
      const yil = new Date().getFullYear();
      const ay = new Date().getMonth() + 1;
      const res = await axios.get(`/maas-plan/odenecek/${yil}/${ay}`);
      const planlar = res.data.planlar || [];

      const toplam = planlar.reduce((acc: number, p: any) => acc + Number(p.toplam), 0);
      const odenen = planlar.reduce((acc: number, p: any) => acc + Number(p.odenenTutar), 0);

      setMaasStats({
        toplamMaas: toplam,
        odenenMaas: odenen,
        kalanMaas: toplam - odenen
      });
    } catch (error) {
      console.error('Maaş istatistikleri yüklenemedi:', error);
    }
  };

  const fetchTenantSettings = async () => {
    try {
      setStatsLoading(true);
      const res = await axios.get('/tenants/settings');
      setTenantSettings(res.data);
    } catch (error) {
      console.error('Tenant settings loading error:', error);
    } finally {
      setStatsLoading(false);
    }
  };

  // Dinamik stats cards - Modern, Gradient-Free Design
  const statsCards = [
    {
      title: 'Toplam Stok Ürün',
      value: statsLoading ? '...' : stats.toplamStok.toLocaleString('tr-TR'),
      icon: Inventory2Outlined,
      color: '#6366f1', // Indigo-500
      trend: '+2.5%',
    },
    {
      title: 'Aktif Cari Kaydı',
      value: statsLoading ? '...' : stats.cariSayisi.toLocaleString('tr-TR'),
      icon: PeopleAltOutlined,
      color: '#8b5cf6', // Violet-500
      trend: '+12',
    },
    {
      title: 'Aylık Ciro',
      value: statsLoading ? '...' : `₺${stats.aylikSatis.toLocaleString('tr-TR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
      icon: ReceiptOutlined,
      color: '#10b981', // Emerald-500
      trend: '+15.2%',
    },
    {
      title: 'Tahmini Kâr',
      value: statsLoading ? '...' : `₺${(stats.aylikSatis * 0.15).toLocaleString('tr-TR', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`,
      icon: TrendingUpOutlined,
      color: '#0f172a', // Slate-900 (Corporate)
      trend: '%15 Marj',
    }
  ];

  return (
    <MainLayout>
      <Box sx={{ mb: 4, display: 'flex', flexDirection: isMobile ? 'column' : 'row', justifyContent: 'space-between', alignItems: isMobile ? 'stretch' : 'center', gap: 3 }}>
        <Box sx={{ flex: 1, minWidth: 0 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: 'var(--radius-lg)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                bgcolor: 'var(--card)',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-sm)',
                overflow: 'hidden',
                flexShrink: 0
              }}
            >
              {statsLoading ? (
                <Skeleton variant="rectangular" width={56} height={56} />
              ) : tenantSettings?.logoUrl ? (
                <Box
                  component="img"
                  src={tenantSettings.logoUrl}
                  sx={{ width: '100%', height: '100%', objectFit: 'contain', p: 0.5 }}
                />
              ) : (
                <Box sx={{ width: 12, height: 36, bgcolor: 'var(--primary)', borderRadius: 'var(--radius-full)' }} />
              )}
            </Box>
            <Box>
              <Typography
                variant="h4"
                sx={{
                  fontWeight: 900,
                  fontSize: { xs: '1.5rem', md: '2.25rem' },
                  color: 'var(--foreground)',
                  letterSpacing: '-0.04em',
                  lineHeight: 1.1,
                }}
              >
                {statsLoading ? (
                  <Skeleton width={200} />
                ) : (
                  tenantSettings?.companyName || 'Yönetici Özeti'
                )}
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: 'var(--muted-foreground)',
                  fontWeight: 600,
                  fontSize: '0.875rem',
                  letterSpacing: '0.02em',
                  mt: 0.5,
                  textTransform: 'uppercase',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 1
                }}
              >
                <Box component="span" sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: 'var(--success)' }} />
                SİSTEM GENEL PERFORMANSI
              </Typography>
            </Box>
          </Box>
        </Box>

        <Stack direction="row" spacing={2} sx={{ alignItems: 'center', alignSelf: isMobile ? 'flex-end' : 'center' }}>
          <Box sx={{ display: { xs: 'none', lg: 'flex' }, gap: 1 }}>
          </Box>

          <Divider orientation="vertical" flexItem sx={{ display: { xs: 'none', lg: 'block' }, mx: 1 }} />

          <Badge
            badgeContent={toplamHatirlatici}
            max={99}
            sx={{
              '& .MuiBadge-badge': {
                bgcolor: 'var(--destructive)',
                color: 'var(--destructive-foreground)',
                fontWeight: 700,
                border: '2px solid var(--background)',
              },
            }}
          >
            <IconButton
              onClick={() => setHatirlaticiOpen(!hatirlaticiOpen)}
              sx={{
                width: 44,
                height: 44,
                bgcolor: hatirlaticiOpen ? 'var(--primary)' : 'var(--card)',
                color: hatirlaticiOpen ? 'var(--primary-foreground)' : 'var(--foreground)',
                border: '1px solid var(--border)',
                boxShadow: 'var(--shadow-sm)',
                '&:hover': {
                  bgcolor: hatirlaticiOpen ? 'var(--primary)' : 'var(--muted)',
                  transform: 'translateY(-1px)',
                  boxShadow: 'var(--shadow-md)',
                },
                transition: 'all 0.2s ease',
              }}
            >
              <NotificationsActiveOutlined sx={{ fontSize: 20 }} />
            </IconButton>
          </Badge>
        </Stack>
      </Box>

      {/* Günlük Hatırlatıcılar Paneli */}
      <Collapse in={hatirlaticiOpen}>
        {toplamHatirlatici > 0 ? (
          <Paper
            sx={{
              p: 3,
              mb: 3,
              borderRadius: 'var(--radius-lg)',
              bgcolor: 'var(--card)',
              border: '1px solid var(--primary)',
              boxShadow: '0 4px 20px rgba(124, 58, 237, 0.08)',
              position: 'relative',
              overflow: 'hidden',
              '&::before': {
                content: '""',
                position: 'absolute',
                top: 0,
                left: 0,
                width: 4,
                height: '100%',
                bgcolor: 'var(--primary)',
              }
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <NotificationsActiveOutlined sx={{ color: 'var(--primary)', fontSize: 24 }} />
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    fontSize: '1.125rem',
                    color: 'var(--foreground)',
                  }}
                >
                  🔔 Hatırlatıcılar
                </Typography>
                <Chip
                  label={`${toplamHatirlatici} İşlem`}
                  size="small"
                  sx={{
                    bgcolor: 'var(--primary)',
                    color: 'var(--primary-foreground)',
                    fontWeight: 600,
                    fontSize: '0.75rem',
                  }}
                />
              </Box>

              <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                {/* Filtre Butonları */}
                <ButtonGroup size="small" variant="outlined">
                  <Button
                    onClick={() => setFiltre('bugun')}
                    variant={filtre === 'bugun' ? 'contained' : 'outlined'}
                    startIcon={<TodayOutlined sx={{ fontSize: 18 }} />}
                    sx={{
                      textTransform: 'none',
                      fontWeight: filtre === 'bugun' ? 600 : 500,
                      ...(filtre === 'bugun' && {
                        bgcolor: 'var(--secondary)',
                        color: 'var(--secondary-foreground)',
                        borderColor: 'var(--secondary)',
                        '&:hover': {
                          bgcolor: 'var(--secondary-hover)',
                          borderColor: 'var(--secondary-hover)',
                        },
                      }),
                      ...(filtre !== 'bugun' && {
                        borderColor: 'var(--border)',
                        color: 'var(--muted-foreground)',
                        '&:hover': {
                          bgcolor: 'var(--muted)',
                          borderColor: 'var(--ring)',
                          color: 'var(--foreground)',
                        },
                      }),
                    }}
                  >
                    Bugün
                  </Button>
                  <Button
                    onClick={() => setFiltre('yarin')}
                    variant={filtre === 'yarin' ? 'contained' : 'outlined'}
                    startIcon={<EventOutlined sx={{ fontSize: 18 }} />}
                    sx={{
                      textTransform: 'none',
                      fontWeight: filtre === 'yarin' ? 600 : 500,
                      ...(filtre === 'yarin' && {
                        bgcolor: 'var(--secondary)',
                        color: 'var(--secondary-foreground)',
                        borderColor: 'var(--secondary)',
                        '&:hover': {
                          bgcolor: 'var(--secondary-hover)',
                          borderColor: 'var(--secondary-hover)',
                        },
                      }),
                      ...(filtre !== 'yarin' && {
                        borderColor: 'var(--border)',
                        color: 'var(--muted-foreground)',
                        '&:hover': {
                          bgcolor: 'var(--muted)',
                          borderColor: 'var(--ring)',
                          color: 'var(--foreground)',
                        },
                      }),
                    }}
                  >
                    Yarın
                  </Button>
                  <Button
                    onClick={() => setFiltre('bu-hafta')}
                    variant={filtre === 'bu-hafta' ? 'contained' : 'outlined'}
                    startIcon={<DateRangeOutlined sx={{ fontSize: 18 }} />}
                    sx={{
                      textTransform: 'none',
                      fontWeight: filtre === 'bu-hafta' ? 600 : 500,
                      ...(filtre === 'bu-hafta' && {
                        bgcolor: 'var(--secondary)',
                        color: 'var(--secondary-foreground)',
                        borderColor: 'var(--secondary)',
                        '&:hover': {
                          bgcolor: 'var(--secondary-hover)',
                          borderColor: 'var(--secondary-hover)',
                        },
                      }),
                      ...(filtre !== 'bu-hafta' && {
                        borderColor: 'var(--border)',
                        color: 'var(--muted-foreground)',
                        '&:hover': {
                          bgcolor: 'var(--muted)',
                          borderColor: 'var(--ring)',
                          color: 'var(--foreground)',
                        },
                      }),
                    }}
                  >
                    Bu Hafta
                  </Button>
                </ButtonGroup>

                {/* Ses Bildirimi Toggle */}
                <Tooltip title={sesAktif ? 'Ses bildirimini kapat' : 'Ses bildirimini aç'}>
                  <IconButton
                    size="small"
                    onClick={() => setSesAktif(!sesAktif)}
                    sx={{
                      color: sesAktif ? 'var(--chart-2)' : 'var(--muted-foreground)',
                      bgcolor: sesAktif
                        ? 'color-mix(in srgb, var(--chart-2) 12%, transparent)'
                        : 'transparent',
                      '&:hover': {
                        bgcolor: sesAktif
                          ? 'color-mix(in srgb, var(--chart-2) 20%, transparent)'
                          : 'var(--muted)',
                      },
                      transition: 'all 0.2s ease',
                    }}
                  >
                    <NotificationsActiveOutlined sx={{ fontSize: 20 }} />
                  </IconButton>
                </Tooltip>

                <IconButton
                  size="small"
                  onClick={() => setHatirlaticiOpen(false)}
                  sx={{
                    color: 'var(--muted-foreground)',
                    '&:hover': {
                      bgcolor: 'var(--muted)',
                      color: 'var(--foreground)',
                    },
                    transition: 'all 0.2s ease',
                  }}
                >
                  <ExpandLess sx={{ fontSize: 20 }} />
                </IconButton>
              </Box>
            </Box>

            {/* Bilgi Mesajı */}
            {filtre === 'bu-hafta' && (
              <Alert
                severity="info"
                sx={{
                  mb: 2,
                  bgcolor: 'color-mix(in srgb, var(--chart-1) 10%, transparent)',
                  border: '1px solid var(--chart-1)',
                  color: 'var(--foreground)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                Bu hafta içinde (7 gün) vadesi gelecek işlemler gösteriliyor
              </Alert>
            )}

            <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>


              {/* Personel Maaş Hatırlatıcısı */}
              {hatirlaticilar.personelOdemeleri.length > 0 && (
                <Card sx={{
                  flex: '1 1 calc(33.33% - 16px)',
                  minWidth: 280,
                  borderRadius: 'var(--radius)',
                  border: '1px solid var(--border)',
                  bgcolor: 'var(--card)',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    boxShadow: 'var(--shadow-md)',
                    borderColor: 'var(--ring)',
                  },
                }}>
                  <CardContent sx={{ p: 2.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                      <Box
                        sx={{
                          bgcolor: 'color-mix(in srgb, var(--chart-2) 15%, transparent)',
                          borderRadius: 'var(--radius-md)',
                          p: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <PaymentOutlined sx={{ color: 'var(--chart-2)', fontSize: 20 }} />
                      </Box>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: 700,
                          fontSize: '0.9375rem',
                          color: 'var(--foreground)',
                          flex: 1,
                        }}
                      >
                        Maaş Ödeme Günü
                      </Typography>
                      <Chip
                        label={hatirlaticilar.personelOdemeleri.length}
                        size="small"
                        sx={{
                          bgcolor: 'var(--chart-2)',
                          color: 'white',
                          fontWeight: 600,
                          fontSize: '0.75rem',
                        }}
                      />
                    </Box>
                    <List dense sx={{ p: 0 }}>
                      {hatirlaticilar.personelOdemeleri.slice(0, 3).map((p: any) => (
                        <ListItem
                          key={p.id}
                          sx={{
                            px: 1.5,
                            py: 1,
                            mb: 0.75,
                            cursor: 'pointer',
                            borderRadius: 'var(--radius-md)',
                            bgcolor: 'transparent',
                            border: '1px solid transparent',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              bgcolor: 'var(--muted)',
                              borderColor: 'var(--border)',
                            },
                          }}
                          onClick={() => router.push('/ik/personel')}
                        >
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontWeight: 600,
                                    fontSize: '0.875rem',
                                    color: 'var(--foreground)',
                                  }}
                                >
                                  💰 {p.ad} {p.soyad}
                                </Typography>
                                <ArrowForward sx={{ fontSize: 14, color: 'var(--chart-2)', ml: 'auto' }} />
                              </Box>
                            }
                            secondary={
                              <Typography
                                variant="caption"
                                sx={{
                                  color: 'var(--muted-foreground)',
                                  fontSize: '0.75rem',
                                }}
                              >
                                Maaş: ₺{Number(p.maas || 0).toLocaleString('tr-TR')} -
                                Bakiye: {Number(p.bakiye) >= 0 ? '-' : '+'}₺{Math.abs(Number(p.bakiye)).toLocaleString('tr-TR')}
                              </Typography>
                            }
                          />
                        </ListItem>
                      ))}
                      {hatirlaticilar.personelOdemeleri.length > 3 && (
                        <Button
                          size="small"
                          fullWidth
                          onClick={() => router.push('/ik/personel')}
                          sx={{
                            mt: 1,
                            textTransform: 'none',
                            fontWeight: 600,
                            bgcolor: 'var(--muted)',
                            color: 'var(--foreground)',
                            '&:hover': {
                              bgcolor: 'var(--secondary-light)',
                              color: 'var(--secondary)',
                            },
                          }}
                        >
                          Tümünü Gör ({hatirlaticilar.personelOdemeleri.length})
                        </Button>
                      )}
                    </List>
                  </CardContent>
                </Card>
              )}

              {/* Banka & Kredi Ödemeleri (Consolidated Card) */}
              {(hatirlaticilar.krediTaksitleri.length > 0 || hatirlaticilar.krediKartiTarihleri.length > 0) && (
                <Card sx={{
                  flex: '1 1 calc(33.33% - 16px)',
                  minWidth: 280,
                  borderRadius: 'var(--radius)',
                  border: '1px solid var(--border)',
                  bgcolor: 'var(--card)',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    boxShadow: 'var(--shadow-md)',
                    borderColor: 'var(--ring)',
                  },
                }}>
                  <CardContent sx={{ p: 2.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                      <Box
                        sx={{
                          bgcolor: 'color-mix(in srgb, var(--primary) 15%, transparent)',
                          borderRadius: 'var(--radius-md)',
                          p: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <CreditCardOutlined sx={{ color: 'var(--primary)', fontSize: 20 }} />
                      </Box>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: 700,
                          fontSize: '0.9375rem',
                          color: 'var(--foreground)',
                          flex: 1,
                        }}
                      >
                        Banka & Kredi Ödemeleri
                      </Typography>
                      <Chip
                        label={hatirlaticilar.krediTaksitleri.length + hatirlaticilar.krediKartiTarihleri.length}
                        size="small"
                        sx={{
                          bgcolor: 'var(--primary)',
                          color: 'white',
                          fontWeight: 600,
                          fontSize: '0.75rem',
                        }}
                      />
                    </Box>
                    <List dense sx={{ p: 0 }}>
                      {/* Credit Card Dates First (Broad range) */}
                      {hatirlaticilar.krediKartiTarihleri.slice(0, 3).map((rem: any) => (
                        <ListItem
                          key={rem.id}
                          sx={{
                            px: 1.5,
                            py: 1,
                            mb: 0.75,
                            cursor: 'pointer',
                            borderRadius: 'var(--radius-md)',
                            bgcolor: 'color-mix(in srgb, var(--chart-4) 5%, transparent)',
                            border: '1px solid color-mix(in srgb, var(--chart-4) 20%, transparent)',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              bgcolor: 'color-mix(in srgb, var(--chart-4) 12%, transparent)',
                              borderColor: 'var(--chart-4)',
                            },
                          }}
                          onClick={() => router.push(`/banka/hesap/${rem.cardId}`)}
                        >
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontWeight: 600,
                                    fontSize: '0.875rem',
                                    color: 'var(--foreground)',
                                  }}
                                >
                                  💳 {rem.bankaAdi} - {rem.label}
                                </Typography>
                                <ArrowForward sx={{ fontSize: 14, color: 'var(--chart-4)', ml: 'auto' }} />
                              </Box>
                            }
                            secondary={
                              <Typography
                                component="div"
                                variant="caption"
                                sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                              >
                                <Typography
                                  component="span"
                                  variant="caption"
                                  sx={{
                                    color: 'var(--muted-foreground)',
                                    fontSize: '0.75rem',
                                  }}
                                >
                                  {rem.hesapAdi}
                                </Typography>
                                <Typography
                                  component="span"
                                  variant="caption"
                                  sx={{
                                    color: 'var(--chart-4)',
                                    fontWeight: 700,
                                    fontSize: '0.75rem',
                                  }}
                                >
                                  {new Date(rem.tarih).toLocaleDateString('tr-TR')}
                                </Typography>
                              </Typography>
                            }
                          />
                        </ListItem>
                      ))}

                      {/* Loan Installments */}
                      {hatirlaticilar.krediTaksitleri.slice(0, 3).map((taksit: any) => (
                        <ListItem
                          key={taksit.id}
                          sx={{
                            px: 1.5,
                            py: 1,
                            mb: 0.75,
                            cursor: 'pointer',
                            borderRadius: 'var(--radius-md)',
                            bgcolor: 'transparent',
                            border: '1px solid transparent',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              bgcolor: 'var(--muted)',
                              borderColor: 'var(--border)',
                            },
                          }}
                          onClick={() => router.push(`/banka/hesap/${taksit.kredi.hesap.id}`)}
                        >
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontWeight: 600,
                                    fontSize: '0.875rem',
                                    color: 'var(--foreground)',
                                  }}
                                >
                                  🏦 {taksit.kredi.hesap.banka.ad} - {taksit.taksitNo}. Taksit
                                </Typography>
                                <ArrowForward sx={{ fontSize: 14, color: 'var(--primary)', ml: 'auto' }} />
                              </Box>
                            }
                            secondary={
                              <Typography
                                component="div"
                                variant="caption"
                                sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                              >
                                <Typography
                                  component="span"
                                  variant="caption"
                                  sx={{
                                    color: 'var(--muted-foreground)',
                                    fontSize: '0.75rem',
                                  }}
                                >
                                  Tutar: ₺{Number(taksit.tutar).toLocaleString('tr-TR')}
                                </Typography>
                                <Typography
                                  component="span"
                                  variant="caption"
                                  sx={{
                                    color: 'var(--primary)',
                                    fontWeight: 600,
                                    fontSize: '0.75rem',
                                  }}
                                >
                                  {new Date(taksit.vadeTarihi).toLocaleDateString('tr-TR')}
                                </Typography>
                              </Typography>
                            }
                          />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              )}

              {/* Çek/Senet Vadeleri */}
              {hatirlaticilar.cekSenetler.length > 0 && (
                <Card sx={{
                  flex: '1 1 calc(33.33% - 16px)',
                  minWidth: 280,
                  borderRadius: 'var(--radius)',
                  border: '1px solid var(--border)',
                  bgcolor: 'var(--card)',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    boxShadow: 'var(--shadow-md)',
                    borderColor: 'var(--ring)',
                  },
                }}>
                  <CardContent sx={{ p: 2.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                      <Box
                        sx={{
                          bgcolor: 'color-mix(in srgb, var(--chart-3) 15%, transparent)',
                          borderRadius: 'var(--radius-md)',
                          p: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <AccountBalanceWalletOutlined sx={{ color: 'var(--chart-3)', fontSize: 20 }} />
                      </Box>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: 700,
                          fontSize: '0.9375rem',
                          color: 'var(--foreground)',
                          flex: 1,
                        }}
                      >
                        Çek/Senet Vadeleri
                      </Typography>
                      <Chip
                        label={hatirlaticilar.cekSenetler.length}
                        size="small"
                        sx={{
                          bgcolor: 'var(--chart-3)',
                          color: 'white',
                          fontWeight: 600,
                          fontSize: '0.75rem',
                        }}
                      />
                    </Box>
                    <List dense sx={{ p: 0 }}>
                      {hatirlaticilar.cekSenetler.slice(0, 3).map((cek: any) => (
                        <ListItem
                          key={cek.id}
                          sx={{
                            px: 1.5,
                            py: 1,
                            mb: 0.75,
                            cursor: 'pointer',
                            borderRadius: 'var(--radius-md)',
                            bgcolor: 'transparent',
                            border: '1px solid transparent',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              bgcolor: 'var(--muted)',
                              borderColor: 'var(--border)',
                            },
                          }}
                          onClick={() => router.push(`/cek-senet/${cek.id}`)}
                        >
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontWeight: 600,
                                    fontSize: '0.875rem',
                                    color: 'var(--foreground)',
                                  }}
                                >
                                  📄 {cek.cekNo || cek.seriNo} - {cek.cari?.unvan}
                                </Typography>
                                <ArrowForward sx={{ fontSize: 14, color: 'var(--chart-3)', ml: 'auto' }} />
                              </Box>
                            }
                            secondary={
                              <Typography
                                component="div"
                                variant="caption"
                                sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}
                              >
                                <Typography
                                  component="span"
                                  variant="caption"
                                  sx={{
                                    color: 'var(--muted-foreground)',
                                    fontSize: '0.75rem',
                                  }}
                                >
                                  Tutar: ₺{Number(cek.kalanTutar).toLocaleString('tr-TR')}
                                </Typography>
                                <Typography
                                  component="span"
                                  variant="caption"
                                  sx={{
                                    color: 'var(--chart-3)',
                                    fontWeight: 700,
                                    fontSize: '0.75rem',
                                  }}
                                >
                                  {new Date(cek.vade).toLocaleDateString('tr-TR')}
                                </Typography>
                              </Typography>
                            }
                          />
                        </ListItem>
                      ))}
                      {hatirlaticilar.cekSenetler.length > 3 && (
                        <Button
                          size="small"
                          fullWidth
                          onClick={() => router.push('/cek-senet')}
                          sx={{
                            mt: 1,
                            textTransform: 'none',
                            fontWeight: 600,
                            bgcolor: 'var(--muted)',
                            color: 'var(--foreground)',
                            '&:hover': {
                              bgcolor: 'var(--secondary-light)',
                              color: 'var(--secondary)',
                            },
                          }}
                        >
                          Tümünü Gör ({hatirlaticilar.cekSenetler.length})
                        </Button>
                      )}
                    </List>
                  </CardContent>
                </Card>
              )}


              {/* Vadesi Geçmiş Faturalar */}
              {hatirlaticilar.vadesiGecenFaturalar.length > 0 && (
                <Card sx={{
                  flex: '1 1 calc(33.33% - 16px)',
                  minWidth: 280,
                  borderRadius: 'var(--radius)',
                  border: '1px solid var(--border)',
                  bgcolor: 'var(--card)',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'all 0.2s ease',
                  '&:hover': {
                    boxShadow: 'var(--shadow-md)',
                    borderColor: 'var(--ring)',
                  },
                }}>
                  <CardContent sx={{ p: 2.5 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 2 }}>
                      <Box
                        sx={{
                          bgcolor: 'color-mix(in srgb, var(--destructive) 15%, transparent)',
                          borderRadius: 'var(--radius-md)',
                          p: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <AccountBalanceOutlined sx={{ color: 'var(--destructive)', fontSize: 20 }} />
                      </Box>
                      <Typography
                        variant="subtitle2"
                        sx={{
                          fontWeight: 700,
                          fontSize: '0.9375rem',
                          color: 'var(--foreground)',
                          flex: 1,
                        }}
                      >
                        Vadesi Geçmiş Faturalar
                      </Typography>
                      <Chip
                        label={hatirlaticilar.vadesiGecenFaturalar.length}
                        size="small"
                        sx={{
                          bgcolor: 'var(--destructive)',
                          color: 'var(--destructive-foreground)',
                          fontWeight: 600,
                          fontSize: '0.75rem',
                        }}
                      />
                    </Box>
                    <List dense sx={{ p: 0 }}>
                      {hatirlaticilar.vadesiGecenFaturalar.slice(0, 3).map((f: any) => (
                        <ListItem
                          key={f.id}
                          sx={{
                            px: 1.5,
                            py: 1,
                            mb: 0.75,
                            cursor: 'pointer',
                            borderRadius: 'var(--radius-md)',
                            bgcolor: 'transparent',
                            border: '1px solid transparent',
                            transition: 'all 0.2s ease',
                            '&:hover': {
                              bgcolor: 'var(--muted)',
                              borderColor: 'var(--border)',
                            },
                          }}
                          onClick={() => router.push('/fatura/arsiv')}
                        >
                          <ListItemText
                            primary={
                              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.5 }}>
                                <Typography
                                  variant="body2"
                                  sx={{
                                    fontWeight: 600,
                                    fontSize: '0.875rem',
                                    color: 'var(--foreground)',
                                  }}
                                >
                                  📋 {f.faturaNo}
                                </Typography>
                                <ArrowForward sx={{ fontSize: 14, color: 'var(--destructive)', ml: 'auto' }} />
                              </Box>
                            }
                            secondary={
                              <Typography
                                variant="caption"
                                sx={{
                                  color: 'var(--destructive)',
                                  fontSize: '0.75rem',
                                  fontWeight: 500,
                                }}
                              >
                                Vade: {new Date(f.vade).toLocaleDateString('tr-TR')} -
                                Kalan: ₺{Number(f.odenecekTutar).toLocaleString('tr-TR')}
                              </Typography>
                            }
                          />
                        </ListItem>
                      ))}
                      {hatirlaticilar.vadesiGecenFaturalar.length > 3 && (
                        <Button
                          size="small"
                          fullWidth
                          onClick={() => router.push('/fatura/arsiv')}
                          sx={{
                            mt: 1,
                            textTransform: 'none',
                            fontWeight: 600,
                            bgcolor: 'var(--muted)',
                            color: 'var(--foreground)',
                            '&:hover': {
                              bgcolor: 'var(--secondary-light)',
                              color: 'var(--secondary)',
                            },
                          }}
                        >
                          Tümünü Gör ({hatirlaticilar.vadesiGecenFaturalar.length})
                        </Button>
                      )}
                    </List>
                  </CardContent>
                </Card>
              )}

            </Box>
          </Paper>
        ) : (
          <Paper sx={{
            p: 3,
            mb: 3,
            borderRadius: 'var(--radius)',
            border: '1px solid var(--border)',
            bgcolor: 'var(--card)',
            boxShadow: 'var(--shadow-sm)',
          }}>
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <NotificationsActiveOutlined sx={{ fontSize: 64, color: 'var(--muted-foreground)', mb: 2, opacity: 0.5 }} />
              <Typography
                variant="h6"
                sx={{
                  color: 'var(--muted-foreground)',
                  fontWeight: 600,
                  mb: 1,
                }}
              >
                Hatırlatıcı Yok
              </Typography>
              <Typography
                variant="body2"
                sx={{
                  color: 'var(--muted-foreground)',
                  fontSize: '0.875rem',
                }}
              >
                {filtre === 'bugun' && 'Bugün için bekleyen işlem bulunmuyor'}
                {filtre === 'yarin' && 'Yarın için bekleyen işlem bulunmuyor'}
                {filtre === 'bu-hafta' && 'Bu hafta için bekleyen işlem bulunmuyor'}
              </Typography>
            </Box>
          </Paper>
        )}
      </Collapse>


      <Stack spacing={3}>
        <Box sx={{ display: 'grid', gridTemplateColumns: { xs: '1fr', sm: '1fr 1fr', lg: '1fr 1fr 1fr 1fr' }, gap: 3 }}>
          {statsCards.map((card, index) => (
            <Card
              key={index}
              sx={{
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border)',
                bgcolor: 'var(--card)',
                boxShadow: 'var(--shadow-sm)',
                overflow: 'hidden',
                position: 'relative',
                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: 'var(--shadow-lg)',
                  borderColor: card.color,
                  '& .icon-wrapper': {
                    bgcolor: card.color,
                    color: 'white',
                  }
                }
              }}
            >
              <CardContent sx={{ p: 3 }}>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', mb: 2.5 }}>
                  <Box
                    className="icon-wrapper"
                    sx={{
                      bgcolor: 'color-mix(in srgb, ' + card.color + ' 8%, transparent)',
                      color: card.color,
                      borderRadius: 'var(--radius-md)',
                      p: 1.75,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      transition: 'all 0.3s ease',
                    }}
                  >
                    <card.icon sx={{ fontSize: 26 }} />
                  </Box>
                  <Chip
                    label={card.trend}
                    size="small"
                    sx={{
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      bgcolor: 'color-mix(in srgb, var(--success) 10%, transparent)',
                      color: 'var(--success)',
                      border: 'none',
                      borderRadius: 'var(--radius-sm)'
                    }}
                  />
                </Box>
                <Typography
                  variant="body2"
                  sx={{
                    fontSize: '0.75rem',
                    color: 'var(--muted-foreground)',
                    fontWeight: 700,
                    textTransform: 'uppercase',
                    letterSpacing: '0.05em',
                    mb: 1,
                  }}
                >
                  {card.title}
                </Typography>
                <Typography
                  variant="h4"
                  sx={{
                    fontWeight: 800,
                    fontSize: '1.75rem',
                    color: 'var(--foreground)',
                    lineHeight: 1.2,
                  }}
                >
                  {card.value}
                </Typography>
              </CardContent>
              <Box sx={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: 4,
                bgcolor: card.color,
                opacity: 0.5
              }} />
            </Card>
          ))}
        </Box>

        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          <Box sx={{ flex: '1 1 65%', minWidth: 400 }}>
            <Paper sx={{
              p: 3,
              borderRadius: 'var(--radius)',
              boxShadow: 'var(--shadow-sm)',
              border: '1px solid var(--border)',
              bgcolor: 'var(--card)',
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <Box sx={{
                  width: 4,
                  height: 24,
                  borderRadius: 'var(--radius-sm)',
                  bgcolor: 'var(--primary)',
                }} />
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    fontSize: '1.125rem',
                    color: 'var(--foreground)',
                  }}
                >
                  Satış Trendi
                </Typography>
              </Box>
              <ResponsiveContainer width="100%" height={320}>
                <AreaChart data={salesData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorSatis" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--primary)" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorKar" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="var(--chart-2)" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="var(--chart-2)" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'var(--muted-foreground)', fontSize: 12, fontWeight: 500 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'var(--muted-foreground)', fontSize: 12, fontWeight: 500 }}
                    tickFormatter={(value) => `₺${(value / 1000).toFixed(0)}k`}
                  />
                  <RechartsTooltip
                    contentStyle={{
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border)',
                      backgroundColor: 'var(--card)',
                      boxShadow: 'var(--shadow-lg)',
                    }}
                    itemStyle={{ fontWeight: 600, fontSize: '12px' }}
                  />
                  <Area
                    type="monotone"
                    dataKey="satis"
                    name="Satış"
                    stroke="var(--primary)"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorSatis)"
                  />
                  <Area
                    type="monotone"
                    dataKey="kar"
                    name="Kâr"
                    stroke="var(--chart-2)"
                    strokeWidth={3}
                    fillOpacity={1}
                    fill="url(#colorKar)"
                  />
                </AreaChart>
              </ResponsiveContainer>
            </Paper>
          </Box>

          <Box sx={{ flex: '1 1 30%', minWidth: 300 }}>
            <Paper sx={{
              p: 3,
              borderRadius: 'var(--radius)',
              boxShadow: 'var(--shadow-sm)',
              border: '1px solid var(--border)',
              bgcolor: 'var(--card)',
            }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5, mb: 3 }}>
                <Box sx={{
                  width: 4,
                  height: 24,
                  borderRadius: 'var(--radius-sm)',
                  bgcolor: 'var(--secondary)',
                }} />
                <Typography
                  variant="h6"
                  sx={{
                    fontWeight: 700,
                    fontSize: '1.125rem',
                    color: 'var(--foreground)',
                  }}
                >
                  Aylık Karşılaştırma
                </Typography>
              </Box>
              <ResponsiveContainer width="100%" height={320}>
                <BarChart data={salesData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis
                    dataKey="name"
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'var(--muted-foreground)', fontSize: 12, fontWeight: 500 }}
                    dy={10}
                  />
                  <YAxis
                    axisLine={false}
                    tickLine={false}
                    tick={{ fill: 'var(--muted-foreground)', fontSize: 12, fontWeight: 500 }}
                    tickFormatter={(value) => `₺${(value / 1000).toFixed(0)}k`}
                  />
                  <RechartsTooltip
                    cursor={{ fill: 'var(--muted)', opacity: 0.4 }}
                    contentStyle={{
                      borderRadius: 'var(--radius-md)',
                      border: '1px solid var(--border)',
                      backgroundColor: 'var(--card)',
                      boxShadow: 'var(--shadow-lg)',
                    }}
                  />
                  <Bar
                    dataKey="satis"
                    name="Satış"
                    fill="var(--primary)"
                    radius={[6, 6, 0, 0]}
                    barSize={20}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Box>
        </Box>

        <Box sx={{ mt: 3, mb: 3 }}>
          <Grid container spacing={3}>
            {/* Maaş Durumu Detay Widget */}
            <Grid size={{ xs: 12, md: 6 }}>
              <Card sx={{
                height: '100%',
                borderRadius: 'var(--radius-lg)',
                border: '1px solid var(--border)',
                bgcolor: 'var(--card)',
                boxShadow: 'var(--shadow-sm)',
                transition: 'all 0.3s ease',
                '&:hover': { boxShadow: 'var(--shadow-md)', borderColor: 'var(--primary)' }
              }}>
                <CardContent sx={{ p: 3 }}>
                  <Stack direction="row" alignItems="center" spacing={1.5} mb={3}>
                    <Box sx={{ p: 1, bgcolor: 'color-mix(in srgb, var(--primary) 10%, transparent)', borderRadius: 'var(--radius-md)', display: 'flex' }}>
                      <PaymentOutlined sx={{ color: 'var(--primary)', fontSize: 20 }} />
                    </Box>
                    <Typography variant="h6" sx={{ fontWeight: 700, fontSize: '1.125rem' }}>Maaş Ödeme Durumu</Typography>
                  </Stack>

                  <Box sx={{ mb: 4 }}>
                    <Typography variant="body2" sx={{ color: 'var(--muted-foreground)', fontWeight: 500, mb: 0.5 }}>Net Ödenecek Toplam</Typography>
                    <Typography variant="h4" sx={{ fontWeight: 800, color: 'var(--primary)' }}>
                      ₺{maasStats.toplamMaas.toLocaleString('tr-TR', { maximumFractionDigits: 2 })}
                    </Typography>
                  </Box>

                  <Stack spacing={3}>
                    <Box>
                      <Stack direction="row" justifyContent="space-between" mb={1}>
                        <Typography variant="body2" sx={{ fontWeight: 600 }}>Ödenen Maaşlar</Typography>
                        <Typography variant="body2" sx={{ color: 'var(--success)', fontWeight: 700 }}>
                          %{maasStats.toplamMaas > 0 ? ((maasStats.odenenMaas / maasStats.toplamMaas) * 100).toFixed(1) : 0}
                        </Typography>
                      </Stack>
                      <LinearProgress
                        variant="determinate"
                        value={maasStats.toplamMaas > 0 ? (maasStats.odenenMaas / maasStats.toplamMaas) * 100 : 0}
                        sx={{
                          height: 10,
                          borderRadius: 5,
                          bgcolor: 'var(--muted)',
                          '& .MuiLinearProgress-bar': { bgcolor: 'var(--success)', borderRadius: 5 }
                        }}
                      />
                      <Stack direction="row" justifyContent="space-between" mt={1}>
                        <Typography variant="caption" sx={{ color: 'var(--muted-foreground)' }}>
                          ₺{maasStats.odenenMaas.toLocaleString('tr-TR')}
                        </Typography>
                        <Typography variant="caption" sx={{ color: 'var(--muted-foreground)', fontWeight: 600 }}>
                          Hedef: ₺{maasStats.toplamMaas.toLocaleString('tr-TR')}
                        </Typography>
                      </Stack>
                    </Box>

                    <Box sx={{ p: 2, bgcolor: 'var(--muted)', borderRadius: 'var(--radius-md)', border: '1px dashed var(--border)' }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Box>
                          <Typography variant="caption" sx={{ color: 'var(--muted-foreground)', display: 'block' }}>Kalan Ödeme</Typography>
                          <Typography variant="subtitle1" sx={{ fontWeight: 700, color: 'var(--destructive)' }}>
                            ₺{maasStats.kalanMaas.toLocaleString('tr-TR')}
                          </Typography>
                        </Box>
                        <Button
                          variant="text"
                          size="small"
                          onClick={() => router.push('/ik/maas-yonetimi')}
                          sx={{ textTransform: 'none', fontWeight: 600, color: 'var(--primary)' }}
                        >
                          Detayları Gör
                        </Button>
                      </Stack>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            <Grid size={{ xs: 12, md: 6 }}>
              {/* Diğer özet grafikler buraya gelecek */}
            </Grid>
          </Grid>
        </Box>
      </Stack>
    </MainLayout>
  );
}
