'use client';

import React from 'react';
import {
  Box,
  Grid,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
} from '@mui/material';
import { Backspace, Clear } from '@mui/icons-material';

interface VirtualNumpadProps {
  open: boolean;
  onClose: () => void;
  onValueChange: (value: string) => void;
  title?: string;
}

export default function VirtualNumpad({
  open,
  onClose,
  onValueChange,
  title = 'Sayı Girişi',
}: VirtualNumpadProps) {
  const [displayValue, setDisplayValue] = React.useState('0');

  const handleDigitClick = (digit: string) => {
    let newValue = displayValue;
    if (newValue === '0') {
      newValue = digit;
    } else {
      newValue += digit;
    }
    // Limit to 12 characters
    if (newValue.length > 12) {
      newValue = newValue.slice(0, 12);
    }
    setDisplayValue(newValue);
    onValueChange(newValue);
  };

  const handleBackspace = () => {
    let newValue = displayValue;
    if (newValue.length > 1) {
      newValue = newValue.slice(0, -1);
    } else if (newValue.length === 1) {
      newValue = '0';
    }
    setDisplayValue(newValue);
    onValueChange(newValue);
  };

  const handleClear = () => {
    setDisplayValue('0');
    onValueChange('0');
  };

  const handleDecimal = () => {
    let newValue = displayValue;
    if (!newValue.includes(',')) {
      newValue += ',';
    } else {
      newValue = newValue.slice(0, -1);
    }
    setDisplayValue(newValue);
    onValueChange(newValue);
  };

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xs" fullWidth>
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Box sx={{ p: 2 }}>
          <Grid container spacing={1} sx={{ maxWidth: 280 }}>
            {/* First row: 7-8-9, Clear */}
            <Grid item xs={3}>
              <Button fullWidth size="large" variant="contained" onClick={() => handleDigitClick('7')}>7</Button>
            </Grid>
            <Grid item xs={3}>
              <Button fullWidth size="large" variant="contained" onClick={() => handleDigitClick('8')}>8</Button>
            </Grid>
            <Grid item xs={3}>
              <Button fullWidth size="large" variant="contained" onClick={() => handleDigitClick('9')}>9</Button>
            </Grid>
            <Grid item xs={3}>
              <Button fullWidth size="large" variant="outlined" color="error" onClick={handleClear}><Clear /></Button>
            </Grid>

            {/* Display */}
            <Grid item xs={12}>
              <Box
                sx={{
                  p: 2,
                  textAlign: 'center',
                  bgcolor: 'background.paper',
                  border: 2,
                  borderColor: 'divider',
                  borderRadius: 1,
                  minHeight: '60px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '32px',
                  fontWeight: 'bold',
                }}
              >
                {displayValue || '0'}
              </Box>
            </Grid>

            {/* Second row: 4-5-6, Backspace, Decimal */}
            <Grid item xs={4}>
              <Button
                fullWidth
                size="large"
                variant="contained"
                onClick={() => handleDigitClick('4')}
              >
                4
              </Button>
            </Grid>
            <Grid item xs={4}>
              <Button
                fullWidth
                size="large"
                variant="contained"
                onClick={() => handleDigitClick('5')}
              >
                5
              </Button>
            </Grid>
            <Grid item xs={4}>
              <Button
                fullWidth
                size="large"
                variant="contained"
                onClick={() => handleDigitClick('6')}
              >
                6
              </Button>
            </Grid>
            <Grid item xs={4}>
              <Button
                fullWidth
                size="large"
                variant="contained"
                onClick={handleBackspace}
              >
                <Backspace />
              </Button>
            </Grid>
            <Grid item xs={4}>
              <Button
                fullWidth
                size="large"
                variant="contained"
                onClick={handleDecimal}
              >
                ,
              </Button>
            </Grid>

            {/* Third row: 1-2-3, 0 */}
            <Grid item xs={4}>
              <Button
                fullWidth
                size="large"
                variant="contained"
                onClick={() => handleDigitClick('1')}
              >
                1
              </Button>
            </Grid>
            <Grid item xs={4}>
              <Button
                fullWidth
                size="large"
                variant="contained"
                onClick={() => handleDigitClick('2')}
              >
                2
              </Button>
            </Grid>
            <Grid item xs={4}>
              <Button
                fullWidth
                size="large"
                variant="contained"
                onClick={() => handleDigitClick('3')}
              >
                3
              </Button>
            </Grid>
            <Grid item xs={4}>
              <Button
                fullWidth
                size="large"
                variant="contained"
                onClick={() => handleDigitClick('0')}
              >
                0
              </Button>
            </Grid>
          </Grid>
        </Box>
      </DialogContent>
    </Dialog>
  );
}
