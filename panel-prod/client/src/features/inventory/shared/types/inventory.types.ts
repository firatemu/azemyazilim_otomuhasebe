/**
 * Stok Yönetimi - TypeScript Type Definitions
 */

export interface InventoryItem {
  id: string;
  stokKodu: string;
  stokAdi: string;
  barkod?: string;
  marka?: string;
  kategori?: string;
  anaKategori?: string;
  altKategori?: string;
  birim: string;
  oem?: string;
  olcu?: string;
  raf?: string;
  alisFiyati: number;
  satisFiyati: number;
  kdvOrani: number;
  kritikStokMiktari: number;
  miktar: number; // Hesaplanan mevcut miktar
  aracMarka?: string;
  aracModel?: string;
  createdAt: string;
  updatedAt: string;
}

export interface InventoryListResponse {
  data: InventoryItem[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface InventoryFilters {
  search?: string;
  kategori?: string;
  marka?: string;
  anaKategori?: string;
  altKategori?: string;
  aracMarka?: string;
  aracModel?: string;
  minMiktar?: number;
  maxMiktar?: number;
}

export interface InventoryFormData {
  stokKodu: string;
  stokAdi: string;
  barkod?: string;
  marka?: string;
  kategori?: string;
  anaKategori?: string;
  altKategori?: string;
  birim: string;
  oem?: string;
  olcu?: string;
  raf?: string;
  alisFiyati: number;
  satisFiyati: number;
  kdvOrani?: number;
  kritikStokMiktari?: number;
  aracMarka?: string;
  aracModel?: string;
  aciklama?: string;
}

export interface StockMovement {
  id: string;
  stokId: string;
  hareketTipi: 'GIRIS' | 'CIKIS' | 'SATIS' | 'IADE' | 'SAYIM_FAZLA' | 'SAYIM_EKSIK';
  miktar: number;
  birimFiyat: number;
  aciklama?: string;
  createdAt: string;
  stok?: {
    id: string;
    stokKodu: string;
    stokAdi: string;
  };
}

export interface StockMovementStats {
  toplamGiris: number;
  toplamCikis: number;
  toplamSatis: number;
  toplamIade: number;
}

export interface StockMovementListResponse {
  data: StockMovement[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}
