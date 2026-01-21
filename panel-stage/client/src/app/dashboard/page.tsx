'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
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
  Collapse,
  Button,
  ButtonGroup,
  Tooltip,
  Alert,
} from '@mui/material';
import {
  Inventory,
  People,
  Receipt,
  TrendingUp,
  Notifications,
  Payment,
  AttachMoney,
  CalendarMonth,
  ExpandMore,
  ExpandLess,
  AccountBalance,
  Description,
  ArrowForward,
  Today,
  Event,
  DateRange,
  NotificationsActive,
  Email,
} from '@mui/icons-material';
import MainLayout from '@/components/Layout/MainLayout';
import axios from '@/lib/axios';
import { useRouter } from 'next/navigation';
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
} from 'recharts';

// Stats cards ve sales data artık API'den çekilecek

interface GunlukHatirlatici {
  cekSenetler: any[];
  personelOdemeleri: any[];
  vadesiGecenFaturalar: any[];
}

export default function DashboardPage() {
  const router = useRouter();
  const [hatirlaticilar, setHatirlaticilar] = useState<GunlukHatirlatici>({
    cekSenetler: [],
    personelOdemeleri: [],
    vadesiGecenFaturalar: [],
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

  // Toplam hatırlatıcı sayısı
  const toplamHatirlatici = 
    hatirlaticilar.cekSenetler.length + 
    hatirlaticilar.personelOdemeleri.length + 
    hatirlaticilar.vadesiGecenFaturalar.length;

  useEffect(() => {
    fetchGunlukHatirlaticilar();
    fetchDashboardStats();
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
      
      // Vadesi gelen çek/senetler (TÜM - ödenmemiş olanlar)
      let cekSenetler: any[] = [];
      try {
        console.log('🔍 Çek/Senet sorgusu:', { 
          vadeBaslangic: baslangicStr, 
          vadeBitis: bitisStr
        });
        const cekSenetRes = await axios.get('/cek-senet', {
          params: { 
            vadeBaslangic: baslangicStr,
            vadeBitis: bitisStr,
            // portfoyTip yok - hem ALACAK hem BORC getir
            // durum koşulu yok - hepsini getir, frontend'de filtrele
          },
        });
        // Durumu ODENDI veya TAHSIL_EDILDI olmayanları al
        const allCekler = cekSenetRes.data || [];
        cekSenetler = allCekler.filter((cs: any) => 
          cs.durum !== 'TAHSIL_EDILDI' && // Tahsil edilmiş ALACAK'ları çıkar
          cs.durum !== 'ODENDI'            // Ödenmiş BORC'ları çıkar
        );
        
        console.log('✅ Çek/Senet API yanıtı:', {
          status: cekSenetRes.status,
          dataType: typeof cekSenetRes.data,
          isArray: Array.isArray(cekSenetRes.data),
          totalCount: allCekler.length,
          filteredCount: cekSenetler.length,
          excludedStatuses: ['TAHSIL_EDILDI', 'ODENDI'],
          data: cekSenetler
        });
      } catch (cekSenetError: any) {
        console.error('❌ Çek/Senet hatırlatıcıları yüklenemedi:', {
          message: cekSenetError.message,
          response: cekSenetError.response?.data,
          status: cekSenetError.response?.status
        });
      }

      // Bugün maaş günü olan personeller
      const gun = new Date().getDate();
      const personelRes = await axios.get('/personel', {
        params: { aktif: true },
      });
      const personelOdemeleri = personelRes.data.filter((p: any) => {
        if (!p.maasGunu) return false;
        if (p.maasGunu === 0) {
          // Ay sonu kontrolü
          const sonGun = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
          return gun === sonGun;
        }
        return p.maasGunu === gun;
      });

      // Vadesi geçmiş faturalar
      let vadesiGecenFaturalar: any[] = [];
      try {
        const faturaRes = await axios.get('/fatura', {
          params: { limit: 100 },
        });
        
        vadesiGecenFaturalar = faturaRes.data.data?.filter((f: any) => 
          f.vade && 
          new Date(f.vade) < new Date() && 
          f.odenecekTutar && 
          Number(f.odenecekTutar) > 0
        ) || [];
      } catch (faturaError) {
        console.log('Fatura hatırlatıcıları yüklenemedi:', faturaError);
      }

      console.log('📊 Hatırlatıcı Özeti:', {
        cekSenet: cekSenetler.length,
        personel: personelOdemeleri.length,
        fatura: vadesiGecenFaturalar.length,
      });

      setHatirlaticilar({
        cekSenetler: cekSenetler,
        personelOdemeleri,
        vadesiGecenFaturalar: vadesiGecenFaturalar.slice(0, 5),
      });
    } catch (error) {
      console.error('Hatırlatıcılar yüklenirken hata:', error);
      // Hata olsa bile kısmi veri göster
      setHatirlaticilar({
        cekSenetler: [],
        personelOdemeleri: [],
        vadesiGecenFaturalar: [],
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
      
      const faturalar = faturaRes.data?.data || [];
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
          
          const tumFaturalar = ayFaturaRes.data?.data || [];
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

  // Dinamik stats cards - Modern, Gradient-Free Design
  const statsCards = [
    { 
      title: 'Toplam Stok', 
      value: statsLoading ? '...' : stats.toplamStok.toLocaleString('tr-TR'), 
      icon: Inventory, 
      bgColor: 'var(--chart-1)',
      iconBg: 'color-mix(in srgb, var(--chart-1) 15%, transparent)',
    },
    { 
      title: 'Cari Sayısı', 
      value: statsLoading ? '...' : stats.cariSayisi.toLocaleString('tr-TR'), 
      icon: People, 
      bgColor: 'var(--secondary)',
      iconBg: 'color-mix(in srgb, var(--secondary) 15%, transparent)',
    },
    { 
      title: 'Aylık Satış', 
      value: statsLoading ? '...' : `₺${stats.aylikSatis.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`, 
      icon: Receipt, 
      bgColor: 'var(--chart-2)',
      iconBg: 'color-mix(in srgb, var(--chart-2) 15%, transparent)',
    },
    { 
      title: 'Kâr Marjı', 
      value: statsLoading ? '...' : `%${stats.karMarji.toFixed(1)}`, 
      icon: TrendingUp, 
      bgColor: 'var(--primary)',
      iconBg: 'color-mix(in srgb, var(--primary) 15%, transparent)',
    },
  ];

  return (
    <MainLayout>
      <Box sx={{ mb: 4, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
          <Typography 
            variant="h4" 
            gutterBottom 
            sx={{ 
              fontWeight: 700,
              fontSize: '1.875rem',
              color: 'var(--foreground)',
              letterSpacing: '-0.02em',
              mb: 0.5,
            }}
          >
            Dashboard
          </Typography>
          <Typography 
            variant="body2" 
            sx={{ 
              color: 'var(--muted-foreground)',
              fontSize: '0.875rem',
            }}
          >
            Hoş geldiniz! İşte sistemin genel görünümü
          </Typography>
        </Box>
        
        {/* Hatırlatıcı Bildirimi */}
        <Badge 
          badgeContent={toplamHatirlatici} 
          max={99}
          sx={{
            '& .MuiBadge-badge': {
              bgcolor: 'var(--destructive)',
              color: 'var(--destructive-foreground)',
              fontWeight: 600,
            },
          }}
        >
          <IconButton 
            onClick={() => setHatirlaticiOpen(!hatirlaticiOpen)}
            sx={{ 
              bgcolor: toplamHatirlatici > 0 
                ? 'color-mix(in srgb, var(--primary) 12%, transparent)' 
                : 'var(--muted)', 
              color: toplamHatirlatici > 0 ? 'var(--primary)' : 'var(--muted-foreground)',
              '&:hover': { 
                bgcolor: toplamHatirlatici > 0 
                  ? 'color-mix(in srgb, var(--primary) 20%, transparent)' 
                  : 'var(--muted-hover)',
                transform: 'scale(1.05)',
              },
              animation: toplamHatirlatici > 0 ? 'pulse 2s ease-in-out infinite' : 'none',
              '@keyframes pulse': {
                '0%, 100%': { transform: 'scale(1)' },
                '50%': { transform: 'scale(1.05)' },
              },
              transition: 'all 0.2s ease',
            }}
          >
            <Notifications sx={{ fontSize: 22 }} />
          </IconButton>
        </Badge>
      </Box>

      {/* Günlük Hatırlatıcılar Paneli */}
      <Collapse in={hatirlaticiOpen}>
        {toplamHatirlatici > 0 ? (
          <Paper 
            sx={{ 
              p: 3, 
              mb: 3, 
              borderRadius: 'var(--radius)',
              bgcolor: 'color-mix(in srgb, var(--primary) 8%, var(--card) 92%)',
              border: '2px solid var(--primary)',
              boxShadow: 'var(--shadow-md)',
            }}
          >
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: 'wrap', gap: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Notifications sx={{ color: 'var(--primary)', fontSize: 24 }} />
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
                    startIcon={<Today sx={{ fontSize: 18 }} />}
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
                    startIcon={<Event sx={{ fontSize: 18 }} />}
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
                    startIcon={<DateRange sx={{ fontSize: 18 }} />}
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
                    <NotificationsActive sx={{ fontSize: 20 }} />
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
              {/* Çek/Senet Hatırlatıcısı */}
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
                          bgcolor: 'color-mix(in srgb, var(--chart-1) 15%, transparent)',
                          borderRadius: 'var(--radius-md)',
                          p: 1,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Description sx={{ color: 'var(--chart-1)', fontSize: 20 }} />
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
                        Vadesi Gelen Çek/Senetler
                      </Typography>
                      <Chip 
                        label={hatirlaticilar.cekSenetler.length} 
                        size="small" 
                        sx={{ 
                          bgcolor: 'var(--chart-1)',
                          color: 'white',
                          fontWeight: 600,
                          fontSize: '0.75rem',
                        }} 
                      />
                    </Box>
                    <Typography 
                      variant="caption" 
                      sx={{ 
                        display: 'block', 
                        mb: 2,
                        color: 'var(--muted-foreground)',
                        fontSize: '0.8125rem',
                      }}
                    >
                      Ödenmemiş / Tahsil edilmemiş çek ve senetler
                    </Typography>
                    <List dense sx={{ p: 0 }}>
                      {hatirlaticilar.cekSenetler.slice(0, 3).map((cs: any) => (
                        <ListItem 
                          key={cs.id} 
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
                          onClick={() => router.push('/bordro/vade-takvim')}
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
                                  {cs.tip === 'CEK' ? '📄 Çek' : '📋 Senet'} #{cs.cekNo || cs.seriNo || 'Belge Yok'}
                                </Typography>
                                <Chip 
                                  label={cs.portfoyTip === 'ALACAK' ? 'Alacak' : 'Borç'} 
                                  size="small" 
                                  sx={{ 
                                    height: 20,
                                    fontSize: '0.6875rem',
                                    fontWeight: 600,
                                    bgcolor: cs.portfoyTip === 'ALACAK' 
                                      ? 'color-mix(in srgb, var(--chart-2) 15%, transparent)'
                                      : 'color-mix(in srgb, var(--destructive) 15%, transparent)',
                                    color: cs.portfoyTip === 'ALACAK' ? 'var(--chart-2)' : 'var(--destructive)',
                                  }}
                                />
                                <ArrowForward sx={{ fontSize: 14, color: 'var(--chart-1)', ml: 'auto' }} />
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
                                {cs.cari?.unvan} - ₺{Number(cs.tutar).toLocaleString('tr-TR')} - {cs.durum}
                              </Typography>
                            }
                          />
                        </ListItem>
                      ))}
                      {hatirlaticilar.cekSenetler.length > 3 && (
                        <Button 
                          size="small" 
                          fullWidth 
                          onClick={() => router.push('/bordro/vade-takvim')}
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
                        <Payment sx={{ color: 'var(--chart-2)', fontSize: 20 }} />
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
                        <AccountBalance sx={{ color: 'var(--destructive)', fontSize: 20 }} />
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
              <Notifications sx={{ fontSize: 64, color: 'var(--muted-foreground)', mb: 2, opacity: 0.5 }} />
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
        <Box sx={{ display: 'flex', gap: 3, flexWrap: 'wrap' }}>
          {statsCards.map((card, index) => (
            <Box key={index} sx={{ flex: '1 1 calc(25% - 24px)', minWidth: 200 }}>
              <Card 
                sx={{ 
                  borderRadius: 'var(--radius)',
                  border: '1px solid var(--border)',
                  bgcolor: 'var(--card)',
                  boxShadow: 'var(--shadow-sm)',
                  transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)',
                  '&:hover': {
                    transform: 'translateY(-2px)',
                    boxShadow: 'var(--shadow-md)',
                    borderColor: 'var(--ring)',
                  }
                }}
              >
                <CardContent sx={{ p: 2.5 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Box
                      sx={{
                        bgcolor: card.iconBg,
                        borderRadius: 'var(--radius-md)',
                        p: 1.5,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 48,
                        height: 48,
                      }}
                    >
                      <card.icon sx={{ color: card.bgColor, fontSize: 24 }} />
                    </Box>
                    <Box sx={{ flex: 1, minWidth: 0 }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          fontSize: '0.8125rem',
                          color: 'var(--muted-foreground)',
                          fontWeight: 500,
                          mb: 0.5,
                        }}
                      >
                        {card.title}
                      </Typography>
                      <Typography 
                        variant="h5" 
                        sx={{ 
                          fontWeight: 700,
                          fontSize: '1.5rem',
                          color: card.bgColor,
                          lineHeight: 1.2,
                        }}
                      >
                        {card.value}
                      </Typography>
                    </Box>
                  </Box>
                </CardContent>
              </Card>
            </Box>
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
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis 
                    dataKey="name" 
                    stroke="var(--muted-foreground)"
                    tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                  />
                  <YAxis 
                    stroke="var(--muted-foreground)"
                    tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                  />
                  <RechartsTooltip 
                    contentStyle={{ 
                      borderRadius: 'var(--radius)', 
                      border: '1px solid var(--border)',
                      backgroundColor: 'var(--card)',
                      boxShadow: 'var(--shadow-lg)',
                      color: 'var(--foreground)',
                    }} 
                  />
                  <Legend 
                    wrapperStyle={{ color: 'var(--foreground)' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="satis" 
                    stroke="var(--primary)" 
                    strokeWidth={3}
                    dot={{ fill: 'var(--primary)', r: 5 }}
                    activeDot={{ r: 7, fill: 'var(--primary)' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="kar" 
                    stroke="var(--chart-2)" 
                    strokeWidth={3}
                    dot={{ fill: 'var(--chart-2)', r: 5 }}
                    activeDot={{ r: 7, fill: 'var(--chart-2)' }}
                  />
                </LineChart>
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
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={salesData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" />
                  <XAxis 
                    dataKey="name" 
                    stroke="var(--muted-foreground)"
                    tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                  />
                  <YAxis 
                    stroke="var(--muted-foreground)"
                    tick={{ fill: 'var(--muted-foreground)', fontSize: 12 }}
                  />
                  <RechartsTooltip 
                    contentStyle={{ 
                      borderRadius: 'var(--radius)', 
                      border: '1px solid var(--border)',
                      backgroundColor: 'var(--card)',
                      boxShadow: 'var(--shadow-lg)',
                      color: 'var(--foreground)',
                    }} 
                  />
                  <Bar 
                    dataKey="satis" 
                    fill="var(--primary)" 
                    radius={[8, 8, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </Paper>
          </Box>
        </Box>
      </Stack>
    </MainLayout>
  );
}

