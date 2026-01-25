'use client';

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  IconButton,
  Paper,
  Grid,
  Divider,
  Chip,
  CircularProgress,
  Alert,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import { Close, Download, PictureAsPdf, Description } from '@mui/icons-material';
import axios from '@/lib/axios';
import { useQuery } from '@tanstack/react-query';

interface InvoiceViewModalProps {
  open: boolean;
  onClose: () => void;
  document: {
    ettn?: string;
    uuid?: string;
    senderTitle?: string;
    senderVkn?: string;
    invoiceNo?: string;
    invoiceDate?: string;
    payableAmount?: number;
    status?: string;
    statusExp?: string;
  } | null;
}

interface InvoiceData {
  invoiceNumber?: string;
  issueDate?: string;
  invoiceType?: string;
  profileId?: string;
  currency?: string;
  lineExtensionAmount?: number;
  taxExclusiveAmount?: number;
  taxInclusiveAmount?: number;
  payableAmount?: number;
  buyer?: {
    partyName?: string;
    taxId?: string;
  };
  seller?: {
    partyName?: string;
    taxId?: string;
  };
  lines?: Array<{
    id?: string;
    name?: string;
    quantity?: number;
    unitPrice?: number;
    lineExtensionAmount?: number;
    taxTotal?: number;
  }>;
  taxTotal?: Array<{
    taxAmount?: number;
    taxScheme?: string;
  }>;
}

