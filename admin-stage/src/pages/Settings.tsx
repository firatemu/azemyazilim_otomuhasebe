import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import {
  Box,
  Typography,
  Paper,
  Tabs,
  Tab,
  TextField,
  Button,
  Switch,
  FormControlLabel,
  Divider,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
} from '@mui/material';
import { Save, Send, Plus, Shield, Key } from 'lucide-react';
import MainLayout from '@/components/Layout/MainLayout';
import FormTextField from '@/components/ui/FormTextField';
import { toast } from 'sonner';
import { getApiBaseUrl, API_ENDPOINTS } from '@/config/constants';

const settingsSchema = z.object({
  siteTitle: z.string().min(1, 'Site başlığı gereklidir'),
  contactEmail: z.string().email('Geçerli bir email adresi giriniz'),
  iyzicoApiKey: z.string().optional(),
  iyzicoSecretKey: z.string().optional(),
  smtpHost: z.string().optional(),
  smtpPort: z.number().optional(),
  jwtSecret: z.string().optional(),
  tokenExpiry: z.number().min(1, 'Token expiry en az 1 olmalıdır'),
});

export default function Settings() {
  const [tabValue, setTabValue] = useState(0);
  const [showSecrets, setShowSecrets] = useState<Record<string, boolean>>({});

  const {
    control,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(settingsSchema),
    defaultValues: {
      siteTitle: 'OtoMuhasebe',
      contactEmail: '',
      iyzicoApiKey: '',
      iyzicoSecretKey: '',
      smtpHost: '',
      smtpPort: 587,
      jwtSecret: '',
      tokenExpiry: 15,
    },
  });

  const onSubmit = async (data: any) => {
    try {
      // API call here
      toast.success('Ayarlar kaydedildi');
    } catch (error) {
      toast.error('Ayarlar kaydedilirken hata oluştu');
    }
  };

  const toggleSecret = (key: string) => {
    setShowSecrets((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const adminUsers = [
    { id: '1', email: 'admin@otomuhasebe.com', role: 'SUPER_ADMIN', lastLogin: '2025-11-15' },
    { id: '2', email: 'support@otomuhasebe.com', role: 'SUPPORT', lastLogin: '2025-11-14' },
  ];

  return (
    <MainLayout>
      <Typography variant="h4" fontWeight="bold" gutterBottom>
        Ayarlar
      </Typography>

      <Paper>
        <Tabs value={tabValue} onChange={(_, v) => setTabValue(v)} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Tab label="Genel Ayarlar" />
          <Tab label="Ödeme Ayarları" />
          <Tab label="Email Ayarları" />
          <Tab label="Güvenlik" />
          <Tab label="Admin Kullanıcıları" />
        </Tabs>
        <Box component="form" onSubmit={handleSubmit(onSubmit)} sx={{ p: 3 }}>
          {tabValue === 0 && (
            <Box>
              <FormTextField
                name="siteTitle"
                control={control}
                label="Site Başlığı"
                margin="normal"
              />
              <FormTextField
                name="contactEmail"
                control={control}
                label="İletişim Email"
                type="email"
                margin="normal"
              />
              <FormControlLabel
                control={<Switch defaultChecked={false} />}
                label="Maintenance Mode"
                sx={{ mt: 2 }}
              />
              <Button variant="contained" startIcon={<Save />} type="submit" sx={{ mt: 3 }}>
                Kaydet
              </Button>
            </Box>
          )}
          {tabValue === 1 && (
            <Box>
              <Alert severity="info" sx={{ mb: 3 }}>
                iyzico API bilgilerinizi güvenli bir şekilde saklayın. Bu bilgiler şifrelenmiş olarak saklanır.
              </Alert>
              <Box sx={{ position: 'relative' }}>
                <FormTextField
                  name="iyzicoApiKey"
                  control={control}
                  label="iyzico API Key"
                  type={showSecrets.iyzicoApiKey ? 'text' : 'password'}
                  margin="normal"
                />
                <Button
                  size="small"
                  onClick={() => toggleSecret('iyzicoApiKey')}
                  sx={{ position: 'absolute', right: 0, top: 8 }}
                >
                  {showSecrets.iyzicoApiKey ? 'Gizle' : 'Göster'}
                </Button>
              </Box>
              <Box sx={{ position: 'relative' }}>
                <FormTextField
                  name="iyzicoSecretKey"
                  control={control}
                  label="iyzico Secret Key"
                  type={showSecrets.iyzicoSecretKey ? 'text' : 'password'}
                  margin="normal"
                />
                <Button
                  size="small"
                  onClick={() => toggleSecret('iyzicoSecretKey')}
                  sx={{ position: 'absolute', right: 0, top: 8 }}
                >
                  {showSecrets.iyzicoSecretKey ? 'Gizle' : 'Göster'}
                </Button>
              </Box>
              <TextField
                fullWidth
                label="Webhook URL"
                margin="normal"
                value={`${getApiBaseUrl()}/payments/webhooks/iyzico`}
                disabled
                helperText="Bu URL'i iyzico panelinde webhook olarak ekleyin"
              />
              <FormControlLabel
                control={<Switch defaultChecked={false} />}
                label="Test Mode"
                sx={{ mt: 2 }}
              />
              <Box sx={{ mt: 2 }}>
                <Button variant="outlined" startIcon={<Send />} sx={{ mr: 2 }}>
                  Test Webhook
                </Button>
                <Button variant="contained" startIcon={<Save />} type="submit">
                  Kaydet
                </Button>
              </Box>
            </Box>
          )}
          {tabValue === 2 && (
            <Box>
              <FormTextField
                name="smtpHost"
                control={control}
                label="SMTP Host"
                margin="normal"
              />
              <FormTextField
                name="smtpPort"
                control={control}
                label="SMTP Port"
                type="number"
                margin="normal"
              />
              <FormTextField
                name="contactEmail"
                control={control}
                label="From Email"
                type="email"
                margin="normal"
              />
              <TextField
                fullWidth
                label="From Name"
                margin="normal"
                defaultValue="OtoMuhasebe"
              />
              <Box sx={{ mt: 2 }}>
                <Button variant="outlined" startIcon={<Send />} sx={{ mr: 2 }}>
                  Test Email Gönder
                </Button>
                <Button variant="contained" startIcon={<Save />} type="submit">
                  Kaydet
                </Button>
              </Box>
            </Box>
          )}
          {tabValue === 3 && (
            <Box>
              <Alert severity="warning" sx={{ mb: 3 }}>
                Güvenlik ayarlarını değiştirirken dikkatli olun. Yanlış yapılandırma sistem güvenliğini etkileyebilir.
              </Alert>
              <Box sx={{ position: 'relative' }}>
                <FormTextField
                  name="jwtSecret"
                  control={control}
                  label="JWT Secret"
                  type={showSecrets.jwtSecret ? 'text' : 'password'}
                  margin="normal"
                />
                <Button
                  size="small"
                  onClick={() => toggleSecret('jwtSecret')}
                  sx={{ position: 'absolute', right: 0, top: 8 }}
                >
                  {showSecrets.jwtSecret ? 'Gizle' : 'Göster'}
                </Button>
              </Box>
              <FormTextField
                name="tokenExpiry"
                control={control}
                label="Token Expiry (minutes)"
                type="number"
                margin="normal"
              />
              <TextField
                fullWidth
                label="Refresh Token Expiry (days)"
                type="number"
                margin="normal"
                defaultValue={7}
              />
              <TextField
                fullWidth
                label="Rate Limit (requests/minute)"
                type="number"
                margin="normal"
                defaultValue={100}
              />
              <Button variant="contained" startIcon={<Save />} type="submit" sx={{ mt: 3 }}>
                Kaydet
              </Button>
            </Box>
          )}
          {tabValue === 4 && (
            <Box>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography variant="h6">Admin Kullanıcıları</Typography>
                <Button variant="contained" startIcon={<Plus />}>
                  Yeni Admin Ekle
                </Button>
              </Box>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Email</TableCell>
                      <TableCell>Rol</TableCell>
                      <TableCell>Son Giriş</TableCell>
                      <TableCell>İşlemler</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {adminUsers.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Chip label={user.role} size="small" color="primary" />
                        </TableCell>
                        <TableCell>{user.lastLogin}</TableCell>
                        <TableCell>
                          <Button size="small">Düzenle</Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}
        </Box>
      </Paper>
    </MainLayout>
  );
}
