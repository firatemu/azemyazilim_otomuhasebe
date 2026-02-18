'use client';

import { createTheme } from '@mui/material/styles';
import { trTR as dataGridTR } from '@mui/x-data-grid/locales';
import { trTR as coreTR } from '@mui/material/locale';

export const theme = createTheme(
  {
    typography: {
      fontFamily: '"AR One Sans", "Roboto", "Helvetica", "Arial", sans-serif',
      h1: { fontWeight: 700 },
      h2: { fontWeight: 700 },
      h3: { fontWeight: 700 },
      h4: { fontWeight: 700 },
      h5: { fontWeight: 600 },
      h6: { fontWeight: 600 },
    },
    palette: {
      mode: 'light',
      primary: {
        main: '#1976d2',
      },
      secondary: {
        main: '#dc004e',
      },
    },
  },
  dataGridTR,
  coreTR
);

