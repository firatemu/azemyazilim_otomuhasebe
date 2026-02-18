'use client';

import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogActions, Button, Select, MenuItem, FormControl, InputLabel, Box } from '@mui/material';
import PrintIcon from '@mui/icons-material/Print';
import CloseIcon from '@mui/icons-material/Close';
import './TeklifPrintForm.css';

interface Teklif {
  teklifNo: string;
  date: string;
  customer: string;
  amount: number;
  kdv: number;
  total: number;
  status: string;
  gecerlilikTarihi?: string | null;
  items?: OrderItem[];
}

interface OrderItem {
  id: string;
  name: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

interface TeklifPrintFormProps {
  open: boolean;
  order: Teklif | null;
  onClose: () => void;
}

type PrintFormat = 'A4-vertical' | 'A5-horizontal' | 'A5-vertical';

const TeklifPrintForm: React.FC<TeklifPrintFormProps> = ({ open, order, onClose }) => {
  const [printFormat, setPrintFormat] = useState<PrintFormat>('A4-vertical');

  useEffect(() => {
    if (open) {
      setPrintFormat('A4-vertical');
    }
  }, [open]);

  const handlePrint = () => {
    window.print();
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('tr-TR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return dateString;
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('tr-TR', {
      style: 'currency',
      currency: 'TRY'
    }).format(amount);
  };

  if (!order) return null;

  return (
    <Dialog 
      open={open} 
      onClose={onClose} 
      maxWidth={false}
      fullWidth
      PaperProps={{
        sx: {
          maxWidth: '90vw',
          maxHeight: '90vh',
          m: 2
        }
      }}
    >
      <DialogContent sx={{ p: 0, overflow: 'auto' }}>
        <div className="print-form-container">
          <div className="print-controls">
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <InputLabel>Yazdırma Formatı</InputLabel>
              <Select
                value={printFormat}
                onChange={(e) => setPrintFormat(e.target.value as PrintFormat)}
                label="Yazdırma Formatı"
              >
                <MenuItem value="A4-vertical">A4 Dikey</MenuItem>
                <MenuItem value="A5-horizontal">A5 Yatay</MenuItem>
                <MenuItem value="A5-vertical">A5 Dikey</MenuItem>
              </Select>
            </FormControl>
          </div>

          <div className={`print-content ${printFormat}`}>
            <div className="print-header">
              <div className="company-info">
                <h1>STNOTO</h1>
                <p>Satış Teklifi</p>
              </div>
              <div className="order-info">
                <div className="info-row">
                  <span className="label">Teklif No:</span>
                  <span className="value">{order.teklifNo || 'Belirtilmemiş'}</span>
                </div>
                <div className="info-row">
                  <span className="label">Tarih:</span>
                  <span className="value">{formatDate(order.date)}</span>
                </div>
                {order.gecerlilikTarihi && (
                  <div className="info-row">
                    <span className="label">Geçerlilik Tarihi:</span>
                    <span className="value">{formatDate(order.gecerlilikTarihi)}</span>
                  </div>
                )}
                <div className="info-row">
                  <span className="label">Durum:</span>
                  <span className="value">{order.status}</span>
                </div>
              </div>
            </div>

            <div className="print-body">
              <div className="customer-section">
                <h3>Cari Bilgileri</h3>
                <p>{order.customer || 'Belirtilmemiş'}</p>
              </div>

              {order.items && order.items.length > 0 && (
                <div className="items-section">
                  <table className="items-table">
                    <thead>
                      <tr>
                        <th>#</th>
                        <th>Ürün Adı</th>
                        <th>Miktar</th>
                        <th>Birim Fiyat</th>
                        <th>Toplam</th>
                      </tr>
                    </thead>
                    <tbody>
                      {order.items.map((item, index) => (
                        <tr key={item.id || index}>
                          <td>{index + 1}</td>
                          <td>{item.name}</td>
                          <td>{item.quantity}</td>
                          <td>{formatCurrency(item.unitPrice)}</td>
                          <td>{formatCurrency(item.total)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              <div className="totals-section">
                <div className="totals-table">
                  <div className="total-row">
                    <span className="total-label">Tutar:</span>
                    <span className="total-value">{formatCurrency(order.amount)}</span>
                  </div>
                  <div className="total-row">
                    <span className="total-label">KDV:</span>
                    <span className="total-value">{formatCurrency(order.kdv)}</span>
                  </div>
                  <div className="total-row total-row-final">
                    <span className="total-label">Genel Toplam:</span>
                    <span className="total-value">{formatCurrency(order.total)}</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="print-footer">
              <p>Bu belge elektronik ortamda oluşturulmuştur.</p>
              <p>Yazdırma Tarihi: {new Date().toLocaleDateString('tr-TR')}</p>
            </div>
          </div>
        </div>
      </DialogContent>
      <DialogActions sx={{ p: 2 }}>
        <Button
          onClick={handlePrint}
          variant="contained"
          startIcon={<PrintIcon />}
          color="primary"
        >
          Yazdır
        </Button>
        <Button
          onClick={onClose}
          variant="outlined"
          startIcon={<CloseIcon />}
        >
          Kapat
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TeklifPrintForm;
