import React, { useState } from 'react';
import { Box, Tabs, Tab, Paper } from '@mui/material';
import { CariFormData } from './cari/types';
import { CariGenelForm } from './cari/CariGenelForm';
import { CariFinansForm } from './cari/CariFinansForm';
import { CariIletisimForm } from './cari/CariIletisimForm';
import { CariAdresForm } from './cari/CariAdresForm';
import { CariBankaForm } from './cari/CariBankaForm';
import { CariDigerForm } from './cari/CariDigerForm';

interface CariFormProps {
  data: CariFormData;
  onChange: (field: string, value: any) => void;
  onCityChange: (city: string) => void;
  availableDistricts: string[];
  satisElemanlari?: any[];
}

const CariForm = React.memo(({ data, onChange, onCityChange, availableDistricts, satisElemanlari = [] }: CariFormProps) => {
  const [activeTab, setActiveTab] = useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  return (
    <Box sx={{ width: '100%', mt: 2 }}>
      <Paper sx={{ mb: 2 }}>
        <Tabs
          value={activeTab}
          onChange={handleTabChange}
          variant="scrollable"
          scrollButtons="auto"
          allowScrollButtonsMobile
          sx={{ borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab label="Genel Bilgiler" />
          <Tab label="Finansal & Risk" />
          <Tab label="İletişim & Yetkililer" />
          <Tab label="Şube & Adresler" />
          <Tab label="Banka Hesapları" />
          <Tab label="Diğer" />
        </Tabs>
      </Paper>

      <Box sx={{ display: activeTab === 0 ? 'block' : 'none' }}>
        <CariGenelForm
          data={data}
          onChange={onChange}
          onCityChange={onCityChange}
          availableDistricts={availableDistricts}
          satisElemanlari={satisElemanlari}
          loadingSalespersons={false}
        />
      </Box>

      <Box sx={{ display: activeTab === 1 ? 'block' : 'none' }}>
        <CariFinansForm data={data} onChange={onChange} />
      </Box>

      <Box sx={{ display: activeTab === 2 ? 'block' : 'none' }}>
        <CariIletisimForm data={data} onChange={onChange} />
      </Box>

      <Box sx={{ display: activeTab === 3 ? 'block' : 'none' }}>
        <CariAdresForm data={data} onChange={onChange} />
      </Box>

      <Box sx={{ display: activeTab === 4 ? 'block' : 'none' }}>
        <CariBankaForm data={data} onChange={onChange} />
      </Box>

      <Box sx={{ display: activeTab === 5 ? 'block' : 'none' }}>
        <CariDigerForm data={data} onChange={onChange} />
      </Box>
    </Box>
  );
});

CariForm.displayName = 'CariForm';

export default CariForm;
