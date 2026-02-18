'use client';

import React, { useMemo } from 'react';
import {
  DataGrid,
  GridColDef,
  GridActionsCellItem,
  GridRowParams,
} from '@mui/x-data-grid';
import { Visibility, Download, Receipt, PictureAsPdf } from '@mui/icons-material';
import { Box, IconButton, Tooltip, Chip } from '@mui/material';
import { useQuery } from '@tanstack/react-query';
import axios from '@/lib/axios';
import XmlModal from './XmlModal';
import InvoiceViewModal from './InvoiceViewModal';

interface IncomingDocument {
  id?: number;
  ettn: string;
  uuid?: string;
  senderVkn: string;
  senderTitle: string;
  invoiceNo?: string;
  invoiceDate?: string;
  rawXml?: string;
  createdAt?: string;
  payableAmount?: number;
  status?: string;
  statusExp?: string;
}

interface IncomingGridProps {
  onViewXml?: (xml: string, document: IncomingDocument) => void;
  startDate?: Date | null;
  endDate?: Date | null;
}

export default function IncomingGrid({ onViewXml, startDate, endDate }: IncomingGridProps) {
  const [selectedDocument, setSelectedDocument] = React.useState<IncomingDocument | null>(null);
  const [xmlModalOpen, setXmlModalOpen] = React.useState(false);
  const [invoiceModalOpen, setInvoiceModalOpen] = React.useState(false);

  // Tarih formatını ISO 8601 string'e çevir (YYYY-MM-DD)
  const formatDateForApi = (date: Date | null): string | undefined => {
    if (!date) return undefined;
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  };

  // React Query ile veri çekme
  // Proxy üzerinden backend'e istek atıyoruz (Authorization header otomatik eklenir)
  const { data, isLoading, error, refetch } = useQuery({
    queryKey: ['hizli-incoming', startDate, endDate],
    queryFn: async () => {
      // Tarih parametrelerini query string'e ekle
      const params = new URLSearchParams();
      if (startDate) {
        params.append('startDate', formatDateForApi(startDate) || '');
      }
      if (endDate) {
        params.append('endDate', formatDateForApi(endDate) || '');
      }

      const queryString = params.toString();
      const url = `/hizli/incoming${queryString ? `?${queryString}` : ''}`;

      // Proxy kullanarak backend'e istek at (axios instance Authorization header ekler)
      const response = await axios.get(url);

      console.log('[IncomingGrid] Response:', response.status, response.data);

      // Backend response: { success: true, documents: [...], count: ... }
      if (!response.data.success) {
        throw new Error(response.data.message || 'E-faturalar getirilemedi');
      }

      return response.data.documents || [];
    },
    refetchInterval: 30000, // 30 saniyede bir yenile
    retry: 2, // 2 kez dene
    retryDelay: 1000, // 1 saniye bekle
  });

  // Manuel yenileme için event listener
  React.useEffect(() => {
    const handleRefresh = (event: Event) => {
      // CustomEvent'ten tarih bilgilerini al (varsa)
      const customEvent = event as CustomEvent;
      if (customEvent.detail?.startDate !== undefined || customEvent.detail?.endDate !== undefined) {
        // Tarih değişti, query otomatik yenilenecek (queryKey'de startDate/endDate var)
        refetch();
      } else {
        // Sadece yenileme isteği
        refetch();
      }
    };

    window.addEventListener('refresh-incoming-grid', handleRefresh);
    return () => {
      window.removeEventListener('refresh-incoming-grid', handleRefresh);
    };
  }, [refetch, startDate, endDate]);

  const documents: IncomingDocument[] = useMemo(() => {
    if (!data || !Array.isArray(data)) return [];

    return data.map((doc: any, index: number) => {
      // SOAP response'undan gelen belgeler için field mapping
      // UUID = ETTN (Electronic Tax Transaction Number)
      const uuid = doc.UUID || doc.uuid || '';
      const documentId = doc.DocumentId || doc.documentId || '';
      const issueDate = doc.IssueDate || doc.issueDate || null;
      const createdDate = doc.CreatedDate || doc.createdDate || null;
      const targetTitle = doc.TargetTitle || doc.targetTitle || '';
      const targetIdentifier = doc.TargetIdentifier || doc.targetIdentifier || '';

      const payableAmount = doc.PayableAmount || doc.payableAmount || null;
      const status = doc.Status || doc.status || null;
      const statusExp = doc.StatusExp || doc.statusExp || null;

      return {
        id: doc.id || index,
        ettn: uuid, // UUID = ETTN
        uuid: uuid, // UUID'yi ayrıca sakla
        senderVkn: targetIdentifier, // TargetIdentifier = Gönderen VKN
        senderTitle: targetTitle, // TargetTitle = Gönderen Ünvan
        invoiceNo: documentId, // DocumentId = Fatura No
        invoiceDate: issueDate ? (typeof issueDate === 'string' ? issueDate : new Date(issueDate).toISOString()) : null,
        rawXml: doc.rawXml || doc.RawXml || doc.xml || doc.XML || null,
        createdAt: createdDate ? (typeof createdDate === 'string' ? createdDate : new Date(createdDate).toISOString()) : null,
        payableAmount: payableAmount ? parseFloat(String(payableAmount)) : undefined,
        status: status ? String(status) : undefined,
        statusExp: statusExp ? String(statusExp) : undefined,
      };
    });
  }, [data]);

  const handleViewXml = (document: IncomingDocument) => {
    setSelectedDocument(document);
    setXmlModalOpen(true);
    if (onViewXml && document.rawXml) {
      onViewXml(document.rawXml, document);
    }
  };

  const handleDownloadXml = async (document: IncomingDocument) => {
    if (!document.rawXml) {
      alert('XML içeriği bulunamadı');
      return;
    }

    const blob = new Blob([document.rawXml], { type: 'application/xml' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${document.ettn || 'document'}.xml`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    window.URL.revokeObjectURL(url);
  };

  const handleDownloadPdf = async (doc: IncomingDocument) => {
    // Client-side kontrolü - SSR sırasında çalışmamalı
    if (typeof window === 'undefined' || typeof document === 'undefined') {
      // #region agent log
      fetch('http://localhost:7244/ingest/fde0823c-7edc-4232-a192-3b97a49bcd3d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'IncomingGrid.tsx:163',message:'handleDownloadPdf called on server side',data:{},timestamp:Date.now(),sessionId:'debug-session',runId:'run7',hypothesisId:'I'})}).catch(()=>{});
      // #endregion
      return;
    }

    if (!doc.uuid && !doc.ettn) {
      // #region agent log
      fetch('http://localhost:7244/ingest/fde0823c-7edc-4232-a192-3b97a49bcd3d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'IncomingGrid.tsx:168',message:'UUID/ETTN missing for PDF download',data:{uuid:doc.uuid,ettn:doc.ettn},timestamp:Date.now(),sessionId:'debug-session',runId:'run7',hypothesisId:'I'})}).catch(()=>{});
      // #endregion
      alert('UUID veya ETTN bulunamadı');
      return;
    }

    try {
      // #region agent log
      fetch('http://localhost:7244/ingest/fde0823c-7edc-4232-a192-3b97a49bcd3d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'IncomingGrid.tsx:175',message:'Downloading PDF',data:{uuid:doc.uuid,ettn:doc.ettn},timestamp:Date.now(),sessionId:'debug-session',runId:'run7',hypothesisId:'I'})}).catch(()=>{});
      // #endregion

      const uuid = doc.uuid || doc.ettn;
      const response = await axios.get(`/hizli/document-content?uuid=${uuid}&type=PDF`, {
        responseType: 'json',
      });

      // #region agent log
      fetch('http://localhost:7244/ingest/fde0823c-7edc-4232-a192-3b97a49bcd3d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'IncomingGrid.tsx:183',message:'PDF response received',data:{hasContent:!!response.data?.content,contentLength:response.data?.content?.length},timestamp:Date.now(),sessionId:'debug-session',runId:'run7',hypothesisId:'I'})}).catch(()=>{});
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
      const link = document.createElement('a');
      link.href = url;
      link.download = `${doc.invoiceNo || doc.ettn || 'invoice'}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);

      // #region agent log
      fetch('http://localhost:7244/ingest/fde0823c-7edc-4232-a192-3b97a49bcd3d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'IncomingGrid.tsx:202',message:'PDF downloaded successfully',data:{fileName:`${doc.invoiceNo || doc.ettn || 'invoice'}.pdf`},timestamp:Date.now(),sessionId:'debug-session',runId:'run7',hypothesisId:'I'})}).catch(()=>{});
      // #endregion
    } catch (error: any) {
      // #region agent log
      fetch('http://localhost:7244/ingest/fde0823c-7edc-4232-a192-3b97a49bcd3d',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({location:'IncomingGrid.tsx:205',message:'PDF download error',data:{error:error?.message || String(error)},timestamp:Date.now(),sessionId:'debug-session',runId:'run7',hypothesisId:'I'})}).catch(()=>{});
      // #endregion
      console.error('PDF indirme hatası:', error);
      alert('PDF indirilemedi: ' + (error?.message || 'Bilinmeyen hata'));
    }
  };

  const handleViewInvoice = (document: IncomingDocument) => {
    setSelectedDocument(document);
    setInvoiceModalOpen(true);
  };

  const columns: GridColDef[] = [
    {
      field: 'ettn',
      headerName: 'ETTN',
      width: 280,
      flex: 1,
      renderCell: (params) => (
        <Box
          sx={{
            fontFamily: 'monospace',
            fontSize: '0.75rem',
            wordBreak: 'break-all',
          }}
        >
          {params.value || '-'}
        </Box>
      ),
    },
    {
      field: 'senderTitle',
      headerName: 'Gönderen Ünvan',
      width: 250,
      flex: 1,
    },
    {
      field: 'senderVkn',
      headerName: 'VKN',
      width: 150,
      renderCell: (params) => (
        <Chip
          label={params.value || '-'}
          size="small"
          sx={{ fontFamily: 'monospace' }}
        />
      ),
    },
    {
      field: 'invoiceNo',
      headerName: 'Fatura No',
      width: 150,
      renderCell: (params) => params.value || '-',
    },
    {
      field: 'invoiceDate',
      headerName: 'Fatura Tarihi',
      width: 150,
      renderCell: (params) => {
        if (!params.value) return '-';
        const date = new Date(params.value);
        return date.toLocaleDateString('tr-TR');
      },
    },
    {
      field: 'createdAt',
      headerName: 'Geliş Tarihi',
      width: 150,
      renderCell: (params) => {
        if (!params.value) return '-';
        const date = new Date(params.value);
        return date.toLocaleDateString('tr-TR', {
          day: '2-digit',
          month: '2-digit',
          year: 'numeric',
          hour: '2-digit',
          minute: '2-digit',
        });
      },
    },
    {
      field: 'statusExp',
      headerName: 'Durum',
      width: 180,
      renderCell: (params) => {
        const status = params.value || params.row.statusExp;
        if (!status) return '-';

        // Durum renklerini belirle
        let color: 'default' | 'primary' | 'success' | 'warning' | 'error' = 'default';
        if (status.includes('Kabul') || status.includes('Onaylandı')) {
          color = 'success';
        } else if (status.includes('Bekliyor') || status.includes('Cevap')) {
          color = 'warning';
        } else if (status.includes('Reddedildi') || status.includes('Hatalı')) {
          color = 'error';
        } else if (status.includes('İptal')) {
          color = 'error';
        }

        return (
          <Chip
            label={status}
            size="small"
            color={color}
            sx={{ fontSize: '0.75rem' }}
          />
        );
      },
    },
    {
      field: 'payableAmount',
      headerName: 'Tutar',
      width: 120,
      renderCell: (params) => {
        if (!params.value) return '-';
        return new Intl.NumberFormat('tr-TR', {
          style: 'currency',
          currency: 'TRY',
        }).format(params.value);
      },
    },
    {
      field: 'actions',
      type: 'actions',
      headerName: 'İşlemler',
      width: 120,
      getActions: (params: GridRowParams) => {
        const doc = params.row as IncomingDocument;
        return [
          <GridActionsCellItem
            key="view-invoice"
            icon={
              <Tooltip title="Fatura Görüntüle">
                <Receipt fontSize="small" />
              </Tooltip>
            }
            label="Fatura Görüntüle"
            onClick={() => handleViewInvoice(doc)}
            disabled={!doc.uuid && !doc.ettn}
          />,
          <GridActionsCellItem
            key="view"
            icon={
              <Tooltip title="XML Görüntüle">
                <Visibility fontSize="small" />
              </Tooltip>
            }
            label="XML Görüntüle"
            onClick={() => handleViewXml(doc)}
            disabled={!doc.rawXml}
          />,
          <GridActionsCellItem
            key="download"
            icon={
              <Tooltip title="XML İndir">
                <Download fontSize="small" />
              </Tooltip>
            }
            label="XML İndir"
            onClick={() => handleDownloadXml(doc)}
            disabled={!doc.rawXml}
          />,
          <GridActionsCellItem
            key="download-pdf"
            icon={
              <Tooltip title="PDF İndir">
                <PictureAsPdf fontSize="small" />
              </Tooltip>
            }
            label="PDF İndir"
            onClick={() => handleDownloadPdf(doc)}
            disabled={!doc.uuid && !doc.ettn}
          />,
        ];
      },
    },
  ];

  if (error) {
    return (
      <Box sx={{ p: 3, textAlign: 'center' }}>
        <p style={{ color: 'red' }}>
          Hata: {error instanceof Error ? error.message : 'Bilinmeyen hata'}
        </p>
        <button onClick={() => refetch()}>Yeniden Dene</button>
      </Box>
    );
  }

  return (
    <>
      <Box sx={{ height: '100%', width: '100%' }}>
        <DataGrid
          rows={documents}
          columns={columns}
          loading={isLoading}
          pageSizeOptions={[10, 25, 50, 100]}
          initialState={{
            pagination: {
              paginationModel: { pageSize: 25 },
            },
          }}
          disableRowSelectionOnClick
          sx={{
            '& .MuiDataGrid-cell': {
              borderBottom: '1px solid #e0e0e0',
            },
            '& .MuiDataGrid-columnHeaders': {
              backgroundColor: '#f5f5f5',
              fontWeight: 'bold',
            },
          }}
        />
      </Box>

      <XmlModal
        open={xmlModalOpen}
        onClose={() => {
          setXmlModalOpen(false);
          setSelectedDocument(null);
        }}
        xml={selectedDocument?.rawXml || ''}
        document={selectedDocument}
      />

      <InvoiceViewModal
        open={invoiceModalOpen}
        onClose={() => {
          setInvoiceModalOpen(false);
          setSelectedDocument(null);
        }}
        document={selectedDocument}
      />
    </>
  );
}

