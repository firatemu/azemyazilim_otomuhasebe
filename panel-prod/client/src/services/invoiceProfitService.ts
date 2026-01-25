import axios from '@/lib/axios';

export interface ProfitByInvoiceResponse {
  fatura: {
    id: string;
    faturaNo: string;
    tarih: string;
    cari: {
      id: string;
      cariKodu: string;
      unvan: string;
    };
    toplamSatisTutari: number;
    toplamMaliyet: number;
    toplamKar: number;
    karOrani: number;
  };
  kalemler: Array<{
    id: string;
    faturaKalemiId: string | null;
    stok: {
      id: string;
      stokKodu: string;
      stokAdi: string;
    } | null;
    miktar: number;
    birimFiyat: number;
    birimMaliyet: number;
    toplamSatisTutari: number;
    toplamMaliyet: number;
    kar: number;
    karOrani: number;
  }>;
}

export interface ProfitByProductItem {
  stok: {
    id: string;
    stokKodu: string;
    stokAdi: string;
  };
  toplamMiktar: number;
  toplamSatisTutari: number;
  toplamMaliyet: number;
  toplamKar: number;
  karOrani: number;
  faturalar: Array<{
    faturaId: string;
    faturaNo: string;
    tarih: string;
    cari: {
      id: string;
      unvan: string;
    };
    miktar: number;
    satisTutari: number;
    maliyet: number;
    kar: number;
  }>;
}

export interface ProfitListItem {
  fatura: {
    id: string;
    faturaNo: string;
    tarih: string;
    cari: {
      id: string;
      cariKodu: string;
      unvan: string;
    };
    durum: string;
  };
  toplamSatisTutari: number;
  toplamMaliyet: number;
  toplamKar: number;
  karOrani: number;
}

export interface ProfitDetailItem {
  id: string;
  stok: {
    id: string;
    stokKodu: string;
    stokAdi: string;
  } | null;
  miktar: number;
  birimFiyat: number;
  birimMaliyet: number;
  toplamSatisTutari: number;
  toplamMaliyet: number;
  kar: number;
  karOrani: number;
}

export interface GetProfitQuery {
  stokId?: string;
  startDate?: string;
  endDate?: string;
  cariId?: string;
  durum?: string;
}

/**
 * Fatura bazlı kar bilgisi
 */
export async function getProfitByInvoice(
  faturaId: string,
): Promise<ProfitByInvoiceResponse> {
  const response = await axios.get(`/invoice-profit/by-invoice/${faturaId}`);
  return response.data;
}

/**
 * Ürün bazlı kar bilgisi
 */
export async function getProfitByProduct(
  filters?: GetProfitQuery,
): Promise<ProfitByProductItem[]> {
  const response = await axios.get('/invoice-profit/by-product', {
    params: filters,
  });
  return response.data;
}

/**
 * Fatura bazlı karlılık listesi
 */
export async function getProfitList(
  filters?: GetProfitQuery,
): Promise<ProfitListItem[]> {
  const response = await axios.get('/invoice-profit/list', {
    params: filters,
  });
  return response.data;
}

/**
 * Fatura detay kar bilgileri (master-detail için)
 */
export async function getProfitDetail(
  faturaId: string,
): Promise<ProfitDetailItem[]> {
  const response = await axios.get(`/invoice-profit/detail/${faturaId}`);
  return response.data;
}

/**
 * Fatura karını yeniden hesapla
 */
export async function recalculateProfit(
  faturaId: string,
): Promise<{ message: string }> {
  const response = await axios.post(`/invoice-profit/recalculate/${faturaId}`);
  return response.data;
}
