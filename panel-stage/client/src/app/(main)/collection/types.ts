export interface Cari {
    id: string;
    cariKodu: string;
    unvan: string;
    bakiye: number;
    satisElemaniId?: string;
}

export interface Kasa {
    id: string;
    kasaKodu: string;
    kasaAdi: string;
    bakiye: number;
    kasaTipi: 'NAKIT' | 'POS' | 'FIRMA_KREDI_KARTI' | 'BANKA';
}

export interface BankaHesap {
    id: string;
    hesapAdi: string;
    bankaAdi: string;
    hesapNo: string;
    iban: string;
    paraBirimi: string;
    hesapTipi: string;
    hesapKodu?: string;
}

export interface FirmaKrediKarti {
    id: string;
    kartAdi: string;
    bankaAdi: string;
    kartTipi: string;
    kartKodu: string;
    sonDortHane: string;
    limit: number;
    aktif: boolean;
    kasaId: string;
}

export interface SatisElemani {
    id: string;
    adSoyad: string;
}

export interface TahsilatFormData {
    tip: 'TAHSILAT' | 'ODEME';
    cariId: string;
    kasaId: string;
    bankaHesapId?: string; // POS için
    firmaKrediKartiId?: string; // Ödeme kredi kartı için
    tutar: number | string;
    tarih: string;
    odemeTipi: 'NAKIT' | 'KREDI_KARTI' | 'HAVALE_EFT' | 'CEK' | 'SENET'; // Genişletilebilir
    aciklama: string;
    satisElemaniId?: string;
    kartSahibi?: string;
    kartSonDort?: string;
    bankaAdi?: string;
}

export interface CaprazOdemeFormData {
    tahsilatCariId: string;
    odemeCariId: string;
    tutar: number | string;
    tarih: string;
    aciklama: string;
}