export default function InvoiceViewModal({ open, onClose, document }: InvoiceViewModalProps) {
  const [invoiceData, setInvoiceData] = useState<InvoiceData | null>(null);
  const [xmlContent, setXmlContent] = useState<string>('');

  // Fatura içeriğini getir
  const { data, isLoading, error } = useQuery({
    queryKey: ['invoice-content', document?.uuid || document?.ettn],
    queryFn: async () => {
      // #region agent log
      fetch('http://localhost:7244/ingest/fde0823c-7edc-4232-a192-3b97a49bcd3d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'InvoiceViewModal.tsx:88',message:'queryFn called',data:{uuid:document?.uuid,ettn:document?.ettn,open},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      if (!document?.uuid && !document?.ettn) {
        // #region agent log
        fetch('http://localhost:7244/ingest/fde0823c-7edc-4232-a192-3b97a49bcd3d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'InvoiceViewModal.tsx:91',message:'UUID/ETTN missing',data:{uuid:document?.uuid,ettn:document?.ettn},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        throw new Error('UUID veya ETTN gerekli');
      }
      const uuid = document?.uuid || document?.ettn;
      // HTML formatında al (XSLT ile oluşturulmuş orijinal görüntü)
      const url = `/hizli/document-content?uuid=${uuid}&type=HTML`;
      // #region agent log
      fetch('http://localhost:7244/ingest/fde0823c-7edc-4232-a192-3b97a49bcd3d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'InvoiceViewModal.tsx:96',message:'Making axios request',data:{url,uuid},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
      // #endregion
      try {
        const response = await axios.get(url);
        // #region agent log
        fetch('http://localhost:7244/ingest/fde0823c-7edc-4232-a192-3b97a49bcd3d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'InvoiceViewModal.tsx:101',message:'Axios response received',data:{status:response.status,hasData:!!response.data,contentLength:response.data?.content?.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        return response.data;
      } catch (err: any) {
        // #region agent log
        fetch('http://localhost:7244/ingest/fde0823c-7edc-4232-a192-3b97a49bcd3d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'InvoiceViewModal.tsx:106',message:'Axios error',data:{status:err?.response?.status,statusText:err?.response?.statusText,url:err?.config?.url,message:err?.message},timestamp:Date.now(),sessionId:'debug-session',runId:'run1',hypothesisId:'B'})}).catch(()=>{});
        // #endregion
        throw err;
      }
    },
    enabled: open && (!!document?.uuid || !!document?.ettn),
    retry: 2,
  });

  useEffect(() => {
    if (data?.content) {
      // #region agent log
      fetch('http://localhost:7244/ingest/fde0823c-7edc-4232-a192-3b97a49bcd3d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'InvoiceViewModal.tsx:118',message:'Content received',data:{contentLength:data.content.length,contentStart:data.content.substring(0,100),isBase64:data.content.match(/^[A-Za-z0-9+/=]+$/)?.length === 1},timestamp:Date.now(),sessionId:'debug-session',runId:'run5',hypothesisId:'F'})}).catch(()=>{});
      // #endregion

      let contentToUse = data.content;

      // Base64 decode kontrolü - eğer base64 encoded ise decode et
      try {
        // Base64 string kontrolü: sadece base64 karakterleri içeriyorsa ve uzunluğu 4'ün katıysa
        if (data.content.match(/^[A-Za-z0-9+/=\s]+$/) && data.content.length > 100) {
          // Base64 decode dene - UTF-8 encoding'i korumak için TextDecoder kullan
          const binaryString = atob(data.content.trim());
          // Binary string'i UTF-8 byte array'e çevir
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          // UTF-8 decoder ile decode et
          const decoded = new TextDecoder('utf-8').decode(bytes);
          // Decode edilen içerik HTML veya XML başlıyorsa kullan
          if (decoded.trim().startsWith('<!DOCTYPE') || decoded.trim().startsWith('<html') || decoded.trim().startsWith('<?xml') || decoded.includes('<body')) {
            contentToUse = decoded;
            // #region agent log
            fetch('http://localhost:7244/ingest/fde0823c-7edc-4232-a192-3b97a49bcd3d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'InvoiceViewModal.tsx:128',message:'Base64 decoded to HTML/XML with UTF-8',data:{decodedLength:decoded.length,decodedStart:decoded.substring(0,100),hasTurkishChars:decoded.includes('İ') || decoded.includes('ş') || decoded.includes('ğ')},timestamp:Date.now(),sessionId:'debug-session',runId:'run5',hypothesisId:'F'})}).catch(()=>{});
            // #endregion
          }
        }
      } catch (e) {
        // Base64 decode başarısız, orijinal içeriği kullan
        // #region agent log
        fetch('http://localhost:7244/ingest/fde0823c-7edc-4232-a192-3b97a49bcd3d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'InvoiceViewModal.tsx:135',message:'Base64 decode failed, using original',data:{error:e instanceof Error ? e.message : String(e)},timestamp:Date.now(),sessionId:'debug-session',runId:'run5',hypothesisId:'F'})}).catch(()=>{});
        // #endregion
      }

      setXmlContent(contentToUse);

      // HTML formatında geldiyse direkt göster, XML parse etme
      if (contentToUse.trim().startsWith('<!DOCTYPE') || contentToUse.trim().startsWith('<html') || contentToUse.includes('<body')) {
        // HTML içeriği - parse etme, direkt göster
        setInvoiceData(null); // HTML gösterilecek, parsed data gerekmez
        // #region agent log
        fetch('http://localhost:7244/ingest/fde0823c-7edc-4232-a192-3b97a49bcd3d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'InvoiceViewModal.tsx:165',message:'HTML content detected, skipping XML parse',data:{contentStart:contentToUse.substring(0,100)},timestamp:Date.now(),sessionId:'debug-session',runId:'run5',hypothesisId:'F'})}).catch(()=>{});
        // #endregion
        return;
      }

      // XML'i parse et ve fatura verilerini çıkar
      try {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(data.content, 'text/xml');

        // UBL Invoice namespace'leri
        const ns = {
          'cac': 'urn:oasis:names:specification:ubl:schema:xsd:CommonAggregateComponents-2',
          'cbc': 'urn:oasis:names:specification:ubl:schema:xsd:CommonBasicComponents-2',
        };

        const getText = (element: Element | null, tagName: string, namespace?: string): string => {
          if (!element) return '';
          const nsPrefix = namespace ? `${namespace}:` : '';
          const el = element.getElementsByTagName(nsPrefix + tagName)[0];
          return el?.textContent || '';
        };

        const invoice = xmlDoc.documentElement;

        const parsedData: InvoiceData = {
          invoiceNumber: getText(invoice, 'ID', 'cbc'),
          issueDate: getText(invoice, 'IssueDate', 'cbc'),
          invoiceType: getText(invoice, 'InvoiceTypeCode', 'cbc'),
          profileId: getText(invoice, 'ProfileID', 'cbc'),
          currency: getText(invoice, 'DocumentCurrencyCode', 'cbc') || 'TRY',
          lineExtensionAmount: parseFloat(getText(invoice, 'LineExtensionAmount', 'cbc')) || 0,
          taxExclusiveAmount: parseFloat(getText(invoice, 'TaxExclusiveAmount', 'cbc')) || 0,
          taxInclusiveAmount: parseFloat(getText(invoice, 'TaxInclusiveAmount', 'cbc')) || 0,
          payableAmount: parseFloat(getText(invoice, 'PayableAmount', 'cbc')) || 0,
        };

        // Buyer bilgileri
        const accountingCustomerParty = invoice.getElementsByTagName('cac:AccountingCustomerParty')[0];
        if (accountingCustomerParty) {
          const party = accountingCustomerParty.getElementsByTagName('cac:Party')[0];
          if (party) {
            const partyName = party.getElementsByTagName('cac:PartyName')[0];
            const taxId = party.getElementsByTagName('cac:PartyTaxScheme')[0]?.getElementsByTagName('cbc:CompanyID')[0];
            parsedData.buyer = {
              partyName: partyName?.getElementsByTagName('cbc:Name')[0]?.textContent || '',
              taxId: taxId?.textContent || '',
            };
          }
        }

        // Seller bilgileri
        const accountingSupplierParty = invoice.getElementsByTagName('cac:AccountingSupplierParty')[0];
        if (accountingSupplierParty) {
          const party = accountingSupplierParty.getElementsByTagName('cac:Party')[0];
          if (party) {
            const partyName = party.getElementsByTagName('cac:PartyName')[0];
            const taxId = party.getElementsByTagName('cac:PartyTaxScheme')[0]?.getElementsByTagName('cbc:CompanyID')[0];
            parsedData.seller = {
              partyName: partyName?.getElementsByTagName('cbc:Name')[0]?.textContent || '',
              taxId: taxId?.textContent || '',
            };
          }
        }

        // Invoice lines
        const invoiceLines = invoice.getElementsByTagName('cac:InvoiceLine');
        parsedData.lines = Array.from(invoiceLines).map((line, index) => {
          const id = getText(line, 'ID', 'cbc');
          const item = line.getElementsByTagName('cac:Item')[0];
          const name = item?.getElementsByTagName('cbc:Name')[0]?.textContent || '';
          const quantity = parseFloat(getText(line, 'InvoicedQuantity', 'cbc')) || 0;
          const price = line.getElementsByTagName('cac:Price')[0];
          const unitPrice = parseFloat(getText(price, 'PriceAmount', 'cbc')) || 0;
          const lineExtensionAmount = parseFloat(getText(line, 'LineExtensionAmount', 'cbc')) || 0;
          const taxTotal = line.getElementsByTagName('cac:TaxTotal')[0];
          const taxAmount = parseFloat(getText(taxTotal, 'TaxAmount', 'cbc')) || 0;

          return {
            id: id || String(index + 1),
            name,
            quantity,
            unitPrice,
            lineExtensionAmount,
            taxTotal: taxAmount,
          };
        });

        // Tax totals
        const taxTotals = invoice.getElementsByTagName('cac:TaxTotal');
        parsedData.taxTotal = Array.from(taxTotals).map((taxTotal) => {
          const taxAmount = parseFloat(getText(taxTotal, 'TaxAmount', 'cbc')) || 0;
          const taxCategory = taxTotal.getElementsByTagName('cac:TaxSubtotal')[0]?.getElementsByTagName('cac:TaxCategory')[0];
          const taxScheme = taxCategory?.getElementsByTagName('cac:TaxScheme')[0];
          const taxSchemeId = getText(taxScheme, 'ID', 'cbc');

          return {
            taxAmount,
            taxScheme: taxSchemeId,
          };
        });

        setInvoiceData(parsedData);
      } catch (error) {
        console.error('XML parse hatası:', error);
        // Parse edilemezse sadece XML göster
      }
    }
  }, [data]);

  const handleDownloadXml = () => {
    if (!xmlContent) return;

    // Client-side kontrolü - SSR sırasında çalışmamalı
    if (typeof window === 'undefined') {
      return;
    }

    // Global document objesine erişim (prop ile çakışmayı önlemek için)
    const docElement = window.document;

    const blob = new Blob([xmlContent], { type: 'application/xml' });
    const url = window.URL.createObjectURL(blob);
    const link = docElement.createElement('a');
    link.href = url;
    link.download = `${document?.invoiceNo || document?.ettn || 'invoice'}.xml`;
    docElement.body.appendChild(link);
    link.click();
    docElement.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleDownloadPdf = async () => {
    // Client-side kontrolü - SSR sırasında çalışmamalı
    if (typeof window === 'undefined') {
      // #region agent log
      fetch('http://localhost:7244/ingest/fde0823c-7edc-4232-a192-3b97a49bcd3d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'InvoiceViewModal.tsx:325',message:'handleDownloadPdf called on server side',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run6',hypothesisId:'H'})}).catch(()=>{});
      // #endregion
      return;
    }

    // Global document objesine erişim (prop ile çakışmayı önlemek için)
    const docElement = window.document;

    if (!document?.uuid && !document?.ettn) {
      // #region agent log
      fetch('http://localhost:7244/ingest/fde0823c-7edc-4232-a192-3b97a49bcd3d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'InvoiceViewModal.tsx:330',message:'UUID/ETTN missing for PDF download',data:{uuid:document?.uuid,ettn:document?.ettn},timestamp:Date.now(),sessionId:'debug-session',runId:'run6',hypothesisId:'H'})}).catch(()=>{});
      // #endregion
      alert('UUID veya ETTN bulunamadı');
      return;
    }

    try {
      // #region agent log
      fetch('http://localhost:7244/ingest/fde0823c-7edc-4232-a192-3b97a49bcd3d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'InvoiceViewModal.tsx:335',message:'Downloading PDF',data:{uuid:document?.uuid,ettn:document?.ettn},timestamp:Date.now(),sessionId:'debug-session',runId:'run6',hypothesisId:'H'})}).catch(()=>{});
      // #endregion

      const uuid = document?.uuid || document?.ettn;
      const response = await axios.get(`/hizli/document-content?uuid=${uuid}&type=PDF`, {
        responseType: 'json',
      });

      // #region agent log
      fetch('http://localhost:7244/ingest/fde0823c-7edc-4232-a192-3b97a49bcd3d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'InvoiceViewModal.tsx:343',message:'PDF response received',data:{hasContent:!!response.data?.content,contentLength:response.data?.content?.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run6',hypothesisId:'H'})}).catch(()=>{});
      // #endregion

      if (!response.data?.content) {
        throw new Error('PDF içeriği bulunamadı');
      }

      // Base64 decode - PDF binary data
      const binaryString = atob(response.data.content);
      const bytes = new Uint8Array(binaryString.length);
      for (let i = 0; i < binaryString.length; i++) {
        bytes[i] = binaryString.charCodeAt(i);
      }

      // PDF blob oluştur ve indir
      const blob = new Blob([bytes], { type: 'application/pdf' });
      const url = window.URL.createObjectURL(blob);
      const link = docElement.createElement('a');
      link.href = url;
      link.download = `${document?.invoiceNo || document?.ettn || 'invoice'}.pdf`;
      docElement.body.appendChild(link);
      link.click();
      docElement.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // #region agent log
      fetch('http://localhost:7244/ingest/fde0823c-7edc-4232-a192-3b97a49bcd3d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'InvoiceViewModal.tsx:362',message:'PDF downloaded successfully',data:{fileName:`${document?.invoiceNo || document?.ettn || 'invoice'}.pdf`},timestamp:Date.now(),sessionId:'debug-session',runId:'run6',hypothesisId:'H'})}).catch(()=>{});
      // #endregion
    } catch (error: any) {
      // #region agent log
      fetch('http://localhost:7244/ingest/fde0823c-7edc-4232-a192-3b97a49bcd3d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'InvoiceViewModal.tsx:365',message:'PDF download error',data:{error:error?.message || String(error)},timestamp:Date.now(),sessionId:'debug-session',runId:'run6',hypothesisId:'H'})}).catch(()=>{});
      // #endregion
      console.error('PDF indirme hatası:', error);
      alert('PDF indirilemedi: ' + (error?.message || 'Bilinmeyen hata'));
    }
  };

  const formatCurrency = (amount: number, currency: string = 'TRY') => {
    // #region agent log
    fetch('http://localhost:7244/ingest/fde0823c-7edc-4232-a192-3b97a49bcd3d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'InvoiceViewModal.tsx:239',message:'formatCurrency called',data:{amount,currency,currencyType:typeof currency,currencyLength:currency?.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run4',hypothesisId:'E'})}).catch(()=>{});
    // #endregion

    // Currency boş veya geçersizse TRY kullan
    const validCurrency = currency && currency.trim() && currency.length >= 3 ? currency.trim().toUpperCase() : 'TRY';

    // #region agent log
    fetch('http://localhost:7244/ingest/fde0823c-7edc-4232-a192-3b97a49bcd3d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'InvoiceViewModal.tsx:245',message:'formatCurrency using currency',data:{validCurrency,originalCurrency:currency},timestamp:Date.now(),sessionId:'debug-session',runId:'run4',hypothesisId:'E'})}).catch(()=>{});
    // #endregion

    try {
      return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: validCurrency,
      }).format(amount);
    } catch (error: any) {
      // #region agent log
      fetch('http://localhost:7244/ingest/fde0823c-7edc-4232-a192-3b97a49bcd3d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'InvoiceViewModal.tsx:252',message:'formatCurrency error',data:{error:error?.message,validCurrency,originalCurrency:currency},timestamp:Date.now(),sessionId:'debug-session',runId:'run4',hypothesisId:'E'})}).catch(()=>{});
      // #endregion
      // Hata durumunda TRY ile tekrar dene
      return new Intl.NumberFormat('tr-TR', {
        style: 'currency',
        currency: 'TRY',
      }).format(amount);
    }
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return '';
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString('tr-TR');
    } catch {
      return dateString;
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: {
          height: '90vh',
        },
      }}
    >
      <DialogTitle>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography variant="h6" component="span">
              Fatura Detayları
            </Typography>
            {document?.invoiceNo && (
              <Typography variant="caption" sx={{ ml: 2, color: 'text.secondary' }}>
                Fatura No: {document.invoiceNo}
              </Typography>
            )}
          </Box>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>
      <DialogContent dividers>
        {isLoading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error">
            Fatura içeriği yüklenemedi: {error instanceof Error ? error.message : 'Bilinmeyen hata'}
          </Alert>
        ) : xmlContent && (xmlContent.trim().startsWith('<!DOCTYPE') || xmlContent.trim().startsWith('<html') || xmlContent.includes('<body')) ? (
          // HTML formatında içerik - XSLT ile oluşturulmuş orijinal görüntü
          <Box
            sx={{
              width: '100%',
              height: '100%',
              overflow: 'auto',
              '& iframe': {
                border: 'none',
                width: '100%',
                minHeight: '70vh',
              },
            }}
          >
            {/* #region agent log */}
            {(() => {
              fetch('http://localhost:7244/ingest/fde0823c-7edc-4232-a192-3b97a49bcd3d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'InvoiceViewModal.tsx:330',message:'Rendering HTML in iframe',data:{contentLength:xmlContent.length,contentStart:xmlContent.substring(0,50)},timestamp:Date.now(),sessionId:'debug-session',runId:'run5',hypothesisId:'F'})}).catch(()=>{});
              return null;
            })()}
            {/* #endregion */}
            <iframe
              srcDoc={xmlContent}
              title="Fatura Görüntüle"
              style={{ width: '100%', minHeight: '70vh', border: 'none' }}
              sandbox="allow-same-origin"
            />
          </Box>
        ) : invoiceData ? (
          <Box>
            {/* Fatura Özet Bilgileri */}
            <Paper elevation={1} sx={{ p: 2, mb: 3 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Alıcı
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {invoiceData.buyer?.partyName || document?.senderTitle || '-'}
                  </Typography>
                  {invoiceData.buyer?.taxId && (
                    <Typography variant="body2" color="text.secondary">
                      VKN: {invoiceData.buyer.taxId}
                    </Typography>
                  )}
                </Grid>
                <Grid item xs={12} md={6}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Satıcı
                  </Typography>
                  <Typography variant="body1" fontWeight="bold">
                    {invoiceData.seller?.partyName || '-'}
                  </Typography>
                  {invoiceData.seller?.taxId && (
                    <Typography variant="body2" color="text.secondary">
                      VKN: {invoiceData.seller.taxId}
                    </Typography>
                  )}
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Fatura Tarihi
                  </Typography>
                  <Typography variant="body1">
                    {formatDate(invoiceData.issueDate || document?.invoiceDate || '')}
                  </Typography>
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Fatura Tipi
                  </Typography>
                  <Chip label={invoiceData.invoiceType || invoiceData.profileId || '-'} size="small" />
                </Grid>
                <Grid item xs={12} md={4}>
                  <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                    Para Birimi
                  </Typography>
                  <Typography variant="body1">
                    {invoiceData.currency || document?.payableAmount ? 'TRY' : '-'}
                  </Typography>
                </Grid>
              </Grid>
            </Paper>

            {/* Fatura Kalemleri */}
            {invoiceData.lines && invoiceData.lines.length > 0 && (
              <Box sx={{ mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Fatura Kalemleri
                </Typography>
                <TableContainer component={Paper} variant="outlined">
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Kalem No</TableCell>
                        <TableCell>Açıklama</TableCell>
                        <TableCell align="right">Miktar</TableCell>
                        <TableCell align="right">Birim Fiyat</TableCell>
                        <TableCell align="right">Tutar</TableCell>
                        <TableCell align="right">KDV</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {invoiceData.lines.map((line, index) => (
                        <TableRow key={line.id || index}>
                          <TableCell>{line.id}</TableCell>
                          <TableCell>{line.name || '-'}</TableCell>
                          <TableCell align="right">{line.quantity.toFixed(2)}</TableCell>
                          <TableCell align="right">
                            {formatCurrency(line.unitPrice, invoiceData.currency)}
                          </TableCell>
                          <TableCell align="right">
                            {formatCurrency(line.lineExtensionAmount || 0, invoiceData.currency)}
                          </TableCell>
                          <TableCell align="right">
                            {formatCurrency(line.taxTotal || 0, invoiceData.currency)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </TableContainer>
              </Box>
            )}

            {/* Toplamlar */}
            <Paper elevation={1} sx={{ p: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Ara Toplam:
                    </Typography>
                    <Typography variant="body2" fontWeight="bold">
                      {formatCurrency(invoiceData.taxExclusiveAmount || invoiceData.lineExtensionAmount || 0, invoiceData.currency)}
                    </Typography>
                  </Box>
                  {invoiceData.taxTotal && invoiceData.taxTotal.length > 0 && (
                    <>
                      {invoiceData.taxTotal.map((tax, index) => (
                        <Box key={index} sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                          <Typography variant="body2" color="text.secondary">
                            KDV ({tax.taxScheme || 'VAT'}):
                          </Typography>
                          <Typography variant="body2">
                            {formatCurrency(tax.taxAmount || 0, invoiceData.currency)}
                          </Typography>
                        </Box>
                      ))}
                    </>
                  )}
                  <Divider sx={{ my: 1 }} />
                  <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                    <Typography variant="h6">
                      Genel Toplam:
                    </Typography>
                    <Typography variant="h6" color="primary" fontWeight="bold">
                      {formatCurrency(invoiceData.payableAmount || invoiceData.taxInclusiveAmount || 0, invoiceData.currency)}
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Box>
        ) : (
          <Alert severity="info">
            Fatura içeriği parse edilemedi. XML formatını kontrol edin.
          </Alert>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={handleDownloadXml} startIcon={<Description />} disabled={!xmlContent}>
          XML İndir
        </Button>
        <Button onClick={handleDownloadPdf} startIcon={<PictureAsPdf />} disabled={!document?.uuid && !document?.ettn}>
          PDF İndir
        </Button>
        <Button onClick={onClose} variant="contained">
          Kapat
        </Button>
      </DialogActions>
    </Dialog>
  );
}

