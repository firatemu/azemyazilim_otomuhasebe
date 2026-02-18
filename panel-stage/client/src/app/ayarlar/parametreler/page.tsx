'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Switch,
  FormControlLabel,
  Alert,
  Snackbar,
  CircularProgress,
  Divider,
  Card,
  CardContent,
} from '@mui/material';
import { Settings, Info } from '@mui/icons-material';
import MainLayout from '@/components/Layout/MainLayout';
import {
  getAllParameters,
  updateParameter,
  SystemParameter,
  setParameterAsBoolean,
  getParameterAsBoolean,
} from '@/services/systemParameterService';

interface ParameterDefinition {
  key: string;
  label: string;
  description: string;
  category: string;
  defaultValue: boolean;
}

const PARAMETER_DEFINITIONS: ParameterDefinition[] = [
  {
    key: 'AUTO_COSTING_ON_PURCHASE_INVOICE',
    label: 'Satın Alma Faturalarında Otomatik Maliyetlendirme',
    description:
      'Satın alma faturaları kaydedildiğinde, düzenlendiğinde, silindiğinde veya durumu değiştiğinde otomatik olarak maliyetlendirme servisi çalışır.',
    category: 'FATURA',
    defaultValue: true,
  },
  {
    key: 'NEGATIVE_STOCK_CONTROL',
    label: 'Negatif Stok Kontrolü',
    description:
      'Satış faturası kaydedilirken stok miktarı kontrolü yapılır. Açık olduğunda, mevcut stoktan fazla satış yapılamaz ve stok negatife düşecek ürünler gösterilir. Kapalı olduğunda stok negatife düşebilir.',
    category: 'STOK',
    defaultValue: false,
  },
  {
    key: 'NEGATIVE_BANK_BALANCE_CONTROL',
    label: 'Negatif Banka Bakiyesi Kontrolü',
    description:
      'Banka havale işlemi yapılırken bakiye kontrolü yapılır. Açık olduğunda, mevcut bakiyeden fazla çıkış yapılamaz. Kapalı olduğunda bakiye eksiye düşebilir.',
    category: 'BANKA',
    defaultValue: true,
  },
  {
    key: 'ALLOW_NEGATIVE_CASH_BALANCE',
    label: 'Negatif Kasa Bakiyesi İzni',
    description:
      'Kasa işlemlerinde bakiye kontrolü yapılır. Açık olduğunda, kasa bakiyesi eksiye düşebilir. Kapalı olduğunda, mevcut bakiyeden fazla çıkış yapılamaz.',
    category: 'KASA',
    defaultValue: false,
  },
];

export default function ParametrelerPage() {
  const [parameters, setParameters] = useState<SystemParameter[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<Record<string, boolean>>({});
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  useEffect(() => {
    fetchParameters();
  }, []);

  const fetchParameters = async () => {
    try {
      setLoading(true);
      const data = await getAllParameters();
      setParameters(data);
    } catch (error: any) {
      showSnackbar(
        error.response?.data?.message || 'Parametreler yüklenirken hata oluştu',
        'error',
      );
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({ open: true, message, severity });
  };

  const handleParameterChange = async (key: string, value: boolean) => {
    try {
      setSaving((prev) => ({ ...prev, [key]: true }));

      const definition = PARAMETER_DEFINITIONS.find((d) => d.key === key);
      if (!definition) {
        throw new Error('Parametre tanımı bulunamadı');
      }

      await setParameterAsBoolean(key, value, definition.description, definition.category);

      // Local state'i güncelle
      setParameters((prev) => {
        const existing = prev.find((p) => p.key === key);
        if (existing) {
          return prev.map((p) => (p.key === key ? { ...p, value } : p));
        } else {
          return [
            ...prev,
            {
              id: '',
              key,
              value,
              description: definition.description,
              category: definition.category,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString(),
            },
          ];
        }
      });

      showSnackbar('Parametre başarıyla güncellendi', 'success');
    } catch (error: any) {
      showSnackbar(
        error.response?.data?.message || 'Parametre güncellenirken hata oluştu',
        'error',
      );
    } finally {
      setSaving((prev) => ({ ...prev, [key]: false }));
    }
  };

  const getParameterValue = (key: string, defaultValue: boolean): boolean => {
    const param = parameters.find((p) => p.key === key);
    if (!param) {
      return defaultValue;
    }
    return param.value === true || param.value === 'true' || param.value === 1;
  };

  const groupedParameters = PARAMETER_DEFINITIONS.reduce((acc, def) => {
    if (!acc[def.category]) {
      acc[def.category] = [];
    }
    acc[def.category].push(def);
    return acc;
  }, {} as Record<string, ParameterDefinition[]>);

  if (loading) {
    return (
      <MainLayout>
        <Box display="flex" justifyContent="center" alignItems="center" minHeight="400px">
          <CircularProgress />
        </Box>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <Box>
        <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
          <Settings sx={{ fontSize: 32, color: 'var(--primary)' }} />
          <Typography variant="h4" fontWeight="bold">
            Parametreler
          </Typography>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 4 }}>
          Sistem ayarlarını buradan yönetebilirsiniz. Parametreler tenant bazlı çalışır ve her
          tenant için ayrı ayarlanabilir.
        </Typography>

        {Object.entries(groupedParameters).map(([category, defs]) => (
          <Box key={category} sx={{ mb: 4 }}>
            <Typography variant="h6" fontWeight="600" sx={{ mb: 2, color: 'var(--primary)' }}>
              {category}
            </Typography>
            <Divider sx={{ mb: 2 }} />

            {defs.map((def) => {
              const currentValue = getParameterValue(def.key, def.defaultValue);
              const isSaving = saving[def.key] || false;

              return (
                <Card key={def.key} sx={{ mb: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
                      <Box sx={{ flex: 1 }}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <Typography variant="h6" fontWeight="600">
                            {def.label}
                          </Typography>
                          {isSaving && <CircularProgress size={16} />}
                        </Box>
                        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                          {def.description}
                        </Typography>
                        <FormControlLabel
                          control={
                            <Switch
                              checked={currentValue}
                              onChange={(e) => handleParameterChange(def.key, e.target.checked)}
                              disabled={isSaving}
                              color="primary"
                            />
                          }
                          label={currentValue ? 'Aktif' : 'Pasif'}
                        />
                      </Box>
                    </Box>
                  </CardContent>
                </Card>
              );
            })}
          </Box>
        ))}

        {PARAMETER_DEFINITIONS.length === 0 && (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="body1" color="text.secondary">
              Henüz tanımlı parametre bulunmamaktadır.
            </Typography>
          </Paper>
        )}
      </Box>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </MainLayout>
  );
}
